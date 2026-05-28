import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../l10n/app_localizations.dart';
import '../services/donor_service.dart';
import '../services/news_service.dart';
import '../services/storage_service.dart';
import '../models/news_model.dart';
import '../models/donor_model.dart';
import 'register_screen.dart';
import 'profile_screen.dart';
import 'emergency_screen.dart';
import 'history_screen.dart';
import 'appreciation_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _isLoggedIn = false;
  DonorModel? _donorProfile;
  List<NewsModel> _newsList = [];
  bool _isLoadingProfile = false;
  bool _isLoadingNews = false;

  @override
  void initState() {
    super.initState();
    _checkStatusAndLoadData();
  }

  Future<void> _checkStatusAndLoadData() async {
    setState(() {
      _isLoggedIn = StorageService.isLoggedIn();
      _isLoadingProfile = _isLoggedIn;
      _isLoadingNews = true;
    });

    // Fetch News
    NewsService.getNews().then((news) {
      if (mounted) {
        setState(() {
          _newsList = news;
          _isLoadingNews = false;
        });
      }
    });

    // Fetch Profile if Logged In
    if (_isLoggedIn) {
      final result = await DonorService.getProfileResult();
      if (mounted) {
        if (result['success'] == true && result['donor'] != null) {
          setState(() {
            _donorProfile = result['donor'];
            _isLoadingProfile = false;
          });
        } else {
          // If unauthorized (token expired/invalid), clear login state
          if (result['unauthorized'] == true) {
            setState(() {
              _isLoggedIn = false;
              _donorProfile = null;
              _isLoadingProfile = false;
            });
          } else {
            setState(() {
              _donorProfile = null;
              _isLoadingProfile = false;
            });
          }
        }
      }
    }
  }

  void _promptRegistration() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        icon:
            const Icon(Icons.lock_outline, color: Color(0xFFB71C1C), size: 48),
        title: const Text('Registration Required'),
        content: const Text(
          'You need to register as a blood donor to access this feature and view your information.',
          textAlign: TextAlign.center,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context); // close dialog
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const RegisterScreen()),
              ).then((_) => _checkStatusAndLoadData());
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFB71C1C),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: const Text('Register Now',
                style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _navigateToFeature(Widget screen) {
    if (!_isLoggedIn) {
      _promptRegistration();
    } else {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => screen),
      ).then((_) => _checkStatusAndLoadData());
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
        title: Row(
          children: const [
            Icon(Icons.bloodtype, color: Colors.white, size: 28),
            SizedBox(width: 8),
            Text(
              'Donor Portal',
              style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 22,
                  color: Colors.white),
            ),
          ],
        ),
        actions: [
          PopupMenuButton<AppLanguage>(
            icon: const Icon(Icons.language, color: Colors.white),
            onSelected: (AppLanguage language) {
              Provider.of<LanguageProvider>(context, listen: false)
                  .setLanguage(language);
            },
            itemBuilder: (BuildContext context) =>
                <PopupMenuEntry<AppLanguage>>[
              for (var lang in AppLanguage.values)
                PopupMenuItem<AppLanguage>(
                  value: lang,
                  child: Row(
                    children: [
                      Text(lang.flag),
                      const SizedBox(width: 8),
                      Text(lang.displayName,
                          style: const TextStyle(fontWeight: FontWeight.w500)),
                    ],
                  ),
                ),
            ],
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _checkStatusAndLoadData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // ─── GREETING HEADER ───
              Container(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                decoration: BoxDecoration(
                  color: themeColor,
                  borderRadius: const BorderRadius.only(
                    bottomLeft: Radius.circular(24),
                    bottomRight: Radius.circular(24),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (_isLoadingProfile)
                      const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation(Colors.white)),
                      )
                    else if (_isLoggedIn && _donorProfile != null)
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Hello, ${_donorProfile!.name}!',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  'Blood Type: ${_donorProfile!.bloodType ?? 'Pending'}',
                                  style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: _donorProfile!.status == 'approved'
                                      ? Colors.green.shade700
                                      : Colors.amber.shade700,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  _donorProfile!.status == 'approved'
                                      ? 'Approved'
                                      : 'Pending Approval',
                                  style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600),
                                ),
                              ),
                            ],
                          ),
                        ],
                      )
                    else
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text(
                            'Welcome to Blood Portal!',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(height: 6),
                          Text(
                            'Save lives by donating blood today.',
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // ─── ANNOUNCEMENTS / NEWS SLIDER (TOP SIDE) ───
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 20),
                child: Text(
                  'Announcements & News',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
              ),
              const SizedBox(height: 10),
              _buildNewsSlider(),

              const SizedBox(height: 24),

              // ─── CORE 4 BUTTONS GRID ───
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 20),
                child: Text(
                  'Donor Services',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  childAspectRatio: 1.15,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  children: [
                    _buildFeatureCard(
                      icon: Icons.person_outline,
                      title: 'My Profile',
                      description: 'View & Edit Profile',
                      color: Colors.blue.shade700,
                      onTap: () => _navigateToFeature(const ProfileScreen()),
                    ),
                    _buildFeatureCard(
                      icon: Icons.emergency_outlined,
                      title: 'Emergency Alert',
                      description: 'Urgent requests',
                      color: Colors.red.shade700,
                      onTap: () => _navigateToFeature(const EmergencyScreen()),
                    ),
                    _buildFeatureCard(
                      icon: Icons.history,
                      title: 'Donation History',
                      description: 'Your contributions',
                      color: Colors.teal.shade700,
                      onTap: () => _navigateToFeature(const HistoryScreen()),
                    ),
                    _buildFeatureCard(
                      icon: Icons.card_membership_outlined,
                      title: 'Appreciation',
                      description: 'Thank-you letters',
                      color: Colors.purple.shade700,
                      onTap: () =>
                          _navigateToFeature(const AppreciationScreen()),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 32),

              // ─── DYNAMIC ACTION BUTTON ───
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: _isLoggedIn
                          ? [Colors.green.shade700, Colors.green.shade900]
                          : [themeColor, const Color(0xFFE53935)],
                    ),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: (_isLoggedIn ? Colors.green : themeColor)
                            .withOpacity(0.35),
                        blurRadius: 12,
                        offset: const Offset(0, 6),
                      )
                    ],
                  ),
                  child: ElevatedButton.icon(
                    onPressed: () {
                      if (_isLoggedIn) {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => const ProfileScreen()),
                        );
                      } else {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => const RegisterScreen()),
                        ).then((_) => _checkStatusAndLoadData());
                      }
                    },
                    icon: Icon(
                      _isLoggedIn ? Icons.person : Icons.person_add,
                      color: Colors.white,
                    ),
                    label: Text(
                      _isLoggedIn
                          ? 'View My Profile'
                          : 'Register as Blood Donor',
                      style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNewsSlider() {
    if (_isLoadingNews) {
      return const SizedBox(
        height: 160,
        child: Center(
          child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation(Color(0xFFB71C1C))),
        ),
      );
    }

    if (_newsList.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Container(
          height: 140,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.announcement_outlined,
                    color: Colors.grey.shade400, size: 40),
                const SizedBox(height: 8),
                const Text(
                  'No announcements at this time.',
                  style: TextStyle(
                      color: Colors.black54, fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return SizedBox(
      height: 170,
      child: PageView.builder(
        controller: PageController(viewportFraction: 0.9),
        itemCount: _newsList.length,
        itemBuilder: (context, index) {
          final news = _newsList[index];
          return Padding(
            padding: const EdgeInsets.only(right: 12),
            child: Card(
              elevation: 3,
              shadowColor: Colors.black26,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16)),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.bottomRight,
                      end: Alignment.topLeft,
                      colors: [
                        Colors.black.withOpacity(0.85),
                        Colors.black.withOpacity(0.4),
                      ],
                    ),
                  ),
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      // Banner Background Image (If exists)
                      if (news.imageUrl != null && news.imageUrl!.isNotEmpty)
                        Opacity(
                          opacity: 0.45,
                          child: Image.network(
                            news.imageUrl!,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Container(color: Colors.grey.shade300);
                            },
                          ),
                        ),
                      // Content Overlay
                      Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            Text(
                              news.title,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              news.content,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.85),
                                fontSize: 12,
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
          );
        },
      ),
    );
  }

  Widget _buildFeatureCard({
    required IconData icon,
    required String title,
    required String description,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 2,
      shadowColor: Colors.black12,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.12),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  icon,
                  color: color,
                  size: 28,
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    description,
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.grey.shade600,
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
}
