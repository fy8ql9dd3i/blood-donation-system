import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../l10n/app_localizations.dart';
import '../services/donor_service.dart';
import '../services/storage_service.dart';
import '../models/donor_model.dart';
import 'home_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  DonorModel? _donor;
  bool _isLoading = true;
  bool _isEditing = false;
  String? _errorMessage;

  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _ageController = TextEditingController();
  final _addressController = TextEditingController();
  String? _selectedGender;
  AppLanguage _selectedLanguage = AppLanguage.en;
  bool _isUpdating = false;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _ageController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final result = await DonorService.getProfileResult();

    if (!mounted) return;

    if (result['success'] == true && result['donor'] != null) {
      final donor = result['donor'] as DonorModel;
      setState(() {
        _donor = donor;
        _nameController.text = donor.name;
        _ageController.text = donor.age.toString();
        _addressController.text = donor.address;
        _selectedGender = donor.gender;
        _selectedLanguage = AppLanguageExt.fromCode(donor.language);
        _isLoading = false;
        _errorMessage = null;
      });
    } else {
      // If session expired, go back to home so user can re-register/login
      if (result['unauthorized'] == true) {
        setState(() => _isLoading = false);
        _showSnackBar(
            'Session expired. Please log in again.', Colors.orange.shade700);
        await Future.delayed(const Duration(seconds: 1));
        if (!mounted) return;
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (_) => const HomeScreen()),
          (route) => false,
        );
        return;
      }

      setState(() {
        _donor = null;
        _isLoading = false;
        _errorMessage = result['message'] ?? 'Failed to load profile';
      });
    }
  }

  Future<void> _updateProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isUpdating = true);

    try {
      final result = await DonorService.updateProfile(
        name: _nameController.text.trim(),
        age: int.parse(_ageController.text.trim()),
        address: _addressController.text.trim(),
        gender: _selectedGender,
        language: _selectedLanguage.code,
      );

      if (!mounted) return;

      if (result['success'] == true) {
        setState(() => _isEditing = false);
        _showSnackBar('Profile updated successfully!', Colors.green.shade700);
        _loadProfile();
      } else {
        final msg = result['message'] ?? 'Failed to update profile';
        _showSnackBar(msg, Colors.red.shade700);
      }
    } catch (e) {
      if (!mounted) return;
      _showSnackBar(
          'Error updating profile: ${e.toString()}', Colors.red.shade700);
    } finally {
      if (mounted) setState(() => _isUpdating = false);
    }
  }

  void _logout() async {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Confirm Logout'),
        content: const Text(
            'Are you sure you want to log out of your donor session?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () async {
              await StorageService.clearSession();
              if (!mounted) return;
              Navigator.pop(context);
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (_) => const HomeScreen()),
                (route) => false,
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFB71C1C),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('Logout', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showSnackBar(String message, Color backgroundColor) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: backgroundColor,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final themeColor = const Color(0xFFB71C1C);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: themeColor,
        elevation: 0,
        title: const Text('My Profile',
            style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          if (_donor != null && !_isLoading)
            IconButton(
              icon: Icon(_isEditing ? Icons.close : Icons.edit,
                  color: Colors.white),
              onPressed: () {
                setState(() => _isEditing = !_isEditing);
                if (!_isEditing) {
                  // Reset fields when cancelling
                  _nameController.text = _donor!.name;
                  _ageController.text = _donor!.age.toString();
                  _addressController.text = _donor!.address;
                  _selectedGender = _donor!.gender;
                  _selectedLanguage = AppLanguageExt.fromCode(_donor!.language);
                }
              },
            ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation(Color(0xFFB71C1C))))
          : _donor == null
              ? _buildErrorWidget()
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      children: [
                        _buildProfileHeader(themeColor),
                        const SizedBox(height: 24),
                        if (_isEditing)
                          _buildEditFields(themeColor)
                        else
                          _buildProfileDetails(),
                        const SizedBox(height: 32),
                        _buildActionButtons(themeColor),
                        const SizedBox(height: 20),
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildErrorWidget() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.error_outline,
                  size: 64, color: Colors.red.shade700),
            ),
            const SizedBox(height: 24),
            const Text(
              'Could Not Load Profile',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: Text(
                _errorMessage ?? 'Unknown error occurred',
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.black54, fontSize: 14),
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Make sure you are registered and the server is running.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.black38, fontSize: 12),
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                OutlinedButton.icon(
                  icon: const Icon(Icons.home_outlined),
                  label: const Text('Go Home'),
                  onPressed: () => Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (_) => const HomeScreen()),
                    (route) => false,
                  ),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFFB71C1C),
                    side: const BorderSide(color: Color(0xFFB71C1C)),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                  ),
                ),
                const SizedBox(width: 12),
                ElevatedButton.icon(
                  icon: const Icon(Icons.refresh),
                  label: const Text('Retry'),
                  onPressed: _loadProfile,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFB71C1C),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileHeader(Color themeColor) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [
          BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, 4))
        ],
      ),
      child: Column(
        children: [
          CircleAvatar(
            radius: 44,
            backgroundColor: themeColor.withOpacity(0.1),
            child: Text(
              _donor!.name.isNotEmpty ? _donor!.name[0].toUpperCase() : '?',
              style: TextStyle(
                  fontSize: 36, fontWeight: FontWeight.bold, color: themeColor),
            ),
          ),
          const SizedBox(height: 14),
          Text(
            _donor!.name,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            _donor!.phone,
            style: const TextStyle(fontSize: 14, color: Colors.black54),
          ),
          const SizedBox(height: 16),
          const Divider(height: 1),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildHeaderStat(
                  'Blood Type', _donor!.bloodType ?? 'Pending', themeColor),
              _buildHeaderStat(
                'Status',
                _donor!.status.toUpperCase(),
                _donor!.status == 'approved'
                    ? Colors.green.shade700
                    : Colors.amber.shade700,
              ),
              _buildHeaderStat(
                'Eligible',
                _donor!.eligibilityStatus ? 'YES' : 'NO',
                _donor!.eligibilityStatus
                    ? Colors.green.shade700
                    : Colors.red.shade700,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderStat(String label, String value, Color color) {
    return Column(
      children: [
        Text(label,
            style: const TextStyle(
                fontSize: 12,
                color: Colors.black54,
                fontWeight: FontWeight.w500)),
        const SizedBox(height: 6),
        Text(value,
            style: TextStyle(
                fontSize: 15, fontWeight: FontWeight.bold, color: color)),
      ],
    );
  }

  Widget _buildProfileDetails() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [
          BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, 4))
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Personal Details',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          _buildDetailRow(
              Icons.cake_outlined, 'Age', '${_donor!.age} years old'),
          const Divider(height: 24),
          _buildDetailRow(
              Icons.wc_outlined, 'Gender', _donor!.gender ?? 'Not specified'),
          const Divider(height: 24),
          _buildDetailRow(Icons.language, 'Language',
              AppLanguageExt.fromCode(_donor!.language).displayName),
          const Divider(height: 24),
          _buildDetailRow(
              Icons.location_on_outlined, 'Address', _donor!.address),
          const Divider(height: 24),
          _buildDetailRow(Icons.star_outline, 'Total Donations',
              '${_donor!.totalDonations} times'),
        ],
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: const Color(0xFFB71C1C), size: 24),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label,
                  style: const TextStyle(fontSize: 12, color: Colors.black54)),
              const SizedBox(height: 2),
              Text(value,
                  style: const TextStyle(
                      fontSize: 15, fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildEditFields(Color themeColor) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [
          BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, 4))
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Edit Profile Info',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 20),

          // Name
          _buildFormTextField(
            controller: _nameController,
            label: 'Full Name',
            icon: Icons.person_outline,
            themeColor: themeColor,
            validator: (value) {
              if (value == null || value.trim().isEmpty)
                return 'Name is required';
              if (value.trim().length < 3) return 'Min 3 characters';
              return null;
            },
          ),
          const SizedBox(height: 16),

          // Age
          _buildFormTextField(
            controller: _ageController,
            label: 'Age',
            icon: Icons.cake_outlined,
            keyboardType: TextInputType.number,
            themeColor: themeColor,
            validator: (value) {
              if (value == null || value.trim().isEmpty) return 'Age required';
              final age = int.tryParse(value.trim());
              if (age == null || age < 18 || age > 65) return 'Age 18 - 65';
              return null;
            },
          ),
          const SizedBox(height: 16),

          // Gender
          DropdownButtonFormField<String>(
            value: _selectedGender,
            decoration: InputDecoration(
              labelText: 'Gender',
              prefixIcon: Icon(Icons.wc_outlined, color: themeColor),
              filled: true,
              fillColor: Colors.grey.shade50,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.grey.shade300),
              ),
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            ),
            items: const [
              DropdownMenuItem(value: 'Male', child: Text('Male')),
              DropdownMenuItem(value: 'Female', child: Text('Female')),
            ],
            onChanged: (value) {
              setState(() => _selectedGender = value);
            },
          ),
          const SizedBox(height: 16),

          // Language
          DropdownButtonFormField<AppLanguage>(
            value: _selectedLanguage,
            decoration: InputDecoration(
              labelText: 'Language',
              prefixIcon: Icon(Icons.language, color: themeColor),
              filled: true,
              fillColor: Colors.grey.shade50,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.grey.shade300),
              ),
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            ),
            items: AppLanguage.values
                .map((lang) => DropdownMenuItem(
                      value: lang,
                      child: Text('${lang.flag} ${lang.displayName}'),
                    ))
                .toList(),
            onChanged: (value) {
              if (value != null) setState(() => _selectedLanguage = value);
            },
          ),
          const SizedBox(height: 16),

          // Address
          _buildFormTextField(
            controller: _addressController,
            label: 'Address',
            icon: Icons.location_on_outlined,
            maxLines: 2,
            themeColor: themeColor,
            validator: (value) {
              if (value == null || value.trim().isEmpty)
                return 'Address required';
              return null;
            },
          ),
        ],
      ),
    );
  }

  Widget _buildFormTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    required Color themeColor,
    TextInputType keyboardType = TextInputType.text,
    int maxLines = 1,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      maxLines: maxLines,
      validator: validator,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: themeColor),
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
          borderSide: BorderSide(color: themeColor, width: 2),
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }

  Widget _buildActionButtons(Color themeColor) {
    if (_isEditing) {
      return Row(
        children: [
          Expanded(
            child: SizedBox(
              height: 50,
              child: OutlinedButton(
                onPressed: _isUpdating
                    ? null
                    : () {
                        setState(() {
                          _isEditing = false;
                          _nameController.text = _donor!.name;
                          _ageController.text = _donor!.age.toString();
                          _addressController.text = _donor!.address;
                          _selectedGender = _donor!.gender;
                          _selectedLanguage =
                              AppLanguageExt.fromCode(_donor!.language);
                        });
                      },
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: themeColor),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                child: Text('Cancel',
                    style: TextStyle(
                        color: themeColor,
                        fontSize: 16,
                        fontWeight: FontWeight.bold)),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: SizedBox(
              height: 50,
              child: ElevatedButton(
                onPressed: _isUpdating ? null : _updateProfile,
                style: ElevatedButton.styleFrom(
                  backgroundColor: themeColor,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                child: _isUpdating
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation(Colors.white)),
                      )
                    : const Text('Save Details',
                        style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold)),
              ),
            ),
          ),
        ],
      );
    }

    return SizedBox(
      width: double.infinity,
      height: 52,
      child: ElevatedButton.icon(
        onPressed: _logout,
        icon: const Icon(Icons.logout, color: Colors.white),
        label: const Text('Log Out Session',
            style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.white)),
        style: ElevatedButton.styleFrom(
          backgroundColor: themeColor,
          elevation: 2,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
      ),
    );
  }
}
