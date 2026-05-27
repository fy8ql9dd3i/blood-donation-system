import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'services/storage_service.dart';
import 'l10n/app_localizations.dart';
import 'screens/home_screen.dart';

void main() async {
  // Ensure Flutter binding is initialized
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize storage service (SharedPreferences)
  await StorageService.init();

  runApp(
    ChangeNotifierProvider(
      create: (_) => LanguageProvider(),
      child: const BloodDonationApp(),
    ),
  );
}

class BloodDonationApp extends StatelessWidget {
  const BloodDonationApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Listen to language changes to rebuild entire app
    final langProvider = Provider.of<LanguageProvider>(context);
    final t = AppLocalizations(langProvider.currentLanguage);

    return MaterialApp(
      title: t.tr('app_title'),
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.red,
        fontFamily: 'Roboto',
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: const HomeScreen(),
    );
  }
}
