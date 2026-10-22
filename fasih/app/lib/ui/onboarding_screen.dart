import 'package:flutter/material.dart';

import '../app.dart';
import 'add_child_screen.dart';
import 'theme.dart';

/// بداية الأسرة المباشرة (دون مدرسة): ترحيب، موافقات، ثم إضافة الطفل
/// واختبار تحديد المستوى.
class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  bool _consentApp = false;
  bool _consentTraining = false;

  Future<void> _start() async {
    final scope = FasihScope.of(context);
    await scope.store.updateSettings((s) {
      s.consentApp = true;
      s.consentTraining = _consentTraining;
    });
    if (!mounted) return;
    // بعد الحفظ تنتقل شاشة الإضافة نفسها إلى اختبار المستوى؛ هذه الشاشة
    // تُستبدل بشاشة اختيار الطفل فور إضافة أول طفل.
    await Navigator.of(context)
        .push(MaterialPageRoute(builder: (_) => const AddChildScreen()));
  }

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            const SizedBox(height: 24),
            const Text(
              '🦉',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 96),
            ),
            Text(
              'فَصيح',
              textAlign: TextAlign.center,
              style: t.headlineLarge!.copyWith(
                fontSize: 48,
                color: FasihColors.primary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'يسمعُ طفلَك ويُعلّمه القراءة',
              textAlign: TextAlign.center,
              style: t.titleLarge,
            ),
            const SizedBox(height: 32),
            const _Point('🎙️', 'طفلك يقرأ بصوت عالٍ، وفصيح يستمع كلمةً كلمة.'),
            const _Point('✨', 'تصحيح لطيف فوري، ونجوم تشجّعه كل يوم.'),
            const _Point('📈', 'تقرير أسبوعي بسيط يخبرك أين وصل وماذا يحتاج.'),
            const _Point(
              '🏫',
              'لا يحتاج مدرسة. وإن انضمت مدرسته لاحقاً، يبقى سجله كاملاً.',
            ),
            const SizedBox(height: 24),
            CheckboxListTile(
              value: _consentApp,
              onChanged: (v) => setState(() => _consentApp = v ?? false),
              title: const Text(
                'أوافق بصفتي ولي الأمر على استخدام طفلي للتطبيق وفق سياسة الخصوصية.',
              ),
              controlAffinity: ListTileControlAffinity.leading,
            ),
            CheckboxListTile(
              value: _consentTraining,
              onChanged: (v) => setState(() => _consentTraining = v ?? false),
              title: const Text(
                '(اختياري) أوافق على حفظ تسجيلات القراءة لتحسين دقة فصيح. يمكن التراجع في أي وقت.',
              ),
              controlAffinity: ListTileControlAffinity.leading,
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: _consentApp ? _start : null,
              child: const Text('أضف طفلك وابدأ'),
            ),
          ],
        ),
      ),
    );
  }
}

class _Point extends StatelessWidget {
  const _Point(this.emoji, this.text);

  final String emoji;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(emoji, style: const TextStyle(fontSize: 28)),
          const SizedBox(width: 12),
          Expanded(
            child: Text(text, style: Theme.of(context).textTheme.bodyLarge),
          ),
        ],
      ),
    );
  }
}
