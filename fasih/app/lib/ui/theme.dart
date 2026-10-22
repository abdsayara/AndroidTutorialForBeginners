import 'package:flutter/material.dart';

class FasihColors {
  static const primary = Color(0xFF1F7A6D);
  static const accent = Color(0xFFF2A541);
  static const background = Color(0xFFFFF8EE);
  static const surface = Colors.white;
  static const ink = Color(0xFF263238);
  static const currentWord = Color(0xFFFFE08A);
  static const correctWord = Color(0xFF2E7D32);
  static const errorWord = Color(0xFFFFD6CC);
  static const softError = Color(0xFFB23A2E);
  static const star = Color(0xFFFFB300);
}

ThemeData buildTheme() {
  final scheme = ColorScheme.fromSeed(
    seedColor: FasihColors.primary,
    primary: FasihColors.primary,
    secondary: FasihColors.accent,
    surface: FasihColors.surface,
  );
  return ThemeData(
    colorScheme: scheme,
    scaffoldBackgroundColor: FasihColors.background,
    useMaterial3: true,
    fontFamily: 'NotoNaskhArabic',
    appBarTheme: const AppBarTheme(
      backgroundColor: FasihColors.background,
      foregroundColor: FasihColors.ink,
      elevation: 0,
      centerTitle: true,
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        minimumSize: const Size(64, 56),
        textStyle: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      ),
    ),
    textTheme: const TextTheme(
      headlineLarge: TextStyle(
        fontSize: 34,
        fontWeight: FontWeight.w800,
        color: FasihColors.ink,
      ),
      headlineMedium: TextStyle(
        fontSize: 26,
        fontWeight: FontWeight.w700,
        color: FasihColors.ink,
      ),
      titleLarge: TextStyle(
        fontSize: 22,
        fontWeight: FontWeight.w700,
        color: FasihColors.ink,
      ),
      bodyLarge: TextStyle(fontSize: 18, color: FasihColors.ink),
      bodyMedium: TextStyle(fontSize: 16, color: FasihColors.ink),
    ),
  );
}

/// زر كبير للأطفال: أيقونة/رمز تعبيري فوق نص قصير (أزرار ≥ 48dp).
class BigChoice extends StatelessWidget {
  const BigChoice({
    super.key,
    required this.emoji,
    required this.label,
    required this.onTap,
    this.color,
    this.selected = false,
  });

  final String emoji;
  final String label;
  final VoidCallback? onTap;
  final Color? color;
  final bool selected;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: color ?? Colors.white,
      borderRadius: BorderRadius.circular(24),
      elevation: selected ? 6 : 2,
      child: InkWell(
        borderRadius: BorderRadius.circular(24),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: selected ? FasihColors.primary : Colors.transparent,
              width: 3,
            ),
          ),
          child: FittedBox(
            fit: BoxFit.scaleDown,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(emoji, style: const TextStyle(fontSize: 48)),
                const SizedBox(height: 8),
                Text(
                  label,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class StarRow extends StatelessWidget {
  const StarRow({super.key, required this.count, this.of = 3, this.size = 40});

  final int count;
  final int of;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (var i = 0; i < of; i++)
          Icon(
            i < count ? Icons.star_rounded : Icons.star_outline_rounded,
            color: FasihColors.star,
            size: size,
          ),
      ],
    );
  }
}
