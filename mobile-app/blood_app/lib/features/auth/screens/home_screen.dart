import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:provider/provider.dart';
import '../../../shared/widgets/base_screen.dart';
import '../../donor/data/news_service.dart';
import '../../donor/screens/staff_portal_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _isRegistered = false;
  String _fullName = '';
  String _phone = '';
  List<dynamic> _newsList = [];
  bool _isLoadingNews = true;
  final NewsService _newsService = NewsService();

  @override
  void initState() {
    super.initState();
    _loadDonorData();
    _fetchLiveNews();
  }

  Future<void> _loadDonorData() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _isRegistered = prefs.getBool('isRegistered') ?? false;
      _fullName = prefs.getString('fullName') ?? '';
      _phone = prefs.getString('phoneNumber') ?? '';
    });
  }

  Future<void> _fetchLiveNews() async {
    try {
      final news = await _newsService.fetchNews(context.locale.languageCode);
      if (mounted) {
        setState(() {
          _newsList = news;
          _isLoadingNews = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoadingNews = false;
        });
      }
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _fetchLiveNews();
  }

  void _changeLanguage(String langCode) {
    setState(() {
      context.setLocale(Locale(langCode));
    });
    _fetchLiveNews();
  }

  @override
  Widget build(BuildContext context) {
    return BaseScreen(
      title: 'app_name'.tr(),
      actions: [
        // Staff portal launcher
        TextButton.icon(
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const StaffPortalScreen()),
            ).then((_) => _loadDonorData());
          },
          icon: const Icon(Icons.biotech_rounded, color: Colors.white),
          label: Text(
            'staff_portal'.tr().split(' ')[0],
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
          ),
          style: TextButton.styleFrom(
            backgroundColor: Colors.white24,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          ),
        ),
        const SizedBox(width: 8),
      ],
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.grey.shade50, Colors.red.shade50.withOpacity(0.3)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 16),
              
              // 1️⃣ Live News & Announcements Carousel (Top Side)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Row(
                  children: [
                    const Icon(Icons.campaign_rounded, color: Colors.red),
                    const SizedBox(width: 8),
                    Text(
                      'news_announcements'.tr(),
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.black87),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              _buildNewsCarousel(),

              const SizedBox(height: 24),

              // 2️⃣ Fact / Benefit Cards Grid
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Text(
                  'about_blood_donation'.tr(),
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.black87),
                ),
              ),
              const SizedBox(height: 12),
              _buildClinicalFactsGrid(),

              const SizedBox(height: 40),

              // 3️⃣ Large Premium Action Button (Bottom Side)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: _buildMainActionButton(),
              ),

              const SizedBox(height: 24),

              // 4️⃣ Quick Translation Selection Toggles
              _buildLanguageToggles(),
              
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNewsCarousel() {
    if (_isLoadingNews) {
      return const SizedBox(
        height: 160,
        child: Center(
          child: CircularProgressIndicator(color: Colors.red),
        ),
      );
    }

    // Fallback if list is empty
    final displayList = _newsList.isNotEmpty
        ? _newsList
        : [
            {
              'title': 'Save Lives This Weekend!',
              'content': 'Join us at the Bahir Dar main branch for a special donation campaign. Free health screening provided.',
              'imageUrl': 'https://images.unsplash.com/photo-1615461066841-6116ecdccd04?q=80&w=800'
            },
            {
              'title': 'Emergency: Blood Group O- Needed',
              'content': 'Urgent demand for O Negative units at St. George Hospital. Please visit the nearest center today.',
              'imageUrl': 'https://images.unsplash.com/photo-1536856788636-e875147be447?q=80&w=800'
            }
          ];

    return SizedBox(
      height: 180,
      child: PageView.builder(
        itemCount: displayList.length,
        controller: PageController(viewportFraction: 0.88),
        itemBuilder: (context, index) {
          final news = displayList[index];
          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              gradient: LinearGradient(
                colors: [Colors.red.shade900, Colors.red.shade600],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.red.withOpacity(0.3),
                  blurRadius: 12,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Stack(
              children: [
                // Inner content
                Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white24,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          'live'.toUpperCase(),
                          style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w900),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        news['title'] ?? '',
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        news['content'] ?? '',
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(color: Colors.white.withOpacity(0.85), fontSize: 12),
                      ),
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

  Widget _buildClinicalFactsGrid() {
    return Container(
      height: 120,
      padding: const EdgeInsets.symmetric(horizontal: 8.0),
      child: ListView(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        children: [
          _buildFactCard(
            Icons.favorite_rounded,
            'save_lives_fact'.tr(),
            Colors.red,
          ),
          _buildFactCard(
            Icons.speed_rounded,
            'quick_process_fact'.tr(),
            Colors.orange,
          ),
          _buildFactCard(
            Icons.health_and_safety_rounded,
            'health_benefits_fact'.tr(),
            Colors.green,
          ),
        ],
      ),
    );
  }

  Widget _buildFactCard(IconData icon, String fact, Color color) {
    return Container(
      width: 220,
      margin: const EdgeInsets.symmetric(horizontal: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.2), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              fact,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.black87),
              maxLines: 4,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMainActionButton() {
    if (_isRegistered) {
      return Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          gradient: const LinearGradient(
            colors: [Color(0xFF2E7D32), Color(0xFF4CAF50)],
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.green.withOpacity(0.3),
              blurRadius: 12,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: ElevatedButton(
          onPressed: () {
            Navigator.pushNamed(context, '/dashboard');
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.transparent,
            shadowColor: Colors.transparent,
            padding: const EdgeInsets.symmetric(vertical: 20),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.dashboard_rounded, color: Colors.white, size: 24),
              const SizedBox(width: 12),
              Text(
                'dashboard'.tr().toUpperCase(),
                style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900, letterSpacing: 1.2),
              ),
            ],
          ),
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: const LinearGradient(
          colors: [Color(0xFF8B0000), Color(0xFFC0152B)],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.red.withOpacity(0.4),
            blurRadius: 15,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: ElevatedButton(
        onPressed: () async {
          await Navigator.pushNamed(context, '/register');
          _loadDonorData();
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          shadowColor: Colors.transparent,
          padding: const EdgeInsets.symmetric(vertical: 20),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.app_registration_rounded, color: Colors.white, size: 24),
            const SizedBox(width: 12),
            Text(
              'register'.tr().toUpperCase(),
              style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900, letterSpacing: 1.2),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLanguageToggles() {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 40,
                height: 1.5,
                color: Colors.red.shade100,
              ),
              const SizedBox(width: 12),
              Text(
                'select_language'.tr(),
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.red.shade800),
              ),
              const SizedBox(width: 12),
              Container(
                width: 40,
                height: 1.5,
                color: Colors.red.shade100,
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _languageChip('en', 'English'),
            const SizedBox(width: 8),
            _languageChip('am', 'አማርኛ'),
            const SizedBox(width: 8),
            _languageChip('or', 'Oromoo'),
          ],
        ),
      ],
    );
  }

  Widget _languageChip(String code, String label) {
    final bool isSelected = context.locale.languageCode == code;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        if (selected) {
          _changeLanguage(code);
        }
      },
      selectedColor: Colors.red.shade800,
      disabledColor: Colors.white,
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : Colors.black87,
        fontWeight: isSelected ? FontWeight.w900 : FontWeight.w500,
        fontSize: 13,
      ),
      backgroundColor: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(color: isSelected ? Colors.transparent : Colors.grey.shade300, width: 1),
      ),
    );
  }
}

