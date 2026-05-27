import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../l10n/app_localizations.dart';
import '../services/donor_service.dart';
import 'home_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({Key? key}) : super(key: key);

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _ageController = TextEditingController();
  final _addressController = TextEditingController();

  String? _selectedGender;
  AppLanguage _selectedLanguage = AppLanguage.en;
  bool _isLoading = false;
  late AnimationController _animController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _fadeAnimation = CurvedAnimation(
      parent: _animController,
      curve: Curves.easeInOut,
    );
    _animController.forward();
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _phoneController.dispose();
    _ageController.dispose();
    _addressController.dispose();
    _animController.dispose();
    super.dispose();
  }

  Future<void> _registerDonor() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final fullName = _fullNameController.text.trim();
    final phone = _phoneController.text.trim();
    final ageStr = _ageController.text.trim();
    final address = _addressController.text.trim();
    final gender = _selectedGender;

    try {
      // 1️⃣ Check if phone exists first
      final checkResult = await DonorService.checkPhoneExists(phone);
      final checkSuccess =
          checkResult['status'] == 'success' || checkResult['success'] == true;

      if (checkSuccess && checkResult['exists'] == true) {
        // Phone already registered — try to log in
        final existingName = checkResult['donorName'] as String?;

        if (existingName != null &&
            existingName.trim().toLowerCase() == fullName.toLowerCase()) {
          // Names match → passwordless login
          final loginResult = await DonorService.loginDonor(
            fullName: fullName,
            phoneNumber: phone,
          );

          if (!mounted) return;

          final loginSuccess = loginResult['success'] == true ||
              loginResult['status'] == 'success';
          if (loginSuccess) {
            _showWelcomeBackDialog(fullName);
          } else {
            _showErrorSnackBar(
                loginResult['message'] ?? 'Login failed. Please try again.');
          }
        } else {
          // Names don't match
          if (!mounted) return;
          _showErrorSnackBar(
              'This phone number is already registered under a different name.');
        }
      } else {
        // Phone not registered → new registration
        final regResult = await DonorService.registerDonor(
          fullName: fullName,
          phoneNumber: phone,
          age: int.parse(ageStr),
          address: address,
          gender: gender,
          language: _selectedLanguage.code,
        );

        if (!mounted) return;

        final regSuccess =
            regResult['success'] == true || regResult['status'] == 'success';
        if (regSuccess) {
          _showSuccessDialog();
        } else {
          _showErrorSnackBar(regResult['message'] ?? 'Registration failed');
        }
      }
    } catch (e) {
      if (!mounted) return;
      _showErrorSnackBar(
          'Connection error. Please check your network and try again.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _resetForm() {
    _fullNameController.clear();
    _phoneController.clear();
    _ageController.clear();
    _addressController.clear();
    _selectedGender = null;
    _selectedLanguage = AppLanguage.en;
    _formKey.currentState?.reset();
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        icon: const Icon(Icons.check_circle, color: Colors.green, size: 56),
        title: const Text('Registration Successful!'),
        content: const Text(
          'You have been registered as a donor, and a Lab Test entry has been created for you.\n\n'
          'Your profile is pending approval by our medical team.',
          textAlign: TextAlign.center,
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context); // close dialog
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (_) => const HomeScreen()),
                (route) => false,
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFB71C1C),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: const Text('Go Home', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showWelcomeBackDialog(String name) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        icon: const Icon(Icons.waving_hand, color: Color(0xFFB71C1C), size: 56),
        title: const Text('Welcome Back!'),
        content: Text(
          'Hello $name, we found your existing blood donor profile. '
          'You have been logged in automatically.',
          textAlign: TextAlign.center,
        ),
        actions: [
          Center(
            child: SizedBox(
              width: 120,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context); // close dialog
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (_) => const HomeScreen()),
                    (route) => false,
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFB71C1C),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                child: const Text('OK', style: TextStyle(color: Colors.white)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red.shade700,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFFB71C1C), // deep red
              Color(0xFFE53935), // medium red
              Color(0xFFFF5252), // lighter red
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // ─── App Bar ───
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                child: Row(
                  children: [
                    IconButton(
                      icon:
                          const Icon(Icons.arrow_back_ios, color: Colors.white),
                      onPressed: () => Navigator.pop(context),
                    ),
                    const Text(
                      'Donor Registration',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),

              // ─── Form Card ───
              Expanded(
                child: FadeTransition(
                  opacity: _fadeAnimation,
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                    child: Column(
                      children: [
                        // Header icon
                        const Icon(
                          Icons.bloodtype,
                          size: 64,
                          color: Colors.white70,
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Join as a Blood Donor',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Your donation can save lives',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.8),
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 24),

                        // ─── Form Container ───
                        Container(
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.15),
                                blurRadius: 20,
                                offset: const Offset(0, 10),
                              ),
                            ],
                          ),
                          child: Form(
                            key: _formKey,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                // Full Name
                                _buildTextField(
                                  controller: _fullNameController,
                                  label: 'Full Name',
                                  hint: 'Enter your full name',
                                  icon: Icons.person_outline,
                                  validator: (value) {
                                    if (value == null || value.trim().isEmpty) {
                                      return 'Full name is required';
                                    }
                                    if (value.trim().length < 3) {
                                      return 'Name must be at least 3 characters';
                                    }
                                    return null;
                                  },
                                ),
                                const SizedBox(height: 16),

                                // Phone Number
                                _buildTextField(
                                  controller: _phoneController,
                                  label: 'Phone Number',
                                  hint: 'e.g. 0912345678',
                                  icon: Icons.phone_outlined,
                                  keyboardType: TextInputType.phone,
                                  inputFormatters: [
                                    FilteringTextInputFormatter.digitsOnly,
                                    LengthLimitingTextInputFormatter(10),
                                  ],
                                  validator: (value) {
                                    if (value == null || value.trim().isEmpty) {
                                      return 'Phone number is required';
                                    }
                                    final trimmed = value.trim();
                                    if (trimmed.length != 10) {
                                      return 'Enter a 10-digit Ethiopian phone number';
                                    }
                                    final regex = RegExp(r'^(09|07)\d{8}\$');
                                    if (!regex.hasMatch(trimmed)) {
                                      return 'Enter a valid Ethiopian 10-digit number';
                                    }
                                    return null;
                                  },
                                ),
                                const SizedBox(height: 16),

                                // Gender 
                                DropdownButtonFormField<String>(
                                  value: _selectedGender,
                                  decoration: InputDecoration(
                                    labelText: 'Gender',
                                    hintText: 'Select your gender',
                                    prefixIcon: const Icon(Icons.wc_outlined,
                                        color: Color(0xFFB71C1C)),
                                    filled: true,
                                    fillColor: Colors.grey.shade50,
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: BorderSide(
                                          color: Colors.grey.shade300),
                                    ),
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: BorderSide(
                                          color: Colors.grey.shade300),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: const BorderSide(
                                          color: Color(0xFFB71C1C), width: 2),
                                    ),
                                    errorBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: const BorderSide(
                                          color: Colors.red, width: 1.5),
                                    ),
                                    contentPadding: const EdgeInsets.symmetric(
                                        horizontal: 16, vertical: 14),
                                  ),
                                  items: const [
                                    DropdownMenuItem(
                                        value: 'Male', child: Text('Male')),
                                    DropdownMenuItem(
                                        value: 'Female', child: Text('Female')),
                                  ],
                                  onChanged: (value) {
                                    setState(() => _selectedGender = value);
                                  },
                                  validator: (value) {
                                    if (value == null || value.isEmpty) {
                                      return 'Please select your gender';
                                    }
                                    return null;
                                  },
                                ),
                                const SizedBox(height: 16),

                                // Age
                                _buildTextField(
                                  controller: _ageController,
                                  label: 'Age',
                                  hint: 'Enter your age (18-65)',
                                  icon: Icons.cake_outlined,
                                  keyboardType: TextInputType.number,
                                  inputFormatters: [
                                    FilteringTextInputFormatter.digitsOnly,
                                    LengthLimitingTextInputFormatter(2),
                                  ],
                                  validator: (value) {
                                    if (value == null || value.trim().isEmpty) {
                                      return 'Age is required';
                                    }
                                    final age = int.tryParse(value.trim());
                                    if (age == null || age < 18 || age > 65) {
                                      return 'Age must be between 18 and 65';
                                    }
                                    return null;
                                  },
                                ),
                                const SizedBox(height: 16),

                                // Address
                                _buildTextField(
                                  controller: _addressController,
                                  label: 'Address',
                                  hint: 'Enter your address',
                                  icon: Icons.location_on_outlined,
                                  maxLines: 2,
                                  validator: (value) {
                                    if (value == null || value.trim().isEmpty) {
                                      return 'Address is required';
                                    }
                                    return null;
                                  },
                                ),
                                const SizedBox(height: 16),

                                // Preferred Language
                                DropdownButtonFormField<AppLanguage>(
                                  value: _selectedLanguage,
                                  decoration: InputDecoration(
                                    labelText: 'Preferred Language',
                                    prefixIcon: const Icon(Icons.language,
                                        color: Color(0xFFB71C1C)),
                                    filled: true,
                                    fillColor: Colors.grey.shade50,
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: BorderSide(
                                          color: Colors.grey.shade300),
                                    ),
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: BorderSide(
                                          color: Colors.grey.shade300),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: const BorderSide(
                                          color: Color(0xFFB71C1C), width: 2),
                                    ),
                                  ),
                                  items: AppLanguage.values
                                      .map(
                                        (lang) => DropdownMenuItem(
                                          value: lang,
                                          child: Text(
                                              '${lang.flag} ${lang.displayName}'),
                                        ),
                                      )
                                      .toList(),
                                  onChanged: (value) {
                                    if (value != null) {
                                      setState(() => _selectedLanguage = value);
                                    }
                                  },
                                ),
                                const SizedBox(height: 28),

                                // Register Button
                                SizedBox(
                                  height: 52,
                                  child: ElevatedButton(
                                    onPressed:
                                        _isLoading ? null : _registerDonor,
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFFB71C1C),
                                      foregroundColor: Colors.white,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(14),
                                      ),
                                      elevation: 3,
                                    ),
                                    child: _isLoading
                                        ? const SizedBox(
                                            width: 24,
                                            height: 24,
                                            child: CircularProgressIndicator(
                                              strokeWidth: 2.5,
                                              valueColor:
                                                  AlwaysStoppedAnimation(
                                                      Colors.white),
                                            ),
                                          )
                                        : const Text(
                                            'Register',
                                            style: TextStyle(
                                              fontSize: 17,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
    List<TextInputFormatter>? inputFormatters,
    String? Function(String?)? validator,
    int maxLines = 1,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      inputFormatters: inputFormatters,
      maxLines: maxLines,
      validator: validator,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        prefixIcon: Icon(icon, color: const Color(0xFFB71C1C)),
        filled: true,
        fillColor: Colors.grey.shade50,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFB71C1C), width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Colors.red, width: 1.5),
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }
}
