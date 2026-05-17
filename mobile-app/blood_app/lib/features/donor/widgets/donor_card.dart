import 'package:flutter/material.dart';
import '../../../core/models/donor_model.dart';
import '../../../core/utils/helpers.dart';

class DonorCard extends StatelessWidget {
  final DonorModel donor;

  const DonorCard({super.key, required this.donor});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        gradient: const LinearGradient(
          colors: [Color(0xFF1e1e24), Color(0xFF2d3436)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Stack(
        children: [
          Positioned(
            right: -20,
            top: -20,
            child: Icon(
              Icons.bloodtype,
              size: 150,
              color: Colors.white.withOpacity(0.05),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'BLOOD DONOR PASS',
                      style: TextStyle(
                        color: Colors.white54,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 2,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.red.shade700,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        donor.bloodType ?? '??',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 30),
                Text(
                  donor.name.toUpperCase(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'ID: #${donor.donorID.toString().padLeft(6, '0')}',
                  style: const TextStyle(color: Colors.white38, fontSize: 12),
                ),
                const SizedBox(height: 30),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildCompactInfo('LAST DONATION', donor.lastDonationDate != null ? Helpers.formatDate(donor.lastDonationDate!) : 'NEVER'),
                    _buildCompactInfo('ELIGIBILITY', donor.eligibilityStatus ? 'YES' : 'NO', color: donor.eligibilityStatus ? Colors.greenAccent : Colors.redAccent),
                    _buildCompactInfo('TOTAL', '${donor.totalDonations} UNITS'),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCompactInfo(String label, String value, {Color? color}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(color: color ?? Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}
