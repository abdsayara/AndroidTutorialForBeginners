import 'arabic.dart';
import 'dialect.dart';

/// كلمة التقطها محرك الكلام (مشكولة إن أمكن) مع توقيتها.
class HeardWord {
  const HeardWord(this.text, this.startMs, this.endMs);

  /// كلمة قيلت خطأً دون معرفة ما قيل: حكم بها المرافق في الوضع اليدوي،
  /// أو لم يتعرّف عليها محرك الكلام. تُحاذى مع الكلمة المتوقعة في موضعها.
  const HeardWord.unclear(this.startMs, this.endMs) : text = unclearText;

  static const String unclearText = '\u2047';

  final String text;
  final int startMs;
  final int endMs;

  bool get isUnclear => text == unclearText;

  @override
  String toString() => '$text@$startMs';
}

enum WordStatus {
  /// لم يصل إليها الطفل بعد (أثناء القراءة).
  pending,
  correct,
  error,

  /// توقفت القراءة قبلها؛ لا تُحتسب في الأداء.
  notReached,
}

/// أنواع الأخطاء حسب القسم 6.2 من وثيقة المنتج.
enum ErrorType { substitution, omission, internalVowel, finalVowel, dialectal }

class AssessmentConfig {
  const AssessmentConfig({
    this.countFinalVowelErrors = false,
    this.hesitationMs = 3000,
  });

  /// هل يُحتسب خطأ حركة الإعراب الأخيرة خطأً (الصفان 1–2: لا).
  final bool countFinalVowelErrors;

  /// مدة الصمت قبل الكلمة التي تُعدّ تردداً.
  final int hesitationMs;
}

class WordResult {
  WordResult({
    required this.word,
    required this.status,
    this.errorType,
    this.heard,
    this.swaps = const [],
    this.selfCorrected = false,
    this.repeated = false,
    this.hesitated = false,
    this.pausal = false,
    this.vowelsChecked = false,
    this.startMs,
    this.endMs,
  });

  final TextWord word;
  final WordStatus status;

  /// نوع الخطأ إن وُجد، ويبقى مسجلاً حتى لو لم يُحتسب (مثل حركة الإعراب
  /// في الصفوف الأولى) ليظهر في الملخص.
  final ErrorType? errorType;
  final String? heard;
  final List<DialectSwap> swaps;
  final bool selfCorrected;
  final bool repeated;
  final bool hesitated;

  /// وقف بالسكون في موضع وقف: نطق صحيح.
  final bool pausal;

  /// هل كانت الكلمة المسموعة مشكولة فتمت مقارنة الحركات.
  final bool vowelsChecked;
  final int? startMs;
  final int? endMs;

  bool get isError => status == WordStatus.error;
  bool get isAttempted =>
      status == WordStatus.correct || status == WordStatus.error;
}

class Assessment {
  Assessment(this.words, this.insertions);

  final List<WordResult> words;

  /// كلمات زائدة لا تقابل أي كلمة في النص.
  final List<HeardWord> insertions;

  /// موقع الطفل الحالي في النص: أول كلمة لم يصل إليها.
  int get currentIndex {
    final i = words.indexWhere(
      (w) =>
          w.status == WordStatus.pending || w.status == WordStatus.notReached,
    );
    return i == -1 ? words.length : i;
  }
}

class _Classification {
  _Classification(
    this.status,
    this.errorType, {
    this.swaps = const [],
    this.pausal = false,
    this.vowelsChecked = false,
  });

  final WordStatus status;
  final ErrorType? errorType;
  final List<DialectSwap> swaps;
  final bool pausal;
  final bool vowelsChecked;
}

/// يقيّم قراءة الطفل مقابل النص المعلوم.
///
/// [complete] = true عند انتهاء الجلسة: الكلمات التي لم يصلها تصبح
/// «لم يصل» بدل «قيد الانتظار».
Assessment assess(
  List<TextWord> text,
  List<HeardWord> heard, {
  AssessmentConfig config = const AssessmentConfig(),
  bool complete = false,
}) {
  final assignment = _align(text, heard);

  // تجميع المحاولات لكل كلمة، مع ضم الكلمات الزائدة المشابهة لجارتها
  // (تصحيح ذاتي أو تكرار).
  final attempts = List.generate(text.length, (_) => <HeardWord>[]);
  final insertions = <HeardWord>[];
  for (var j = 0; j < heard.length; j++) {
    final i = assignment[j];
    if (i != null) attempts[i].add(heard[j]);
  }
  for (var j = 0; j < heard.length; j++) {
    if (assignment[j] != null) continue;
    int? prev;
    for (var k = j - 1; k >= 0; k--) {
      if (assignment[k] != null) {
        prev = assignment[k];
        break;
      }
    }
    int? next;
    for (var k = j + 1; k < heard.length; k++) {
      if (assignment[k] != null) {
        next = assignment[k];
        break;
      }
    }
    final candidates = <int>{
      ?prev,
      ?next,
      if (prev == null && next == null && text.isNotEmpty) 0,
    };
    int? best;
    var bestSim = 0.5;
    for (final c in candidates) {
      final s = _similarity(text[c].text, heard[j].text);
      if (s >= bestSim) {
        bestSim = s;
        best = c;
      }
    }
    if (best != null) {
      attempts[best].add(heard[j]);
    } else {
      insertions.add(heard[j]);
    }
  }

  var lastAttempted = -1;
  for (var i = 0; i < text.length; i++) {
    if (attempts[i].isNotEmpty) lastAttempted = i;
  }

  final results = <WordResult>[];
  int? previousEnd;
  for (var i = 0; i < text.length; i++) {
    final word = text[i];
    final tries = attempts[i]..sort((a, b) => a.startMs.compareTo(b.startMs));
    if (tries.isEmpty) {
      if (i < lastAttempted) {
        results.add(
          WordResult(
            word: word,
            status: WordStatus.error,
            errorType: ErrorType.omission,
          ),
        );
      } else {
        results.add(
          WordResult(
            word: word,
            status: complete ? WordStatus.notReached : WordStatus.pending,
          ),
        );
      }
      continue;
    }
    final last = tries.last;
    final c = _classify(word, last.text, config);
    final earlier = tries.sublist(0, tries.length - 1);
    final earlierResults = earlier
        .map((t) => _classify(word, t.text, config))
        .toList();
    final selfCorrected =
        c.status == WordStatus.correct &&
        earlierResults.any((r) => r.status == WordStatus.error);
    final repeated =
        earlierResults.isNotEmpty &&
        earlierResults.every((r) => r.status == c.status);
    final hesitated =
        previousEnd != null &&
        tries.first.startMs - previousEnd > config.hesitationMs;
    results.add(
      WordResult(
        word: word,
        status: c.status,
        errorType: c.errorType,
        heard: last.text,
        swaps: c.swaps,
        selfCorrected: selfCorrected,
        repeated: repeated && !selfCorrected,
        hesitated: hesitated,
        pausal: c.pausal,
        vowelsChecked: c.vowelsChecked,
        startMs: tries.first.startMs,
        endMs: last.endMs,
      ),
    );
    previousEnd = last.endMs;
  }
  return Assessment(results, insertions);
}

double _similarity(String expected, String heard) {
  // أقل من عتبة الضم (0.5) وأرخص من الزيادة في المحاذاة.
  if (heard == HeardWord.unclearText) return 0.45;
  if (skeleton(expected) == skeleton(heard)) return 1;
  if (dialectSwaps(expected, heard) != null) return 0.9;
  return skeletonSimilarity(expected, heard);
}

/// محاذاة شبه شاملة: الكلمات في آخر النص التي لم تُقرأ لا تُكلّف شيئاً.
/// تعيد لكل كلمة مسموعة رقم الكلمة المقابلة في النص أو null إن كانت زائدة.
List<int?> _align(List<TextWord> text, List<HeardWord> heard) {
  final n = text.length;
  final m = heard.length;
  // الزيادة أغلى قليلاً من التخطي، كي لا تُفضَّل «زيادات» على التقدم في
  // النص (نهاية المحاذاة مجانية). التكرار والتصحيح الذاتي يُجمعان لاحقاً.
  const del = 1.0;
  const ins = 1.2;
  double sub(int i, int j) {
    final s = _similarity(text[i].text, heard[j].text);
    return s >= 1 ? 0 : 2 * (1 - s);
  }

  final cost = List.generate(n + 1, (_) => List<double>.filled(m + 1, 0));
  final move = List.generate(n + 1, (_) => List<int>.filled(m + 1, 0));
  for (var i = 1; i <= n; i++) {
    cost[i][0] = i * del;
    move[i][0] = 1;
  }
  for (var j = 1; j <= m; j++) {
    cost[0][j] = j * ins;
    move[0][j] = 2;
  }
  for (var i = 1; i <= n; i++) {
    for (var j = 1; j <= m; j++) {
      final diag = cost[i - 1][j - 1] + sub(i - 1, j - 1);
      final up = cost[i - 1][j] + del;
      final left = cost[i][j - 1] + ins;
      // عند التساوي: الاستبدال أولاً، ثم الزيادة، ثم التخطي.
      if (diag <= left && diag <= up) {
        cost[i][j] = diag;
        move[i][j] = 0;
      } else if (left <= up) {
        cost[i][j] = left;
        move[i][j] = 2;
      } else {
        cost[i][j] = up;
        move[i][j] = 1;
      }
    }
  }

  // أفضل نقطة نهاية: ما بعدها «لم يُقرأ بعد» دون تكلفة. عند التساوي نختار
  // الأبعد، فكلمة مسموعة تقابل كلمة تالية أولى من عدّها زائدة.
  var endI = 0;
  for (var i = 1; i <= n; i++) {
    if (cost[i][m] <= cost[endI][m]) endI = i;
  }

  final result = List<int?>.filled(m, null);
  var i = endI;
  var j = m;
  while (i > 0 || j > 0) {
    final mv = (i == 0) ? 2 : (j == 0 ? 1 : move[i][j]);
    if (mv == 0) {
      result[j - 1] = i - 1;
      i--;
      j--;
    } else if (mv == 2) {
      j--;
    } else {
      i--;
    }
  }
  return result;
}

_Classification _classify(
  TextWord word,
  String heard,
  AssessmentConfig config,
) {
  if (heard == HeardWord.unclearText) {
    return _Classification(WordStatus.error, ErrorType.substitution);
  }
  if (skeleton(word.text) != skeleton(heard)) {
    final swaps = dialectSwaps(word.text, heard);
    if (swaps != null) {
      return _Classification(
        WordStatus.error,
        ErrorType.dialectal,
        swaps: swaps,
      );
    }
    return _Classification(WordStatus.error, ErrorType.substitution);
  }
  if (!hasAnyDiacritic(heard)) {
    return _Classification(WordStatus.correct, null);
  }

  final eg = graphemes(word.text);
  final hg = graphemes(heard);
  final finalIdx = _caseEndingIndex(eg);
  var internalError = false;
  var finalError = false;
  var pausal = false;

  for (var k = 0; k < eg.length && k < hg.length; k++) {
    final e = eg[k];
    final h = hg[k];
    if (h.vowel == null && !h.hasShadda) continue; // غير مشكول: لا نحكم
    final sameVowel = (e.vowel ?? sukun) == (h.vowel ?? sukun);
    final sameShadda = e.hasShadda == h.hasShadda;
    if (k == finalIdx) {
      if (sameVowel && sameShadda) continue;
      if (word.endsClause && _isPausal(e, h)) {
        pausal = true;
      } else {
        finalError = true;
      }
    } else if (!sameVowel || !sameShadda) {
      internalError = true;
    }
  }

  if (internalError) {
    return _Classification(
      WordStatus.error,
      ErrorType.internalVowel,
      vowelsChecked: true,
    );
  }
  if (finalError) {
    return _Classification(
      config.countFinalVowelErrors ? WordStatus.error : WordStatus.correct,
      ErrorType.finalVowel,
      vowelsChecked: true,
    );
  }
  return _Classification(
    WordStatus.correct,
    null,
    pausal: pausal,
    vowelsChecked: true,
  );
}

/// موضع حركة الإعراب: آخر حرف إن كان مشكولاً، أو الحرف قبل ألف تنوين الفتح.
int? _caseEndingIndex(List<Grapheme> gs) {
  if (gs.isEmpty) return null;
  final last = gs.length - 1;
  if (gs[last].vowel != null) return last;
  if (gs.length >= 2 &&
      gs[last - 1].vowel == fathatan &&
      (gs[last].letter == 'ا' || gs[last].letter == 'ى')) {
    return last - 1;
  }
  return null;
}

/// الوقف: السكون مكان الحركة أو التنوين، والفتح مكان تنوين الفتح.
bool _isPausal(Grapheme expected, Grapheme heard) {
  if (heard.hasShadda != expected.hasShadda) return false;
  final hv = heard.vowel ?? sukun;
  if (hv == sukun) return true;
  return expected.vowel == fathatan && hv == fatha;
}
