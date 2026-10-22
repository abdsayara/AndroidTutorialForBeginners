import 'dart:convert';
import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../engine/leveling.dart';

/// أقصى عدد أطفال على جهاز واحد (C-01).
const int maxChildren = 5;

enum SessionKind { practice, placement, benchmark }

/// طريقة الاستماع لقراءة الطفل.
enum InputMode {
  /// المرافق (ولي الأمر) يضغط صحيح/خطأ لكل كلمة؛ يعمل اليوم دون محرك صوت.
  companion,

  /// عرض تجريبي بقارئ محاكى، لتجربة الواجهة.
  demo,
}

class SessionRecord {
  SessionRecord({
    required this.textId,
    required this.kind,
    required this.level,
    required this.at,
    required this.durationMs,
    required this.wcpm,
    required this.accuracy,
    required this.wordsAttempted,
    this.comprehensionCorrect = 0,
    this.comprehensionTotal = 0,
    this.errorCounts = const {},
    this.stars = 0,
  });

  factory SessionRecord.fromJson(Map<String, dynamic> j) => SessionRecord(
    textId: j['textId'] as String,
    kind: SessionKind.values.byName(j['kind'] as String),
    level: j['level'] as int,
    at: DateTime.parse(j['at'] as String),
    durationMs: j['durationMs'] as int,
    wcpm: (j['wcpm'] as num).toDouble(),
    accuracy: (j['accuracy'] as num).toDouble(),
    wordsAttempted: j['wordsAttempted'] as int,
    comprehensionCorrect: j['comprehensionCorrect'] as int,
    comprehensionTotal: j['comprehensionTotal'] as int,
    errorCounts: Map<String, int>.from(j['errorCounts'] as Map),
    stars: j['stars'] as int,
  );

  final String textId;
  final SessionKind kind;
  final int level;
  final DateTime at;
  final int durationMs;
  final double wcpm;
  final double accuracy;
  final int wordsAttempted;
  final int comprehensionCorrect;
  final int comprehensionTotal;
  final Map<String, int> errorCounts;
  final int stars;

  double get comprehension =>
      comprehensionTotal == 0 ? 1 : comprehensionCorrect / comprehensionTotal;

  Map<String, dynamic> toJson() => {
    'textId': textId,
    'kind': kind.name,
    'level': level,
    'at': at.toIso8601String(),
    'durationMs': durationMs,
    'wcpm': wcpm,
    'accuracy': accuracy,
    'wordsAttempted': wordsAttempted,
    'comprehensionCorrect': comprehensionCorrect,
    'comprehensionTotal': comprehensionTotal,
    'errorCounts': errorCounts,
    'stars': stars,
  };
}

class Child {
  Child({
    required this.id,
    required this.name,
    required this.grade,
    required this.avatar,
    this.level,
    List<SessionRecord>? sessions,
  }) : sessions = sessions ?? [];

  factory Child.fromJson(Map<String, dynamic> j) => Child(
    id: j['id'] as String,
    name: j['name'] as String,
    grade: j['grade'] as int,
    avatar: j['avatar'] as String,
    level: j['level'] as int?,
    sessions: [
      for (final s in j['sessions'] as List)
        SessionRecord.fromJson(s as Map<String, dynamic>),
    ],
  );

  final String id;

  /// الاسم الأول فقط (تقليل البيانات، القسم 9).
  String name;
  int grade;
  String avatar;

  /// null قبل اختبار تحديد المستوى.
  int? level;
  final List<SessionRecord> sessions;

  bool get isPlaced => level != null;

  int get stars => sessions.fold(0, (s, r) => s + r.stars);

  List<SessionRecord> get practice =>
      sessions.where((s) => s.kind == SessionKind.practice).toList();

  /// عدد الأيام التي قرأ فيها الطفل خلال آخر 7 أيام.
  int daysReadInLastWeek(DateTime now) {
    final from = DateTime(
      now.year,
      now.month,
      now.day,
    ).subtract(const Duration(days: 6));
    return sessions
        .where((s) => !s.at.isBefore(from))
        .map((s) => DateTime(s.at.year, s.at.month, s.at.day))
        .toSet()
        .length;
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'grade': grade,
    'avatar': avatar,
    'level': level,
    'sessions': [for (final s in sessions) s.toJson()],
  };
}

class FamilySettings {
  FamilySettings({
    this.hintDelaySec = 3,
    this.inputMode = InputMode.companion,
    this.consentApp = false,
    this.consentTraining = false,
  });

  factory FamilySettings.fromJson(Map<String, dynamic> j) => FamilySettings(
    hintDelaySec: j['hintDelaySec'] as int,
    inputMode: InputMode.values.byName(j['inputMode'] as String),
    consentApp: j['consentApp'] as bool,
    consentTraining: j['consentTraining'] as bool,
  );

  /// مهلة التلميح عند التردد، 2–5 ثوانٍ (C-06).
  int hintDelaySec;
  InputMode inputMode;

  /// موافقة ولي الأمر على استخدام التطبيق (إلزامية).
  bool consentApp;

  /// موافقة اختيارية على حفظ التسجيلات لتحسين النموذج.
  bool consentTraining;

  Map<String, dynamic> toJson() => {
    'hintDelaySec': hintDelaySec,
    'inputMode': inputMode.name,
    'consentApp': consentApp,
    'consentTraining': consentTraining,
  };
}

/// حساب الأسرة محلياً. المزامنة مع الخادم (Supabase) تأتي في مرحلة لاحقة.
class FamilyStore extends ChangeNotifier {
  FamilyStore._(this._prefs, this.children, this.settings);

  static const _key = 'fasih.family.v1';

  static Future<FamilyStore> load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    if (raw == null) return FamilyStore._(prefs, [], FamilySettings());
    try {
      final j = jsonDecode(raw) as Map<String, dynamic>;
      return FamilyStore._(prefs, [
        for (final c in j['children'] as List)
          Child.fromJson(c as Map<String, dynamic>),
      ], FamilySettings.fromJson(j['settings'] as Map<String, dynamic>));
    } catch (e) {
      // بيانات تالفة: نحتفظ بنسخة منها ونبدأ من جديد بدل أن يتعطل التطبيق.
      debugPrint('fasih: unreadable family data, starting fresh: $e');
      await prefs.setString('$_key.corrupt', raw);
      return FamilyStore._(prefs, [], FamilySettings());
    }
  }

  final SharedPreferences _prefs;
  final List<Child> children;
  final FamilySettings settings;

  bool get canAddChild => children.length < maxChildren;

  Child byId(String id) => children.firstWhere((c) => c.id == id);

  Future<Child> addChild({
    required String name,
    required int grade,
    required String avatar,
  }) async {
    if (!canAddChild) throw StateError('max children reached');
    final child = Child(
      id: '${DateTime.now().microsecondsSinceEpoch}-${Random().nextInt(1 << 20)}',
      name: name.trim(),
      grade: grade,
      avatar: avatar,
    );
    children.add(child);
    await _save();
    return child;
  }

  /// حق الحذف (القسم 9): يحذف الطفل وكل بياناته من الجهاز.
  Future<void> removeChild(String id) async {
    children.removeWhere((c) => c.id == id);
    await _save();
  }

  Future<void> setLevel(Child child, int level) async {
    child.level = level;
    await _save();
  }

  /// يسجل الجلسة ويحدّث مستوى الطفل حسب المسار التكيّفي.
  Future<void> recordSession(Child child, SessionRecord record) async {
    child.sessions.add(record);
    if (record.kind == SessionKind.practice && child.level != null) {
      child.level = nextLevel(child.level!, [
        for (final s in child.practice)
          PracticeResult(
            level: s.level,
            accuracy: s.accuracy,
            comprehension: s.comprehension,
          ),
      ]);
    }
    await _save();
  }

  Future<void> updateSettings(void Function(FamilySettings s) change) async {
    change(settings);
    await _save();
  }

  Future<void> _save() async {
    await _prefs.setString(
      _key,
      jsonEncode({
        'children': [for (final c in children) c.toJson()],
        'settings': settings.toJson(),
      }),
    );
    notifyListeners();
  }
}
