import 'package:flutter/material.dart';
import '../../../app/theme.dart';
import 'dashboard_screen.dart';
import 'notification_screen.dart';
import 'profile_screen.dart';

/// MainScreen is shown AFTER a donor successfully registers.
/// It shows only the donor's relevant screens — no public-facing home or map.
class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        backgroundColor: AppColors.bg,
        body: NestedScrollView(
          headerSliverBuilder: (context, innerBoxIsScrolled) {
            return [
              SliverAppBar(
                backgroundColor: Colors.white,
                pinned: true,
                floating: true,
                elevation: 1,
                forceElevated: innerBoxIsScrolled,
                shadowColor: Colors.black12,
                automaticallyImplyLeading: false, // No back arrow
                // ── Title removed as requested ──────────────────────────────
                title: null,
                actions: [
                  Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.08),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            children: [
                              Icon(Icons.favorite_rounded, color: AppColors.primary, size: 16),
                              const SizedBox(width: 6),
                              Text(
                                'Donor Portal',
                                style: TextStyle(
                                  color: AppColors.primary,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
                bottom: TabBar(
                  indicatorColor: AppColors.primary,
                  indicatorWeight: 3,
                  labelColor: AppColors.primary,
                  unselectedLabelColor: AppColors.textSecondary,
                  tabs: const [
                    Tab(
                      icon: Icon(Icons.dashboard_rounded, size: 26),
                      text: 'Dashboard',
                    ),
                    Tab(
                      icon: Icon(Icons.notifications_rounded, size: 26),
                      text: 'Alerts',
                    ),
                    Tab(
                      icon: Icon(Icons.person_rounded, size: 26),
                      text: 'Profile',
                    ),
                  ],
                ),
              ),
            ];
          },
          body: const TabBarView(
            children: [
              DashboardScreen(),
              NotificationScreen(),
              ProfileScreen(),
            ],
          ),
        ),
      ),
    );
  }
}
