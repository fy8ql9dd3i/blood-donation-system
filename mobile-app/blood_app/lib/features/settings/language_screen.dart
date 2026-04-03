import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';

class LanguageScreen extends StatelessWidget {
  const LanguageScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Language').tr()),
      body: ListView(
        children: [
          ListTile(
            title: const Text('English'),
            leading: Radio<Locale>(
              value: const Locale('en'),
              groupValue: context.locale,
              onChanged: (Locale? value) {
                if (value != null) {
                  context.setLocale(value);
                }
              },
            ),
            onTap: () => context.setLocale(const Locale('en')),
          ),
          ListTile(
            title: const Text('አማርኛ'),
            leading: Radio<Locale>(
              value: const Locale('am'),
              groupValue: context.locale,
              onChanged: (Locale? value) {
                if (value != null) {
                  context.setLocale(value);
                }
              },
            ),
            onTap: () => context.setLocale(const Locale('am')),
          ),
          ListTile(
            title: const Text('Afaan Oromoo'),
            leading: Radio<Locale>(
              value: const Locale('or'),
              groupValue: context.locale,
              onChanged: (Locale? value) {
                if (value != null) {
                  context.setLocale(value);
                }
              },
            ),
            onTap: () => context.setLocale(const Locale('or')),
          ),
        ],
      ),
    );
  }
}
