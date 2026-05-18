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

  // ── Phone number search state ──
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _filterController = TextEditingController();
  String _filterQuery = '';

  // When non-null we are showing search results for a specific phone
  String? _searchedPhone;
  Future<List<DonationModel>>? _searchFuture;
  bool _isSearching = false;

  @override
  void initState() {
    super.initState();
    _historyFuture = context.read<DonorRepository>().getHistory();
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _filterController.dispose();
    super.dispose();
  }

  void _refresh() {
    setState(() {
      _historyFuture = context.read<DonorRepository>().getHistory();
      if (_searchedPhone != null) {
        _searchFuture = context.read<DonorRepository>().getHistory(_searchedPhone);
      }
    });
  }

  void _doPhoneSearch() {
    final phone = _phoneController.text.trim();
    if (phone.isEmpty) return;
    setState(() {
      _searchedPhone = phone;
      _filterQuery = '';
      _filterController.clear();
      _searchFuture = context.read<DonorRepository>().getHistory(phone);
    });
    FocusScope.of(context).unfocus();
  }

  void _clearSearch() {
    setState(() {
      _searchedPhone = null;
      _searchFuture = null;
      _phoneController.clear();
      _filterQuery = '';
      _filterController.clear();
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
            Text(
              'Donation History',
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Colors.black87),
            ),
          ],
        ),
        actions: [
          if (_searchedPhone != null)
            TextButton.icon(
              onPressed: _clearSearch,
              icon: const Icon(Icons.close_rounded, size: 16, color: Colors.red),
              label: const Text('Clear Search', style: TextStyle(color: Colors.red, fontSize: 12, fontWeight: FontWeight.bold)),
            ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          // ─── Phone Number Search Bar ───
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Search by Phone Number',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: Colors.black38,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        decoration: BoxDecoration(
                          color: const Color(0xFFF4F6FB),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: _searchedPhone != null
                                ? Colors.red.shade300
                                : Colors.grey.shade200,
                            width: 1.5,
                          ),
                        ),
                        child: TextField(
                          controller: _phoneController,
                          keyboardType: TextInputType.phone,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: Colors.black87,
                          ),
                          decoration: InputDecoration(
                            hintText: 'e.g. +251912345678',
                            hintStyle: TextStyle(
                              color: Colors.grey.shade400,
                              fontSize: 13,
                              fontWeight: FontWeight.normal,
                            ),
                            prefixIcon: Icon(
                              Icons.phone_rounded,
                              color: _searchedPhone != null ? Colors.red : Colors.grey,
                              size: 20,
                            ),
                            suffixIcon: _phoneController.text.isNotEmpty
                                ? IconButton(
                                    icon: const Icon(Icons.clear_rounded, size: 18, color: Colors.grey),
                                    onPressed: () {
                                      _phoneController.clear();
                                      setState(() {});
                                    },
                                  )
                                : null,
                            border: InputBorder.none,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
                          ),
                          onChanged: (_) => setState(() {}),
                          onSubmitted: (_) => _doPhoneSearch(),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    GestureDetector(
                      onTap: _phoneController.text.trim().isNotEmpty ? _doPhoneSearch : null,
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 13),
                        decoration: BoxDecoration(
                          gradient: _phoneController.text.trim().isNotEmpty
                              ? const LinearGradient(
                                  colors: [Color(0xFFD31027), Color(0xFFEA384D)],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                )
                              : null,
                          color: _phoneController.text.trim().isEmpty ? Colors.grey.shade200 : null,
                          borderRadius: BorderRadius.circular(14),
                          boxShadow: _phoneController.text.trim().isNotEmpty
                              ? [BoxShadow(color: Colors.red.withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 4))]
                              : [],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.search_rounded,
                              color: _phoneController.text.trim().isNotEmpty ? Colors.white : Colors.grey,
                              size: 18,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              'Search',
                              style: TextStyle(
                                color: _phoneController.text.trim().isNotEmpty ? Colors.white : Colors.grey,
                                fontWeight: FontWeight.w800,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                if (_searchedPhone != null) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.red.shade100),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.info_outline_rounded, size: 13, color: Colors.red.shade400),
                        const SizedBox(width: 6),
                        Text(
                          'Showing results for: $_searchedPhone',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: Colors.red.shade700,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),

          // ─── Main Content Area ───
          Expanded(
            child: _searchedPhone != null
                ? _buildSearchResults()
                : _buildOwnHistory(),
          ),
        ],
      ),
    );
  }

  // ── Search Results (by phone) ──────────────────────────────────────────────
  Widget _buildSearchResults() {
    return FutureBuilder<List<DonationModel>>(
      future: _searchFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularProgressIndicator(color: Colors.red),
                SizedBox(height: 16),
                Text('Searching...', style: TextStyle(color: Colors.black54, fontWeight: FontWeight.w600)),
              ],
            ),
          );
        }

        if (snapshot.hasError) {
          final errMsg = snapshot.error.toString();
          final isNotFound = errMsg.toLowerCase().contains('not found') || errMsg.contains('404');
          return Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(isNotFound ? '📵' : '⚠️', style: const TextStyle(fontSize: 52)),
                  const SizedBox(height: 16),
                  Text(
                    isNotFound
                        ? 'No donor found with this phone number'
                        : 'Error loading history',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black87),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    isNotFound
                        ? 'Check the phone number and try again.'
                        : errMsg,
                    style: TextStyle(color: Colors.grey.shade500, fontSize: 13),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 20),
                  OutlinedButton.icon(
                    onPressed: _clearSearch,
                    icon: const Icon(Icons.arrow_back_rounded, size: 16),
                    label: const Text('Clear Search'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.red,
                      side: const BorderSide(color: Colors.red),
                    ),
                  ),
                ],
              ),
            ),
          );
        }

        final results = snapshot.data ?? [];

        if (results.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('🩸', style: TextStyle(fontSize: 52)),
                  const SizedBox(height: 16),
                  const Text(
                    'No donation records found',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black87),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'This donor has not donated yet.',
                    style: TextStyle(color: Colors.grey.shade500, fontSize: 13),
                  ),
                ],
              ),
            ),
          );
        }

        final sorted = List<DonationModel>.from(results)
          ..sort((a, b) => b.collectionDate.compareTo(a.collectionDate));
        final totalUnits = sorted.fold<int>(0, (s, d) => s + d.units);

        return CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            // ─── Result summary banner ───
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF1A1A2E), Color(0xFF16213E)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 16, offset: const Offset(0, 6)),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 46,
                        height: 46,
                        decoration: BoxDecoration(
                          color: Colors.red.shade600,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.phone_rounded, color: Colors.white, size: 22),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _searchedPhone!,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w900,
                                fontSize: 15,
                                letterSpacing: 0.5,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${sorted.length} donation${sorted.length != 1 ? 's' : ''} • $totalUnits total units',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.6),
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.red.shade600.withOpacity(0.25),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          sorted.first.bloodType,
                          style: const TextStyle(
                            color: Colors.redAccent,
                            fontWeight: FontWeight.w900,
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 10),
                child: Text(
                  'DONATION RECORDS  •  ${sorted.length}',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: Colors.black38,
                    letterSpacing: 1.5,
                  ),
                ),
              ),
            ),

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
        );
      },
    );
  }

  // ── Own donation history (default view) ──────────────────────────────────
  Widget _buildOwnHistory() {
    return FutureBuilder<List<DonationModel>>(
      future: _historyFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const LoadingWidget();
        }

        if (snapshot.hasError) {
          return RefreshIndicator(
            onRefresh: () async => _refresh(),
            color: Colors.red,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: Container(
                height: MediaQuery.of(context).size.height * 0.6,
                alignment: Alignment.center,
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.wifi_off_rounded, size: 56, color: Colors.red),
                    const SizedBox(height: 16),
                    Text(
                      'Could not load history\n${snapshot.error}',
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 14, color: Colors.black54),
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton.icon(
                      onPressed: _refresh,
                      icon: const Icon(Icons.refresh_rounded),
                      label: const Text('Retry'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red.shade700,
                        foregroundColor: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }

        final history = snapshot.data ?? [];
        final sorted = List<DonationModel>.from(history)
          ..sort((a, b) => b.collectionDate.compareTo(a.collectionDate));

        // Local text filter
        final filtered = sorted.where((d) {
          if (_filterQuery.isEmpty) return true;
          final q = _filterQuery.toLowerCase().trim();
          return d.bloodType.toLowerCase().contains(q) ||
              d.units.toString().contains(q) ||
              _formatDate(d.collectionDate).toLowerCase().contains(q);
        }).toList();

        final totalUnits = sorted.fold<int>(0, (s, d) => s + d.units);
        final latestDonation = sorted.isNotEmpty ? sorted.first : null;
        final nextEligible = latestDonation?.collectionDate.add(const Duration(days: 90));
        final daysLeft = nextEligible?.difference(DateTime.now()).inDays ?? 0;
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
                          latestDonation == null ? 'N/A' : (isEligible ? 'NOW' : '$daysLeft d'),
                          'Next Eligible',
                          isEligible ? Icons.check_circle_rounded : Icons.hourglass_bottom_rounded,
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // ─── Text Filter (within own history) ───
              if (sorted.isNotEmpty)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.04),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: TextField(
                        controller: _filterController,
                        decoration: InputDecoration(
                          hintText: 'Filter by blood type, units, or date...',
                          hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13),
                          prefixIcon: const Icon(Icons.filter_list_rounded, color: Colors.grey),
                          suffixIcon: _filterQuery.isNotEmpty
                              ? IconButton(
                                  icon: const Icon(Icons.clear_rounded, color: Colors.grey),
                                  onPressed: () {
                                    setState(() {
                                      _filterController.clear();
                                      _filterQuery = '';
                                    });
                                  },
                                )
                              : null,
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        ),
                        style: const TextStyle(color: Colors.black87, fontSize: 14, fontWeight: FontWeight.w600),
                        onChanged: (val) => setState(() => _filterQuery = val),
                      ),
                    ),
                  ),
                ),

              // ─── Section Title ───
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 24, 20, 12),
                  child: Text(
                    'MY DONATIONS  •  ${filtered.length} RECORDS',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: Colors.black38,
                      letterSpacing: 1.5,
                    ),
                  ),
                ),
              ),

              // ─── List ───
              sorted.isEmpty
                  ? SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 60, horizontal: 20),
                        child: Center(
                          child: Column(
                            children: [
                              const Text('🩸', style: TextStyle(fontSize: 52)),
                              const SizedBox(height: 16),
                              const Text(
                                'No donation records yet',
                                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black87),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                'Your donation history will appear here.',
                                style: TextStyle(color: Colors.grey.shade500, fontSize: 13),
                              ),
                            ],
                          ),
                        ),
                      ),
                    )
                  : filtered.isEmpty
                      ? SliverToBoxAdapter(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
                            child: Center(
                              child: Column(
                                children: [
                                  const Text('🔍', style: TextStyle(fontSize: 48)),
                                  const SizedBox(height: 16),
                                  const Text(
                                    'No matching records found',
                                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black87),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    'Try a different filter.',
                                    style: TextStyle(color: Colors.grey.shade500, fontSize: 13),
                                    textAlign: TextAlign.center,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        )
                      : SliverPadding(
                          padding: const EdgeInsets.fromLTRB(20, 0, 20, 40),
                          sliver: SliverList(
                            delegate: SliverChildBuilderDelegate(
                              (context, index) => HistoryItem(
                                donation: filtered[index],
                                isLatest: index == 0 && _filterQuery.isEmpty,
                              ),
                              childCount: filtered.length,
                            ),
                          ),
                        ),
            ],
          ),
        );
      },
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
