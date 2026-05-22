import 'package:flutter/material.dart';
import '../../../app/theme.dart';
import 'dashboard_screen.dart';
import 'map_screen.dart';
import 'profile_screen.dart';
import 'notification_screen.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 4,
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
                title: Text(
                  'BloodApp',
                  style: TextStyle(
                    color: AppColors.primary,
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -1.0,
                  ),
                ),
                actions: [
                  IconButton(
                    icon: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: const BoxDecoration(
                        color: AppColors.bgSubtle,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.search, color: Colors.black87, size: 22),
                    ),
                    onPressed: () {},
                  ),
                  IconButton(
                    icon: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: const BoxDecoration(
                        color: AppColors.bgSubtle,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.chat_bubble_rounded, color: Colors.black87, size: 22),
                    ),
                    onPressed: () {},
                  ),
                  const SizedBox(width: 8),
                ],
                bottom: const TabBar(
                  indicatorColor: AppColors.primary,
                  indicatorWeight: 3,
                  labelColor: AppColors.primary,
                  unselectedLabelColor: AppColors.textSecondary,
                  tabs: [
                    Tab(icon: Icon(Icons.home_rounded, size: 28)),
                    Tab(icon: Icon(Icons.location_on_rounded, size: 28)),
                    Tab(icon: Icon(Icons.notifications_rounded, size: 28)),
                    Tab(icon: Icon(Icons.menu_rounded, size: 28)), // Menu icon like Facebook
                  ],
                ),
              ),
            ];
          },
          body: const TabBarView(
            children: [
              DashboardScreen(),
              MapScreen(),
              NotificationScreen(),
              ProfileScreen(),
            ],
          ),
        ),
      ),
    );
  }
}
