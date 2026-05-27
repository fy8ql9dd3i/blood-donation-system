import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/constants/app_constants.dart';

class StaffPortalScreen extends StatefulWidget {
  const StaffPortalScreen({super.key});

  @override
  State<StaffPortalScreen> createState() => _StaffPortalScreenState();
}

class _StaffPortalScreenState extends State<StaffPortalScreen> {
  final _formKey = GlobalKey<FormState>();

  List<dynamic> _pendingDonors = [];
  dynamic _selectedDonor;
  bool _isLoadingDonors = true;
  bool _isSubmitting = false;
  String? _result;
  bool _isSuccess = false;

  final _weightController = TextEditingController();
  final _bpController = TextEditingController();
  final _hemoglobinController = TextEditingController();
  final _tempController = TextEditingController();
  final _volumeController = TextEditingController(text: '450');

  String _hivStatus = 'Negative';
  String _hbvStatus = 'Negative';

  @override
  void initState() {
    super.initState();
    _fetchPendingDonors();
  }

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(AppConstants.tokenKey);
  }

  Future<void> _fetchPendingDonors() async {
    setState(() => _isLoadingDonors = true);
    try {
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/donors'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List<dynamic> all = data is List ? data : (data['data'] ?? []);
        setState(() {
          _pendingDonors = all.where((d) => d['status'] == 'pending').toList();
        });
      }
    } catch (e) {
      debugPrint('Error fetching donors: $e');
    } finally {
      if (mounted) setState(() => _isLoadingDonors = false);
    }
  }

  Future<void> _submitLabResults() async {
    if (_selectedDonor == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('enter_vitals_first'.tr()),
          backgroundColor: Colors.orange.shade700,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isSubmitting = true;
      _result = null;
    });

    try {
      final token = await _getToken();
      final body = {
        'donorId': _selectedDonor['donorID'],
        'name': _selectedDonor['name'],
        'age': _selectedDonor['age'],
        'phone': _selectedDonor['phone'],
        'address': _selectedDonor['address'],
        'blood_type': _selectedDonor['bloodType'] ?? 'O+',
        'weight': _weightController.text.trim(),
        'bp': _bpController.text.trim(),
        'hemoglobin': _hemoglobinController.text.trim(),
        'bodyTemperature': _tempController.text.trim(),
        'hiv': _hivStatus,
        'hbv': _hbvStatus,
        'donation_amount': int.tryParse(_volumeController.text.trim()) ?? 450,
      };

      final response = await http.post(
        Uri.parse('${ApiConstants.baseUrl}/lab/add'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: jsonEncode(body),
      ).timeout(const Duration(seconds: 20));

      final responseData = jsonDecode(response.body);
      if (mounted) {
        setState(() {
          _isSuccess = responseData['success'] == true;
          _result = responseData['message'] ?? (responseData['success'] == true ? 'Donation verified successfully!' : 'Verification failed.');
        });

        if (_isSuccess) {
          await _fetchPendingDonors();
          setState(() => _selectedDonor = null);
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isSuccess = false;
          _result = 'Error: ${e.toString().replaceAll('Exception: ', '')}';
        });
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  InputDecoration _fieldStyle(String label, IconData icon, {String? hintText}) {
    return InputDecoration(
      labelText: label,
      hintText: hintText,
      labelStyle: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF1B5E20)),
      prefixIcon: Icon(icon, color: const Color(0xFF2E7D32)),
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Color(0xFFB9F6CA), width: 1.5),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Color(0xFF2E7D32), width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Colors.red, width: 1.5),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Colors.red, width: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F8E9),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1B5E20),
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.biotech_rounded, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'staff_portal'.tr(),
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16),
                  ),
                  const Text(
                    'Lab Verification Simulator',
                    style: TextStyle(color: Colors.white70, fontSize: 10),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white),
            onPressed: _fetchPendingDonors,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // ──────────────── SELECT DONOR CARD ────────────────
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xFFC8E6C9), width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: Colors.green.withOpacity(0.08),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE8F5E9),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.person_search_rounded, color: Color(0xFF2E7D32), size: 22),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        'select_pending_donor'.tr(),
                        style: const TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 15,
                          color: Color(0xFF1B5E20),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (_isLoadingDonors)
                    const Center(
                      child: CircularProgressIndicator(color: Color(0xFF2E7D32)),
                    )
                  else if (_pendingDonors.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF9FBE7),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFDCEDC8)),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.check_circle_rounded, color: Color(0xFF558B2F), size: 22),
                          SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'No pending donors at this time.\nAll registrations have been processed.',
                              style: TextStyle(color: Color(0xFF33691E), fontSize: 13, fontWeight: FontWeight.w600),
                            ),
                          ),
                        ],
                      ),
                    )
                  else
                    DropdownButtonFormField<dynamic>(
                      value: _selectedDonor,
                      decoration: InputDecoration(
                        labelText: 'Select Donor',
                        prefixIcon: const Icon(Icons.person_rounded, color: Color(0xFF2E7D32)),
                        filled: true,
                        fillColor: const Color(0xFFF1F8E9),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: const BorderSide(color: Color(0xFFB9F6CA), width: 1.5),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: const BorderSide(color: Color(0xFF2E7D32), width: 2),
                        ),
                      ),
                      dropdownColor: Colors.white,
                      items: _pendingDonors.map((donor) {
                        return DropdownMenuItem(
                          value: donor,
                          child: Text(
                            '${donor['name']} — ${donor['phone'] ?? 'No phone'}',
                            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                          ),
                        );
                      }).toList(),
                      onChanged: (val) => setState(() => _selectedDonor = val),
                    ),
                  if (_selectedDonor != null) ...[
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE8F5E9),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFC8E6C9)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _infoRow(Icons.badge_rounded, 'Donor ID', '#${_selectedDonor['donorID']}'),
                          _infoRow(Icons.person_rounded, 'Name', _selectedDonor['name'] ?? 'N/A'),
                          _infoRow(Icons.phone_rounded, 'Phone', _selectedDonor['phone'] ?? 'N/A'),
                          _infoRow(Icons.cake_rounded, 'Age', '${_selectedDonor['age'] ?? 'N/A'} years'),
                          _infoRow(Icons.location_on_rounded, 'Address', _selectedDonor['address'] ?? 'N/A'),
                          _infoRow(Icons.bloodtype_rounded, 'Blood Type', _selectedDonor['bloodType'] ?? 'Not recorded yet'),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 20),

            // ──────────────── CLINICAL VITALS FORM ────────────────
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xFFC8E6C9), width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: Colors.green.withOpacity(0.08),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFFE8F5E9),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.medical_services_rounded, color: Color(0xFF2E7D32), size: 22),
                        ),
                        const SizedBox(width: 12),
                        Text(
                          'clinical_vitals'.tr(),
                          style: const TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 15,
                            color: Color(0xFF1B5E20),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Weight & Blood Pressure row
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _weightController,
                            decoration: _fieldStyle('weight'.tr(), Icons.monitor_weight_rounded),
                            keyboardType: TextInputType.number,
                            validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextFormField(
                            controller: _bpController,
                            decoration: _fieldStyle('blood_pressure'.tr(), Icons.favorite_rounded, hintText: '120/80'),
                            keyboardType: TextInputType.text,
                            validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Hemoglobin & Temperature row
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _hemoglobinController,
                            decoration: _fieldStyle('hemoglobin'.tr(), Icons.science_rounded),
                            keyboardType: TextInputType.number,
                            validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextFormField(
                            controller: _tempController,
                            decoration: _fieldStyle('temperature'.tr(), Icons.thermostat_rounded),
                            keyboardType: TextInputType.number,
                            validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // HIV Status
                    Text('hiv_status'.tr(), style: const TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF1B5E20), fontSize: 13)),
                    const SizedBox(height: 8),
                    _buildStatusToggle(
                      value: _hivStatus,
                      onChanged: (v) => setState(() => _hivStatus = v),
                    ),
                    const SizedBox(height: 16),

                    // HBV Status
                    Text('hbv_status'.tr(), style: const TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF1B5E20), fontSize: 13)),
                    const SizedBox(height: 8),
                    _buildStatusToggle(
                      value: _hbvStatus,
                      onChanged: (v) => setState(() => _hbvStatus = v),
                    ),
                    const SizedBox(height: 16),

                    // Donation Volume
                    TextFormField(
                      controller: _volumeController,
                      decoration: _fieldStyle('donation_volume'.tr(), Icons.bloodtype_rounded),
                      keyboardType: TextInputType.number,
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // ──────────────── SUBMIT BUTTON ────────────────
            _isSubmitting
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF2E7D32)))
                : Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      gradient: const LinearGradient(
                        colors: [Color(0xFF1B5E20), Color(0xFF388E3C)],
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.green.withOpacity(0.4),
                          blurRadius: 12,
                          offset: const Offset(0, 5),
                        ),
                      ],
                    ),
                    child: ElevatedButton.icon(
                      onPressed: _submitLabResults,
                      icon: const Icon(Icons.verified_rounded, color: Colors.white),
                      label: Text(
                        'verify_and_approve'.tr().toUpperCase(),
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 15, letterSpacing: 1),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        padding: const EdgeInsets.symmetric(vertical: 18),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      ),
                    ),
                  ),

            // ──────────────── RESULT BANNER ────────────────
            if (_result != null) ...[
              const SizedBox(height: 20),
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: _isSuccess ? const Color(0xFFE8F5E9) : const Color(0xFFFFEBEE),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: _isSuccess ? const Color(0xFFA5D6A7) : const Color(0xFFEF9A9A),
                    width: 1.5,
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      _isSuccess ? Icons.check_circle_rounded : Icons.error_rounded,
                      color: _isSuccess ? const Color(0xFF2E7D32) : Colors.red.shade700,
                      size: 32,
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Text(
                        _result!,
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          color: _isSuccess ? const Color(0xFF1B5E20) : Colors.red.shade800,
                          fontSize: 14,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              if (_isSuccess) ...[
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.arrow_back_rounded),
                  label: const Text('Back to Home'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF2E7D32),
                    side: const BorderSide(color: Color(0xFF2E7D32), width: 1.5),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ],
            ],

            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusToggle({required String value, required Function(String) onChanged}) {
    return Row(
      children: ['Negative', 'Positive'].map((option) {
        final bool isSelected = value == option;
        final bool isDanger = option == 'Positive';
        return GestureDetector(
          onTap: () => onChanged(option),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            margin: const EdgeInsets.only(right: 10),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            decoration: BoxDecoration(
              color: isSelected
                  ? (isDanger ? Colors.red.shade700 : const Color(0xFF2E7D32))
                  : Colors.grey.shade100,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isSelected
                    ? (isDanger ? Colors.red.shade700 : const Color(0xFF2E7D32))
                    : Colors.grey.shade300,
                width: 1.5,
              ),
            ),
            child: Text(
              option,
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.grey.shade700,
                fontWeight: FontWeight.w700,
                fontSize: 13,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _infoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icon, size: 16, color: const Color(0xFF558B2F)),
          const SizedBox(width: 8),
          Text('$label: ', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: Color(0xFF33691E))),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 12, color: Color(0xFF1B5E20), fontWeight: FontWeight.w700),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}
