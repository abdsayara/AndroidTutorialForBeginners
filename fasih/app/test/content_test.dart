import 'dart:io';

import 'package:fasih/content/library.dart';
import 'package:fasih/engine/arabic.dart';
import 'package:fasih/engine/assessor.dart';
import 'package:fasih/speech/simulated_reader.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  final library = ContentLibrary.fromJson(
    File('assets/content/texts.json').readAsStringSync(),
  );

  test('placement has graded texts for levels 1–3', () {
    expect(library.placement.map((t) => t.level), [1, 2, 3]);
  });

  for (final t in library.texts) {
    group(t.id, () {
      test('ids unique and texts vocalized', () {
        expect(library.texts.where((x) => x.id == t.id).length, 1);
        final vocalized = t.words.where((w) => hasAnyDiacritic(w.text)).length;
        // أسماء العلم وبعض الحروف (في، لا، يا) تُكتب عادةً دون شكل.
        expect(vocalized / t.words.length, greaterThan(0.75));
      });

      test('bridge words appear in the text', () {
        final words = t.words.map((w) => w.text).toSet();
        for (final b in t.bridge) {
          expect(
            words.contains(b.word) || words.any((w) => w.endsWith(b.word)),
            isTrue,
            reason: b.word,
          );
        }
      });

      test('questions are well formed', () {
        for (final q in t.questions) {
          expect(q.options.length, inInclusiveRange(2, 3));
          expect(q.answer, inInclusiveRange(0, q.options.length - 1));
        }
      });

      test('a perfect reading scores 100%', () {
        var ms = 0;
        final heard = [
          for (final w in t.words) HeardWord(w.text, ms += 500, ms + 400),
        ];
        final a = assess(t.words, heard, complete: true);
        expect(a.words.every((w) => w.status == WordStatus.correct), isTrue);
      });

      test('simulated reader reaches the end', () {
        final a = assess(
          t.words,
          SimulatedReader(t.words).script(),
          complete: true,
        );
        expect(a.currentIndex, t.words.length);
        expect(a.insertions, isEmpty);
      });
    });
  }
}
