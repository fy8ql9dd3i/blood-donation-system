import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/notification_service.dart';
import '../services/storage_service.dart';
import '../models/notification_model.dart';

class AppreciationScreen extends StatefulWidget {
  const AppreciationScreen({Key? key}) : super(key: key);

  @override
  State<AppreciationScreen> createState() => _AppreciationScreenState();
}

class _AppreciationScreenState extends State<AppreciationScreen> {
  List<NotificationModel> _letters = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initializeSocketListener();
    _loadAppreciationLetters();
  }

  Future<void> _initializeSocketListener() async {
    try {
      final donorId = StorageService.getDonorId();
      if (donorId != null) {
        await NotificationService.initializeSocket(donorId);
        NotificationService.onNewNotification((notification) {
          if (_matchesAppreciationNotification(notification)) {
            if (mounted) {
              setState(() {
                final exists = _letters.any((n) => n.id == notification.id);
                if (!exists) {
                  _letters.insert(0, notification);
                }
              });
            }
          }
        });
      }
    } catch (e) {
      print('[Appreciation Screen] Socket initialization error: $e');
    }
  }

  bool _matchesAppreciationNotification(NotificationModel notification) {
    final title = notification.title.toLowerCase();
    final msg = notification.message.toLowerCase();
    final isGeneral = notification.type == 'GENERAL';

    final hasAppreciationKeyword = title.contains('thank') ||
        title.contains('commendation') ||
        title.contains('appreciation') ||
        title.contains('hero') ||
        title.contains('lifesaver') ||
        title.contains('💝') ||
        title.contains('🎖️') ||
        title.contains('🙏') ||
        title.contains('❤️') ||
        title.contains('⭐') ||
        title.contains('አመሰግናለሁ') ||
        title.contains('ምስጋና') ||
        title.contains('ጀግና') ||
        title.contains('galatoomi') ||
        title.contains('galata') ||
        title.contains('goota') ||
        msg.contains('thank') ||
        msg.contains('commendation') ||
        msg.contains('appreciation') ||
        msg.contains('hero') ||
        msg.contains('lifesaver') ||
        msg.contains('💝') ||
        msg.contains('🎖️') ||
        msg.contains('🙏') ||
        msg.contains('❤️') ||
        msg.contains('⭐') ||
        msg.contains('አመሰግናለሁ') ||
        msg.contains('ምስጋና') ||
        msg.contains('ጀግና') ||
        msg.contains('galatoomi') ||
        msg.contains('galata') ||
        msg.contains('goota');

    final isSystemOrStatusMsg = title.contains('welcome') ||
        title.contains('approved') ||
        title.contains('rejected') ||
        title.contains('account') ||
        msg.contains('pending approval') ||
        msg.contains('registering') ||
        msg.contains('registration') ||
        msg.contains('eligible to donate') ||
        msg.contains('eligibility');

    return isGeneral && hasAppreciationKeyword && !isSystemOrStatusMsg;
  }

  Future<void> _loadAppreciationLetters() async {
    setState(() => _isLoading = true);
    final list = await NotificationService.getNotifications();

    // Filter to only include appreciation notifications
    final filtered = list.where(_matchesAppreciationNotification).toList();

    if (mounted) {
      setState(() {
        _letters = filtered;
        _isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    NotificationService.disconnect();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final themeColor = const Color(0xFFB71C1C);

    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      appBar: AppBar(
        backgroundColor: themeColor,
        elevation: 0,
        title: const Text('Appreciation Letters',
            style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _loadAppreciationLetters,
        child: _isLoading
            ? const Center(
                child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation(Color(0xFFB71C1C))))
            : _letters.isEmpty
                ? _buildEmptyState()
                : ListView.builder(
                    padding: const EdgeInsets.all(20),
                    itemCount: _letters.length,
                    itemBuilder: (context, index) {
                      final item = _letters[index];
                      return _buildLetterCard(item, themeColor);
                    },
                  ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      children: [
        SizedBox(height: MediaQuery.of(context).size.height * 0.25),
        Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.card_membership_outlined,
                  size: 72, color: Colors.grey.shade400),
              const SizedBox(height: 16),
              const Text(
                'No Letters Received Yet',
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87),
              ),
              const SizedBox(height: 6),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 32.0),
                child: Text(
                  'When the blood bank staff sends you appreciation or commendation letters, they will be beautifully listed here.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.black54),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildLetterCard(NotificationModel item, Color themeColor) {
    final DateFormat formatter = DateFormat('MMMM dd, yyyy');

    return Card(
      elevation: 4,
      shadowColor: Colors.black26,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      margin: const EdgeInsets.only(bottom: 20),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.white,
              themeColor.withOpacity(0.02),
            ],
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.amber.shade100.withOpacity(0.5),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.star,
                      color: Colors.amber,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.title,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          formatter.format(item.createdAt),
                          style: const TextStyle(
                              fontSize: 11, color: Colors.black45),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Divider(height: 1),
              const SizedBox(height: 16),
              Text(
                item.message,
                style: TextStyle(
                  fontSize: 14.5,
                  color: Colors.grey.shade800,
                  height: 1.5,
                  fontStyle: FontStyle.italic,
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(
                    '— Blood Bank Administration Team',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: themeColor.withOpacity(0.8),
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
