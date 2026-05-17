import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../data/notification_repository.dart';
import '../../../core/models/notification_model.dart';
import '../../../shared/widgets/loading_widget.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  late Future<List<NotificationModel>> _future;

  @override
  void initState() {
    super.initState();
    _future = context.read<NotificationRepository>().getNotifications();
  }

  void _refresh() {
    setState(() {
      _future = context.read<NotificationRepository>().getNotifications();
    });
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);
    if (diff.inSeconds < 60) return 'just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays == 1) return 'Yesterday';
    if (diff.inDays < 7) return '${diff.inDays} days ago';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }

  IconData _getIcon(NotificationModel n) {
    final t = (n.title ?? '').toLowerCase();
    if (t.contains('urgent') || t.contains('emergency') || t.contains('critical')) return Icons.warning_amber_rounded;
    if (t.contains('thank') || t.contains('appreciat') || t.contains('hero')) return Icons.favorite_rounded;
    if (t.contains('remind') || t.contains('eligible') || t.contains('ready')) return Icons.alarm_rounded;
    if (t.contains('event') || t.contains('drive') || t.contains('join')) return Icons.event_rounded;
    return Icons.campaign_rounded;
  }

  Color _getColor(NotificationModel n) {
    final t = (n.title ?? '').toLowerCase();
    if (t.contains('urgent') || t.contains('emergency') || t.contains('critical')) return Colors.red.shade700;
    if (t.contains('thank') || t.contains('appreciat') || t.contains('hero')) return Colors.pink.shade600;
    if (t.contains('remind') || t.contains('eligible') || t.contains('ready')) return Colors.orange.shade600;
    if (t.contains('event') || t.contains('drive') || t.contains('join')) return Colors.purple.shade600;
    return Colors.blue.shade700;
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
            Icon(Icons.notifications_rounded, color: Colors.red, size: 22),
            SizedBox(width: 10),
            Text('Notifications', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Colors.black87)),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh_rounded, color: Colors.grey.shade500),
            onPressed: _refresh,
          ),
        ],
      ),
      body: FutureBuilder<List<NotificationModel>>(
        future: _future,
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
                    Text('Could not load notifications', style: TextStyle(color: Colors.grey.shade600)),
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

          final all = snapshot.data ?? [];

          if (all.isEmpty) {
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
                        Container(
                          width: 90, height: 90,
                          decoration: BoxDecoration(color: Colors.grey.shade100, shape: BoxShape.circle),
                          child: Icon(Icons.notifications_off_outlined, size: 40, color: Colors.grey.shade400),
                        ),
                        const SizedBox(height: 16),
                        const Text('No notifications yet', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87)),
                        const SizedBox(height: 6),
                        Text('Blood bank messages will appear here.', style: TextStyle(fontSize: 13, color: Colors.grey.shade500)),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }

          // Count unread
          final unreadCount = all.where((n) => !n.read).length;

          return RefreshIndicator(
            onRefresh: () async => _refresh(),
            color: Colors.red,
            child: CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              slivers: [
                // ── Summary banner ──
                if (unreadCount > 0)
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [Color(0xFFD31027), Color(0xFFEA384D)]),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(10)),
                              child: const Icon(Icons.mark_email_unread_rounded, color: Colors.white, size: 18),
                            ),
                            const SizedBox(width: 12),
                            Text(
                              '$unreadCount unread message${unreadCount > 1 ? 's' : ''} from Bahir Dar Blood Bank',
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                // ── Section title ──
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 20, 20, 10),
                    child: Text(
                      '${all.length} MESSAGE${all.length > 1 ? 'S' : ''}',
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.black38, letterSpacing: 1.5),
                    ),
                  ),
                ),

                // ── Notification Cards ──
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 40),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) => _buildCard(all[index]),
                      childCount: all.length,
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

  Widget _buildCard(NotificationModel n) {
    final isUnread = !n.read;
    final color = _getColor(n);
    final icon = _getIcon(n);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: isUnread ? Colors.white : Colors.white.withOpacity(0.7),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isUnread ? color.withOpacity(0.2) : Colors.grey.shade100,
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: isUnread ? color.withOpacity(0.08) : Colors.black.withOpacity(0.03),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Icon ──
            Container(
              width: 46, height: 46,
              decoration: BoxDecoration(
                color: isUnread ? color.withOpacity(0.12) : Colors.grey.shade100,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: isUnread ? color : Colors.grey.shade400, size: 22),
            ),
            const SizedBox(width: 14),

            // ── Content ──
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          n.title ?? 'Blood Bank Notification',
                          style: TextStyle(
                            fontWeight: isUnread ? FontWeight.w800 : FontWeight.w600,
                            fontSize: 13.5,
                            color: isUnread ? Colors.black87 : Colors.black54,
                          ),
                        ),
                      ),
                      if (isUnread)
                        Container(
                          width: 8, height: 8,
                          margin: const EdgeInsets.only(top: 4, left: 6),
                          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    n.message ?? '',
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(fontSize: 12.5, color: Colors.grey.shade600, height: 1.4),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.access_time_rounded, size: 11, color: Colors.grey.shade400),
                          const SizedBox(width: 4),
                          Text(_formatDate(n.createdAt), style: TextStyle(fontSize: 11, color: Colors.grey.shade400)),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'Blood Bank',
                          style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.grey.shade500, letterSpacing: 0.5),
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
  }
}
