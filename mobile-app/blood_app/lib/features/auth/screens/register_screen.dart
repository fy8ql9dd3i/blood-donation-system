import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../data/repositories/auth_repository.dart';
import '../../../widgets/custom_button.dart';
import '../../../widgets/custom_input.dart';
import '../../../widgets/loading_widget.dart';
import '../../../core/utils/validators.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _ageController = TextEditingController();
  final TextEditingController _bloodTypeController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _addressController = TextEditingController();

  String _selectedLanguage = 'en'; // default language
  bool _isLoading = false;

  // =========================
  // 📝 REGISTER FUNCTION
  // =========================
  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final authRepo = context.read<AuthRepository>();

      final userData = {
        'name': _nameController.text.trim(),
        'email': _emailController.text.trim(),
        'password': _passwordController.text.trim(),
        'age': int.tryParse(_ageController.text.trim()) ?? 0,
        'bloodType': _bloodTypeController.text.trim(),
        'phoneNumber': _phoneController.text.trim(),
        'address': _addressController.text.trim(),
        'language': _selectedLanguage,
      };

      await authRepo.register(userData);

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Registration successful. Please login.'),
          backgroundColor: Colors.green,
        ),
      );

      Navigator.pop(context); // back to login
    } catch (error) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString()), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  // =========================
  // 🧹 CLEANUP
  // =========================
  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _ageController.dispose();
    _bloodTypeController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  // =========================
  // 🎨 UI
  // =========================
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Register')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                // 👤 NAME
                CustomInput(
                  controller: _nameController,
                  label: 'Full Name',
                  prefixIcon: Icons.person,
                  validator: Validators.name,
                ),
                const SizedBox(height: 16),

                // 📧 EMAIL
                CustomInput(
                  controller: _emailController,
                  label: 'Email',
                  prefixIcon: Icons.email,
                  validator: Validators.email,
                ),
                const SizedBox(height: 16),

                // 🔒 PASSWORD
                CustomInput(
                  controller: _passwordController,
                  label: 'Password',
                  obscureText: true,
                  prefixIcon: Icons.lock,
                  validator: Validators.password,
                ),
                const SizedBox(height: 16),

                // 🎂 AGE
                CustomInput(
                  controller: _ageController,
                  label: 'Age (18-65)',
                  prefixIcon: Icons.cake,
                  keyboardType: TextInputType.number,
                  validator: Validators.age,
                ),
                const SizedBox(height: 16),

                // 🩸 BLOOD TYPE
                CustomInput(
                  controller: _bloodTypeController,
                  label: 'Blood Type (e.g., A+)',
                  prefixIcon: Icons.water_drop,
                ),
                const SizedBox(height: 16),

                // 📞 PHONE
                CustomInput(
                  controller: _phoneController,
                  label: 'Phone Number',
                  prefixIcon: Icons.phone,
                  keyboardType: TextInputType.phone,
                  validator: Validators.phone,
                ),
                const SizedBox(height: 16),

                // 📍 ADDRESS
                CustomInput(
                  controller: _addressController,
                  label: 'Address',
                  prefixIcon: Icons.location_on,
                ),
                const SizedBox(height: 16),

                // 🌐 LANGUAGE SELECTION (Radio Buttons)
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey.shade300),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(left: 16, top: 8),
                        child: Text(
                          'Preferred Language',
                          style: TextStyle(
                            color: Colors.grey.shade700,
                            fontSize: 14,
                          ),
                        ),
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          _buildRadioTile('English', 'en'),
                          _buildRadioTile('አማርኛ', 'am'),
                          _buildRadioTile('Afaan Oromoo', 'or'),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // 🔄 LOADING / BUTTON
                _isLoading
                    ? const LoadingWidget()
                    : CustomButton(
                        text: 'Register',
                        onPressed: _handleRegister,
                      ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // Helper widget for language radio buttons
  Widget _buildRadioTile(String label, String value) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Radio<String>(
          value: value,
          groupValue: _selectedLanguage,
          onChanged: (newValue) {
            if (newValue != null) {
              setState(() {
                _selectedLanguage = newValue;
              });
            }
          },
          activeColor: Colors.red,
        ),
        Text(label, style: const TextStyle(fontSize: 14)),
      ],
    );
  }
}
