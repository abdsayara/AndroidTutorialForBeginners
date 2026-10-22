/// أدوات معالجة النص العربي المشكول: تقطيع الكلمات، فصل الحروف عن الحركات،
/// وتطبيع الحروف للمقارنة.
library;

const int fathatan = 0x064B;
const int dammatan = 0x064C;
const int kasratan = 0x064D;
const int fatha = 0x064E;
const int damma = 0x064F;
const int kasra = 0x0650;
const int shadda = 0x0651;
const int sukun = 0x0652;
const int daggerAlif = 0x0670;
const int tatweel = 0x0640;

const Set<int> _marks = {
  fathatan,
  dammatan,
  kasratan,
  fatha,
  damma,
  kasra,
  shadda,
  sukun,
  daggerAlif,
};

const Set<int> tanwin = {fathatan, dammatan, kasratan};
const Set<int> shortVowels = {fatha, damma, kasra};

bool isMark(int rune) => _marks.contains(rune);

/// علامات الترقيم التي تنهي جملة أو عبارة (موضع وقف).
const String _pausePunctuation = '.،,؛;:!؟?';
const String _otherPunctuation = '«»"\'()[]-–—…';

/// حرف أساسي مع حركاته.
class Grapheme {
  Grapheme(this.letter, Set<int> marks) : marks = Set.unmodifiable(marks);

  final String letter;
  final Set<int> marks;

  bool get hasShadda => marks.contains(shadda);

  /// الحركة (أو التنوين أو السكون) بعد استبعاد الشدة. null إن لم يُشكل.
  int? get vowel {
    for (final m in marks) {
      if (m != shadda && m != daggerAlif) return m;
    }
    return null;
  }

  @override
  String toString() => letter + String.fromCharCodes(marks);
}

/// يقسم الكلمة إلى حروف وحركاتها، مع تجاهل التطويل.
List<Grapheme> graphemes(String word) {
  final out = <Grapheme>[];
  String? letter;
  var marks = <int>{};
  for (final r in word.runes) {
    if (r == tatweel) continue;
    if (isMark(r)) {
      marks.add(r);
      continue;
    }
    if (letter != null) out.add(Grapheme(letter, marks));
    letter = String.fromCharCode(r);
    marks = <int>{};
  }
  if (letter != null) out.add(Grapheme(letter, marks));
  return out;
}

String stripDiacritics(String s) =>
    String.fromCharCodes(s.runes.where((r) => !isMark(r) && r != tatweel));

bool hasAnyDiacritic(String s) => s.runes.any(isMark);

/// تطبيع حرف واحد للمقارنة المتسامحة: أشكال الألف، والهمزات على الواو والياء،
/// والألف المقصورة، والتاء المربوطة (تُنطق هاءً عند الوقف).
String normalizeLetter(String letter) {
  switch (letter) {
    case 'أ':
    case 'إ':
    case 'آ':
    case 'ٱ':
      return 'ا';
    case 'ؤ':
    case 'ئ':
      return 'ء';
    case 'ى':
      return 'ي';
    case 'ة':
      return 'ه';
    default:
      return letter;
  }
}

/// هيكل الكلمة: حروفها مطبّعة دون حركات.
String skeleton(String word) =>
    graphemes(word).map((g) => normalizeLetter(g.letter)).join();

/// كلمة من النص المعروض للطفل.
class TextWord {
  const TextWord({
    required this.index,
    required this.text,
    required this.display,
    required this.endsClause,
  });

  /// ترتيب الكلمة في النص.
  final int index;

  /// الكلمة المشكولة دون علامات ترقيم.
  final String text;

  /// الكلمة كما تُعرض (مع علامات الترقيم الملاصقة).
  final String display;

  /// تقع قبل علامة وقف (أو في آخر النص)، فيجوز الوقف عليها بالسكون.
  final bool endsClause;
}

/// يقطّع النص إلى كلمات مع تحديد مواضع الوقف.
List<TextWord> tokenize(String text) {
  final raw = text.split(RegExp(r'\s+')).where((w) => w.isNotEmpty).toList();
  final words = <TextWord>[];
  for (var i = 0; i < raw.length; i++) {
    final display = raw[i];
    var core = display;
    var pause = false;
    while (core.isNotEmpty &&
        (_pausePunctuation.contains(core[core.length - 1]) ||
            _otherPunctuation.contains(core[core.length - 1]))) {
      if (_pausePunctuation.contains(core[core.length - 1])) pause = true;
      core = core.substring(0, core.length - 1);
    }
    while (core.isNotEmpty && _otherPunctuation.contains(core[0])) {
      core = core.substring(1);
    }
    if (core.isEmpty) continue;
    words.add(
      TextWord(
        index: words.length,
        text: core,
        display: display,
        endsClause: pause || i == raw.length - 1,
      ),
    );
  }
  return words;
}

/// المقطع الأول من الكلمة، يُستعمل تلميحاً عند تردد الطفل.
/// في الكلمات المبدوءة بـ«ال» يشمل المقطع الحرف الذي بعدها.
String hintSyllable(String word) {
  final gs = graphemes(word);
  if (gs.isEmpty) return word;
  var take = 1;
  final startsWithAl =
      gs.length > 2 &&
      normalizeLetter(gs[0].letter) == 'ا' &&
      gs[1].letter == 'ل' &&
      gs[0].vowel == null;
  if (startsWithAl) {
    take = 3;
  } else if (gs[0].vowel == sukun && gs.length > 1) {
    take = 2;
  }
  return gs.take(take).map((g) => g.toString()).join();
}

int levenshtein(String a, String b) {
  if (a == b) return 0;
  final ar = a.runes.toList();
  final br = b.runes.toList();
  if (ar.isEmpty) return br.length;
  if (br.isEmpty) return ar.length;
  var prev = List<int>.generate(br.length + 1, (i) => i);
  for (var i = 1; i <= ar.length; i++) {
    final cur = List<int>.filled(br.length + 1, 0);
    cur[0] = i;
    for (var j = 1; j <= br.length; j++) {
      final cost = ar[i - 1] == br[j - 1] ? 0 : 1;
      cur[j] = [
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + cost,
      ].reduce((x, y) => x < y ? x : y);
    }
    prev = cur;
  }
  return prev[br.length];
}

/// تشابه هيكلي بين 0 و1.
double skeletonSimilarity(String a, String b) {
  final sa = skeleton(a);
  final sb = skeleton(b);
  final maxLen = sa.runes.length > sb.runes.length
      ? sa.runes.length
      : sb.runes.length;
  if (maxLen == 0) return 1;
  return 1 - levenshtein(sa, sb) / maxLen;
}
