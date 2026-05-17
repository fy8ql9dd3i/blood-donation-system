import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:share_plus/share_plus.dart';
import '../data/news_service.dart';

class NewsScreen extends StatefulWidget {
  const NewsScreen({super.key});

  @override
  State<NewsScreen> createState() => _NewsScreenState();
}

class _NewsScreenState extends State<NewsScreen>
    with SingleTickerProviderStateMixin {
  late Future<List<dynamic>> _newsFuture;
  final NewsService _newsService = NewsService();
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _newsFuture = _newsService.fetchNews(context.locale.languageCode);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _refresh() async {
    setState(() {
      _newsFuture = _newsService.fetchNews(context.locale.languageCode);
    });
  }

  String _formatDate(String? dateString) {
    if (dateString == null) return '';
    try {
      final date = DateTime.parse(dateString).toLocal();
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return '${date.day} ${months[date.month - 1]} ${date.year}  •  ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F6FB),
      body: FutureBuilder<List<dynamic>>(
        future: _newsFuture,
        builder: (context, snapshot) {
          final allPosts = snapshot.data ?? [];
          // Split: Announcements = any, News = also any (same source, but different visual)
          final featured = allPosts.isNotEmpty ? allPosts.take(1).toList() : [];
          final rest = allPosts.length > 1 ? allPosts.skip(1).toList() : [];

          return CustomScrollView(
            slivers: [
              // ══════════════════ SLIVER APP BAR ══════════════════
              SliverAppBar(
                backgroundColor: Colors.white,
                elevation: 0,
                pinned: true,
                title: const Row(
                  children: [
                    Icon(Icons.campaign_rounded, color: Colors.orange, size: 22),
                    SizedBox(width: 10),
                    Text(
                      'Announcements',
                      style: TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 18,
                        color: Colors.black87,
                      ),
                    ),
                  ],
                ),
                centerTitle: false,
                bottom: TabBar(
                  controller: _tabController,
                  labelColor: Colors.red.shade700,
                  unselectedLabelColor: Colors.grey.shade400,
                  indicatorColor: Colors.red.shade700,
                  indicatorWeight: 2.5,
                  labelStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12),
                  tabs: const [
                    Tab(icon: Icon(Icons.campaign_rounded, size: 18), text: 'Announcements'),
                    Tab(icon: Icon(Icons.newspaper_rounded, size: 18), text: 'News'),
                  ],
                ),
              ),

              SliverFillRemaining(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    // ══════════ TAB 1: ANNOUNCEMENTS ══════════
                    _buildAnnouncementsTab(snapshot, allPosts, featured, rest),
                    // ══════════ TAB 2: NEWS ══════════
                    _buildNewsTab(snapshot, allPosts),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  // ─────────────────────────────────────────────────────
  // ANNOUNCEMENTS TAB — Card grid with featured hero
  // ─────────────────────────────────────────────────────
  Widget _buildAnnouncementsTab(
    AsyncSnapshot<List<dynamic>> snapshot,
    List<dynamic> allPosts,
    List<dynamic> featured,
    List<dynamic> rest,
  ) {
    if (snapshot.connectionState == ConnectionState.waiting) {
      return const Center(child: CircularProgressIndicator(color: Colors.orange, strokeWidth: 2));
    }
    if (allPosts.isEmpty) {
      return RefreshIndicator(
        onRefresh: _refresh,
        color: Colors.orange,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          children: [
            const SizedBox(height: 100),
            Center(
              child: Column(
                children: [
                  const Text('📢', style: TextStyle(fontSize: 52)),
                  const SizedBox(height: 16),
                  const Text('No announcements yet', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87)),
                  const SizedBox(height: 6),
                  Text('Pull down to refresh', style: TextStyle(color: Colors.grey.shade500, fontSize: 13)),
                ],
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _refresh,
      color: Colors.orange,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        children: [
          // ── Featured / Hero post ──
          if (featured.isNotEmpty) _buildFeaturedCard(featured.first),

          if (rest.isNotEmpty) ...[
            const SizedBox(height: 20),
            const Padding(
              padding: EdgeInsets.only(left: 4, bottom: 12),
              child: Text(
                'MORE ANNOUNCEMENTS',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.black38, letterSpacing: 1.5),
              ),
            ),
            ...rest.map((post) => _buildAnnouncementCard(post)).toList(),
          ],
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  // ── Featured Hero Card ──
  Widget _buildFeaturedCard(dynamic news) {
    final hasImage = news['imageUrl'] != null && news['imageUrl'].toString().isNotEmpty;
    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFF6B35), Color(0xFFE8472A)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: Colors.orange.withOpacity(0.35), blurRadius: 20, offset: const Offset(0, 8))],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (hasImage)
            Stack(
              children: [
                Image.network(news['imageUrl'], width: double.infinity, height: 180, fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => const SizedBox.shrink()),
                Positioned.fill(child: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Colors.transparent, Color(0xCC000000)],
                    ),
                  ),
                )),
              ],
            ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(20)),
                  child: const Text('📌  FEATURED', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 1)),
                ),
                const SizedBox(height: 10),
                Text(
                  news['title'] ?? '',
                  style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold, height: 1.3),
                ),
                const SizedBox(height: 8),
                Text(
                  news['content'] ?? '',
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.5),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(_formatDate(news['createdAt']), style: const TextStyle(color: Colors.white54, fontSize: 11)),
                    GestureDetector(
                      onTap: () => Share.share('${news['title']}\n\n${news['content']}'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                        decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(10)),
                        child: const Row(
                          children: [
                            Icon(Icons.share_rounded, size: 14, color: Colors.white),
                            SizedBox(width: 6),
                            Text('Share', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white)),
                          ],
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
    );
  }

  // ── Compact Announcement Card ──
  Widget _buildAnnouncementCard(dynamic news) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 46, height: 46,
            decoration: BoxDecoration(color: Colors.orange.shade50, borderRadius: BorderRadius.circular(14)),
            child: const Icon(Icons.campaign_rounded, color: Colors.orange, size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(news['title'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.black87, height: 1.3)),
                const SizedBox(height: 4),
                Text(news['content'] ?? '', maxLines: 2, overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 12, color: Colors.black45, height: 1.4)),
                const SizedBox(height: 6),
                Text(_formatDate(news['createdAt']), style: TextStyle(fontSize: 10, color: Colors.grey.shade400)),
              ],
            ),
          ),
          IconButton(
            icon: Icon(Icons.share_rounded, size: 18, color: Colors.grey.shade400),
            onPressed: () => Share.share('${news['title']}\n\n${news['content']}'),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
          ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────
  // NEWS TAB — Magazine-style full cards
  // ─────────────────────────────────────────────────────
  Widget _buildNewsTab(AsyncSnapshot<List<dynamic>> snapshot, List<dynamic> allPosts) {
    if (snapshot.connectionState == ConnectionState.waiting) {
      return const Center(child: CircularProgressIndicator(color: Colors.blue, strokeWidth: 2));
    }
    if (allPosts.isEmpty) {
      return RefreshIndicator(
        onRefresh: _refresh,
        color: Colors.blue,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          children: [
            const SizedBox(height: 100),
            Center(
              child: Column(
                children: [
                  const Text('📭', style: TextStyle(fontSize: 52)),
                  const SizedBox(height: 16),
                  const Text('No news yet', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87)),
                  const SizedBox(height: 6),
                  Text('Pull down to refresh', style: TextStyle(color: Colors.grey.shade500, fontSize: 13)),
                ],
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _refresh,
      color: Colors.blue,
      child: ListView.separated(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        itemCount: allPosts.length,
        separatorBuilder: (_, __) => const SizedBox(height: 16),
        itemBuilder: (context, index) => _buildNewsCard(allPosts[index]),
      ),
    );
  }

  // ── Full Magazine News Card ──
  Widget _buildNewsCard(dynamic news) {
    final hasImage = news['imageUrl'] != null && news['imageUrl'].toString().isNotEmpty;
    final lang = news['language'];
    final langBadge = lang == 'am' ? '🇪🇹 Amharic' : lang == 'or' ? '🇪🇹 Oromoo' : '🇬🇧 English';

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.blue.withOpacity(0.07), blurRadius: 20, offset: const Offset(0, 6))],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (hasImage)
            Stack(children: [
              Image.network(news['imageUrl'], width: double.infinity, height: 200, fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => const SizedBox.shrink()),
              Positioned.fill(child: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [Colors.transparent, Color(0x88000000)],
                  ),
                ),
              )),
            ]),
          // Blue accent line for news
          Container(height: 3, decoration: const BoxDecoration(
            gradient: LinearGradient(colors: [Color(0xFF2196F3), Color(0xFF21CBF3)]),
          )),
          Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.blue.shade50,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.blue.shade200),
                      ),
                      child: Text(langBadge, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.blue.shade800)),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(20)),
                      child: const Text('📰  NEWS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.black45, letterSpacing: 1)),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(news['title'] ?? '',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87, height: 1.3)),
                const SizedBox(height: 8),
                Text(news['content'] ?? '',
                  style: const TextStyle(fontSize: 14, color: Colors.black54, height: 1.6)),
                const SizedBox(height: 14),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(children: [
                      Icon(Icons.access_time_rounded, size: 13, color: Colors.grey.shade400),
                      const SizedBox(width: 4),
                      Text(_formatDate(news['createdAt']), style: TextStyle(fontSize: 11, color: Colors.grey.shade400)),
                    ]),
                    GestureDetector(
                      onTap: () => Share.share('${news['title']}\n\n${news['content']}\n\nDownload the Blood Donation App ❤️'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(color: Colors.blue.shade50, borderRadius: BorderRadius.circular(12)),
                        child: const Row(children: [
                          Icon(Icons.share_rounded, size: 15, color: Colors.blue),
                          SizedBox(width: 6),
                          Text('Share', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.blue)),
                        ]),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
