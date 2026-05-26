import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../app/theme.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  Map<String, String> _getLocalizedContent(String langCode) {
    if (langCode == 'am') {
      return {
        'title': 'ስለ ደም ባንክ',
        'mission': 'ተልዕኮአችን',
        'mission_text': 'ትክክለኛውን ደም ለሚፈልጉ ታካሚዎች በወቅቱ ማድረስ እና ህይወትን ማዳን።',
        'why': 'ለምን ደም እንለግሳለን?',
        'why_text': 'ደም መለገስ የሰውን ህይወት ያድናል። አንድ ጊዜ ደም በመለገስ እስከ 3 ሰዎችን ህይወት ማትረፍ ይቻላል። እርስዎ የሚሰጡት ደም ለወሊድ እናቶች፣ ለአደጋ ተጎጂዎች እና ለካንሰር ህሙማን እጅግ አስፈላጊ ነው።',
        'contact': 'ያግኙን',
        'contact_text': 'ስልክ: +251 911 123 456\nኢሜይል: info@bahirdarbloodbank.com',
      };
    } else if (langCode == 'or') {
      return {
        'title': 'Waa\'ee Baankii Dhiigaa',
        'mission': 'Ergama Keenya',
        'mission_text': 'Dhiiga qulqulluu fi nagaa qabu yeroon dhukkubsattootaaf dhiyeessuu fi lubbuu baraaruu.',
        'why': 'Maaliif Dhiiga Arjoomna?',
        'why_text': 'Dhiiga arjoomuun lubbuu namaa baraara. Yeroo tokko dhiiga arjoomuun lubbuu namoota 3 oolchuu dandeenya. Dhiigni isin arjoomtan haadholii deeman, namoota balaa tiraafikaa irra ga\'an fi dhukkubsattoota kaansariif baay\'ee barbaachisaadha.',
        'contact': 'Nu Quunnamaa',
        'contact_text': 'Bilbila: +251 911 123 456\nImeelii: info@bahirdarbloodbank.com',
      };
    } else {
      return {
        'title': 'About Blood Bank',
        'mission': 'Our Mission',
        'mission_text': 'To provide safe, adequate, and timely blood supply to patients in need and save lives.',
        'why': 'Why Donate Blood?',
        'why_text': 'Donating blood saves lives. A single donation can save up to 3 lives. Your blood is crucial for mothers during childbirth, accident victims, and patients undergoing surgeries or cancer treatments.',
        'contact': 'Contact Us',
        'contact_text': 'Phone: +251 911 123 456\nEmail: info@bahirdarbloodbank.com',
      };
    }
  }

  @override
  Widget build(BuildContext context) {
    final langCode = context.locale.languageCode;
    final content = _getLocalizedContent(langCode);

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.black87),
        title: Text(
          content['title']!,
          style: const TextStyle(
            color: Colors.black87,
            fontWeight: FontWeight.w900,
            fontSize: 18,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Image/Icon
            Center(
              child: Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF8B0000), Color(0xFFC0152B)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withOpacity(0.3),
                      blurRadius: 15,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: const Icon(Icons.favorite_rounded, color: Colors.white, size: 50),
              ),
            ),
            const SizedBox(height: 30),

            // Mission Section
            _buildSection(
              icon: Icons.flag_rounded,
              title: content['mission']!,
              body: content['mission_text']!,
            ),
            const SizedBox(height: 24),

            // Why Donate Section
            _buildSection(
              icon: Icons.health_and_safety_rounded,
              title: content['why']!,
              body: content['why_text']!,
            ),
            const SizedBox(height: 24),

            // Contact Section
            _buildSection(
              icon: Icons.contact_support_rounded,
              title: content['contact']!,
              body: content['contact_text']!,
            ),
            
            const SizedBox(height: 40),
            Center(
              child: Text(
                'Bahir Dar Blood Bank © ${DateTime.now().year}',
                style: TextStyle(
                  color: Colors.grey.shade500,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSection({required IconData icon, required String title, required String body}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFFFE5E5), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: AppColors.primary, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            body,
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }
}
