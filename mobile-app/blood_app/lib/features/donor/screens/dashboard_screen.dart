import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:provider/provider.dart';
import 'dart:io';
import '../data/donor_repository.dart';
import '../../../core/models/donor_model.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../widgets/donor_card.dart';
import '../../../shared/widgets/about_donation_widget.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  late Future<DonorModel> _profileFuture;

  @override
  void initState() {
    super.initState();
    _profileFuture = context.read<DonorRepository>().getProfile();
  }

  void _refreshProfile() {
    setState(() {
      _profileFuture = context.read<DonorRepository>().getProfile();
    });
  }

  String _getErrorMessage(dynamic error) {
    if (error is String) {
      return error;
    } else if (error is SocketException) {
      return 'network_error'.tr();
    } else if (error is HttpException) {
      return 'server_error'.tr();
    } else {
      return '${'error_occurred'.tr()}\n($error)';
    }
  }

  void _showLanguageSelector(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'select_language'.tr(),
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 10),
              _buildLanguageOption(context, 'en', 'English'),
              _buildLanguageOption(context, 'am', 'አማርኛ'),
              _buildLanguageOption(context, 'or', 'Afaan Oromoo'),
            ],
          ),
        );
      },
    );
  }

  Widget _buildLanguageOption(BuildContext context, String code, String label) {
    final bool isSelected = context.locale.languageCode == code;
    return ListSelectionItem(
      title: label,
      isSelected: isSelected,
      onTap: () {
        context.setLocale(Locale(code));
        Navigator.pop(context);
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: Text(
          'dashboard'.tr(),
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.language_rounded),
            onPressed: () => _showLanguageSelector(context),
            tooltip: 'language'.tr(),
          ),
          const SizedBox(width: 8),
        ],
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
      ),
      body: FutureBuilder<DonorModel>(
        future: _profileFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const LoadingWidget();
          } else if (snapshot.hasError) {
            return _buildErrorState(snapshot.error);
          } else if (!snapshot.hasData) {
            return Center(child: Text('no_data'.tr()));
          }

          final donor = snapshot.data!;
          return RefreshIndicator(
            onRefresh: () async => _refreshProfile(),
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                _buildWelcomeHeader(donor),
                const SizedBox(height: 24),
                DonorCard(donor: donor),
                const SizedBox(height: 32),
                const SizedBox(height: 32),
                AboutDonationWidget(),
                const SizedBox(height: 32),
                Text(
                  'services'.tr(),
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                _buildActionList(context),
                const SizedBox(height: 40),
                _buildSocialMediaSection(context),
                const SizedBox(height: 40),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildSocialMediaSection(BuildContext context) {
    return Column(
      children: [
        const Text(
          'Connect with us',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Colors.black54,
            letterSpacing: 1.2,
          ),
        ),
        const SizedBox(height: 20),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _buildSocialIcon(
              icon: Icons.facebook_rounded,
              color: const Color(0xFF1877F2),
              onTap: () => _launchURL('https://facebook.com'),
            ),
            const SizedBox(width: 25),
            _buildSocialIcon(
              icon: Icons.camera_alt_rounded,
              color: const Color(0xFFE4405F),
              onTap: () => _launchURL('https://instagram.com'),
            ),
            const SizedBox(width: 25),
            _buildSocialIcon(
              icon: Icons.telegram_rounded,
              color: const Color(0xFF229ED9),
              onTap: () => _launchURL('https://t.me/blood_donation'),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSocialIcon({required IconData icon, required Color color, required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(15),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(15),
        ),
        child: Icon(icon, color: color, size: 30),
      ),
    );
  }

  Future<void> _launchURL(String urlString) async {
    try {
      final launched = await context.read<DonorRepository>().openExternalUrl(urlString);
      if (!launched) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Could not open social media link')),
          );
        }
      }
    } catch (e) {
      debugPrint('Error launching URL: $e');
    }
  }

  Widget _buildWelcomeHeader(DonorModel donor) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.red.shade700, Colors.redAccent.shade200],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.red.withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.volunteer_activism, color: Colors.white, size: 32),
              const SizedBox(width: 12),
              Text(
                '${'hello'.tr()},',
                style: const TextStyle(
                  fontSize: 20,
                  color: Colors.white70,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            donor.name,
            style: const TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: Colors.white,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.15),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                const Icon(Icons.favorite_rounded, color: Colors.white, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'gratitude_message'.tr(),
                    style: const TextStyle(
                      fontSize: 14,
                      color: Colors.white,
                      height: 1.3,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionList(BuildContext context) {
    return Column(
      children: [
        _buildActionTile(
          context,
          icon: Icons.history_rounded,
          title: 'Donation History',
          subtitle: 'View your past donations',
          color: Colors.blueAccent,
          route: '/history',
        ),
        const SizedBox(height: 16),
        _buildActionTile(
          context,
          icon: Icons.location_on_rounded,
          title: 'Find Hospitals Map',
          subtitle: 'Locate nearby donation centers',
          color: Colors.teal,
          route: '/map',
        ),
        const SizedBox(height: 16),
        _buildActionTile(
          context,
          icon: Icons.notifications_active_rounded,
          title: 'Notifications',
          subtitle: 'Alerts and blood requests',
          color: Colors.orangeAccent,
          route: '/notifications',
        ),
        const SizedBox(height: 16),
        _buildActionTile(
          context,
          icon: Icons.person_outline_rounded,
          title: 'My Profile',
          subtitle: 'Manage your account details',
          color: Colors.purpleAccent,
          route: '/profile',
        ),
      ],
    );
  }

  Widget _buildActionTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required String route,
  }) {
    return InkWell(
      onTap: () => Navigator.pushNamed(context, route),
      borderRadius: BorderRadius.circular(20),
      splashColor: color.withOpacity(0.1),
      highlightColor: color.withOpacity(0.05),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.grey.shade100, width: 2),
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [color.withOpacity(0.2), color.withOpacity(0.05)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 28),
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.black54,
                    ),
                  ),
                ],
              ),
            ),
            Icon(Icons.chevron_right_rounded, color: Colors.grey.shade300, size: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState(dynamic error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline_rounded, size: 64, color: Colors.red),
            const SizedBox(height: 20),
            Text(
              _getErrorMessage(error),
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _refreshProfile,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: Text('retry'.tr()),
            ),
          ],
        ),
      ),
    );
  }
}

class ListSelectionItem extends StatelessWidget {
  final String title;
  final bool isSelected;
  final VoidCallback onTap;

  const ListSelectionItem({
    super.key,
    required this.title,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(
        title,
        style: TextStyle(
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          color: isSelected ? Theme.of(context).primaryColor : Colors.black87,
        ),
      ),
      trailing: isSelected
          ? Icon(Icons.check_circle, color: Theme.of(context).primaryColor)
          : null,
      onTap: onTap,
    );
  }
}
