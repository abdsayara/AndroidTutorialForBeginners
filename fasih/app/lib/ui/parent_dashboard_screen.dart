import 'package:flutter/material.dart';

import '../app.dart';
import '../data/family.dart';
import 'add_child_screen.dart';
import 'theme.dart';

/// ما يعمل عليه الطفل، بلغة الأهل، مع نشاط منزلي قصير.
const focusAreas = {
  'dialectal': (
    'الأصوات الفصيحة: ث، ذ، ظ، ق',
    'اختر كلمة فيها «ث» وقولاها معاً ببطء مع إخراج اللسان قليلاً: ثَوْب، ثَعْلَب.',
  ),
  'internalVowel': (
    'الحركات داخل الكلمة',
    'اقرأ معه كلمتين تختلفان بحركة واحدة: كَتَبَ / كُتِبَ، وليقل لك الفرق.',
  ),
  'finalVowel': (
    'حركة آخر الكلمة',
    'لا تقلق، هذا يأتي في الصفوف الأعلى. اقرأ له جملة وليُعِدها.',
  ),
  'substitution': (
    'قراءة الكلمة كاملة بدل التخمين',
    'اطلب منه أن ينظر إلى أول الكلمة وآخرها قبل أن يقرأها.',
  ),
  'omission': ('عدم تخطّي الكلمات', 'ليتتبّع السطر بإصبعه أثناء القراءة.'),
  'insertion': (
    'قراءة ما هو مكتوب فقط',
    'اقرأ له جملة بإصبعك على كل كلمة، ثم يقرأها هو بالطريقة نفسها.',
  ),
};

/// لوحة الأسرة (P-06) والإعدادات. خلف بوابة الوالدين.
class ParentDashboardScreen extends StatelessWidget {
  const ParentDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final store = FasihScope.of(context).store;
    return Scaffold(
      appBar: AppBar(title: const Text('لوحة الأسرة')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          for (final c in store.children) _ChildCard(child: c),
          if (store.canAddChild)
            OutlinedButton.icon(
              onPressed: () => Navigator.of(
                context,
              ).push(MaterialPageRoute(builder: (_) => const AddChildScreen())),
              icon: const Icon(Icons.add),
              label: const Text('إضافة طفل'),
            ),
          const SizedBox(height: 24),
          const _Settings(),
        ],
      ),
    );
  }
}

class _ChildCard extends StatelessWidget {
  const _ChildCard({required this.child});

  final Child child;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    final sessions = child.sessions;
    final last = sessions.isEmpty ? null : sessions.last;
    final prev = sessions.length < 2 ? null : sessions[sessions.length - 2];
    final delta = (last != null && prev != null) ? last.wcpm - prev.wcpm : null;
    final days = child.daysReadInLastWeek(DateTime.now());
    final focus = _topFocus(sessions);

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(child.avatar, style: const TextStyle(fontSize: 40)),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    '${child.name} · الصف ${child.grade} · المستوى ${child.level ?? '—'}',
                    style: t.titleLarge,
                  ),
                ),
                IconButton(
                  tooltip: 'حذف بيانات الطفل',
                  icon: const Icon(Icons.delete_outline),
                  onPressed: () => _confirmDelete(context),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                _Stat(
                  label: 'كلمة صحيحة في الدقيقة',
                  value: last == null ? '—' : last.wcpm.round().toString(),
                  note: delta == null
                      ? null
                      : '${delta >= 0 ? '↑' : '↓'}${delta.abs().round()}',
                ),
                _Stat(label: 'أيام القراءة هذا الأسبوع', value: '$days من 7'),
                _Stat(
                  label: 'الدقة',
                  value: last == null
                      ? '—'
                      : '${(last.accuracy * 100).round()}%',
                ),
              ],
            ),
            if (sessions.length > 1) ...[
              const SizedBox(height: 12),
              _Trend(
                values: [
                  for (final s in sessions.reversed.take(10).toList().reversed)
                    s.wcpm,
                ],
              ),
            ],
            if (focus != null) ...[
              const Divider(height: 24),
              Text(
                'ما نعمل عليه هذا الأسبوع: ${focus.$1}',
                style: t.titleMedium,
              ),
              const SizedBox(height: 4),
              Text('💡 ${focus.$2}'),
            ],
          ],
        ),
      ),
    );
  }

  /// أكثر أنواع الأخطاء في آخر 5 جلسات.
  (String, String)? _topFocus(List<SessionRecord> sessions) {
    final counts = <String, int>{};
    for (final s in sessions.reversed.take(5)) {
      s.errorCounts.forEach((k, v) => counts[k] = (counts[k] ?? 0) + v);
    }
    if (counts.isEmpty) return null;
    final top = counts.entries.reduce((a, b) => a.value >= b.value ? a : b).key;
    return focusAreas[top];
  }

  Future<void> _confirmDelete(BuildContext context) async {
    final store = FasihScope.of(context).store;
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('حذف ${child.name}؟'),
        content: const Text(
          'ستُحذف كل بيانات الطفل وجلساته من هذا الجهاز نهائياً.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('إلغاء'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('حذف'),
          ),
        ],
      ),
    );
    if (ok ?? false) {
      await store.removeChild(child.id);
      if (store.children.isEmpty && context.mounted) {
        Navigator.of(context).popUntil((r) => r.isFirst);
      }
    }
  }
}

class _Stat extends StatelessWidget {
  const _Stat({required this.label, required this.value, this.note});

  final String label;
  final String value;
  final String? note;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          FittedBox(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                if (note != null) ...[
                  const SizedBox(width: 4),
                  Text(
                    note!,
                    style: TextStyle(
                      color: note!.startsWith('↑')
                          ? FasihColors.correctWord
                          : FasihColors.softError,
                    ),
                  ),
                ],
              ],
            ),
          ),
          Text(
            label,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 13),
          ),
        ],
      ),
    );
  }
}

/// أعمدة صغيرة لآخر الجلسات (WCPM).
class _Trend extends StatelessWidget {
  const _Trend({required this.values});

  final List<double> values;

  @override
  Widget build(BuildContext context) {
    // نبدأ المحور قرب أدنى قيمة كي يظهر التحسّن بوضوح.
    final maxV = values.fold<double>(1, (m, v) => v > m ? v : m);
    final minV = values.fold<double>(maxV, (m, v) => v < m ? v : m) * 0.8;
    final span = maxV - minV <= 0 ? 1 : maxV - minV;
    return SizedBox(
      height: 56,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          for (var i = 0; i < values.length; i++)
            Expanded(
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 3),
                height: 8 + 48 * (values[i] - minV) / span,
                decoration: BoxDecoration(
                  color: i == values.length - 1
                      ? FasihColors.primary
                      : FasihColors.primary.withAlpha(90),
                  borderRadius: BorderRadius.circular(6),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _Settings extends StatelessWidget {
  const _Settings();

  @override
  Widget build(BuildContext context) {
    final store = FasihScope.of(context).store;
    final s = store.settings;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('الإعدادات', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            Text('مهلة التلميح عند التردد: ${s.hintDelaySec} ثوانٍ'),
            Slider(
              value: s.hintDelaySec.toDouble(),
              min: 2,
              max: 5,
              divisions: 3,
              label: '${s.hintDelaySec}',
              onChanged: (v) =>
                  store.updateSettings((x) => x.hintDelaySec = v.round()),
            ),
            const Text('طريقة الاستماع'),
            const SizedBox(height: 8),
            SegmentedButton<InputMode>(
              segments: const [
                ButtonSegment(
                  value: InputMode.companion,
                  label: Text('المرافق يضغط'),
                ),
                ButtonSegment(value: InputMode.demo, label: Text('عرض تجريبي')),
              ],
              selected: {s.inputMode},
              onSelectionChanged: (v) =>
                  store.updateSettings((x) => x.inputMode = v.first),
            ),
            const SizedBox(height: 4),
            const Text(
              'الاستماع الآلي بالميكروفون يأتي مع ربط محرك الكلام.',
              style: TextStyle(fontSize: 13),
            ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              value: s.consentTraining,
              onChanged: (v) =>
                  store.updateSettings((x) => x.consentTraining = v),
              title: const Text('حفظ التسجيلات لتحسين فصيح (اختياري)'),
            ),
            const ListTile(
              contentPadding: EdgeInsets.zero,
              enabled: false,
              leading: Icon(Icons.school_outlined),
              title: Text('ربط بمدرسة طفلك'),
              subtitle: Text(
                'قريباً: أدخل «رمز الصف» من المعلمة، ويبقى سجل طفلك كاملاً.',
              ),
            ),
          ],
        ),
      ),
    );
  }
}
