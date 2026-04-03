import 'package:flutter/material.dart';
import '../../../data/models/donor_model.dart';
import '../../../core/utils/helpers.dart';

class DonorCard extends StatelessWidget {
  final DonorModel donor;

  const DonorCard({super.key, required this.donor});

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: Colors.red.shade100,
                  radius: 30,
                  child: Text(
                    donor.name[0].toUpperCase(),
                    style: const TextStyle(fontSize: 24, color: Colors.red),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        donor.name,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'Blood: ${donor.bloodType ?? 'Not set'}',
                        style: TextStyle(color: Colors.grey.shade600),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const Divider(height: 24),
            _infoRow(Icons.cake, 'Age', donor.age.toString()),
            const SizedBox(height: 8),
            _infoRow(Icons.phone, 'Phone', donor.phoneNumber ?? 'Not set'),
            const SizedBox(height: 8),
            _infoRow(Icons.location_on, 'Address', donor.address ?? 'Not set'),
            const SizedBox(height: 8),
            _infoRow(
              Icons.calendar_today,
              'Registered',
              Helpers.formatDate(donor.registrationDate),
            ),
            const SizedBox(height: 8),
            _infoRow(
              Icons.health_and_safety,
              'Eligibility',
              donor.eligibilityStatus ? 'Eligible' : 'Not eligible',
              color: donor.eligibilityStatus ? Colors.green : Colors.red,
            ),
            if (donor.lastDonationDate != null) ...[
              const SizedBox(height: 8),
              _infoRow(
                Icons.history,
                'Last Donation',
                Helpers.formatDate(donor.lastDonationDate!),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _infoRow(IconData icon, String label, String value, {Color? color}) {
    return Row(
      children: [
        Icon(icon, size: 18, color: Colors.grey.shade600),
        const SizedBox(width: 8),
        Text('$label: ', style: const TextStyle(fontWeight: FontWeight.w500)),
        Expanded(
          child: Text(value, style: TextStyle(color: color ?? Colors.black87)),
        ),
      ],
    );
  }
}
