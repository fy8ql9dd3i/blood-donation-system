import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:provider/provider.dart';
import 'dart:io';
import 'dart:async';
import '../data/donor_repository.dart';
import '../data/notification_repository.dart';
import '../data/donor_service.dart';
import '../data/news_service.dart';
import '../../../core/models/donor_model.dart';
import '../../../core/models/notification_model.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../widgets/donor_card.dart';
import '../../../app/theme.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  late Future<DonorModel> _profileFuture;
  late Future<List<NotificationModel>> _notifFuture;
  late Future<List<dynamic>> _newsFuture;
  final NewsService _newsService = NewsService();

  Timer? _pollingTimer;
  final Set<String> _alertedNotifications = {};
  int _cachedNotificationsCount = 0;

  @override
  void initState() {
    super.initState();
    _profileFuture = context.read<DonorRepository>().getProfile();
    _notifFuture = context.read<NotificationRepository>().getNotifications();
    _newsFuture = _newsService.fetchNews(context.locale.languageCode);

    // Track initial notifications list to avoid double prompting existing unread items on startup
    _notifFuture.then((list) {
      _cachedNotificationsCount = list.length;
      for (var n in list) {
        if (n.read) {
          _alertedNotifications.add(n.id);
        }
      }
    }).catchError((_) {});

    // Start background polling every 10 seconds
    _pollingTimer = Timer.periodic(const Duration(seconds: 10), (timer) {
      _checkNewNotifications();
    });
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    super.dispose();
  }

  void _refreshAll() {
    setState(() {
      _profileFuture = context.read<DonorRepository>().getProfile();
      _notifFuture = context.read<NotificationRepository>().getNotifications();
      _newsFuture = _newsService.fetchNews(context.locale.languageCode);
    });
  }

  void _checkNewNotifications() {
    context.read<NotificationRepository>().getNotifications().then((list) {
      if (!mounted) return;
      final unreadEmergencies = list.where((n) {
        if (n.read) return false;
        final t = n.title.toLowerCase();
        final m = n.message.toLowerCase();
        return n.type == 'EMERGENCY' || t.contains('urgent') || t.contains('emergency') || m.contains('urgent');
      }).toList();

      bool hasNew = false;
      for (var n in unreadEmergencies) {
        if (!_alertedNotifications.contains(n.id)) {
          _alertedNotifications.add(n.id);
          hasNew = true;
          _showEmergencyDialog(n);
        }
      }

      if (hasNew || list.length != _cachedNotificationsCount) {
        setState(() {
          _cachedNotificationsCount = list.length;
          _notifFuture = Future.value(list);
        });
      }
    }).catchError((err) {
      debugPrint('Polling error: $err');
    });
  }

  Future<void> _handleResponse(String notificationId, String status) async {
    final success = await DonorService.respondNotification(
      notificationId: notificationId,
      responseStatus: status,
    );
    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(status == 'ACCEPTED' ? 'Request Accepted ❤️' : 'Request Declined'),
          backgroundColor: status == 'ACCEPTED' ? Colors.green.shade600 : Colors.red.shade600,
        ),
      );
      _refreshAll();
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to update response'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _showEmergencyDialog(NotificationModel n) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        elevation: 16,
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(28),
            border: Border.all(color: Colors.red.shade100, width: 2),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.red.shade100, width: 3),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.red.withOpacity(0.2),
                      blurRadius: 16,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.warning_amber_rounded,
                  color: Colors.red,
                  size: 38,
                ),
              ),
              const SizedBox(height: 20),
              Text(
                n.title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textPrimary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                n.message,
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        Navigator.pop(ctx);
                        _handleResponse(n.id, 'DECLINED');
                      },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.red,
                        side: BorderSide(color: Colors.red.shade200, width: 1.5),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      child: const Text('Decline', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(ctx);
                        _handleResponse(n.id, 'ACCEPTED');
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green.shade600,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        elevation: 2,
                      ),
                      child: const Text('Accept ❤️', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showLanguageSelector(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade200,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'select_language'.tr(),
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimary,
              ),
            ),
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
      title: Text(
        label,
        style: TextStyle(
          fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
          color: isSelected ? AppColors.primary : AppColors.textPrimary,
        ),
      ),
      trailing: isSelected
          ? const Icon(Icons.check_circle_rounded, color: AppColors.primary)
          : null,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      onTap: () {
        ctx.setLocale(Locale(code));
        Navigator.pop(ctx);
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      body: FutureBuilder<DonorModel>(
        future: _profileFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const LoadingWidget();
          }
          if (snapshot.hasError) return _buildErrorState(snapshot.error);

          final donor = snapshot.data;

          return RefreshIndicator(
            onRefresh: () async => _refreshAll(),
            color: AppColors.primary,
            backgroundColor: Colors.white,
            child: CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              slivers: [
                // ══════════════════════ APP BAR ══════════════════════
                SliverAppBar(
                  backgroundColor: AppColors.bg,
                  surfaceTintColor: Colors.transparent,
                  elevation: 0,
                  pinned: true,
                  expandedHeight: 0,
                  title: Row(
                    children: [
                      // Logo mark
                      Container(
                        width: 38,
                        height: 38,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF8B0000), Color(0xFFC0152B)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withOpacity(0.3),
                              blurRadius: 8,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: const Icon(Icons.water_drop_rounded,
                            color: Colors.white, size: 20),
                      ),
                      const SizedBox(width: 10),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'GIVE BLOOD',
                            style: TextStyle(
                              fontWeight: FontWeight.w900,
                              letterSpacing: 1.5,
                              fontSize: 14,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          Text(
                            'Bahir Dar Blood Bank',
                            style: TextStyle(
                              fontSize: 10,
                              color: AppColors.textHint,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  actions: [
                    Container(
                      margin: const EdgeInsets.only(right: 16),
                      decoration: BoxDecoration(
                        color: AppColors.bgSubtle,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFFFD5D5)),
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.language_rounded,
                            color: AppColors.textSecondary, size: 20),
                        onPressed: () => _showLanguageSelector(context),
                        padding: const EdgeInsets.all(8),
                        constraints:
                            const BoxConstraints(minWidth: 40, minHeight: 40),
                      ),
                    ),
                  ],
                ),

                SliverToBoxAdapter(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 20),

                      // ══════════ GREETING ══════════
                      if (donor != null)
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 22),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Hello, ${donor.name.split(' ')[0]}! 👋',
                                          style: const TextStyle(
                                            fontSize: 24,
                                            fontWeight: FontWeight.w900,
                                            color: AppColors.textPrimary,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        const Text(
                                          'Your blood saves lives every day.',
                                          style: TextStyle(
                                            fontSize: 13,
                                            color: AppColors.textHint,
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  // Blood type chip
                                  if (donor.bloodType != null)
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 14, vertical: 8),
                                      decoration: BoxDecoration(
                                        color: AppColors.bgSubtle,
                                        borderRadius: BorderRadius.circular(14),
                                        border: Border.all(
                                            color: const Color(0xFFFFD5D5),
                                            width: 1.5),
                                      ),
                                      child: Column(
                                        children: [
                                          const Icon(Icons.water_drop_rounded,
                                              color: AppColors.primary,
                                              size: 16),
                                          const SizedBox(height: 2),
                                          Text(
                                            donor.bloodType!,
                                            style: const TextStyle(
                                              color: AppColors.primary,
                                              fontWeight: FontWeight.w900,
                                              fontSize: 16,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                ],
                              ),
                              const SizedBox(height: 20),
                              // ── Donor Card ──
                              DonorCard(donor: donor),
                            ],
                          ),
                        ),

                      const SizedBox(height: 28),

                      // ══════════ STATS ══════════
                      if (donor != null) _buildStatsBanner(donor),

                      const SizedBox(height: 28),

                      // ══════════ ALERTS PREVIEW ══════════
                      _buildAlertsPreview(context),

                      const SizedBox(height: 28),

                      // ══════════ NEWS & ANNOUNCEMENTS PREVIEW ══════════
                      _buildNewsPreview(context),

                      const SizedBox(height: 28),

                      // ══════════ QUICK SERVICES ══════════
                      _buildQuickActions(context),

                      const SizedBox(height: 48),
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
      padding: const EdgeInsets.symmetric(horizontal: 22),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 22, horizontal: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: const Color(0xFFFFE5E5), width: 1.5),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withOpacity(0.07),
              blurRadius: 20,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _statItem(
              '${donor.totalDonations}',
              'Donations',
              Icons.water_drop_rounded,
              AppColors.primary,
            ),
            _statDivider(),
            _statItem(
              eligible
                  ? 'Ready'
                  : (daysLeft != null && daysLeft > 0
                      ? '${daysLeft}d'
                      : 'Check'),
              'Status',
              eligible
                  ? Icons.check_circle_rounded
                  : Icons.hourglass_bottom_rounded,
              eligible ? AppColors.success : AppColors.warning,
            ),
            _statDivider(),
            _statItem(
              donor.bloodType ?? '??',
              'Blood Type',
              Icons.bloodtype_rounded,
              AppColors.accent,
            ),
          ],
        ),
      ),
    );
  }

  Widget _statItem(String value, String label, IconData icon, Color color) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Icon(icon, color: color, size: 22),
        ),
        const SizedBox(height: 8),
        Text(
          value,
          style: TextStyle(
            color: color,
            fontWeight: FontWeight.w900,
            fontSize: 17,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(
            color: AppColors.textHint,
            fontSize: 10,
            fontWeight: FontWeight.w600,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _statDivider() => Container(
        width: 1,
        height: 52,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Colors.transparent,
              const Color(0xFFFFD5D5),
              Colors.transparent
            ],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
      );

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
          padding: const EdgeInsets.symmetric(horizontal: 22),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: AppColors.bgSubtle,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.campaign_rounded,
                            color: AppColors.primary, size: 18),
                      ),
                      const SizedBox(width: 10),
                      const Text(
                        'Staff Alerts',
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 16,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      if (unread.isNotEmpty) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            '${unread.length}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  TextButton(
                    onPressed: () {},
                    style: TextButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      padding: EdgeInsets.zero,
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('View All',
                            style: TextStyle(
                                fontWeight: FontWeight.w700, fontSize: 12)),
                        SizedBox(width: 2),
                        Icon(Icons.chevron_right_rounded, size: 16),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              if (snapshot.connectionState == ConnectionState.waiting)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(16),
                    child: CircularProgressIndicator(
                      color: AppColors.primary,
                      strokeWidth: 2.5,
                    ),
                  ),
                )
              else if (notifs.isEmpty)
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: const Color(0xFFFFE5E5)),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.notifications_off_outlined,
                          color: Colors.grey.shade300, size: 28),
                      const SizedBox(width: 14),
                      Text(
                        'No staff alerts at this time.',
                        style: TextStyle(
                            color: Colors.grey.shade400, fontSize: 13),
                      ),
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
    final isEmergency = (n.title).toLowerCase().contains('urgent') ||
        (n.title).toLowerCase().contains('emergency') ||
        (n.title).toLowerCase().contains('critical') ||
        (n.message).toLowerCase().contains('urgent');

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isRead
            ? Colors.white
            : (isEmergency ? const Color(0xFFFFF0F0) : AppColors.bgSubtle),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isRead
              ? const Color(0xFFF0E5E5)
              : (isEmergency
                  ? const Color(0xFFFFCCCC)
                  : const Color(0xFFFFD5D5)),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.025),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: isEmergency
                  ? AppColors.primary.withOpacity(0.12)
                  : (isRead ? Colors.grey.shade100 : AppColors.bgSubtle),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              isEmergency ? Icons.emergency_rounded : Icons.campaign_rounded,
              color: isEmergency
                  ? AppColors.primary
                  : (isRead ? Colors.grey.shade400 : AppColors.primary),
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
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                    color: isRead ? AppColors.textHint : AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  n.message ?? '',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                      fontSize: 12, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
          if (!isRead)
            Container(
              width: 8,
              height: 8,
              margin: const EdgeInsets.only(top: 4),
              decoration: const BoxDecoration(
                color: AppColors.primary,
                shape: BoxShape.circle,
              ),
            ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // NEWS & ANNOUNCEMENTS PREVIEW
  // ─────────────────────────────────────────────────────────────────────
  Widget _buildNewsPreview(BuildContext context) {
    return FutureBuilder<List<dynamic>>(
      future: _newsFuture,
      builder: (context, snapshot) {
        final newsList = snapshot.data ?? [];
        if (newsList.isEmpty && snapshot.connectionState != ConnectionState.waiting) {
          return const SizedBox.shrink();
        }

        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 22),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: Colors.orange.shade50,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.campaign_rounded,
                            color: Colors.orange, size: 18),
                      ),
                      const SizedBox(width: 10),
                      const Text(
                        'Announcements & News',
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 16,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                  TextButton(
                    onPressed: () {
                      // Navigate to News Screen, typically handled via Bottom Navigation (index 2)
                    },
                    style: TextButton.styleFrom(
                      foregroundColor: Colors.orange,
                      padding: EdgeInsets.zero,
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('View All',
                            style: TextStyle(
                                fontWeight: FontWeight.w700, fontSize: 12)),
                        SizedBox(width: 2),
                        Icon(Icons.chevron_right_rounded, size: 16),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              if (snapshot.connectionState == ConnectionState.waiting)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(16),
                    child: CircularProgressIndicator(
                      color: Colors.orange,
                      strokeWidth: 2.5,
                    ),
                  ),
                )
              else
                ...newsList.take(2).map((n) => _newsCard(n)).toList(),
            ],
          ),
        );
      },
    );
  }

  Widget _newsCard(dynamic news) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFF0E5E5), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.025),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: Colors.orange.shade50,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.newspaper_rounded, color: Colors.orange, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  news['title'] ?? 'News',
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                    color: AppColors.textPrimary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 3),
                Text(
                  news['content'] ?? '',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                      fontSize: 12, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // QUICK ACTIONS
  // ─────────────────────────────────────────────────────────────────────
  Widget _buildQuickActions(BuildContext context) {
    final actions = [
      {
        'icon': Icons.history_rounded,
        'label': 'History',
        'color': AppColors.info,
        'bg': const Color(0xFFEFF5FF),
        'route': '/history'
      },
      {
        'icon': Icons.location_on_rounded,
        'label': 'Find Center',
        'color': AppColors.success,
        'bg': const Color(0xFFEFFAF6),
        'route': '/map'
      },
      {
        'icon': Icons.notifications_active_rounded,
        'label': 'Alerts',
        'color': AppColors.warning,
        'bg': const Color(0xFFFFF8EC),
        'route': '/notifications'
      },
      {
        'icon': Icons.emergency_rounded,
        'label': 'Emergency',
        'color': const Color(0xFFD32F2F),
        'bg': const Color(0xFFFFEBEE),
        'route': '/emergency'
      },
      {
        'icon': Icons.favorite_rounded,
        'label': 'Hero Letters',
        'color': AppColors.accent,
        'bg': const Color(0xFFFFF0F0),
        'route': '/appreciation'
      },
      {
        'icon': Icons.info_rounded,
        'label': 'About Us',
        'color': Colors.blue,
        'bg': Colors.blue.shade50,
        'route': '/about'
      },
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 22),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'QUICK SERVICES',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w800,
              color: AppColors.textHint,
              letterSpacing: 1.8,
            ),
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: actions.map((a) {
              final color = a['color'] as Color;
              final bg = a['bg'] as Color;
              return SizedBox(
                width: (MediaQuery.of(context).size.width - 22 * 2 - 24) / 2,
                child: GestureDetector(
                  onTap: () =>
                      Navigator.pushNamed(context, a['route'] as String),
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(vertical: 18, horizontal: 4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border:
                          Border.all(color: const Color(0xFFF5E5E5), width: 1),
                      boxShadow: [
                        BoxShadow(
                          color: color.withOpacity(0.08),
                          blurRadius: 14,
                          offset: const Offset(0, 5),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: bg,
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Icon(a['icon'] as IconData,
                              color: color, size: 22),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          a['label'] as String,
                          style: const TextStyle(
                            fontSize: 10.5,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textSecondary,
                          ),
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
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

  Widget _buildActiveEmergencyBanner(BuildContext context) {
    return FutureBuilder<List<NotificationModel>>(
      future: _notifFuture,
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const SizedBox.shrink();
        final list = snapshot.data!;
        final activeEmergencies = list.where((n) {
          if (n.read) return false;
          final t = n.title.toLowerCase();
          final m = n.message.toLowerCase();
          return n.type == 'EMERGENCY' || t.contains('urgent') || t.contains('emergency') || m.contains('urgent');
        }).toList();

        if (activeEmergencies.isEmpty) return const SizedBox.shrink();

        final alert = activeEmergencies.first;

        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 8),
          child: Container(
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFE52020), Color(0xFFB01212)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: Colors.red.withOpacity(0.35),
                  blurRadius: 18,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            padding: const EdgeInsets.all(18),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.18),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Icon(
                    Icons.warning_amber_rounded,
                    color: Colors.white,
                    size: 26,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'CRITICAL ALERT NEEDED!',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                          fontSize: 13,
                          letterSpacing: 1.2,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        alert.message,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.92),
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          ElevatedButton(
                            onPressed: () {
                              DefaultTabController.of(context).animateTo(2);
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: AppColors.primary,
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              minimumSize: Size.zero,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            child: const Text(
                              'RESPOND NOW',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          TextButton(
                            onPressed: () => _handleResponse(alert.id, 'DECLINED'),
                            style: TextButton.styleFrom(
                              foregroundColor: Colors.white,
                            ),
                            child: const Text(
                              'Dismiss',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: Colors.white70,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // ERROR STATE
  // ─────────────────────────────────────────────────────────────────────
  Widget _buildErrorState(dynamic error) {
    String msg = error is SocketException
        ? 'network_error'.tr()
        : '${'error_occurred'.tr()}\n($error)';
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.bgSubtle,
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFFFD5D5), width: 2),
              ),
              child: const Icon(Icons.wifi_off_rounded,
                  size: 40, color: AppColors.primary),
            ),
            const SizedBox(height: 20),
            Text(
              msg,
              textAlign: TextAlign.center,
              style:
                  const TextStyle(fontSize: 15, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 28),
            ElevatedButton.icon(
              onPressed: _refreshAll,
              icon: const Icon(Icons.refresh_rounded, size: 18),
              label: Text('retry'.tr()),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14)),
                padding:
                    const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
