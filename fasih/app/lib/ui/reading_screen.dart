import 'dart:async';

import 'package:flutter/material.dart';

import '../content/library.dart';
import '../data/family.dart';
import '../engine/arabic.dart';
import '../engine/assessor.dart';
import '../engine/feedback_policy.dart';
import '../engine/metrics.dart';
import '../speech/simulated_reader.dart';
import 'theme.dart';

class ReadingOutcome {
  const ReadingOutcome(this.assessment, this.metrics);

  final Assessment assessment;
  final SessionMetrics metrics;
}

/// شاشة القراءة الجهرية: النص مشكولاً بخط كبير، الكلمة الحالية مظللة،
/// تصحيح لحظي، وتلميح عند التردد. تعيد [ReadingOutcome] عند الانتهاء.
class ReadingScreen extends StatefulWidget {
  const ReadingScreen({
    super.key,
    required this.text,
    required this.mode,
    required this.hintDelaySec,
    this.config = const AssessmentConfig(),
    this.liveFeedback = true,
  });

  final ReadingText text;
  final InputMode mode;
  final int hintDelaySec;
  final AssessmentConfig config;

  /// يُعطَّل التصحيح اللحظي في التقييم وتحديد المستوى.
  final bool liveFeedback;

  @override
  State<ReadingScreen> createState() => _ReadingScreenState();
}

class _ReadingScreenState extends State<ReadingScreen> {
  final _heard = <HeardWord>[];
  final _policy = FeedbackPolicy();
  late Assessment _assessment;
  double _fontSize = 30;

  DateTime? _startedAt;
  bool _finished = false;
  StreamSubscription<HeardWord>? _demo;
  Timer? _hintTimer;
  Timer? _feedbackTimer;
  String? _hint;
  FeedbackAction _feedback = FeedbackAction.none;

  List<TextWord> get _words => widget.text.words;

  @override
  void initState() {
    super.initState();
    _assessment = assess(_words, const [], config: widget.config);
  }

  @override
  void dispose() {
    _demo?.cancel();
    _hintTimer?.cancel();
    _feedbackTimer?.cancel();
    super.dispose();
  }

  int get _elapsedMs => _startedAt == null
      ? 0
      : DateTime.now().difference(_startedAt!).inMilliseconds;

  void _start() {
    setState(() => _startedAt = DateTime.now());
    _armHint();
    if (widget.mode == InputMode.demo) {
      _demo = SimulatedReader(_words).play().listen(_onHeard);
    }
  }

  void _onHeard(HeardWord h) {
    if (_finished) return;
    _heard.add(h);
    _reassess();
  }

  void _reassess() {
    setState(() {
      _assessment = assess(_words, _heard, config: widget.config);
      _hint = null;
    });
    _armHint();
    if (widget.liveFeedback) {
      final action = _policy.next(_assessment);
      if (action.kind != FeedbackKind.none) _showFeedback(action);
    }
    if (_assessment.currentIndex >= _words.length) {
      Future<void>.delayed(const Duration(milliseconds: 700), _finish);
    }
  }

  void _armHint() {
    _hintTimer?.cancel();
    _hintTimer = Timer(Duration(seconds: widget.hintDelaySec), () {
      final i = _assessment.currentIndex;
      if (!mounted || _finished || i >= _words.length) return;
      setState(() => _hint = hintSyllable(_words[i].text));
    });
  }

  void _showFeedback(FeedbackAction action) {
    _feedbackTimer?.cancel();
    setState(() => _feedback = action);
    _feedbackTimer = Timer(const Duration(milliseconds: 2800), () {
      if (mounted) setState(() => _feedback = FeedbackAction.none);
    });
  }

  /// وضع المرافق: ولي الأمر يحكم على الكلمة الحالية.
  void _mark(bool correct) {
    final i = _assessment.currentIndex;
    if (i >= _words.length) return;
    final start = _heard.isEmpty ? 0 : _heard.last.endMs;
    final now = _elapsedMs;
    final end = now < start ? start : now;
    _heard.add(
      correct
          ? HeardWord(_words[i].text, start, end)
          : HeardWord.unclear(start, end),
    );
    _reassess();
  }

  void _undo() {
    if (_heard.isEmpty) return;
    _heard.removeLast();
    setState(() => _assessment = assess(_words, _heard, config: widget.config));
  }

  void _finish() {
    if (_finished || !mounted) return;
    _finished = true;
    _demo?.cancel();
    _hintTimer?.cancel();
    final duration = _heard.isEmpty ? _elapsedMs : _heard.last.endMs;
    final finalAssessment = assess(
      _words,
      _heard,
      config: widget.config,
      complete: true,
    );
    Navigator.of(context).pop(
      ReadingOutcome(
        finalAssessment,
        computeMetrics(finalAssessment, duration),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final started = _startedAt != null;
    return Scaffold(
      appBar: AppBar(
        title: Text('${widget.text.emoji} ${widget.text.title}'),
        actions: [
          IconButton(
            tooltip: 'تصغير',
            icon: const Icon(Icons.text_decrease),
            onPressed: () =>
                setState(() => _fontSize = (_fontSize - 4).clamp(24, 56)),
          ),
          IconButton(
            tooltip: 'تكبير',
            icon: const Icon(Icons.text_increase),
            onPressed: () =>
                setState(() => _fontSize = (_fontSize + 4).clamp(24, 56)),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: Stack(
                children: [
                  SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(20, 12, 20, 160),
                    child: Card(
                      color: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Wrap(
                          spacing: 6,
                          runSpacing: 10,
                          children: [
                            for (final r in _assessment.words)
                              _WordChip(
                                result: r,
                                current:
                                    started &&
                                    r.word.index == _assessment.currentIndex,
                                // لا نلوّن آخر كلمة قُرئت خطأً قبل أن يتجاوزها
                                // الطفل، فقد يصحح نفسه.
                                settled:
                                    r.word.index < _assessment.currentIndex - 1,
                                fontSize: _fontSize,
                              ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  if (_hint != null)
                    Positioned(
                      left: 20,
                      right: 20,
                      bottom: 16,
                      child: _Bubble(
                        emoji: '🦉',
                        child: Text(
                          '$_hint…',
                          style: TextStyle(
                            fontSize: _fontSize,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                  if (_feedback.kind != FeedbackKind.none)
                    Positioned(
                      left: 20,
                      right: 20,
                      bottom: 16,
                      child: _FeedbackCard(
                        action: _feedback,
                        fontSize: _fontSize,
                      ),
                    ),
                ],
              ),
            ),
            _controls(started),
          ],
        ),
      ),
    );
  }

  Widget _controls(bool started) {
    if (!started) {
      return Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Text(
              widget.mode == InputMode.companion
                  ? 'يقرأ الطفل بصوت عالٍ، وأنت تضغط ✓ أو ✗ لكل كلمة.'
                  : 'عرض تجريبي: فصيح يحاكي طفلاً يقرأ.',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: _start,
                icon: const Icon(Icons.mic, size: 32),
                label: const Text('ابدأ القراءة'),
              ),
            ),
          ],
        ),
      );
    }
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
      child: Row(
        children: [
          if (widget.mode == InputMode.companion) ...[
            Expanded(
              flex: 3,
              child: FilledButton(
                style: FilledButton.styleFrom(
                  backgroundColor: FasihColors.correctWord,
                ),
                onPressed: () => _mark(true),
                child: const Text('✓ صحيح', style: TextStyle(fontSize: 22)),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              flex: 3,
              child: FilledButton(
                style: FilledButton.styleFrom(
                  backgroundColor: FasihColors.softError,
                ),
                onPressed: () => _mark(false),
                child: const Text('✗ خطأ', style: TextStyle(fontSize: 22)),
              ),
            ),
            const SizedBox(width: 8),
            IconButton.outlined(
              tooltip: 'تراجع',
              onPressed: _heard.isEmpty ? null : _undo,
              icon: const Icon(Icons.undo),
            ),
          ] else
            const Expanded(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.graphic_eq, color: FasihColors.primary, size: 32),
                  SizedBox(width: 8),
                  Text('فصيح يستمع…', style: TextStyle(fontSize: 20)),
                ],
              ),
            ),
          const SizedBox(width: 8),
          TextButton(onPressed: _finish, child: const Text('انتهيت')),
        ],
      ),
    );
  }
}

class _WordChip extends StatelessWidget {
  const _WordChip({
    required this.result,
    required this.current,
    required this.settled,
    required this.fontSize,
  });

  final WordResult result;
  final bool current;
  final bool settled;
  final double fontSize;

  @override
  Widget build(BuildContext context) {
    Color? bg;
    var fg = FasihColors.ink;
    if (current) {
      bg = FasihColors.currentWord;
    } else if (result.isError && settled) {
      bg = FasihColors.errorWord;
    } else if (result.status == WordStatus.correct) {
      fg = FasihColors.correctWord;
    }
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        result.word.display,
        style: TextStyle(
          fontSize: fontSize,
          height: 1.9,
          color: fg,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class _Bubble extends StatelessWidget {
  const _Bubble({required this.emoji, required this.child});

  final String emoji;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Material(
      elevation: 6,
      color: Colors.white,
      borderRadius: BorderRadius.circular(20),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Text(emoji, style: const TextStyle(fontSize: 40)),
            const SizedBox(width: 12),
            Expanded(child: child),
          ],
        ),
      ),
    );
  }
}

class _FeedbackCard extends StatelessWidget {
  const _FeedbackCard({required this.action, required this.fontSize});

  final FeedbackAction action;
  final double fontSize;

  @override
  Widget build(BuildContext context) {
    final w = action.word!;
    final big = TextStyle(
      fontSize: fontSize,
      fontWeight: FontWeight.w800,
      color: FasihColors.primary,
    );
    switch (action.kind) {
      case FeedbackKind.correctAndRepeat:
        return _Bubble(
          emoji: '🦉',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('نقرؤها هكذا:'),
              Text(w.word.text, style: big),
              const Text('أعِدْها معي 🙂'),
            ],
          ),
        );
      case FeedbackKind.dialectHint:
        final letter = w.swaps.isEmpty ? '' : w.swaps.first.expected;
        return _Bubble(
          emoji: '🦉',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('في الفصحى نقول «$letterـ»'),
              Text(w.word.text, style: big),
            ],
          ),
        );
      case FeedbackKind.encourage:
        return const _Bubble(
          emoji: '👏',
          child: Text('أحسنت! صحّحت نفسك.', style: TextStyle(fontSize: 22)),
        );
      case FeedbackKind.none:
        return const SizedBox.shrink();
    }
  }
}
