import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:provider/provider.dart';
import '../../../data/repositories/auth_repository.dart';
import '../../../widgets/base_screen.dart';

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

  bool _isLoading = false;

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      await context.read<AuthRepository>().register({
        "name": _fullNameController.text.trim(),
        "phoneNumber": _phoneController.text.trim(),
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
              children: [
                const Icon(Icons.bloodtype, size: 80, color: Colors.red),
                const SizedBox(height: 20),
                const SizedBox(height: 20),

                // Full Name
                TextFormField(
                  controller: _fullNameController,
                  decoration: InputDecoration(labelText: '${'name'.tr()} *'),
                  validator: (value) => value == null || value.isEmpty
                      ? '${'name_required'.tr()}'
                      : null,
                ),
                const SizedBox(height: 16),

                // Phone Number
                TextFormField(
                  controller: _phoneController,
                  decoration: InputDecoration(labelText: '${'phone'.tr()} *'),
                  keyboardType: TextInputType.phone,
                  validator: (value) => value == null || value.isEmpty
                      ? '${'phone_required'.tr()}'
                      : null,
                ),
                const SizedBox(height: 16),

                // Age
                TextFormField(
                  controller: _ageController,
                  decoration: InputDecoration(labelText: '${'age'.tr()} *'),
                  keyboardType: TextInputType.number,
                  validator: (value) => value == null || value.isEmpty
                      ? '${'age_required'.tr()}'
                      : null,
                ),
                const SizedBox(height: 16),

                // Address
                TextFormField(
                  controller: _addressController,
                  decoration: InputDecoration(labelText: '${'address'.tr()} *'),
                  validator: (value) => value == null || value.isEmpty
                      ? '${'address_required'.tr()}'
                      : null,
                ),
                const SizedBox(height: 24),

                _isLoading
                    ? const CircularProgressIndicator()
                    : ElevatedButton(
                        onPressed: _handleRegister,
                        child: Text('register'.tr()),
                      ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
