import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';

class LanguageScreen extends StatelessWidget {
  const LanguageScreen({super.key});

  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).primaryColor,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.language, size: 100, color: Colors.white),
                const SizedBox(height: 24),
                const Text(
                  'Select Language',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 48),
                _buildLanguageCard(context, 'en', 'English'),
                const SizedBox(height: 16),
                _buildLanguageCard(context, 'am', 'አማርኛ'),
                const SizedBox(height: 16),
                _buildLanguageCard(context, 'or', 'Afaan Oromoo'),
                const SizedBox(height: 48),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pushReplacementNamed(context, '/register');
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: Theme.of(context).primaryColor,
                      padding: const EdgeInsets.symmetric(vertical: 18),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(30),
                      ),
                    ),
                    child: const Text('Continue / ቀጥል', style: TextStyle(fontSize: 18)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLanguageCard(BuildContext context, String code, String label) {
    final bool isSelected = context.locale.languageCode == code;
    return GestureDetector(
      onTap: () => context.setLocale(Locale(code)),
      child: Container(
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.white.withOpacity(0.2),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? Colors.white : Colors.transparent,
            width: 2,
          ),
        ),
        child: ListTile(
          title: Text(
            label,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: isSelected ? Theme.of(context).primaryColor : Colors.white,
            ),
          ),
          trailing: Radio<String>(
            value: code,
            groupValue: context.locale.languageCode,
            activeColor: Theme.of(context).primaryColor,
            fillColor: WidgetStateProperty.resolveWith((states) {
              return isSelected ? Theme.of(context).primaryColor : Colors.white;
            }),
            onChanged: (String? value) {
              if (value != null) {
                context.setLocale(Locale(value));
              }
            },
          ),
        ),
      ),
    );
  }
}
