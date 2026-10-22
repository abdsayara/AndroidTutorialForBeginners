import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'app.dart';
import 'content/library.dart';
import 'data/family.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final library = ContentLibrary.fromJson(
    await rootBundle.loadString('assets/content/texts.json'),
  );
  final store = await FamilyStore.load();
  runApp(FasihApp(library: library, store: store));
}
