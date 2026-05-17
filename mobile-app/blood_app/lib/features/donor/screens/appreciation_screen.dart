import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../data/notification_repository.dart';
import '../../../core/models/notification_model.dart';
import '../../../shared/widgets/loading_widget.dart';

class AppreciationScreen extends StatefulWidget {
  const AppreciationScreen({super.key});

  @override
  State<AppreciationScreen> createState() => _AppreciationScreenState();
}

class _AppreciationScreenState extends State<AppreciationScreen> {
  late Future<List<NotificationModel>> _future;

  @override
  void initState() {
    super.initState();
    _future = context.read<NotificationRepository>().getNotifications();
  }

  void _refresh() {
    setState(() {
      _future = context.read<NotificationRepository>().getNotifications();
    });
  }

  String _formatDate(DateTime date) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFDF2F8), // Light pink background
      appBar: AppBar(
        backgroundColor: Colors.pink.shade600,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        title: const Text('My Appreciations 💝', style: TextStyle(fontWeight: FontWeight.w900, color: Colors.white)),
      ),
      body: FutureBuilder<List<NotificationModel>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const LoadingWidget();
          }

          if (snapshot.hasError) {
            return Center(
              child: ElevatedButton(
                onPressed: _refresh,
                child: const Text('Retry'),
              ),
            );
          }

          final all = snapshot.data ?? [];
          
          // Filter only appreciation messages
          final appreciations = all.where((n) {
            final t = (n.title ?? '').toLowerCase();
            return t.contains('hero') || t.contains('commendation') || t.contains('thank');
          }).toList();

          if (appreciations.isEmpty) {
            return RefreshIndicator(
              onRefresh: () async => _refresh(),
              color: Colors.pink,
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  const SizedBox(height: 100),
                  Center(
                    child: Column(
                      children: [
                        const Text('📭', style: TextStyle(fontSize: 80)),
                        const SizedBox(height: 16),
                        const Text('No Letters Yet', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.pink)),
                        const SizedBox(height: 8),
                        Text('Donate blood and wait for hospital feedback!', style: TextStyle(color: Colors.pink.shade300)),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async => _refresh(),
            color: Colors.pink,
            child: ListView.builder(
              padding: const EdgeInsets.all(20),
              itemCount: appreciations.length,
              itemBuilder: (context, index) => _buildCard(appreciations[index]),
            ),
          );
        },
      ),
    );
  }

  Widget _buildCard(NotificationModel n) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.pink.withOpacity(0.1),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [Colors.pink.shade400, Colors.pink.shade600]),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: Row(
              children: [
                const Text('🎖️', style: TextStyle(fontSize: 32)),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        n.title ?? 'Hero Commendation',
                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Colors.white),
                      ),
                      Text(
                        _formatDate(n.createdAt),
                        style: TextStyle(color: Colors.pink.shade100, fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(24),
            child: Text(
              n.message ?? '',
              style: TextStyle(fontSize: 15, color: Colors.grey.shade800, height: 1.6, fontStyle: FontStyle.italic),
            ),
          ),
        ],
      ),
    );
  }
}
