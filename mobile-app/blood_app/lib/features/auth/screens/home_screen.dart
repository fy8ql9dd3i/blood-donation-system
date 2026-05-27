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
      // We read name/phone for display purposes only.
      // Registration status is determined by the backend (by phone number),
      // NOT by a device flag — so many donors can share one device.
      _isRegistered = false; // always allow access to Register on home screen
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
      actions: const [],
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

              const SizedBox(height: 28),

              // 2.5️⃣ Quick Access Services Grid
              _buildQuickServicesGrid(),

              const SizedBox(height: 32),

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

  Widget _buildQuickServicesGrid() {
    final services = [
      {
        'icon': Icons.person_rounded,
        'label': 'My Profile',
        'color': Colors.blue.shade700,
        'bg': Colors.blue.shade50,
        'route': '/profile',
        'requiresAuth': true,
      },
      {
        'icon': Icons.warning_amber_rounded,
        'label': 'Emergency Alerts',
        'color': Colors.red.shade700,
        'bg': const Color(0xFFFFF0F0),
        'route': '/emergency',
        'requiresAuth': false,
      },
      {
        'icon': Icons.history_rounded,
        'label': 'History',
        'color': Colors.teal.shade700,
        'bg': Colors.teal.shade50,
        'route': '/history',
        'requiresAuth': true,
      },
      {
        'icon': Icons.favorite_rounded,
        'label': 'Appreciation',
        'color': Colors.pink.shade600,
        'bg': Colors.pink.shade50,
        'route': '/appreciation',
        'requiresAuth': true,
      },
      {
        'icon': Icons.app_registration_rounded,
        'label': 'Register',
        'color': Colors.orange.shade800,
        'bg': Colors.orange.shade50,
        'action': 'register',
        'requiresAuth': false,
      },
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.grid_view_rounded, color: Colors.red, size: 20),
              const SizedBox(width: 8),
              Text(
                'quick_services'.tr().toUpperCase(),
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w900,
                  color: Colors.black87,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 0.95,
            ),
            itemCount: services.length,
            itemBuilder: (context, index) {
              final service = services[index];
              final color = service['color'] as Color;
              final bg = service['bg'] as Color;
              final label = service['label'] as String;

              return GestureDetector(
                onTap: () {
                  // NOTE: We no longer block by device 'isRegistered' flag.
                  // Registration is per-donor (checked by phone on the backend),
                  // so multiple donors can share the same device.
                  // Auth-required services simply open the registration screen
                  // if a donor hasn't registered yet on this device session.
                  final reqAuth = service['requiresAuth'] as bool;
                  if (reqAuth) {
                    // Redirect to register first; after register they go to dashboard
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Please register as a donor first to access $label!'),
                        backgroundColor: Colors.red.shade800,
                        action: SnackBarAction(
                          label: 'REGISTER',
                          textColor: Colors.white,
                          onPressed: () {
                            Navigator.pushNamed(context, '/register').then((_) => _loadDonorData());
                          },
                        ),
                      ),
                    );
                    return;
                  }

                  if (service['action'] == 'staff') {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const StaffPortalScreen()),
                    ).then((_) => _loadDonorData());
                  } else if (service['action'] == 'register') {
                    // Always navigate to register — backend checks phone for duplicates
                    Navigator.pushNamed(context, '/register').then((_) => _loadDonorData());
                  } else {
                    final route = service['route'] as String;
                    Navigator.pushNamed(context, route);
                  }
                },
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFFFEAEB), width: 1.2),
                    boxShadow: [
                      BoxShadow(
                        color: color.withOpacity(0.06),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: bg,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Icon(
                          service['icon'] as IconData,
                          color: color,
                          size: 22,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                        child: Text(
                          label,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: Colors.grey.shade800,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
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

    if (_newsList.isEmpty) {
      return Container(
        height: 140,
        margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: const Color(0xFFFFEAEB), width: 1.5),
          boxShadow: [
            BoxShadow(
              color: Colors.red.withOpacity(0.04),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.campaign_rounded, color: Colors.red, size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text(
                    'Stay Tuned!',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.black87),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'No news or announcements posted yet. Check back later!',
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }

    final displayList = _newsList;

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
      return const SizedBox.shrink();
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

