import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'app/app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await EasyLocalization.ensureInitialized();
  runApp(
    EasyLocalization(
      supportedLocales: const [Locale('en'), Locale('am'), Locale('or')],
      path: 'assets/translations',
      fallbackLocale: const Locale('en'),
      child: App(), // No 'const' – App is not a constant widget
    ),
  );
}
