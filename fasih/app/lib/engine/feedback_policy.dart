import 'assessor.dart';

enum FeedbackKind {
  none,

  /// نطق الكلمة الصحيحة وطلب الإعادة.
  correctAndRepeat,

  /// تنبيه لطيف على إبدال لهجي: «في الفصحى نقول ثَـ».
  dialectHint,

  /// تشجيع بعد تصحيح ذاتي.
  encourage,
}

class FeedbackAction {
  const FeedbackAction(this.kind, this.word);

  final FeedbackKind kind;
  final WordResult? word;

  static const none = FeedbackAction(FeedbackKind.none, null);
}

/// طبقة القواعد التي تقرر متى نقاطع الطفل (القسم 6.1، الخطوة 6).
/// لا نقاطع على كل خطأ: أخطاء الإعراب والكلمات الزائدة تذهب للملخص فقط،
/// ولا نقاطع مرتين متتاليتين خلال [cooldownWords] كلمات.
class FeedbackPolicy {
  FeedbackPolicy({this.cooldownWords = 3});

  final int cooldownWords;
  final Set<int> _handled = {};
  int _lastInterruptIndex = -1000;

  /// يُستدعى بعد كل تحديث للتقييم؛ يعيد إجراءً واحداً على الأكثر لكلمة
  /// انتهى الطفل منها ولم يُتعامل معها بعد.
  FeedbackAction next(Assessment a) {
    final current = a.currentIndex;
    for (final w in a.words) {
      final i = w.word.index;
      // ننتظر حتى يتجاوز الطفل الكلمة، فقد يصحح نفسه.
      if (i >= current - 1 && current < a.words.length) break;
      if (!w.isAttempted || _handled.contains(i)) continue;
      _handled.add(i);
      final action = _decide(w);
      if (action.kind == FeedbackKind.none) continue;
      final interrupting = action.kind != FeedbackKind.encourage;
      if (interrupting && i - _lastInterruptIndex < cooldownWords) continue;
      if (interrupting) _lastInterruptIndex = i;
      return action;
    }
    return FeedbackAction.none;
  }

  FeedbackAction _decide(WordResult w) {
    if (w.selfCorrected) return FeedbackAction(FeedbackKind.encourage, w);
    if (!w.isError) return FeedbackAction.none;
    switch (w.errorType) {
      case ErrorType.substitution:
      case ErrorType.omission:
      case ErrorType.internalVowel:
        return FeedbackAction(FeedbackKind.correctAndRepeat, w);
      case ErrorType.dialectal:
        return FeedbackAction(FeedbackKind.dialectHint, w);
      case ErrorType.finalVowel:
      case null:
        return FeedbackAction.none;
    }
  }
}
