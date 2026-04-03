import 'package:flutter/material.dart';
import '../../../data/models/donation_model.dart';
import '../../../core/utils/helpers.dart';

class HistoryItem extends StatelessWidget {
  final DonationModel donation;

  const HistoryItem({super.key, required this.donation});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Colors.red.shade100,
          child: const Icon(Icons.bloodtype, color: Colors.red),
        ),
        title: Text('Donation on ${Helpers.formatDate(donation.donationDate)}'),
        subtitle: Text(
          'Amount: ${donation.amount} ml\nLocation: ${donation.location ?? 'Unknown'}',
        ),
        isThreeLine: true,
      ),
    );
  }
}
