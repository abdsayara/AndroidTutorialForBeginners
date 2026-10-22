/// تحديد المستوى (C-02) والمسار التكيّفي (C-02b): يعملان دون معلم.
library;

const int minLevel = 1;
const int maxLevel = 5;

/// نتيجة قراءة نص واحد في اختبار تحديد المستوى.
class PlacementReading {
  const PlacementReading(this.level, this.accuracy, this.wcpm);

  final int level;
  final double accuracy;
  final double wcpm;
}

/// دقة «المستوى التعليمي»: يقرأ الطفل النص بجهد معقول دون إحباط.
const double placementAccuracy = 0.90;

/// أعلى مستوى قرأه الطفل بدقة ≥ 90%، أو المستوى الأول.
int placeLevel(List<PlacementReading> readings) {
  var level = minLevel;
  for (final r in readings) {
    if (r.accuracy >= placementAccuracy && r.level > level) level = r.level;
  }
  return level;
}

/// هل نتابع إلى النص الأصعب في اختبار تحديد المستوى؟
bool continuePlacement(PlacementReading r) => r.accuracy >= placementAccuracy;

/// ملخص جلسة تدريب لأغراض المسار.
class PracticeResult {
  const PracticeResult({
    required this.level,
    required this.accuracy,
    required this.comprehension,
  });

  final int level;
  final double accuracy;

  /// نسبة أسئلة الفهم الصحيحة (0–1).
  final double comprehension;
}

/// يرفع المستوى بعد 3 جلسات متتالية بدقة ≥ 97% وفهم ≥ 70%،
/// ويخفضه بعد جلستين بدقة < 85%.
int nextLevel(int current, List<PracticeResult> history) {
  final atLevel = history.where((h) => h.level == current).toList();
  if (atLevel.length >= 3) {
    final last3 = atLevel.sublist(atLevel.length - 3);
    if (last3.every((h) => h.accuracy >= 0.97 && h.comprehension >= 0.7) &&
        current < maxLevel) {
      return current + 1;
    }
  }
  if (atLevel.length >= 2) {
    final last2 = atLevel.sublist(atLevel.length - 2);
    if (last2.every((h) => h.accuracy < 0.85) && current > minLevel) {
      return current - 1;
    }
  }
  return current;
}

/// النص التالي: أول نص في المستوى لم يُقرأ، وإلا أقدمها قراءة.
String? nextTextId(List<String> textIdsAtLevel, List<String> readHistory) {
  if (textIdsAtLevel.isEmpty) return null;
  for (final id in textIdsAtLevel) {
    if (!readHistory.contains(id)) return id;
  }
  String? oldest;
  var oldestPos = readHistory.length;
  for (final id in textIdsAtLevel) {
    final pos = readHistory.lastIndexOf(id);
    if (pos < oldestPos) {
      oldestPos = pos;
      oldest = id;
    }
  }
  return oldest;
}
