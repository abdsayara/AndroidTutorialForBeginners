import 'package:flutter/material.dart';

import '../app.dart';
import '../data/family.dart';
import '../engine/leveling.dart';
import 'reading_screen.dart';
import 'theme.dart';

/// اختبار تحديد المستوى (C-02): حتى 3 نصوص متدرجة، يتوقف عند أول نص
/// دون 90% دقة. يعمل دون معلم.
class PlacementScreen extends StatefulWidget {
  const PlacementScreen({super.key, required this.childId});

  final String childId;

  @override
  State<PlacementScreen> createState() => _PlacementScreenState();
}

class _PlacementScreenState extends State<PlacementScreen> {
  final _readings = <PlacementReading>[];
  int? _result;
  bool _running = false;

  Future<void> _run() async {
    final scope = FasihScope.of(context);
    final store = scope.store;
    final child = store.byId(widget.childId);
    final navigator = Navigator.of(context);
    setState(() => _running = true);
    for (final text in scope.library.placement) {
      final outcome = await navigator.push<ReadingOutcome>(
        MaterialPageRoute(
          builder: (_) => ReadingScreen(
            text: text,
            mode: store.settings.inputMode,
            hintDelaySec: store.settings.hintDelaySec,
            liveFeedback: false,
          ),
        ),
      );
      if (!mounted) return;
      if (outcome == null) {
        setState(() => _running = false);
        return;
      }
      final m = outcome.metrics;
      final reading = PlacementReading(text.level, m.accuracy, m.wcpm);
      _readings.add(reading);
      await store.recordSession(
        child,
        SessionRecord(
          textId: text.id,
          kind: SessionKind.placement,
          level: text.level,
          at: DateTime.now(),
          durationMs: m.durationMs,
          wcpm: m.wcpm,
          accuracy: m.accuracy,
          wordsAttempted: m.wordsAttempted,
          errorCounts: m.errorCounts,
        ),
      );
      if (!continuePlacement(reading)) break;
    }
    final level = placeLevel(_readings);
    await store.setLevel(child, level);
    if (mounted) setState(() => _result = level);
  }

  @override
  Widget build(BuildContext context) {
    final child = FasihScope.of(context).store.byId(widget.childId);
    final t = Theme.of(context).textTheme;
    return Scaffold(
      appBar: AppBar(title: const Text('اختبار المستوى')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              child.avatar,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 96),
            ),
            const SizedBox(height: 16),
            if (_result == null) ...[
              Text(
                'هيّا يا ${child.name}!',
                textAlign: TextAlign.center,
                style: t.headlineMedium,
              ),
              const SizedBox(height: 8),
              Text(
                'ستقرأ قصصاً قصيرة لفصيح، تزداد صعوبةً قليلاً. لا بأس إن أخطأت!\n'
                '(نحو 3 دقائق — يمكن لولي الأمر مساعدته في الضغط)',
                textAlign: TextAlign.center,
                style: t.bodyLarge,
              ),
              const SizedBox(height: 32),
              FilledButton(
                onPressed: _running ? null : _run,
                child: const Text('ابدأ'),
              ),
            ] else ...[
              Text(
                'أحسنت يا ${child.name}! 🎉',
                textAlign: TextAlign.center,
                style: t.headlineMedium,
              ),
              const SizedBox(height: 16),
              const Center(child: StarRow(count: 3, size: 56)),
              const SizedBox(height: 16),
              Text(
                'ستبدأ رحلتك من المستوى $_result',
                textAlign: TextAlign.center,
                style: t.titleLarge,
              ),
              const SizedBox(height: 32),
              FilledButton(
                onPressed: () =>
                    Navigator.of(context).popUntil((r) => r.isFirst),
                child: const Text('إلى الرحلة'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
