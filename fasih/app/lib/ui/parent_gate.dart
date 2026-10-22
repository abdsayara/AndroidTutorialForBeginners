import 'dart:math';

import 'package:flutter/material.dart';

/// «بوابة الوالدين»: سؤال حسابي بسيط يمنع الطفل من دخول إعدادات الأهل
/// وشاشات الشراء (القسم 9).
Future<bool> showParentGate(BuildContext context) async {
  final rnd = Random();
  final a = 3 + rnd.nextInt(6);
  final b = 3 + rnd.nextInt(6);
  final answer = a * b;
  final options = <int>{answer};
  while (options.length < 3) {
    options.add(answer + (rnd.nextInt(9) - 4) * (1 + rnd.nextInt(2)));
  }
  options.remove(0);
  final shuffled = options.toList()..shuffle(rnd);

  final ok = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: const Text('للأهل فقط'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('كم يساوي $a × $b ؟', style: Theme.of(ctx).textTheme.titleLarge),
          const SizedBox(height: 16),
          Wrap(
            spacing: 12,
            children: [
              for (final o in shuffled)
                OutlinedButton(
                  onPressed: () => Navigator.of(ctx).pop(o == answer),
                  child: Text('$o', style: const TextStyle(fontSize: 20)),
                ),
            ],
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(ctx).pop(false),
          child: const Text('إلغاء'),
        ),
      ],
    ),
  );
  return ok ?? false;
}
