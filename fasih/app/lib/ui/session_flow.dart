import 'package:flutter/material.dart';

import '../app.dart';
import '../content/library.dart';
import '../data/family.dart';
import '../engine/assessor.dart';
import '../engine/leveling.dart';
import 'reading_screen.dart';
import 'theme.dart';

enum _Step { bridge, reading, questions, reward }

/// الجلسة اليومية: جسر الكلمات ← القراءة الجهرية ← أسئلة الفهم ← المكافأة.
class SessionFlow extends StatefulWidget {
  const SessionFlow({super.key, required this.childId});

  final String childId;

  @override
  State<SessionFlow> createState() => _SessionFlowState();
}

class _SessionFlowState extends State<SessionFlow> {
  late ReadingText _text;
  _Step _step = _Step.bridge;
  int _bridgeIndex = 0;
  int _questionIndex = 0;
  int _firstTryCorrect = 0;
  int? _wrongPick;
  ReadingOutcome? _outcome;
  int _stars = 0;
  bool _ready = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_ready) return;
    final scope = FasihScope.of(context);
    final child = scope.store.byId(widget.childId);
    final level = (child.level ?? 1).clamp(
      minLevel,
      scope.library.highestPracticeLevel,
    );
    final ids = scope.library.practiceAt(level).map((t) => t.id).toList();
    final id = nextTextId(ids, [for (final s in child.sessions) s.textId]);
    _text = scope.library.byId(id!);
    _step = _text.bridge.isEmpty ? _Step.reading : _Step.bridge;
    _ready = true;
    if (_step == _Step.reading) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _read());
    }
  }

  Future<void> _read() async {
    final store = FasihScope.of(context).store;
    final outcome = await Navigator.of(context).push<ReadingOutcome>(
      MaterialPageRoute(
        builder: (_) => ReadingScreen(
          text: _text,
          mode: store.settings.inputMode,
          hintDelaySec: store.settings.hintDelaySec,
          config: AssessmentConfig(
            countFinalVowelErrors: _text.level >= 3,
            hesitationMs: store.settings.hintDelaySec * 1000,
          ),
        ),
      ),
    );
    if (!mounted) return;
    if (outcome == null) {
      Navigator.of(context).pop();
      return;
    }
    setState(() {
      _outcome = outcome;
      _step = _text.questions.isEmpty ? _Step.reward : _Step.questions;
    });
    if (_step == _Step.reward) await _finish();
  }

  void _answer(int choice) {
    final q = _text.questions[_questionIndex];
    if (choice != q.answer) {
      setState(() => _wrongPick = choice);
      return;
    }
    if (_wrongPick == null) _firstTryCorrect++;
    setState(() {
      _wrongPick = null;
      _questionIndex++;
    });
    if (_questionIndex >= _text.questions.length) {
      setState(() => _step = _Step.reward);
      _finish();
    }
  }

  Future<void> _finish() async {
    final m = _outcome!.metrics;
    _stars = m.accuracy >= 0.95 ? 3 : (m.accuracy >= 0.85 ? 2 : 1);
    final store = FasihScope.of(context).store;
    await store.recordSession(
      store.byId(widget.childId),
      SessionRecord(
        textId: _text.id,
        kind: SessionKind.practice,
        level: _text.level,
        at: DateTime.now(),
        durationMs: m.durationMs,
        wcpm: m.wcpm,
        accuracy: m.accuracy,
        wordsAttempted: m.wordsAttempted,
        comprehensionCorrect: _firstTryCorrect,
        comprehensionTotal: _text.questions.length,
        errorCounts: m.errorCounts,
        stars: _stars,
      ),
    );
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('${_text.emoji} ${_text.title}')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: switch (_step) {
            _Step.bridge => _bridge(),
            _Step.reading => const Center(child: CircularProgressIndicator()),
            _Step.questions => _questions(),
            _Step.reward => _reward(),
          },
        ),
      ),
    );
  }

  /// جسر العامية-الفصحى (C-07): الكلمة الفصيحة ومقابلها العامي.
  Widget _bridge() {
    final b = _text.bridge[_bridgeIndex];
    final t = Theme.of(context).textTheme;
    final last = _bridgeIndex == _text.bridge.length - 1;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        LinearProgressIndicator(
          value: (_bridgeIndex + 1) / _text.bridge.length,
        ),
        const Spacer(),
        Text(
          b.emoji,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 96),
        ),
        const SizedBox(height: 16),
        Text(
          b.word,
          textAlign: TextAlign.center,
          style: t.headlineLarge!.copyWith(
            fontSize: 52,
            color: FasihColors.primary,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          'نقولُ في البيت: «${b.dialect}»',
          textAlign: TextAlign.center,
          style: t.titleLarge,
        ),
        const SizedBox(height: 8),
        Text('قُلْها معي 🦉', textAlign: TextAlign.center, style: t.bodyLarge),
        const Spacer(),
        FilledButton.icon(
          onPressed: () {
            if (last) {
              setState(() => _step = _Step.reading);
              _read();
            } else {
              setState(() => _bridgeIndex++);
            }
          },
          icon: Icon(
            last ? Icons.menu_book_rounded : Icons.arrow_forward_rounded,
            size: 32,
          ),
          label: Text(last ? 'إلى القصة' : 'التالي'),
        ),
      ],
    );
  }

  /// أسئلة الفهم (C-08) بخيارات مصورة.
  Widget _questions() {
    final q = _text.questions[_questionIndex];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        LinearProgressIndicator(
          value: (_questionIndex + 1) / _text.questions.length,
        ),
        const SizedBox(height: 24),
        Text(
          q.prompt,
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.headlineMedium,
        ),
        const SizedBox(height: 24),
        // خيارات مصوّرة في عمود: تتسع للتسميات الطويلة على الهاتف.
        Expanded(
          child: ListView.separated(
            itemCount: q.options.length,
            separatorBuilder: (_, _) => const SizedBox(height: 12),
            itemBuilder: (_, i) => _OptionTile(
              option: q.options[i],
              wrong: _wrongPick == i,
              onTap: () => _answer(i),
            ),
          ),
        ),
        if (_wrongPick != null)
          const Text(
            'حاوِلْ مرةً أخرى 🙂',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 22),
          ),
      ],
    );
  }

  Widget _reward() {
    final t = Theme.of(context).textTheme;
    const cheers = {
      3: 'رائع! قراءة فصيحة 🌟',
      2: 'أحسنت! أنت تتقدّم 💪',
      1: 'جميل! غداً أفضل 🌱',
    };
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          '🦉',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 96),
        ),
        const SizedBox(height: 16),
        Center(child: StarRow(count: _stars, size: 64)),
        const SizedBox(height: 16),
        Text(
          cheers[_stars] ?? '',
          textAlign: TextAlign.center,
          style: t.headlineMedium,
        ),
        const SizedBox(height: 40),
        FilledButton(
          onPressed: _stars == 0 ? null : () => Navigator.of(context).pop(),
          child: const Text('عودة إلى الرحلة'),
        ),
      ],
    );
  }
}

class _OptionTile extends StatelessWidget {
  const _OptionTile({
    required this.option,
    required this.wrong,
    required this.onTap,
  });

  final AnswerOption option;
  final bool wrong;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: wrong ? FasihColors.errorWord : Colors.white,
      borderRadius: BorderRadius.circular(24),
      elevation: 2,
      child: InkWell(
        borderRadius: BorderRadius.circular(24),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          child: Row(
            children: [
              Text(option.emoji, style: const TextStyle(fontSize: 52)),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  option.label,
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
