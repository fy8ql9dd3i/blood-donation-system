import 'package:flutter/material.dart';
import '../../../core/models/donation_model.dart';

class HistoryItem extends StatelessWidget {
  final DonationModel donation;
  final bool isLatest;

  const HistoryItem({super.key, required this.donation, this.isLatest = false});

  String _formatDate(DateTime date) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    final nextDate = donation.collectionDate.add(const Duration(days: 90));
    final daysLeft = nextDate.difference(DateTime.now()).inDays;
    final isEligible = daysLeft <= 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: isLatest ? Border.all(color: Colors.red.shade200, width: 1.5) : null,
        boxShadow: [
          BoxShadow(
            color: isLatest ? Colors.red.withOpacity(0.10) : Colors.black.withOpacity(0.04),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // ─── Header Row ───
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
            child: Row(
              children: [
                // Blood drop icon
                Container(
                  width: 48, height: 48,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFFD31027), Color(0xFFEA384D)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(Icons.water_drop_rounded, color: Colors.white, size: 24),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            'Donation — ${_formatDate(donation.collectionDate)}',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.black87),
                          ),
                          if (isLatest) ...[
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.red.shade600,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: const Text('LATEST', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 3),
                      Text(
                        'Blood Type: ${donation.bloodType}  •  ${donation.units} unit(s) donated',
                        style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // ─── Divider ───
          Divider(height: 1, color: Colors.grey.shade100),

          // ─── Next Donation Date ───
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 14),
            child: Row(
              children: [
                Icon(
                  isEligible ? Icons.check_circle_rounded : Icons.hourglass_bottom_rounded,
                  size: 18,
                  color: isEligible ? Colors.green.shade600 : Colors.orange.shade600,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Next Eligible Date',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.grey.shade400, letterSpacing: 0.5),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        isEligible ? '✅  Ready to Donate Now!' : '📅  ${_formatDate(nextDate)}  ($daysLeft days remaining)',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: isEligible ? Colors.green.shade700 : Colors.orange.shade700,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
