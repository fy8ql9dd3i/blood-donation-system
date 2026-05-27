import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../data/auth_repository.dart';
import '../../../shared/widgets/base_screen.dart';
import '../../donor/screens/main_screen.dart';

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
  String? _selectedGender; // Selected Gender

  final List<Map<String, String>> _countryCodes = [
    {'code': '+251', 'name': 'Ethiopia'},
    {'code': '+1', 'name': 'USA/Canada'},
    {'code': '+44', 'name': 'UK'},
    {'code': '+91', 'name': 'India'},
    {'code': '+254', 'name': 'Kenya'},
    {'code': '+20', 'name': 'Egypt'},
  ];

  bool _isLoading = false;

  // ─── Show "already registered" info dialog ─────────────────────────────────
  void _showAlreadyRegisteredDialog(String donorName) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Icon(Icons.check_circle_rounded, color: Colors.green.shade600, size: 28),
            const SizedBox(width: 10),
            const Text('Already Registered', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
          ],
        ),
        content: Text(
          'The phone number you entered is already registered under the name "$donorName".\n\nIf this is you, your registration is already complete! ✅',
          style: const TextStyle(fontSize: 14, height: 1.5),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK', style: TextStyle(color: Colors.red, fontWeight: FontWeight.w800)),
          ),
        ],
      ),
    );
  }

  // ─── Main registration handler ─────────────────────────────────────────────
  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      String phoneText = _phoneController.text.trim();
      if (_selectedCountryCode == '+251' && phoneText.startsWith('0')) {
        phoneText = phoneText.substring(1);
      }
      final fullPhoneNumber = '$_selectedCountryCode$phoneText';

      // ── Register via repository → hits backend ──────────────────────────
      await context.read<AuthRepository>().register({
        'name': _fullNameController.text.trim(),
        'phoneNumber': fullPhoneNumber,
        'age': int.parse(_ageController.text.trim()),
        'gender': _selectedGender,
        'address': _addressController.text.trim(),
        'language': context.locale.languageCode,
        'sendToLabTest': true,
      });

      // ── Save donor info locally (keyed by phone, not device) ────────────
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('fullName', _fullNameController.text.trim());
      await prefs.setString('phoneNumber', fullPhoneNumber);
      await prefs.setString('age', _ageController.text.trim());
      await prefs.setString('gender', _selectedGender ?? '');
      await prefs.setString('address', _addressController.text.trim());
      // NOTE: We do NOT set 'isRegistered' here — registration is per-donor,
      // not per-device. Each donor's status lives in the backend.

      if (!mounted) return;

      // ── Success: navigate to MainScreen and clear the back-stack ────────
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('registered_successfully'.tr()),
          backgroundColor: Colors.green.shade600,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );

      // Replace entire stack so the user lands on the donor dashboard
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const MainScreen()),
        (route) => false,
      );
    } catch (e) {
      if (!mounted) return;

      final errMsg = e.toString();

      // ── If the backend says phone is already registered, show a nice dialog
      if (errMsg.toLowerCase().contains('already registered') ||
          errMsg.toLowerCase().contains('phone number is already')) {
        _showAlreadyRegisteredDialog(_fullNameController.text.trim());
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errMsg),
            backgroundColor: Colors.red.shade600,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  InputDecoration _buildInputDecoration({required String label, required IconData prefixIcon}) {
    return InputDecoration(
      labelText: label,
      labelStyle: TextStyle(color: Colors.red.shade900, fontWeight: FontWeight.w600),
      prefixIcon: Icon(prefixIcon, color: Colors.red.shade700),
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide(color: Colors.red.shade100, width: 1.5),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: Colors.red, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide(color: Colors.red.shade300, width: 1.5),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: Colors.red, width: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BaseScreen(
      title: 'donor_registration'.tr(),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.grey.shade50, Colors.red.shade50.withOpacity(0.2)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.all(24.0),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // ── Heading card ──────────────────────────────────────────
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(28),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.red.withOpacity(0.06),
                          blurRadius: 20,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.red.shade50,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.favorite_rounded, color: Colors.red, size: 40),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'donor_registration'.tr(),
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            color: Colors.red,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'be_a_hero_call'.tr(),
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade600,
                            fontWeight: FontWeight.w500,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // ── 1️⃣ Full Name ─────────────────────────────────────────
                  TextFormField(
                    controller: _fullNameController,
                    decoration: _buildInputDecoration(label: '${'name'.tr()} *', prefixIcon: Icons.person_rounded),
                    style: const TextStyle(fontWeight: FontWeight.w600),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'name_required'.tr();
                      }
                      if (RegExp(r'[0-9]').hasMatch(value)) {
                        return 'Name must contain only letters';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),

                  // ── 2️⃣ Phone Number with Country Code ────────────────────
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.red.shade100, width: 1.5),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: _selectedCountryCode,
                            dropdownColor: Colors.white,
                            style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.black87),
                            items: _countryCodes.map((country) {
                              return DropdownMenuItem<String>(
                                value: country['code'],
                                child: Text('${country['code']}'),
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
                        const SizedBox(width: 8),
                        Container(width: 1.5, height: 30, color: Colors.red.shade100),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextFormField(
                            controller: _phoneController,
                            decoration: const InputDecoration(
                              hintText: 'Phone Number *',
                              border: InputBorder.none,
                            ),
                            style: const TextStyle(fontWeight: FontWeight.w600, letterSpacing: 1.1),
                            keyboardType: TextInputType.phone,
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'phone_required'.tr();
                              }
                              if (!RegExp(r'^[0-9]+$').hasMatch(value)) {
                                return 'Phone number must contain only numbers';
                              }
                              if (_selectedCountryCode == '+251') {
                                if (value.startsWith('0')) {
                                  if (value.length != 10) {
                                    return 'Ethiopian local number must be 10 digits starting with 09 or 07';
                                  }
                                  if (!value.startsWith('09') && !value.startsWith('07')) {
                                    return 'Ethiopian local number must start with 09 (EthioTelecom) or 07 (Safaricom)';
                                  }
                                } else {
                                  if (value.length != 9) {
                                    return 'Phone number must be 9 digits (e.g. 911223344)';
                                  }
                                }
                              }
                              return null;
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // ── 3️⃣ Age & Gender Row ──────────────────────────────────
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _ageController,
                          decoration: _buildInputDecoration(label: '${'age'.tr()} *', prefixIcon: Icons.cake_rounded),
                          style: const TextStyle(fontWeight: FontWeight.w600),
                          keyboardType: TextInputType.number,
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'age_required'.tr();
                            }
                            final parsed = int.tryParse(value);
                            if (parsed == null) {
                              return 'Must be a number';
                            }
                            if (parsed < 18 || parsed > 65) {
                              return 'Age must be 18-65';
                            }
                            return null;
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: _selectedGender,
                          decoration: _buildInputDecoration(label: '${'gender'.tr()} *', prefixIcon: Icons.wc_rounded),
                          dropdownColor: Colors.white,
                          style: const TextStyle(fontWeight: FontWeight.w600, color: Colors.black87),
                          items: [
                            DropdownMenuItem(value: 'Male', child: Text('male'.tr())),
                            DropdownMenuItem(value: 'Female', child: Text('female'.tr())),
                            DropdownMenuItem(value: 'Other', child: Text('other'.tr())),
                          ],
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'gender_required'.tr();
                            }
                            return null;
                          },
                          onChanged: (value) {
                            setState(() {
                              _selectedGender = value;
                            });
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // ── 4️⃣ Address ───────────────────────────────────────────
                  TextFormField(
                    controller: _addressController,
                    decoration: _buildInputDecoration(label: '${'address'.tr()} *', prefixIcon: Icons.location_on_rounded),
                    style: const TextStyle(fontWeight: FontWeight.w600),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'address_required'.tr();
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 32),

                  // ── Submit Button ─────────────────────────────────────────
                  _isLoading
                      ? const Center(child: CircularProgressIndicator(color: Colors.red))
                      : Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(20),
                            gradient: const LinearGradient(
                              colors: [Color(0xFF8B0000), Color(0xFFC0152B)],
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.red.withOpacity(0.3),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: ElevatedButton(
                            onPressed: _handleRegister,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              shadowColor: Colors.transparent,
                              padding: const EdgeInsets.symmetric(vertical: 18),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                            ),
                            child: Text(
                              'register'.tr().toUpperCase(),
                              style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: 1.2),
                            ),
                          ),
                        ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
