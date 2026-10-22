import 'package:flutter/material.dart';

import '../app.dart';
import '../engine/leveling.dart';
import 'session_flow.dart';
import 'theme.dart';

/// بيت الطفل: خريطة الرحلة (المستويات) والنجوم وزر القراءة. دون نصوص
/// تعليمات تحتاج قراءة.
class ChildHomeScreen extends StatelessWidget {
  const ChildHomeScreen({super.key, required this.childId});

  final String childId;

  @override
  Widget build(BuildContext context) {
    final child = FasihScope.of(context).store.byId(childId);
    final level = child.level ?? 1;
    return Scaffold(
      appBar: AppBar(
        title: Text('${child.avatar} ${child.name}'),
        actions: [
          Padding(
            padding: const EdgeInsetsDirectional.only(end: 16),
            child: Row(
              children: [
                const Icon(
                  Icons.star_rounded,
                  color: FasihColors.star,
                  size: 32,
                ),
                Text(
                  '${child.stars}',
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              reverse: true,
              padding: const EdgeInsets.all(24),
              children: [
                for (var l = minLevel; l <= maxLevel; l++)
                  _JourneyStop(
                    level: l,
                    state: l < level ? 0 : (l == level ? 1 : 2),
                  ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(24),
            child: SizedBox(
              width: double.infinity,
              height: 88,
              child: FilledButton.icon(
                onPressed: () => Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => SessionFlow(childId: childId),
                  ),
                ),
                icon: const Icon(Icons.menu_book_rounded, size: 40),
                label: const Text('هيّا نقرأ', style: TextStyle(fontSize: 28)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _JourneyStop extends StatelessWidget {
  const _JourneyStop({required this.level, required this.state});

  final int level;

  /// 0 = مكتمل، 1 = الحالي، 2 = مقفل.
  final int state;

  static const _icons = ['🌱', '🌿', '🌳', '🏔️', '🏰'];

  @override
  Widget build(BuildContext context) {
    final current = state == 1;
    return Align(
      alignment: level.isOdd
          ? AlignmentDirectional.centerStart
          : AlignmentDirectional.centerEnd,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 32),
        child: Opacity(
          opacity: state == 2 ? 0.35 : 1,
          child: Container(
            width: current ? 120 : 92,
            height: current ? 120 : 92,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: current ? FasihColors.currentWord : Colors.white,
              border: Border.all(
                color: FasihColors.primary,
                width: current ? 5 : 2,
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  state == 2 ? '🔒' : _icons[level - 1],
                  style: TextStyle(fontSize: current ? 44 : 34),
                ),
                Text(
                  '$level',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
