import 'package:fasih/engine/arabic.dart';
import 'package:fasih/engine/assessor.dart';
import 'package:fasih/engine/dialect.dart';
import 'package:fasih/engine/feedback_policy.dart';
import 'package:fasih/engine/leveling.dart';
import 'package:fasih/engine/metrics.dart';
import 'package:flutter_test/flutter_test.dart';

/// يحوّل قائمة كلمات إلى كلمات مسموعة بفاصل 600ms.
List<HeardWord> heardSeq(List<String> words, {int gapMs = 600, int start = 0}) {
  final out = <HeardWord>[];
  var t = start;
  for (final w in words) {
    out.add(HeardWord(w, t, t + 400));
    t += gapMs;
  }
  return out;
}

void main() {
  group('arabic', () {
    test('tokenize strips punctuation and marks pause positions', () {
      final ws = tokenize('رَسَمَ أَحْمَدُ القَمَرَ. قالَ: «جَميلٌ»!');
      expect(ws.map((w) => w.text).toList(), [
        'رَسَمَ',
        'أَحْمَدُ',
        'القَمَرَ',
        'قالَ',
        'جَميلٌ',
      ]);
      expect(ws.map((w) => w.endsClause).toList(), [
        false,
        false,
        true,
        true,
        true,
      ]);
    });

    test('skeleton normalizes hamza seats, ta marbuta and alef maqsura', () {
      expect(skeleton('أَحْمَدُ'), skeleton('احمد'));
      expect(skeleton('الشَّجَرَةِ'), skeleton('الشجره'));
      expect(skeleton('سَلْمى'), skeleton('سلمي'));
    });

    test('graphemes attach marks to letters', () {
      final gs = graphemes('قِطٌّ');
      expect(gs.length, 2);
      expect(gs[1].hasShadda, isTrue);
      expect(gs[1].vowel, dammatan);
    });

    test('hint syllable', () {
      expect(hintSyllable('رَسَمَ'), 'رَ');
      expect(hintSyllable('القَمَرَ'), 'القَ');
    });
  });

  group('dialect', () {
    test('detects Levantine substitutions', () {
      expect(dialectSwaps('ثَعْلَب', 'تَعْلَب'), [const DialectSwap('ث', 'ت')]);
      expect(dialectSwaps('أَخَذَ', 'أَخَد'), [const DialectSwap('ذ', 'د')]);
      expect(dialectSwaps('القَمَرَ', 'الأَمَر'), [
        const DialectSwap('ق', 'ا'),
      ]);
      expect(dialectSwaps('بِنْتٌ', 'بيت'), isNull);
    });
  });

  group('assess', () {
    final text = tokenize(
      'أَخَذَ أَحْمَدُ القَلَمَ. رَسَمَ أَحْمَدُ القَمَرَ.',
    );

    test('perfect reading', () {
      final a = assess(
        text,
        heardSeq(text.map((w) => w.text).toList()),
        complete: true,
      );
      expect(a.words.every((w) => w.status == WordStatus.correct), isTrue);
      expect(a.insertions, isEmpty);
    });

    test('unvocalized ASR output is accepted on skeleton', () {
      final a = assess(
        text,
        heardSeq(['اخذ', 'احمد', 'القلم', 'رسم', 'احمد', 'القمر']),
      );
      expect(a.words.every((w) => w.status == WordStatus.correct), isTrue);
      expect(a.words.every((w) => !w.vowelsChecked), isTrue);
    });

    test('substitution, omission and dialect errors', () {
      final a = assess(
        text,
        heardSeq(['أَخَدَ', 'أَحْمَدُ', 'القَلَمَ', 'أَحْمَدُ', 'الكَلْبَ']),
        complete: true,
      );
      expect(a.words[0].errorType, ErrorType.dialectal);
      expect(a.words[3].errorType, ErrorType.omission);
      expect(a.words[4].status, WordStatus.correct);
      expect(a.words[5].errorType, ErrorType.substitution);
    });

    test('internal vowel error', () {
      final a = assess(
        tokenize('كَتَبَ الوَلَدُ'),
        heardSeq(['كُتِبَ', 'الوَلَدُ']),
      );
      expect(a.words[0].errorType, ErrorType.internalVowel);
      expect(a.words[0].isError, isTrue);
    });

    test('final vowel counted only when configured', () {
      final t = tokenize('جاءَ الوَلَدُ مُسْرِعًا');
      final h = heardSeq(['جاءَ', 'الوَلَدَ', 'مُسْرِعًا']);
      final lenient = assess(t, h);
      expect(lenient.words[1].status, WordStatus.correct);
      expect(lenient.words[1].errorType, ErrorType.finalVowel);
      final strict = assess(
        t,
        h,
        config: const AssessmentConfig(countFinalVowelErrors: true),
      );
      expect(strict.words[1].status, WordStatus.error);
    });

    test('pausal sukun at end of sentence is correct', () {
      final t = tokenize('ذَهَبْتُ إِلى المَدْرَسَةِ.');
      final a = assess(
        t,
        heardSeq(['ذَهَبْتُ', 'إِلى', 'المَدْرَسَهْ']),
        config: const AssessmentConfig(countFinalVowelErrors: true),
      );
      expect(a.words[2].status, WordStatus.correct);
      expect(a.words[2].pausal, isTrue);
    });

    test('pausal fatha for tanwin fath before alef', () {
      final t = tokenize('أَكَلْنا مَعًا.');
      final a = assess(
        t,
        heardSeq(['أَكَلْنا', 'مَعَا']),
        config: const AssessmentConfig(countFinalVowelErrors: true),
      );
      expect(a.words[1].status, WordStatus.correct);
    });

    test('self-correction counts as correct', () {
      final a = assess(
        text,
        heardSeq([
          'أَخَذَ',
          'أَحْمَدُ',
          'القَلَمَ',
          'رُسِمَ',
          'رَسَمَ',
          'أَحْمَدُ',
        ]),
      );
      expect(a.words[3].status, WordStatus.correct);
      expect(a.words[3].selfCorrected, isTrue);
      expect(a.insertions, isEmpty);
    });

    test('repetition is not an error', () {
      final a = assess(text, heardSeq(['أَخَذَ', 'أَخَذَ', 'أَحْمَدُ']));
      expect(a.words[0].status, WordStatus.correct);
      expect(a.words[0].repeated, isTrue);
      expect(a.insertions, isEmpty);
    });

    test('unrelated extra word is an insertion', () {
      final a = assess(text, heardSeq(['أَخَذَ', 'وَ', 'أَحْمَدُ']));
      expect(a.insertions.map((h) => h.text), ['وَ']);
      expect(a.words[1].status, WordStatus.correct);
    });

    test('repeated words in text track the earliest position', () {
      final a = assess(text, heardSeq(['أَخَذَ', 'أَحْمَدُ']));
      expect(a.words[1].status, WordStatus.correct);
      expect(a.words[4].status, WordStatus.pending);
      expect(a.currentIndex, 2);
    });

    test('unclear words advance as substitutions (companion mode)', () {
      final a = assess(text, [
        const HeardWord('أَخَذَ', 0, 400),
        const HeardWord.unclear(400, 800),
        const HeardWord.unclear(800, 1200),
        const HeardWord('رَسَمَ', 1200, 1600),
      ]);
      expect(a.words[1].errorType, ErrorType.substitution);
      expect(a.words[2].errorType, ErrorType.substitution);
      expect(a.words[3].status, WordStatus.correct);
      expect(a.currentIndex, 4);
      expect(a.insertions, isEmpty);
    });

    test('hesitation is flagged', () {
      final h = [
        const HeardWord('أَخَذَ', 0, 400),
        const HeardWord('أَحْمَدُ', 4000, 4400),
      ];
      final a = assess(text, h);
      expect(a.words[1].hesitated, isTrue);
      expect(a.words[1].status, WordStatus.correct);
    });

    test('unreached words are not counted', () {
      final a = assess(text, heardSeq(['أَخَذَ', 'أَحْمَدُ']), complete: true);
      expect(a.words[2].status, WordStatus.notReached);
      final m = computeMetrics(a, 60000);
      expect(m.wordsAttempted, 2);
      expect(m.wcpm, 2);
    });
  });

  group('metrics', () {
    test('wcpm and accuracy', () {
      final t = tokenize('أَخَذَ أَحْمَدُ القَلَمَ رَسَمَ');
      final a = assess(
        t,
        heardSeq(['أَخَذَ', 'أَحْمَدُ', 'الكَلْبَ', 'رَسَمَ', 'هُوَ']),
        complete: true,
      );
      final m = computeMetrics(a, 30000);
      expect(m.wordsAttempted, 4);
      expect(m.wordsCorrect, 3);
      expect(m.errors, 2); // استبدال + كلمة زائدة
      expect(m.wcpm, 4); // (4 − 2) ÷ 0.5 دقيقة
      expect(m.accuracy, 0.75);
      expect(m.errorCounts, {'substitution': 1, 'insertion': 1});
    });
  });

  group('feedback policy', () {
    final text = tokenize('أَخَذَ أَحْمَدُ القَلَمَ رَسَمَ أَحْمَدُ القَمَرَ');

    test('waits until the child moves past the word', () {
      final p = FeedbackPolicy();
      expect(
        p.next(assess(text, heardSeq(['أَخَدَ']))).kind,
        FeedbackKind.none,
      );
      final a = assess(text, heardSeq(['أَخَدَ', 'أَحْمَدُ']));
      final action = p.next(a);
      expect(action.kind, FeedbackKind.dialectHint);
      expect(action.word!.word.index, 0);
      expect(p.next(a).kind, FeedbackKind.none);
    });

    test('does not interrupt twice within the cooldown', () {
      final p = FeedbackPolicy();
      final a = assess(
        text,
        heardSeq([
          'الكَلْبَ',
          'الكَلْبَ',
          'القَلَمَ',
          'رَسَمَ',
          'أَحْمَدُ',
          'القَمَرَ',
        ]),
        complete: true,
      );
      expect(p.next(a).kind, FeedbackKind.correctAndRepeat);
      expect(p.next(a).kind, FeedbackKind.none);
    });
  });

  group('leveling', () {
    test('placement picks highest level read at 90%+', () {
      expect(
        placeLevel(const [
          PlacementReading(1, 0.98, 30),
          PlacementReading(2, 0.92, 28),
          PlacementReading(3, 0.80, 20),
        ]),
        2,
      );
      expect(placeLevel(const [PlacementReading(1, 0.5, 10)]), 1);
    });

    test('level up after 3 strong sessions, down after 2 weak ones', () {
      const strong = PracticeResult(level: 2, accuracy: 0.98, comprehension: 1);
      const weak = PracticeResult(level: 2, accuracy: 0.8, comprehension: 0.5);
      expect(nextLevel(2, const [strong, strong]), 2);
      expect(nextLevel(2, const [strong, strong, strong]), 3);
      expect(nextLevel(2, const [strong, weak, weak]), 1);
      expect(nextLevel(1, const [weak, weak]), 1);
    });

    test('next text prefers unread, then least recent', () {
      expect(nextTextId(['a', 'b', 'c'], ['a']), 'b');
      expect(nextTextId(['a', 'b'], ['a', 'b', 'a']), 'b');
    });
  });
}
