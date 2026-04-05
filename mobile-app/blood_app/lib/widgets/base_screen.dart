import 'package:flutter/material.dart';

/// Base screen widget that provides a consistent layout and styling
/// for all screens in the app. It includes a scaffold with optional
/// app bar, drawer, and bottom navigation.
class BaseScreen extends StatelessWidget {
  final String? title;
  final Widget body;
  final List<Widget>? actions;
  final Widget? floatingActionButton;
  final Widget? bottomNavigationBar;
  final Widget? drawer;
  final bool showAppBar;
  final bool centerTitle;
  final PreferredSizeWidget? appBar;

  const BaseScreen({
    super.key,
    this.title,
    required this.body,
    this.actions,
    this.floatingActionButton,
    this.bottomNavigationBar,
    this.drawer,
    this.showAppBar = true,
    this.centerTitle = true,
    this.appBar,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: showAppBar
          ? appBar ??
              AppBar(
                title: title != null ? Text(title!) : null,
                centerTitle: centerTitle,
                actions: actions,
              )
          : null,
      drawer: drawer,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: body,
        ),
      ),
      floatingActionButton: floatingActionButton,
      bottomNavigationBar: bottomNavigationBar,
    );
  }
}