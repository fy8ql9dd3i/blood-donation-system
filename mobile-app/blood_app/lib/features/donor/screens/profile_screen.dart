import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../data/repositories/donor_repository.dart';
import '../../../data/models/donor_model.dart';
import '../../../widgets/custom_button.dart';
import '../../../widgets/custom_input.dart';
import '../../../widgets/loading_widget.dart';
import '../../../core/utils/validators.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  late Future<DonorModel> _profileFuture;
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _ageController;
  late TextEditingController _bloodTypeController;
  late TextEditingController _phoneController;
  late TextEditingController _addressController;
  late TextEditingController _languageController;
  bool _isEditing = false;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    _profileFuture = context.read<DonorRepository>().getProfile();
    final donor = await _profileFuture;
    _nameController = TextEditingController(text: donor.name);
    _ageController = TextEditingController(text: donor.age.toString());
    _bloodTypeController = TextEditingController(text: donor.bloodType ?? '');
    _phoneController = TextEditingController(text: donor.phoneNumber ?? '');
    _addressController = TextEditingController(text: donor.address ?? '');
    _languageController = TextEditingController(text: donor.language);
    setState(() {});
  }

  Future<void> _saveProfile() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isSaving = true);
      try {
        final donor = await _profileFuture;
        final updatedDonor = DonorModel(
          donorID: donor.donorID,
          userId: donor.userId,
          name: _nameController.text.trim(),
          age: int.parse(_ageController.text.trim()),
          bloodType: _bloodTypeController.text.trim(),
          phoneNumber: _phoneController.text.trim(),
          lastDonationDate: donor.lastDonationDate,
          eligibilityStatus: donor.eligibilityStatus,
          registrationDate: donor.registrationDate,
          address: _addressController.text.trim(),
          latitude: donor.latitude,
          longitude: donor.longitude,
          language: _languageController.text.trim(),
        );
        await context.read<DonorRepository>().updateProfile(updatedDonor);
        _profileFuture = Future.value(updatedDonor);
        setState(() => _isEditing = false);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Profile updated')));
      } catch (e) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(e.toString())));
      } finally {
        if (mounted) setState(() => _isSaving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          if (!_isEditing)
            IconButton(
              icon: const Icon(Icons.edit),
              onPressed: () => setState(() => _isEditing = true),
            ),
          if (_isEditing)
            TextButton(
              onPressed: _isSaving ? null : _saveProfile,
              child: const Text('Save', style: TextStyle(color: Colors.white)),
            ),
        ],
      ),
      body: FutureBuilder<DonorModel>(
        future: _profileFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const LoadingWidget();
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else if (!snapshot.hasData) {
            return const Center(child: Text('No data'));
          }
          return Padding(
            padding: const EdgeInsets.all(16),
            child: Form(
              key: _formKey,
              child: ListView(
                children: [
                  CustomInput(
                    controller: _nameController,
                    label: 'Full Name',
                    enabled: _isEditing,
                    validator: Validators.name,
                  ),
                  const SizedBox(height: 16),
                  CustomInput(
                    controller: _ageController,
                    label: 'Age',
                    keyboardType: TextInputType.number,
                    enabled: _isEditing,
                    validator: Validators.age,
                  ),
                  const SizedBox(height: 16),
                  CustomInput(
                    controller: _bloodTypeController,
                    label: 'Blood Type',
                    enabled: _isEditing,
                  ),
                  const SizedBox(height: 16),
                  CustomInput(
                    controller: _phoneController,
                    label: 'Phone Number',
                    enabled: _isEditing,
                    validator: Validators.phone,
                  ),
                  const SizedBox(height: 16),
                  CustomInput(
                    controller: _addressController,
                    label: 'Address',
                    enabled: _isEditing,
                  ),
                  const SizedBox(height: 16),
                  CustomInput(
                    controller: _languageController,
                    label: 'Language (en, am, or)',
                    enabled: _isEditing,
                  ),
                  const SizedBox(height: 24),
                  if (_isEditing && _isSaving) const LoadingWidget(),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
