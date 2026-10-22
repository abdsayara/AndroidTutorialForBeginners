import 'dart:convert';

import '../engine/arabic.dart';

enum TextKind { practice, placement, benchmark }

class BridgeWord {
  const BridgeWord(this.word, this.dialect, this.emoji);

  /// الكلمة الفصيحة كما في النص.
  final String word;

  /// مقابلها العامي.
  final String dialect;
  final String emoji;
}

class AnswerOption {
  const AnswerOption(this.label, this.emoji);

  final String label;
  final String emoji;
}

class Question {
  const Question(this.prompt, this.options, this.answer);

  final String prompt;
  final List<AnswerOption> options;
  final int answer;
}

class ReadingText {
  ReadingText({
    required this.id,
    required this.level,
    required this.kind,
    required this.title,
    required this.emoji,
    required this.body,
    required this.bridge,
    required this.questions,
  }) : words = tokenize(body);

  final String id;
  final int level;
  final TextKind kind;
  final String title;
  final String emoji;
  final String body;
  final List<BridgeWord> bridge;
  final List<Question> questions;
  final List<TextWord> words;
}

class ContentLibrary {
  ContentLibrary(this.texts);

  factory ContentLibrary.fromJson(String source) {
    final data = jsonDecode(source) as Map<String, dynamic>;
    final texts = (data['texts'] as List).map((raw) {
      final t = raw as Map<String, dynamic>;
      return ReadingText(
        id: t['id'] as String,
        level: t['level'] as int,
        kind: TextKind.values.byName(t['kind'] as String),
        title: t['title'] as String,
        emoji: t['emoji'] as String,
        body: t['text'] as String,
        bridge: [
          for (final b in t['bridge'] as List)
            BridgeWord(
              b['word'] as String,
              b['dialect'] as String,
              b['emoji'] as String,
            ),
        ],
        questions: [
          for (final q in t['questions'] as List)
            Question(q['prompt'] as String, [
              for (final o in q['options'] as List)
                AnswerOption(o['label'] as String, o['emoji'] as String),
            ], q['answer'] as int),
        ],
      );
    }).toList();
    return ContentLibrary(texts);
  }

  final List<ReadingText> texts;

  ReadingText byId(String id) => texts.firstWhere((t) => t.id == id);

  List<ReadingText> practiceAt(int level) => texts
      .where((t) => t.kind == TextKind.practice && t.level == level)
      .toList();

  List<ReadingText> get placement =>
      texts.where((t) => t.kind == TextKind.placement).toList()
        ..sort((a, b) => a.level.compareTo(b.level));

  /// أعلى مستوى فيه نصوص تدريب (المكتبة تنمو تدريجياً).
  int get highestPracticeLevel => texts
      .where((t) => t.kind == TextKind.practice)
      .fold(1, (m, t) => t.level > m ? t.level : m);
}
