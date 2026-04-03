import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../data/repositories/donor_repository.dart';
import '../../../data/models/donation_model.dart';
import '../../../widgets/loading_widget.dart';
import '../widgets/history_item.dart';

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Donation History')),
      body: FutureBuilder<List<DonationModel>>(
        future: context.read<DonorRepository>().getHistory(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const LoadingWidget();
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('No donation history yet.'));
          }
          final history = snapshot.data!;
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: history.length,
            itemBuilder: (context, index) {
              return HistoryItem(donation: history[index]);
            },
          );
        },
      ),
    );
  }
}
