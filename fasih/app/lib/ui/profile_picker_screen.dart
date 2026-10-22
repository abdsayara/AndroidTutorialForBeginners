import 'package:flutter/material.dart';

import '../app.dart';
import 'add_child_screen.dart';
import 'child_home_screen.dart';
import 'parent_dashboard_screen.dart';
import 'parent_gate.dart';
import 'placement_screen.dart';
import 'theme.dart';

/// دخول الطفل بصورته دون كلمة مرور (C-01): ضغطة لاختيار الصورة،
/// وضغطة لبدء القراءة.
class ProfilePickerScreen extends StatelessWidget {
  const ProfilePickerScreen({super.key});

  Future<void> _parentArea(BuildContext context, Widget screen) async {
    if (!await showParentGate(context) || !context.mounted) return;
    await Navigator.of(context).push(MaterialPageRoute(builder: (_) => screen));
  }

  @override
  Widget build(BuildContext context) {
    final store = FasihScope.of(context).store;
    return Scaffold(
      appBar: AppBar(
        title: const Text('مَنْ سيقرأ اليوم؟'),
        actions: [
          IconButton(
            tooltip: 'للأهل',
            icon: const Icon(Icons.family_restroom),
            onPressed: () =>
                _parentArea(context, const ParentDashboardScreen()),
          ),
        ],
      ),
      body: GridView.count(
        padding: const EdgeInsets.all(24),
        crossAxisCount: 2,
        mainAxisSpacing: 20,
        crossAxisSpacing: 20,
        children: [
          for (final c in store.children)
            BigChoice(
              emoji: c.avatar,
              label: c.name,
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => c.isPlaced
                      ? ChildHomeScreen(childId: c.id)
                      : PlacementScreen(childId: c.id),
                ),
              ),
            ),
          if (store.canAddChild)
            BigChoice(
              emoji: '➕',
              label: 'طفل جديد',
              color: FasihColors.background,
              onTap: () => _parentArea(context, const AddChildScreen()),
            ),
        ],
      ),
    );
  }
}
