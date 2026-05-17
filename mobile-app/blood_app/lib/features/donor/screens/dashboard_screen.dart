import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:provider/provider.dart';
import 'dart:io';
import '../data/donor_repository.dart';
import '../data/news_service.dart';
import '../data/notification_repository.dart';
import '../../../core/models/donor_model.dart';
import '../../../core/models/notification_model.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../widgets/donor_card.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  late Future<DonorModel> _profileFuture;
  late Future<List<dynamic>> _newsFuture;
  late Future<List<NotificationModel>> _notifFuture;
  final NewsService _newsService = NewsService();

  @override
  void initState() {
    super.initState();
    _profileFuture = context.read<DonorRepository>().getProfile();
    _notifFuture = context.read<NotificationRepository>().getNotifications();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _newsFuture = _newsService.fetchNews(context.locale.languageCode);
  }

  void _refreshAll() {
    setState(() {
      _profileFuture = context.read<DonorRepository>().getProfile();
      _notifFuture = context.read<NotificationRepository>().getNotifications();
      _newsFuture = _newsService.fetchNews(context.locale.languageCode);
    });
  }

  void _showLanguageSelector(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(4))),
            const SizedBox(height: 20),
            Text('select_language'.tr(), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            _langTile(ctx, 'en', '🇬🇧', 'English'),
            _langTile(ctx, 'am', '🇪🇹', 'አማርኛ'),
            _langTile(ctx, 'or', '🇪🇹', 'Afaan Oromoo'),
          ],
        ),
      ),
    );
  }

  Widget _langTile(BuildContext ctx, String code, String flag, String label) {
    final bool isSelected = ctx.locale.languageCode == code;
    return ListTile(
      leading: Text(flag, style: const TextStyle(fontSize: 22)),
      title: Text(label, style: TextStyle(fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
      trailing: isSelected ? Icon(Icons.check_circle_rounded, color: Colors.red.shade700) : null,
      onTap: () { ctx.setLocale(Locale(code)); Navigator.pop(ctx); },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F6FB),
      body: FutureBuilder<DonorModel>(
        future: _profileFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) return const LoadingWidget();
          if (snapshot.hasError) return _buildErrorState(snapshot.error);

          final donor = snapshot.data;

          return RefreshIndicator(
            onRefresh: () async => _refreshAll(),
            color: Colors.red,
            child: CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              slivers: [
                // ════════════════════════ APP BAR ════════════════════════
                SliverAppBar(
                  backgroundColor: Colors.white,
                  elevation: 0,
                  pinned: true,
                  expandedHeight: 0,
                  title: Row(
                    children: [
                      Container(
                        width: 36, height: 36,
                        decoration: BoxDecoration(color: Colors.red.shade700, borderRadius: BorderRadius.circular(10)),
                        child: const Icon(Icons.volunteer_activism, color: Colors.white, size: 20),
                      ),
                      const SizedBox(width: 10),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('GIVE BLOOD', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1, fontSize: 15, color: Colors.black87)),
                          Text('Bahir Dar Blood Bank', style: TextStyle(fontSize: 10, color: Colors.grey.shade500, fontWeight: FontWeight.w500)),
                        ],
                      ),
                    ],
                  ),
                  actions: [
                    IconButton(
                      icon: const Icon(Icons.language_rounded, color: Colors.black54),
                      onPressed: () => _showLanguageSelector(context),
                    ),
                    const SizedBox(width: 4),
                  ],
                ),

                SliverToBoxAdapter(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 16),

                      // ════════════ HERO GREETING & DONOR CARD ════════════
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (donor != null) ...[
                              Text(
                                'Hello, ${donor.name.split(' ')[0]}! 👋',
                                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.black87),
                              ),
                              const Text(
                                'Your blood saves lives every day.',
                                style: TextStyle(fontSize: 13, color: Colors.black45),
                              ),
                              const SizedBox(height: 16),
                              DonorCard(donor: donor),
                            ],
                          ],
                        ),
                      ),

                      const SizedBox(height: 24),

                      // ════════════ DONATION STATS BANNER ════════════
                      if (donor != null) _buildStatsBanner(donor),

                      const SizedBox(height: 24),

                      // ════════════ ALERTS PREVIEW ════════════
                      _buildAlertsPreview(context),

                      const SizedBox(height: 24),

                      // ════════════ QUICK SERVICES ════════════
                      _buildQuickActions(context),

                      const SizedBox(height: 24),

                      // ════════════ NEWS FEED ════════════
                      _buildNewsSection(context),

                      const SizedBox(height: 40),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // STATS BANNER
  // ─────────────────────────────────────────────────────────────────────
  Widget _buildStatsBanner(DonorModel donor) {
    final nextDonation = donor.lastDonationDate != null
        ? donor.lastDonationDate!.add(const Duration(days: 90))
        : null;
    final daysLeft = nextDonation != null
        ? nextDonation.difference(DateTime.now()).inDays
        : null;
    final eligible = donor.eligibilityStatus;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
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
            _statItem('${donor.totalDonations}', 'Total\nDonations', Icons.water_drop_rounded),
            _statDivider(),
            _statItem(
              eligible ? 'Ready' : (daysLeft != null && daysLeft > 0 ? '$daysLeft days' : 'Check'),
              'Status',
              eligible ? Icons.check_circle_rounded : Icons.hourglass_bottom_rounded,
            ),
            _statDivider(),
            _statItem(
              donor.bloodType ?? '??',
              'Blood\nType',
              Icons.bloodtype_rounded,
            ),
          ],
        ),
      ),
    );
  }

  Widget _statItem(String value, String label, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: Colors.white70, size: 20),
        const SizedBox(height: 6),
        Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 10), textAlign: TextAlign.center),
      ],
    );
  }

  Widget _statDivider() => Container(width: 1, height: 50, color: Colors.white24);

  // ─────────────────────────────────────────────────────────────────────
  // ALERTS PREVIEW
  // ─────────────────────────────────────────────────────────────────────
  Widget _buildAlertsPreview(BuildContext context) {
    return FutureBuilder<List<NotificationModel>>(
      future: _notifFuture,
      builder: (context, snapshot) {
        final notifs = snapshot.data ?? [];
        final unread = notifs.where((n) => !n.read).toList();

        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Text('🔔', style: TextStyle(fontSize: 16)),
                      const SizedBox(width: 8),
                      const Text('Staff Alerts', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: Colors.black87)),
                      if (unread.isNotEmpty) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(color: Colors.red.shade600, borderRadius: BorderRadius.circular(20)),
                          child: Text('${unread.length}', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ],
                  ),
                  TextButton(
                    onPressed: () {},
                    child: Text('View All', style: TextStyle(color: Colors.red.shade600, fontWeight: FontWeight.bold, fontSize: 12)),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              if (snapshot.connectionState == ConnectionState.waiting)
                const Center(child: Padding(
                  padding: EdgeInsets.all(16),
                  child: CircularProgressIndicator(color: Colors.red, strokeWidth: 2),
                ))
              else if (notifs.isEmpty)
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
                  child: Row(
                    children: [
                      Icon(Icons.notifications_off_outlined, color: Colors.grey.shade300, size: 28),
                      const SizedBox(width: 14),
                      Text('No staff alerts at this time.', style: TextStyle(color: Colors.grey.shade500, fontSize: 13)),
                    ],
                  ),
                )
              else
                ...notifs.take(3).map((n) => _alertCard(n)).toList(),
            ],
          ),
        );
      },
    );
  }

  Widget _alertCard(NotificationModel n) {
    final isRead = n.read;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isRead ? Colors.white : Colors.red.shade50,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isRead ? Colors.grey.shade100 : Colors.red.shade100, width: 1.2),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8, offset: const Offset(0, 3))],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(
              color: isRead ? Colors.grey.shade100 : Colors.red.shade100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              Icons.campaign_rounded,
              color: isRead ? Colors.grey.shade400 : Colors.red.shade700,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  n.title ?? 'Notification',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: isRead ? Colors.black54 : Colors.black87),
                ),
                const SizedBox(height: 3),
                Text(
                  n.message ?? '',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                ),
              ],
            ),
          ),
          if (!isRead)
            Container(width: 8, height: 8, decoration: BoxDecoration(color: Colors.red.shade500, shape: BoxShape.circle)),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // QUICK ACTIONS (News removed)
  // ─────────────────────────────────────────────────────────────────────
  Widget _buildQuickActions(BuildContext context) {
    final actions = [
      {'icon': Icons.history_rounded,             'label': 'History',     'color': const Color(0xFF4A90D9), 'route': '/history'},
      {'icon': Icons.location_on_rounded,          'label': 'Find Center', 'color': const Color(0xFF26B89A), 'route': '/map'},
      {'icon': Icons.notifications_active_rounded, 'label': 'Alerts',     'color': const Color(0xFFE67E22), 'route': '/notifications'},
      {'icon': Icons.favorite_rounded,             'label': 'Hero Letters', 'color': const Color(0xFFE91E63), 'route': '/appreciation'},
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('QUICK SERVICES', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.black38, letterSpacing: 1.5)),
          const SizedBox(height: 14),
          Row(
            children: actions.map((a) {
              final color = a['color'] as Color;
              return Expanded(
                child: GestureDetector(
                  onTap: () => Navigator.pushNamed(context, a['route'] as String),
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    padding: const EdgeInsets.symmetric(vertical: 18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [BoxShadow(color: color.withOpacity(0.12), blurRadius: 12, offset: const Offset(0, 4))],
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 46, height: 46,
                          decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(14)),
                          child: Icon(a['icon'] as IconData, color: color, size: 24),
                        ),
                        const SizedBox(height: 10),
                        Text(a['label'] as String, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.grey.shade700)),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // NEWS FEED
  // ─────────────────────────────────────────────────────────────────────
  Widget _buildNewsSection(BuildContext context) {
    return FutureBuilder<List<dynamic>>(
      future: _newsFuture,
      builder: (context, snapshot) {
        final newsList = snapshot.data ?? [];

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Text('📢', style: TextStyle(fontSize: 16)),
                      SizedBox(width: 8),
                      Text('Announcements', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: Colors.black87)),
                    ],
                  ),
                  TextButton(
                    onPressed: () {},
                    child: Text('See All', style: TextStyle(color: Colors.red.shade600, fontWeight: FontWeight.bold, fontSize: 12)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
            if (snapshot.connectionState == ConnectionState.waiting)
              const Center(child: Padding(
                padding: EdgeInsets.all(20),
                child: CircularProgressIndicator(color: Colors.red, strokeWidth: 2),
              ))
            else if (newsList.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
                  child: Row(
                    children: [
                      const Text('📭', style: TextStyle(fontSize: 28)),
                      const SizedBox(width: 14),
                      Text('No announcements yet.', style: TextStyle(color: Colors.grey.shade500, fontSize: 13)),
                    ],
                  ),
                ),
              )
            else
              SizedBox(
                height: 240,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.only(left: 20, right: 8),
                  itemCount: newsList.length,
                  itemBuilder: (context, index) => _newsCard(newsList[index]),
                ),
              ),
          ],
        );
      },
    );
  }

  Widget _newsCard(dynamic news) {
    final hasImage = news['imageUrl'] != null && news['imageUrl'].toString().isNotEmpty;
    return Container(
      width: 260,
      margin: const EdgeInsets.only(right: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.orange.withOpacity(0.10), blurRadius: 16, offset: const Offset(0, 6))],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (hasImage)
            Image.network(news['imageUrl'], width: double.infinity, height: 110, fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(height: 110, color: Colors.orange.shade50,
                child: const Center(child: Icon(Icons.campaign_rounded, color: Colors.orange, size: 40))))
          else
            Container(height: 110, color: Colors.orange.shade50,
              child: const Center(child: Icon(Icons.campaign_rounded, color: Colors.orange, size: 40))),
          Container(height: 3, color: Colors.orange),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    news['title'] ?? '',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.black87, height: 1.3),
                  ),
                  const SizedBox(height: 6),
                  Expanded(
                    child: Text(
                      news['content'] ?? '',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 11, color: Colors.black45, height: 1.5),
                    ),
                  ),
                  Row(
                    children: [
                      Icon(Icons.access_time_rounded, size: 11, color: Colors.grey.shade400),
                      const SizedBox(width: 4),
                      Text(_formatDate(news['createdAt']), style: TextStyle(fontSize: 10, color: Colors.grey.shade400)),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(String? d) {
    if (d == null) return '';
    try {
      final dt = DateTime.parse(d).toLocal();
      return '${dt.day} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dt.month - 1]} ${dt.year}';
    } catch (_) { return ''; }
  }

  // ─────────────────────────────────────────────────────────────────────
  // ERROR STATE
  // ─────────────────────────────────────────────────────────────────────
  Widget _buildErrorState(dynamic error) {
    String msg = error is SocketException ? 'network_error'.tr() : '${'error_occurred'.tr()}\n($error)';
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.wifi_off_rounded, size: 64, color: Colors.red),
            const SizedBox(height: 20),
            Text(msg, textAlign: TextAlign.center, style: const TextStyle(fontSize: 15)),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _refreshAll,
              icon: const Icon(Icons.refresh_rounded),
              label: Text('retry'.tr()),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red.shade700,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
