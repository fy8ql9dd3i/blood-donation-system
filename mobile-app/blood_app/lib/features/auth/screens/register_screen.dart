import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:provider/provider.dart';
import '../data/auth_repository.dart';
import '../../../shared/widgets/base_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _fullNameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _ageController = TextEditingController();
  final TextEditingController _addressController = TextEditingController();

  String _selectedCountryCode = '+251'; // Default: Ethiopia

  final List<Map<String, String>> _countryCodes = [
    {'code': '+251', 'name': 'Ethiopia'},
    {'code': '+1', 'name': 'USA/Canada'},
    {'code': '+44', 'name': 'UK'},
    {'code': '+91', 'name': 'India'},
    {'code': '+254', 'name': 'Kenya'},
    {'code': '+20', 'name': 'Egypt'},
  ];

  bool _isLoading = false;

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      await context.read<AuthRepository>().register({
        "name": _fullNameController.text.trim(),
        "phoneNumber": "$_selectedCountryCode${_phoneController.text.trim()}",
        "age": int.parse(_ageController.text.trim()),
        "address": _addressController.text.trim(),
        "language": context.locale.languageCode,
      });

      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('registered_successfully'.tr())));

      Navigator.pushReplacementNamed(context, '/dashboard');
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (!mounted) return;
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return BaseScreen(
      title: 'donor_registration'.tr(),
      body: Center(
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 10),
                
                Text(
                  'donor_registration'.tr(),
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.red),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 20),
                
                // Language Dropdown
                DropdownButtonFormField<String>(
                  value: context.locale.languageCode,
                  decoration: InputDecoration(
                    labelText: 'select_language'.tr(),
                    prefixIcon: const Icon(Icons.language_rounded),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'en', child: Text('English')),
                    DropdownMenuItem(value: 'am', child: Text('አማርኛ')),
                    DropdownMenuItem(value: 'or', child: Text('Afaan Oromoo')),
                  ],
                  onChanged: (value) {
                    if (value != null) {
                      context.setLocale(Locale(value));
                    }
                  },
                ),
                const SizedBox(height: 16),

                // Full Name
                TextFormField(
                  controller: _fullNameController,
                  decoration: InputDecoration(labelText: '${'name'.tr()} *'),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'name_required'.tr();
                    }
                    if (RegExp(r'[0-9]').hasMatch(value)) {
                      return 'Name must contain only letters (no numbers)';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                // Phone Number with Country Code
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      margin: const EdgeInsets.only(top: 8),
                      child: DropdownButton<String>(
                        value: _selectedCountryCode,
                        items: _countryCodes.map((country) {
                          return DropdownMenuItem<String>(
                            value: country['code'],
                            child: Text('${country['name']} (${country['code']})'),
                          );
                        }).toList(),
                        onChanged: (value) {
                          if (value != null) {
                            setState(() {
                              _selectedCountryCode = value;
                            });
                          }
                        },
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextFormField(
                        controller: _phoneController,
                        decoration: InputDecoration(labelText: '${'phone'.tr()} *'),
                        keyboardType: TextInputType.phone,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'phone_required'.tr();
                          }
                          if (!RegExp(r'^[0-9]+$').hasMatch(value)) {
                            return 'Phone number must contain only numbers';
                          }
                          return null;
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Age
                TextFormField(
                  controller: _ageController,
                  decoration: InputDecoration(labelText: '${'age'.tr()} *'),
                  keyboardType: TextInputType.number,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'age_required'.tr();
                    }
                    if (int.tryParse(value) == null) {
                      return 'Age must be a valid number';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                // Address
                TextFormField(
                  controller: _addressController,
                  decoration: InputDecoration(labelText: '${'address'.tr()} *'),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'address_required'.tr();
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 24),

                _isLoading
                    ? const CircularProgressIndicator()
                    : ElevatedButton(
                        onPressed: _handleRegister,
                        child: Text('register'.tr()),
                      ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
