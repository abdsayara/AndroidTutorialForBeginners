import 'dart:async';

import '../engine/arabic.dart';
import '../engine/assessor.dart';
import '../engine/dialect.dart';

/// قارئ محاكى لوضع العرض: يقرأ النص بإيقاع طفل ويرتكب أخطاء نموذجية
/// (إبدال لهجي، خطأ حركة، تصحيح ذاتي، تردد) لتجربة الواجهة قبل ربط محرك
/// الكلام الحقيقي.
class SimulatedReader {
  SimulatedReader(this.words, {this.wordMs = 900, this.hesitationMs = 4000});

  final List<TextWord> words;
  final int wordMs;
  final int hesitationMs;

  /// يبني تسلسل الكلمات المسموعة مع توقيتها.
  List<HeardWord> script() {
    final out = <HeardWord>[];
    var t = 600;
    var dialectDone = false;
    var vowelDone = false;
    var selfCorrectDone = false;
    for (final w in words) {
      final i = w.index;
      if (i == 4 && words.length > 8) t += hesitationMs;

      if (!dialectDone && i > 0) {
        final swapped = _dialectVariant(w.text);
        if (swapped != null) {
          dialectDone = true;
          out.add(HeardWord(swapped, t, t + wordMs - 200));
          t += wordMs;
          continue;
        }
      }
      if (!selfCorrectDone && i >= 6) {
        final wrong = _vowelVariant(w.text);
        if (wrong != null) {
          selfCorrectDone = true;
          out.add(HeardWord(wrong, t, t + wordMs - 200));
          t += wordMs;
          out.add(HeardWord(w.text, t, t + wordMs - 200));
          t += wordMs;
          continue;
        }
      }
      if (!vowelDone && i >= 10) {
        final wrong = _vowelVariant(w.text);
        if (wrong != null) {
          vowelDone = true;
          out.add(HeardWord(wrong, t, t + wordMs - 200));
          t += wordMs;
          continue;
        }
      }
      out.add(HeardWord(w.text, t, t + wordMs - 200));
      t += wordMs;
    }
    return out;
  }

  /// يبث الكلمات في توقيتها الحقيقي.
  Stream<HeardWord> play() async* {
    final start = DateTime.now();
    for (final h in script()) {
      final elapsed = DateTime.now().difference(start).inMilliseconds;
      final wait = h.endMs - elapsed;
      if (wait > 0) await Future<void>.delayed(Duration(milliseconds: wait));
      yield h;
    }
  }

  String? _dialectVariant(String word) {
    final gs = graphemes(word);
    for (var k = 0; k < gs.length; k++) {
      final alts = dialectSubstitutions[normalizeLetter(gs[k].letter)];
      if (alts == null) continue;
      final replaced = [
        for (var x = 0; x < gs.length; x++)
          x == k
              ? Grapheme(alts.first == 'ء' ? 'أ' : alts.first, gs[x].marks)
              : gs[x],
      ];
      return replaced.join();
    }
    return null;
  }

  /// يغيّر حركة أول حرف مفتوح إلى ضمة.
  String? _vowelVariant(String word) {
    final gs = graphemes(word);
    for (var k = 0; k < gs.length - 1; k++) {
      if (gs[k].vowel == fatha) {
        final marks = {...gs[k].marks}
          ..remove(fatha)
          ..add(damma);
        return [
          for (var x = 0; x < gs.length; x++)
            x == k ? Grapheme(gs[x].letter, marks) : gs[x],
        ].join();
      }
    }
    return null;
  }
}
