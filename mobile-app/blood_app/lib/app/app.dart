import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/network/api_client.dart';
import 'theme.dart';
import '../data/repositories/auth_repository.dart'; // <-- add this line// <-- add
import '../data/repositories/donor_repository.dart';
import '../data/repositories/notification_repository.dart';
import '../data/services/auth_service.dart';
import '../data/services/donor_service.dart';
import '../data/services/notification_service.dart';
import 'routes.dart';

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<ApiClient>(create: (_) => ApiClient()),
        Provider<AuthService>(
          create: (context) => AuthService(context.read<ApiClient>()),
        ),
        Provider<DonorService>(
          create: (context) => DonorService(context.read<ApiClient>()),
        ),
        Provider<NotificationService>(
          create: (context) => NotificationService(context.read<ApiClient>()),
        ),
        Provider<AuthRepository>(
          create: (context) =>
              AuthRepository(authService: context.read<AuthService>()),
        ),
        Provider<DonorRepository>(
          create: (context) =>
              DonorRepository(donorService: context.read<DonorService>()),
        ),
        Provider<NotificationRepository>(
          create: (context) => NotificationRepository(
            notificationService: context.read<NotificationService>(),
          ),
        ),
      ],
      child: MaterialApp(
        title: 'Donor Management',
        theme: AppTheme.lightTheme,
        localizationsDelegates: context.localizationDelegates,
        supportedLocales: context.supportedLocales,
        locale: context.locale,
        initialRoute: Routes.login,
        onGenerateRoute: Routes.generateRoute,
      ),
    );
  }
}
