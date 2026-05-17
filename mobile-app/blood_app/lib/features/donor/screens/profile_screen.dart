import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:easy_localization/easy_localization.dart';
import '../data/donor_repository.dart';
import '../../../core/models/donor_model.dart';
import '../../../shared/widgets/custom_button.dart';
import '../../../shared/widgets/custom_input.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../core/utils/validators.dart';
import '../../../core/utils/helpers.dart';
import 'package:geolocator/geolocator.dart';

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

  Future<void> _getCurrentLocation() async {
    bool serviceEnabled;
    LocationPermission permission;

    setState(() => _isSaving = true);

    try {
      serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        throw 'Location services are disabled.';
      }

      permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          throw 'Location permissions are denied';
        }
      }
      
      if (permission == LocationPermission.deniedForever) {
        throw 'Location permissions are permanently denied';
      }

      final position = await Geolocator.getCurrentPosition();
      final address = await context.read<DonorRepository>().reverseGeocode(
        position.latitude,
        position.longitude,
      );

      _addressController.text = address;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Location detected successfully!')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('MY PROFILE', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1, fontSize: 18)),
        centerTitle: false,
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          if (!_isEditing)
            IconButton(
              icon: const Icon(Icons.edit_rounded, color: Colors.black87),
              onPressed: () => setState(() => _isEditing = true),
            ),
          if (_isEditing)
            TextButton(
              onPressed: _isSaving ? null : _saveProfile,
              child: Text(_isSaving ? '...' : 'SAVE', style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
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
          
          final donor = snapshot.data!;

          return SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Form(
              key: _formKey,
              child: Column(
                children: [
                  const SizedBox(height: 20),
                  _buildProfileHeader(donor),
                  const SizedBox(height: 40),
                  CustomInput(
                    controller: _nameController,
                    label: 'Full Name',
                    enabled: _isEditing,
                    prefixIcon: const Icon(Icons.person_outline_rounded, color: Colors.red),
                    validator: Validators.name,
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Expanded(
                        child: CustomInput(
                          controller: _ageController,
                          label: 'Age',
                          keyboardType: TextInputType.number,
                          enabled: _isEditing,
                          prefixIcon: const Icon(Icons.cake_outlined, color: Colors.red),
                          validator: Validators.age,
                        ),
                      ),
                      const SizedBox(width: 20),
                      Expanded(
                        child: CustomInput(
                          controller: _bloodTypeController,
                          label: 'Blood Type',
                          enabled: _isEditing,
                          prefixIcon: const Icon(Icons.bloodtype_outlined, color: Colors.red),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  CustomInput(
                    controller: _phoneController,
                    label: 'Phone Number',
                    enabled: _isEditing,
                    prefixIcon: const Icon(Icons.phone_outlined, color: Colors.red),
                    validator: Validators.phone,
                  ),
                  const SizedBox(height: 20),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Expanded(
                        child: CustomInput(
                          controller: _addressController,
                          label: 'Address',
                          enabled: _isEditing,
                          prefixIcon: const Icon(Icons.location_on_outlined, color: Colors.red),
                        ),
                      ),
                      if (_isEditing) ...[
                        const SizedBox(width: 8),
                        Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: IconButton(
                            onPressed: _isSaving ? null : _getCurrentLocation,
                            icon: const Icon(Icons.my_location_rounded, color: Colors.red),
                            tooltip: 'Get current location',
                            style: IconButton.styleFrom(
                              backgroundColor: Colors.red.shade50,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 20),
                  _buildLanguageDropdown(),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildProfileHeader(DonorModel donor) {
    return Column(
      children: [
        Stack(
          children: [
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: Colors.red.shade100, width: 2),
              ),
              child: CircleAvatar(
                radius: 50,
                backgroundColor: Colors.red.shade50,
                child: Text(
                  donor.name.isNotEmpty ? donor.name[0].toUpperCase() : '?',
                  style: TextStyle(fontSize: 40, fontWeight: FontWeight.bold, color: Colors.red.shade700),
                ),
              ),
            ),
            if (_isEditing)
              Positioned(
                bottom: 0,
                right: 0,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                  child: const Icon(Icons.camera_alt, color: Colors.white, size: 16),
                ),
              ),
          ],
        ),
        const SizedBox(height: 16),
        Text(
          donor.name,
          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
        ),
        Text(
          'Member since ${Helpers.formatDate(donor.registrationDate)}',
          style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
        ),
      ],
    );
  }

  Widget _buildLanguageDropdown() {
    return DropdownButtonFormField<String>(
      value: ['en', 'am', 'or'].contains(_languageController.text) 
          ? _languageController.text 
          : 'en',
      decoration: InputDecoration(
        labelText: 'Preferred Language',
        prefixIcon: const Icon(Icons.language_rounded, color: Colors.red),
        filled: true,
        fillColor: Colors.grey.shade50,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
      ),
      items: const [
        DropdownMenuItem(value: 'en', child: Text('English')),
        DropdownMenuItem(value: 'am', child: Text('አማርኛ / Amharic')),
        DropdownMenuItem(value: 'or', child: Text('Afaan Oromoo')),
      ],
      onChanged: _isEditing ? (value) {
        if (value != null) {
          setState(() {
            _languageController.text = value;
            context.setLocale(Locale(value));
          });
        }
      } : null,
    );
  }
}
