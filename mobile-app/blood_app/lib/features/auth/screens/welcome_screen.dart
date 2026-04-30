import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../shared/widgets/base_screen.dart';

import '../../../shared/widgets/news_widget.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  void _showLanguageSelector(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'select_language'.tr(),
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 10),
              ListTile(
                title: const Text('English'),
                trailing: context.locale.languageCode == 'en' ? Icon(Icons.check_circle, color: Theme.of(context).primaryColor) : null,
                onTap: () { context.setLocale(const Locale('en')); Navigator.pop(context); },
              ),
              ListTile(
                title: const Text('አማርኛ'),
                trailing: context.locale.languageCode == 'am' ? Icon(Icons.check_circle, color: Theme.of(context).primaryColor) : null,
                onTap: () { context.setLocale(const Locale('am')); Navigator.pop(context); },
              ),
              ListTile(
                title: const Text('Afaan Oromoo'),
                trailing: context.locale.languageCode == 'or' ? Icon(Icons.check_circle, color: Theme.of(context).primaryColor) : null,
                onTap: () { context.setLocale(const Locale('or')); Navigator.pop(context); },
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return BaseScreen(
      title: 'welcome'.tr(),
      actions: [
        IconButton(
          icon: const Icon(Icons.language_rounded),
          onPressed: () => _showLanguageSelector(context),
          tooltip: 'language'.tr(),
        ),
      ],
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 10),
            
            // News & Announcements Section
            const NewsWidget(),
            
            const SizedBox(height: 32),
            
            // App Branding / Hero
            Center(
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.bloodtype, size: 60, color: Colors.red),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'app_name'.tr(),
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 10),
            
            // Action Button
            ElevatedButton(
              onPressed: () => Navigator.pushNamed(context, '/register'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 18),
                backgroundColor: Colors.red.shade600,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                elevation: 4,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.app_registration_rounded, color: Colors.white),
                  const SizedBox(width: 12),
                  Text(
                    'get_started_registration'.tr(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Secondary Actions / Info
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'need_help'.tr(),
                  style: TextStyle(color: Colors.grey.shade600),
                ),
                TextButton(
                  onPressed: () {
                    // Contact Support or FAQ
                  },
                  child: Text('contact_us'.tr()),
                ),
              ],
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
