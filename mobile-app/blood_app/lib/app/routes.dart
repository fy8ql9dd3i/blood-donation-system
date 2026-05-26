import 'package:flutter/material.dart';
import '../features/auth/screens/register_screen.dart';
import '../features/auth/screens/home_screen.dart';
import '../features/donor/screens/dashboard_screen.dart';
import '../features/donor/screens/history_screen.dart';
import '../features/donor/screens/map_screen.dart';
import '../features/donor/screens/notification_screen.dart';
import '../features/donor/screens/profile_screen.dart';
import '../features/donor/screens/news_screen.dart';
import '../features/donor/screens/appreciation_screen.dart';
import '../features/donor/screens/about_screen.dart';
import '../features/settings/language_screen.dart';

import '../features/donor/screens/main_screen.dart';

class Routes {
  static const String home = '/';
  static const String register = '/register';
  static const String dashboard = '/dashboard';
  static const String profile = '/profile';
  static const String history = '/history';
  static const String map = '/map';
  static const String notifications = '/notifications';
  static const String emergency = '/emergency';
  static const String news = '/news';
  static const String appreciation = '/appreciation';
  static const String about = '/about';
  static const String language = '/language';


  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case home:
        return MaterialPageRoute(builder: (_) => const HomeScreen());
      case register:
        return MaterialPageRoute(builder: (_) => const RegisterScreen());
      case dashboard:
        return MaterialPageRoute(builder: (_) => const MainScreen());
      case profile:
        return MaterialPageRoute(builder: (_) => const ProfileScreen());
      case history:
        return MaterialPageRoute(builder: (_) => const HistoryScreen());
      case map:
        return MaterialPageRoute(builder: (_) => const MapScreen());
      case notifications:
        return MaterialPageRoute(builder: (_) => const NotificationScreen());
      case emergency:
        return MaterialPageRoute(builder: (_) => const NotificationScreen(filterEmergency: true));
      case news:
        return MaterialPageRoute(builder: (_) => const NewsScreen());
      case appreciation:
        return MaterialPageRoute(builder: (_) => const AppreciationScreen());
      case about:
        return MaterialPageRoute(builder: (_) => const AboutScreen());
      case language:
        return MaterialPageRoute(builder: (_) => const LanguageScreen());

      default:
        return MaterialPageRoute(builder: (_) => const RegisterScreen());
    }
  }
}
