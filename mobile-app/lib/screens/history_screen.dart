import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/donation_service.dart';
import '../models/donation_model.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({Key? key}) : super(key: key);

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  List<DonationModel> _donations = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadDonationHistory();
  }

  Future<void> _loadDonationHistory() async {
    setState(() => _isLoading = true);
    final history = await DonationService.getDonationHistory();
    if (mounted) {
      setState(() {
        _donations = history;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final themeColor = const Color(0xFFB71C1C);

    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      appBar: AppBar(
        backgroundColor: themeColor,
        elevation: 0,
        title: const Text('Donation History', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _loadDonationHistory,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(valueColor: AlwaysStoppedAnimation(Color(0xFFB71C1C))))
            : _donations.isEmpty
                ? _buildEmptyState()
                : _buildTimeline(themeColor),
      ),
    );
  }

  Widget _buildEmptyState() {
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      children: [
        SizedBox(height: MediaQuery.of(context).size.height * 0.25),
        Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.history_toggle_off, size: 72, color: Colors.grey.shade400),
              const SizedBox(height: 16),
              const Text(
                'No Donations Yet',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87),
              ),
              const SizedBox(height: 6),
              const Text(
                "You haven't made any donations yet. Your history will appear here once recorded.",
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.black54),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTimeline(Color themeColor) {
    final DateFormat formatter = DateFormat('MMMM dd, yyyy');

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      itemCount: _donations.length,
      itemBuilder: (context, index) {
        final donation = _donations[index];
        final bool isFirst = index == 0;
        final bool isLast = index == _donations.length - 1;

        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Timeline line & indicator
            Column(
              children: [
                Container(
                  width: 3,
                  height: 20,
                  color: isFirst ? Colors.transparent : themeColor.withOpacity(0.5),
                ),
                Container(
                  margin: const EdgeInsets.symmetric(vertical: 4),
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: themeColor.withOpacity(0.12),
                    shape: BoxShape.circle,
                    border: Border.all(color: themeColor, width: 2),
                  ),
                  child: Icon(Icons.bloodtype, color: themeColor, size: 20),
                ),
                Container(
                  width: 3,
                  height: 80,
                  color: isLast ? Colors.transparent : themeColor.withOpacity(0.5),
                ),
              ],
            ),
            const SizedBox(width: 20),

            // Donation details card
            Expanded(
              child: Card(
                elevation: 3,
                shadowColor: Colors.black12,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            formatter.format(donation.collectionDate),
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.green.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              'Success',
                              style: TextStyle(
                                color: Colors.green.shade800,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      const Divider(height: 1),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildCardStat('Blood Type', donation.bloodType),
                          _buildCardStat('Units Donated', '${donation.units} Bag(s)'),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildCardStat(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 12, color: Colors.black45),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
      ],
    );
  }
}
