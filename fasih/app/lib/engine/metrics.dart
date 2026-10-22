import 'assessor.dart';

/// مؤشرات جلسة قراءة واحدة.
class SessionMetrics {
  const SessionMetrics({
    required this.wordsAttempted,
    required this.wordsCorrect,
    required this.errors,
    required this.durationMs,
    required this.errorCounts,
    required this.selfCorrections,
    required this.hesitations,
  });

  /// كلمات النص التي وصل إليها الطفل.
  final int wordsAttempted;

  /// منها ما قُرئ صحيحاً.
  final int wordsCorrect;

  /// الأخطاء المحتسبة: كلمات خاطئة + كلمات زائدة.
  final int errors;
  final int durationMs;

  /// عدد كل نوع خطأ، بما فيها غير المحتسبة (للملخص)؛ المفتاح «insertion»
  /// للكلمات الزائدة.
  final Map<String, int> errorCounts;
  final int selfCorrections;
  final int hesitations;

  /// كلمات صحيحة في الدقيقة: (المقروء − الأخطاء) ÷ الدقائق.
  double get wcpm {
    if (durationMs <= 0) return 0;
    final net = wordsAttempted - errors;
    return (net < 0 ? 0 : net) / (durationMs / 60000);
  }

  /// الدقة: الكلمات الصحيحة ÷ الكلمات المقروءة.
  double get accuracy =>
      wordsAttempted == 0 ? 0 : wordsCorrect / wordsAttempted;
}

SessionMetrics computeMetrics(Assessment a, int durationMs) {
  final attempted = a.words.where((w) => w.isAttempted).toList();
  final correct = attempted.where((w) => w.status == WordStatus.correct).length;
  final counts = <String, int>{};
  for (final w in attempted) {
    final t = w.errorType;
    if (t != null) counts[t.name] = (counts[t.name] ?? 0) + 1;
  }
  if (a.insertions.isNotEmpty) counts['insertion'] = a.insertions.length;
  return SessionMetrics(
    wordsAttempted: attempted.length,
    wordsCorrect: correct,
    errors: attempted.length - correct + a.insertions.length,
    durationMs: durationMs,
    errorCounts: counts,
    selfCorrections: attempted.where((w) => w.selfCorrected).length,
    hesitations: attempted.where((w) => w.hesitated).length,
  );
}
