import 'dart:io';

import 'package:fasih/app.dart';
import 'package:fasih/content/library.dart';
import 'package:fasih/data/family.dart';
import 'package:fasih/ui/reading_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

Future<FamilyStore> _freshStore() async {
  SharedPreferences.setMockInitialValues({});
  return FamilyStore.load();
}

ContentLibrary _library() => ContentLibrary.fromJson(
  File('assets/content/texts.json').readAsStringSync(),
);

Future<void> _tapText(WidgetTester tester, String text) async {
  if (find.text(text).evaluate().isEmpty) {
    // القوائم تبني عناصرها عند الحاجة: نمرّر حتى يظهر الزر.
    await tester.dragUntilVisible(
      find.text(text),
      find.byType(Scrollable).first,
      const Offset(0, -300),
    );
  }
  await tester.ensureVisible(find.text(text));
  await tester.tap(find.text(text));
  await tester.pumpAndSettle();
}

/// يقرأ النص الحالي في وضع المرافق: ✓ لكل كلمة.
Future<void> _readAllCorrect(WidgetTester tester) async {
  final words = tester
      .widget<ReadingScreen>(find.byType(ReadingScreen))
      .text
      .words
      .length;
  await _tapText(tester, 'ابدأ القراءة');
  for (var i = 0; i < words; i++) {
    await tester.tap(find.text('✓ صحيح'));
    await tester.pump(const Duration(milliseconds: 50));
  }
  // الشاشة تنتهي تلقائياً بعد آخر كلمة.
  await tester.pump(const Duration(seconds: 1));
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('family signs up without a school, places and reads', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1080, 2340);
    tester.view.devicePixelRatio = 2.6;
    addTearDown(tester.view.reset);

    final store = await _freshStore();
    await tester.pumpWidget(FasihApp(library: _library(), store: store));
    await tester.pumpAndSettle();

    // الترحيب والموافقة.
    expect(find.text('فَصيح'), findsOneWidget);
    await tester.tap(find.byType(CheckboxListTile).first);
    await tester.pumpAndSettle();
    await _tapText(tester, 'أضف طفلك وابدأ');

    // إضافة الطفل.
    await tester.enterText(find.byType(TextField), 'ليان');
    await tester.tap(find.text('الثاني'));
    await tester.tap(find.text('🦋'));
    await tester.pumpAndSettle();
    await _tapText(tester, 'التالي: اختبار المستوى');

    // اختبار المستوى: 3 نصوص كلها صحيحة ← المستوى 3.
    await _tapText(tester, 'ابدأ');
    for (var i = 0; i < 3; i++) {
      await _readAllCorrect(tester);
    }
    expect(find.text('ستبدأ رحلتك من المستوى 3'), findsOneWidget);
    expect(store.children.single.level, 3);
    expect(store.children.single.sessions.length, 3);

    await _tapText(tester, 'إلى الرحلة');
    expect(find.text('مَنْ سيقرأ اليوم؟'), findsOneWidget);

    // جلسة يومية: الصورة ← هيّا نقرأ ← الجسر ← القراءة ← الأسئلة ← المكافأة.
    await _tapText(tester, 'ليان');
    await _tapText(tester, 'هيّا نقرأ');
    while (find.text('التالي').evaluate().isNotEmpty) {
      await _tapText(tester, 'التالي');
    }
    await _tapText(tester, 'إلى القصة');
    await _readAllCorrect(tester);

    // نصوص المستوى 3 غير متوفرة بعد، فيُختار نص من المستوى 2.
    final session = store.children.single;
    final text = _library().texts.firstWhere(
      (t) => t.kind == TextKind.practice && t.level == 2,
    );
    for (final q in text.questions) {
      await _tapText(tester, q.options[q.answer].label);
    }
    expect(find.text('رائع! قراءة فصيحة 🌟'), findsOneWidget);
    expect(session.practice.single.accuracy, 1);
    expect(session.practice.single.comprehensionCorrect, text.questions.length);
    expect(session.stars, 3);
  });

  test('corrupt saved data starts fresh instead of crashing', () async {
    SharedPreferences.setMockInitialValues({'fasih.family.v1': '{not json'});
    final store = await FamilyStore.load();
    expect(store.children, isEmpty);
    final prefs = await SharedPreferences.getInstance();
    expect(prefs.getString('fasih.family.v1.corrupt'), '{not json');
  });

  testWidgets(
    'parent gate opens the family dashboard with progress and focus',
    (tester) async {
      tester.view.physicalSize = const Size(1080, 2340);
      tester.view.devicePixelRatio = 2.6;
      addTearDown(tester.view.reset);

      final store = await _freshStore();
      await store.updateSettings((s) => s.consentApp = true);
      final child = await store.addChild(name: 'أحمد', grade: 1, avatar: '🦁');
      await store.setLevel(child, 1);
      await store.recordSession(
        child,
        SessionRecord(
          textId: 'l1-ahmad-draws',
          kind: SessionKind.practice,
          level: 1,
          at: DateTime.now(),
          durationMs: 60000,
          wcpm: 30,
          accuracy: 0.9,
          wordsAttempted: 16,
          errorCounts: const {'dialectal': 2},
          stars: 2,
        ),
      );
      await tester.pumpWidget(FasihApp(library: _library(), store: store));
      await tester.pumpAndSettle();

      await tester.tap(find.byTooltip('للأهل'));
      await tester.pumpAndSettle();
      // حلّ سؤال البوابة.
      final q = tester.widget<Text>(find.textContaining('كم يساوي')).data!;
      final nums = RegExp(r'\d+')
          .allMatches(q)
          .map((m) => int.parse(m.group(0)!))
          .toList();
      await tester.tap(find.text('${nums[0] * nums[1]}'));
      await tester.pumpAndSettle();

      expect(find.text('لوحة الأسرة'), findsOneWidget);
      expect(find.textContaining('الأصوات الفصيحة'), findsOneWidget);
      expect(find.text('30'), findsOneWidget);
    },
  );
}
