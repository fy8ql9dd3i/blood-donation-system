import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../data/donor_repository.dart';
import '../../../core/models/donation_model.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../widgets/history_item.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  late Future<List<DonationModel>> _historyFuture;

  @override
  void initState() {
    super.initState();
    _historyFuture = context.read<DonorRepository>().getHistory();
  }

  void _refresh() {
    setState(() {
      _historyFuture = context.read<DonorRepository>().getHistory();
    });
  }

  String _formatDate(DateTime d) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return '${d.day} ${months[d.month - 1]} ${d.year}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F6FB),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        title: const Row(
          children: [
            Icon(Icons.water_drop_rounded, color: Colors.red),
            SizedBox(width: 10),
            Text('Donation History', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Colors.black87)),
          ],
        ),
      ),
      body: FutureBuilder<List<DonationModel>>(
        future: _historyFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const LoadingWidget();
          }

          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.wifi_off_rounded, size: 56, color: Colors.red),
                    const SizedBox(height: 16),
                    Text('Could not load history\n${snapshot.error}', textAlign: TextAlign.center, style: const TextStyle(fontSize: 14, color: Colors.black54)),
                    const SizedBox(height: 20),
                    ElevatedButton.icon(
                      onPressed: _refresh,
                      icon: const Icon(Icons.refresh_rounded),
                      label: const Text('Retry'),
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.red.shade700, foregroundColor: Colors.white),
                    ),
                  ],
                ),
              ),
            );
          }

          final history = snapshot.data ?? [];

          if (history.isEmpty) {
            return RefreshIndicator(
              onRefresh: () async => _refresh(),
              color: Colors.red,
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  const SizedBox(height: 100),
                  Center(
                    child: Column(
                      children: [
                        const Text('🩸', style: TextStyle(fontSize: 56)),
                        const SizedBox(height: 16),
                        const Text('No donations yet', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87)),
                        const SizedBox(height: 6),
                        Text('Your donation journey starts here.', style: TextStyle(color: Colors.grey.shade500, fontSize: 13)),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }

          // ── Sort: most recent first ──
          final sorted = List<DonationModel>.from(history)
            ..sort((a, b) => b.collectionDate.compareTo(a.collectionDate));

          // ── Calculate totals ──
          final totalUnits = sorted.fold<int>(0, (sum, d) => sum + d.units);
          final latestDonation = sorted.first;
          final nextEligible = latestDonation.collectionDate.add(const Duration(days: 90));
          final daysLeft = nextEligible.difference(DateTime.now()).inDays;
          final isEligible = daysLeft <= 0;

          return RefreshIndicator(
            onRefresh: () async => _refresh(),
            color: Colors.red,
            child: CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              slivers: [
                // ─── Summary Banner ───
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                    child: Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFFD31027), Color(0xFFEA384D)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(color: Colors.red.withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 8)),
                        ],
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          _summaryTile('${sorted.length}', 'Donations', Icons.favorite_rounded),
                          _divider(),
                          _summaryTile('$totalUnits', 'Total Units', Icons.water_drop_rounded),
                          _divider(),
                          _summaryTile(
                            isEligible ? 'NOW' : '$daysLeft d',
                            'Next Eligible',
                            isEligible ? Icons.check_circle_rounded : Icons.hourglass_bottom_rounded,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                // ─── Next Eligible Date Card ───
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                      decoration: BoxDecoration(
                        color: isEligible ? Colors.green.shade50 : Colors.orange.shade50,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isEligible ? Colors.green.shade200 : Colors.orange.shade200,
                          width: 1.2,
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: isEligible ? Colors.green.shade100 : Colors.orange.shade100,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(
                              isEligible ? Icons.check_circle_rounded : Icons.calendar_today_rounded,
                              color: isEligible ? Colors.green.shade700 : Colors.orange.shade700,
                              size: 22,
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  isEligible ? 'You Can Donate Now! 🎉' : 'Next Donation Date',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 13,
                                    color: isEligible ? Colors.green.shade800 : Colors.orange.shade800,
                                  ),
                                ),
                                const SizedBox(height: 3),
                                Text(
                                  isEligible
                                      ? 'Visit Bahir Dar Blood Bank to donate.'
                                      : '${_formatDate(nextEligible)}  •  $daysLeft days remaining',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: isEligible ? Colors.green.shade600 : Colors.orange.shade600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                // ─── Section Title ───
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 24, 20, 12),
                    child: Text(
                      'ALL DONATIONS  •  ${sorted.length} RECORDS',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: Colors.black38,
                        letterSpacing: 1.5,
                      ),
                    ),
                  ),
                ),

                // ─── Timeline List ───
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 40),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) => HistoryItem(
                        donation: sorted[index],
                        isLatest: index == 0,
                      ),
                      childCount: sorted.length,
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _summaryTile(String value, String label, IconData icon) => Column(
    children: [
      Icon(icon, color: Colors.white70, size: 18),
      const SizedBox(height: 4),
      Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18)),
      const SizedBox(height: 2),
      Text(label, style: const TextStyle(color: Colors.white70, fontSize: 10), textAlign: TextAlign.center),
    ],
  );

  Widget _divider() => Container(width: 1, height: 50, color: Colors.white24);
}
