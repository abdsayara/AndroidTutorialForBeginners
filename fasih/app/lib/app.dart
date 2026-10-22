import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'content/library.dart';
import 'data/family.dart';
import 'ui/onboarding_screen.dart';
import 'ui/profile_picker_screen.dart';
import 'ui/theme.dart';

/// يتيح للشاشات الوصول إلى المكتبة وحساب الأسرة.
class FasihScope extends InheritedNotifier<FamilyStore> {
  const FasihScope({
    super.key,
    required this.library,
    required FamilyStore store,
    required super.child,
  }) : super(notifier: store);

  final ContentLibrary library;

  FamilyStore get store => notifier!;

  static FasihScope of(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<FasihScope>()!;
}

class FasihApp extends StatelessWidget {
  const FasihApp({super.key, required this.library, required this.store});

  final ContentLibrary library;
  final FamilyStore store;

  @override
  Widget build(BuildContext context) {
    return FasihScope(
      library: library,
      store: store,
      child: MaterialApp(
        title: 'فَصيح',
        debugShowCheckedModeBanner: false,
        theme: buildTheme(),
        locale: const Locale('ar'),
        supportedLocales: const [Locale('ar')],
        localizationsDelegates: const [
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        home: const RootScreen(),
      ),
    );
  }
}

/// أول تشغيل: ترحيب وتسجيل الأسرة. بعدها: اختيار الطفل بصورته.
class RootScreen extends StatelessWidget {
  const RootScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final store = FasihScope.of(context).store;
    if (!store.settings.consentApp || store.children.isEmpty) {
      return const OnboardingScreen();
    }
    return const ProfilePickerScreen();
  }
}
