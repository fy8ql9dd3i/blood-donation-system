import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../data/repositories/auth_repository.dart';
import '../../../data/repositories/donor_repository.dart';
import '../../../data/models/donor_model.dart';
import '../../../widgets/loading_widget.dart';
import '../widgets/donor_card.dart';

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await context.read<AuthRepository>().logout();
              if (!mounted) return;
              Navigator.pushReplacementNamed(context, '/login');
            },
          ),
        ],
      ),
      body: FutureBuilder<DonorModel>(
        future: _profileFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const LoadingWidget();
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else if (!snapshot.hasData) {
            return const Center(child: Text('No data'));
          }
          final donor = snapshot.data!;
          return RefreshIndicator(
            onRefresh: () async {
              setState(() {
                _profileFuture = context.read<DonorRepository>().getProfile();
              });
            },
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                DonorCard(donor: donor),
                const SizedBox(height: 20),
                _buildActionButton(
                  icon: Icons.history,
                  label: 'Donation History',
                  onTap: () => Navigator.pushNamed(context, '/history'),
                ),
                const SizedBox(height: 12),
                _buildActionButton(
                  icon: Icons.map,
                  label: 'Map',
                  onTap: () => Navigator.pushNamed(context, '/map'),
                ),
                const SizedBox(height: 12),
                _buildActionButton(
                  icon: Icons.notifications,
                  label: 'Notifications',
                  onTap: () => Navigator.pushNamed(context, '/notifications'),
                ),
                const SizedBox(height: 12),
                _buildActionButton(
                  icon: Icons.settings,
                  label: 'Settings',
                  onTap: () => Navigator.pushNamed(context, '/language'),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: Colors.red.shade100,
        child: Icon(icon, color: Colors.red),
      ),
      title: Text(label),
      trailing: const Icon(Icons.arrow_forward_ios, size: 16),
      onTap: onTap,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      tileColor: Colors.grey.shade50,
    );
  }
}
