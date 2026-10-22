import 'package:flutter/material.dart';

import '../app.dart';
import 'placement_screen.dart';
import 'theme.dart';

/// صور رمزية بدل صور حقيقية للأطفال (تقليل البيانات، القسم 9).
const avatars = [
  '🦁',
  '🐰',
  '🦊',
  '🐼',
  '🐢',
  '🦋',
  '🐬',
  '🦄',
  '🐝',
  '🐧',
  '🐯',
  '🐨',
];

/// إضافة طفل للأسرة، ثم الانتقال مباشرة إلى اختبار تحديد المستوى.
class AddChildScreen extends StatefulWidget {
  const AddChildScreen({super.key});

  @override
  State<AddChildScreen> createState() => _AddChildScreenState();
}

class _AddChildScreenState extends State<AddChildScreen> {
  final _name = TextEditingController();
  int? _grade;
  String? _avatar;
  bool _saving = false;

  bool get _valid =>
      _name.text.trim().isNotEmpty && _grade != null && _avatar != null;

  @override
  void dispose() {
    _name.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    final child = await FasihScope.of(context).store
        .addChild(name: _name.text, grade: _grade!, avatar: _avatar!);
    if (!mounted) return;
    await Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => PlacementScreen(childId: child.id)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).textTheme;
    return Scaffold(
      appBar: AppBar(title: const Text('طفل جديد')),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          Text('الاسم الأول', style: t.titleLarge),
          const SizedBox(height: 8),
          TextField(
            controller: _name,
            textInputAction: TextInputAction.done,
            maxLength: 20,
            style: const TextStyle(fontSize: 22),
            decoration: const InputDecoration(
              hintText: 'مثلاً: ليان',
              border: OutlineInputBorder(),
              counterText: '',
            ),
            onChanged: (_) => setState(() {}),
          ),
          const SizedBox(height: 24),
          Text('الصف', style: t.titleLarge),
          const SizedBox(height: 8),
          Wrap(
            spacing: 12,
            children: [
              for (final g in const [1, 2, 3, 4])
                ChoiceChip(
                  label: Text(
                    _gradeName(g),
                    style: const TextStyle(fontSize: 18),
                  ),
                  selected: _grade == g,
                  onSelected: (_) => setState(() => _grade = g),
                ),
            ],
          ),
          const SizedBox(height: 24),
          Text('اختر صورته', style: t.titleLarge),
          const SizedBox(height: 8),
          GridView.count(
            crossAxisCount: 4,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            children: [
              for (final a in avatars)
                Material(
                  color: _avatar == a ? FasihColors.currentWord : Colors.white,
                  shape: const CircleBorder(),
                  child: InkWell(
                    customBorder: const CircleBorder(),
                    onTap: () => setState(() => _avatar = a),
                    child: Center(
                      child: Text(a, style: const TextStyle(fontSize: 40)),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 32),
          FilledButton(
            onPressed: _valid && !_saving ? _save : null,
            child: const Text('التالي: اختبار المستوى'),
          ),
        ],
      ),
    );
  }
}

String _gradeName(int g) =>
    const {1: 'الأول', 2: 'الثاني', 3: 'الثالث', 4: 'الرابع'}[g]!;
