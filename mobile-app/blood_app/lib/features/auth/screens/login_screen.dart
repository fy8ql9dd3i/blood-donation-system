import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../data/repositories/auth_repository.dart';
import '../../../widgets/custom_button.dart';
import '../../../widgets/custom_input.dart';
import '../../../widgets/loading_widget.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();

  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  bool _isLoading = false;

  // =========================
  // 🔐 LOGIN FUNCTION
  // =========================
  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final authRepo = context.read<AuthRepository>();

      await authRepo.login(
        _emailController.text.trim(),
        _passwordController.text.trim(),
      );

      if (!mounted) return;

      Navigator.pushReplacementNamed(context, '/dashboard');
    } catch (error) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            error.toString(),
            style: const TextStyle(color: Colors.white),
          ),
          backgroundColor: Colors.red,
        ),
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
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  // =========================
  // 🎨 UI
  // =========================
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.bloodtype, size: 80, color: Colors.red),

                  const SizedBox(height: 20),

                  Text(
                    'Donor Login',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),

                  const SizedBox(height: 40),

                  // 📧 EMAIL INPUT
                  CustomInput(
                    controller: _emailController,
                    label: 'Email',
                    prefixIcon: Icons.email,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Email is required';
                      }
                      return null;
                    },
                  ),

                  const SizedBox(height: 16),

                  // 🔒 PASSWORD INPUT
                  CustomInput(
                    controller: _passwordController,
                    label: 'Password',
                    obscureText: true,
                    prefixIcon: Icons.lock,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Password is required';
                      }
                      return null;
                    },
                  ),

                  const SizedBox(height: 24),

                  // 🔄 LOADING / BUTTON
                  _isLoading
                      ? const LoadingWidget()
                      : CustomButton(text: 'Login', onPressed: _handleLogin),

                  const SizedBox(height: 10),

                  // 🔁 NAVIGATION TO REGISTER
                  TextButton(
                    onPressed: () {
                      Navigator.pushNamed(context, '/register');
                    },
                    child: const Text("Don't have an account? Register"),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
