import 'package:flutter/material.dart';
import '../services/storage_service.dart';

/// Supported language codes
enum AppLanguage {
  en, // English
  am, // Amharic (አማርኛ)
  om, // Oromo (Afaan Oromoo)
}

/// Extension to get display name and native name
extension AppLanguageExt on AppLanguage {
  String get code {
    switch (this) {
      case AppLanguage.en: return 'en';
      case AppLanguage.am: return 'am';
      case AppLanguage.om: return 'om';
    }
  }

  String get displayName {
    switch (this) {
      case AppLanguage.en: return 'English';
      case AppLanguage.am: return 'አማርኛ';
      case AppLanguage.om: return 'Afaan Oromoo';
    }
  }

  String get flag {
    switch (this) {
      case AppLanguage.en: return '🇬🇧';
      case AppLanguage.am: return '🇪🇹';
      case AppLanguage.om: return '🇪🇹';
    }
  }

  static AppLanguage fromCode(String code) {
    switch (code) {
      case 'am': return AppLanguage.am;
      case 'om': return AppLanguage.om;
      default:   return AppLanguage.en;
    }
  }
}

/// ChangeNotifier-based language provider for reactive UI updates
class LanguageProvider extends ChangeNotifier {
  AppLanguage _currentLanguage = AppLanguage.en;

  AppLanguage get currentLanguage => _currentLanguage;

  LanguageProvider() {
    _loadSavedLanguage();
  }

  void _loadSavedLanguage() {
    final savedCode = StorageService.getLanguage();
    if (savedCode != null) {
      _currentLanguage = AppLanguageExt.fromCode(savedCode);
    }
  }

  Future<void> setLanguage(AppLanguage language) async {
    if (_currentLanguage == language) return;
    _currentLanguage = language;
    await StorageService.saveLanguage(language.code);
    notifyListeners();
  }
}

/// Static translation lookup – call S.of(context).key or S.get('key', lang)
class AppLocalizations {
  final AppLanguage locale;

  AppLocalizations(this.locale);

  String tr(String key) {
    return _localizedValues[locale.code]?[key] ?? _localizedValues['en']?[key] ?? key;
  }

  // ─── ALL TRANSLATIONS ────────────────────────────────────────
  static const Map<String, Map<String, String>> _localizedValues = {
    // ════════════════════════════════════════════════════════════
    // ENGLISH
    // ════════════════════════════════════════════════════════════
    'en': {
      // ── General ──
      'app_title': 'Donor Portal',
      'cancel': 'Cancel',
      'ok': 'OK',
      'retry': 'Retry',
      'save': 'Save',
      'loading': 'Loading...',
      'error': 'Error',
      'success': 'Success',
      'language': 'Language',
      'select_language': 'Select Language',

      // ── Home Screen ──
      'hello': 'Hello',
      'welcome': 'Welcome to Blood Portal!',
      'save_lives': 'Save lives by donating blood today.',
      'blood_type': 'Blood Type',
      'pending': 'Pending',
      'approved': 'Approved',
      'pending_approval': 'Pending Approval',
      'announcements_news': 'Announcements & News',
      'no_announcements': 'No announcements at this time.',
      'donor_services': 'Donor Services',
      'my_profile': 'My Profile',
      'view_edit_profile': 'View & Edit Profile',
      'emergency_alert': 'Emergency Alert',
      'urgent_requests': 'Urgent requests',
      'donation_history': 'Donation History',
      'your_contributions': 'Your contributions',
      'appreciation': 'Appreciation',
      'thank_you_letters': 'Thank-you letters',
      'register_donor': 'Register as Blood Donor',

      // ── Registration Required Dialog ──
      'registration_required': 'Registration Required',
      'registration_required_msg': 'You need to register as a blood donor to access this feature and view your information.',
      'register_now': 'Register Now',

      // ── Register Screen ──
      'donor_registration': 'Donor Registration',
      'join_donor': 'Join as a Blood Donor',
      'donation_saves': 'Your donation can save lives',
      'full_name': 'Full Name',
      'enter_full_name': 'Enter your full name',
      'phone_number': 'Phone Number',
      'phone_hint': 'e.g. 0912345678',
      'gender': 'Gender',
      'select_gender': 'Select your gender',
      'male': 'Male',
      'female': 'Female',
      'age': 'Age',
      'age_hint': 'Enter your age (18-65)',
      'address': 'Address',
      'enter_address': 'Enter your address',
      'register': 'Register',

      // ── Register Validation ──
      'name_required': 'Full name is required',
      'name_min': 'Name must be at least 3 characters',
      'phone_required': 'Phone number is required',
      'phone_invalid': 'Enter a valid phone number',
      'gender_required': 'Please select your gender',
      'age_required': 'Age is required',
      'age_range': 'Age must be between 18 and 65',
      'address_required': 'Address is required',

      // ── Register Dialogs ──
      'registration_successful': 'Registration Successful!',
      'registration_success_msg': 'You have been registered as a donor, and a Lab Test entry has been created for you.\n\nYour profile is pending approval by our medical team.',
      'welcome_back': 'Welcome Back!',
      'welcome_back_msg': ', we found your existing blood donor profile. You have been logged in automatically.',
      'phone_already_registered': 'This phone number is already registered under a different name.',
      'connection_error': 'Connection error. Please check your network and try again.',
      'login_failed': 'Login failed. Please try again.',
      'registration_failed': 'Registration failed',

      // ── Profile Screen ──
      'edit_profile': 'Edit Profile Info',
      'personal_details': 'Personal Details',
      'years_old': 'years old',
      'not_specified': 'Not specified',
      'total_donations': 'Total Donations',
      'times': 'times',
      'eligible': 'Eligible',
      'yes': 'YES',
      'no': 'NO',
      'status': 'Status',
      'save_details': 'Save Details',
      'log_out': 'Log Out Session',
      'confirm_logout': 'Confirm Logout',
      'logout_msg': 'Are you sure you want to log out of your donor session?',
      'logout': 'Logout',
      'profile_updated': 'Profile updated successfully!',
      'profile_update_failed': 'Failed to update profile',
      'profile_load_failed': 'Failed to load profile',
      'profile_error_msg': 'There was an error communicating with the server. Please verify your connection.',
      'profile_update_error': 'Error updating profile. Please try again.',
      'min_chars': 'Min 3 characters',
      'age_18_65': 'Age 18 - 65',

      // ── Emergency Screen ──
      'emergency_reminders': 'Emergency & Reminders',
      'no_alerts': 'No Alerts Found',
      'no_alerts_msg': 'You have no urgent emergency requests or eligibility reminders.',
      'reminder': 'Reminder',
      'decline': 'Decline',
      'accept': 'Accept',
      'accepted_msg': 'Thank you! Your acceptance has been recorded.',
      'declined_msg': 'You declined this request.',
      'response_failed': 'Failed to submit response. Retrying...',
      'response_accepted': 'Response: Accepted',
      'response_declined': 'Response: Declined',

      // ── History Screen ──
      'no_donations': 'No Donations Yet',
      'no_donations_msg': "You haven't made any donations yet. Your history will appear here once recorded.",
      'units_donated': 'Units Donated',
      'bags': 'Bag(s)',

      // ── Appreciation Screen ──
      'appreciation_letters': 'Appreciation Letters',
      'no_letters': 'No Letters Received Yet',
      'no_letters_msg': 'When the blood bank staff sends you appreciation or commendation letters, they will be beautifully listed here.',
      'admin_team': '— Blood Bank Administration Team',
    },

    // ════════════════════════════════════════════════════════════
    // AMHARIC (አማርኛ)
    // ════════════════════════════════════════════════════════════
    'am': {
      // ── General ──
      'app_title': 'ለጋሽ ፖርታል',
      'cancel': 'ሰርዝ',
      'ok': 'እሺ',
      'retry': 'እንደገና ሞክር',
      'save': 'አስቀምጥ',
      'loading': 'በመጫን ላይ...',
      'error': 'ስህተት',
      'success': 'ተሳክቷል',
      'language': 'ቋንቋ',
      'select_language': 'ቋንቋ ይምረጡ',

      // ── Home Screen ──
      'hello': 'ሰላም',
      'welcome': 'እንኳን ወደ ደም ባንክ በደህና መጡ!',
      'save_lives': 'ዛሬ ደም በመለገስ ህይወት ያድኑ።',
      'blood_type': 'የደም ዓይነት',
      'pending': 'በመጠበቅ ላይ',
      'approved': 'ፀድቋል',
      'pending_approval': 'ፀድቅ በመጠበቅ ላይ',
      'announcements_news': 'ማስታወቂያዎች እና ዜናዎች',
      'no_announcements': 'በአሁኑ ጊዜ ምንም ማስታወቂያ የለም።',
      'donor_services': 'የለጋሽ አገልግሎቶች',
      'my_profile': 'መገለጫዬ',
      'view_edit_profile': 'መገለጫ ይመልከቱ እና ያርትዑ',
      'emergency_alert': 'አስቸኳይ ማንቂያ',
      'urgent_requests': 'አስቸኳይ ጥያቄዎች',
      'donation_history': 'የልገሳ ታሪክ',
      'your_contributions': 'ያበረከቱት ድርሻ',
      'appreciation': 'ምስጋና',
      'thank_you_letters': 'የምስጋና ደብዳቤዎች',
      'register_donor': 'እንደ ደም ለጋሽ ይመዝገቡ',

      // ── Registration Required Dialog ──
      'registration_required': 'ምዝገባ ያስፈልጋል',
      'registration_required_msg': 'ይህንን ባህሪ ለመድረስ እና መረጃዎን ለማየት እንደ ደም ለጋሽ መመዝገብ ያስፈልግዎታል።',
      'register_now': 'አሁን ይመዝገቡ',

      // ── Register Screen ──
      'donor_registration': 'የለጋሽ ምዝገባ',
      'join_donor': 'እንደ ደም ለጋሽ ይቀላቀሉ',
      'donation_saves': 'የእርስዎ ልገሳ ህይወት ያድናል',
      'full_name': 'ሙሉ ስም',
      'enter_full_name': 'ሙሉ ስምዎን ያስገቡ',
      'phone_number': 'ስልክ ቁጥር',
      'phone_hint': 'ለምሳሌ 0912345678',
      'gender': 'ጾታ',
      'select_gender': 'ጾታዎን ይምረጡ',
      'male': 'ወንድ',
      'female': 'ሴት',
      'age': 'ዕድሜ',
      'age_hint': 'ዕድሜዎን ያስገቡ (18-65)',
      'address': 'አድራሻ',
      'enter_address': 'አድራሻዎን ያስገቡ',
      'register': 'ይመዝገቡ',

      // ── Register Validation ──
      'name_required': 'ሙሉ ስም ያስፈልጋል',
      'name_min': 'ስም ቢያንስ 3 ፊደሎች መሆን አለበት',
      'phone_required': 'ስልክ ቁጥር ያስፈልጋል',
      'phone_invalid': 'ትክክለኛ ስልክ ቁጥር ያስገቡ',
      'gender_required': 'እባክዎ ጾታዎን ይምረጡ',
      'age_required': 'ዕድሜ ያስፈልጋል',
      'age_range': 'ዕድሜ ከ18 እስከ 65 መሆን አለበት',
      'address_required': 'አድራሻ ያስፈልጋል',

      // ── Register Dialogs ──
      'registration_successful': 'ምዝገባ ተሳክቷል!',
      'registration_success_msg': 'እንደ ለጋሽ ተመዝግበዋል፣ እና የላብራቶሪ ምርመራ ግቤት ለእርስዎ ተፈጥሯል።\n\nመገለጫዎ በሕክምና ቡድናችን ፀድቅ በመጠበቅ ላይ ነው።',
      'welcome_back': 'እንኳን ተመልሰው መጡ!',
      'welcome_back_msg': '፣ ያለዎትን የደም ለጋሽ መገለጫ አግኝተናል። በራስ-ሰር ገብተዋል።',
      'phone_already_registered': 'ይህ ስልክ ቁጥር ቀድሞ በሌላ ስም ተመዝግቧል።',
      'connection_error': 'የግንኙነት ስህተት። እባክዎ ኔትወርክዎን ያረጋግጡ እና እንደገና ይሞክሩ።',
      'login_failed': 'መግባት አልተሳካም። እባክዎ እንደገና ይሞክሩ።',
      'registration_failed': 'ምዝገባ አልተሳካም',

      // ── Profile Screen ──
      'edit_profile': 'መገለጫ ማረም',
      'personal_details': 'የግል መረጃ',
      'years_old': 'ዓመት',
      'not_specified': 'አልተገለጸም',
      'total_donations': 'ጠቅላላ ልገሳዎች',
      'times': 'ጊዜ',
      'eligible': 'ብቁ',
      'yes': 'አዎ',
      'no': 'አይ',
      'status': 'ሁኔታ',
      'save_details': 'ዝርዝሮችን ያስቀምጡ',
      'log_out': 'ከመለያ ይውጡ',
      'confirm_logout': 'መውጣት ያረጋግጡ',
      'logout_msg': 'ከለጋሽ ክፍለ-ጊዜዎ መውጣት እንደሚፈልጉ እርግጠኛ ነዎት?',
      'logout': 'ውጣ',
      'profile_updated': 'መገለጫ በተሳካ ሁኔታ ተዘምኗል!',
      'profile_update_failed': 'መገለጫ ማዘመን አልተሳካም',
      'profile_load_failed': 'መገለጫ መጫን አልተሳካም',
      'profile_error_msg': 'ከሰርቨሩ ጋር በመገናኘት ላይ ስህተት ነበር። እባክዎ ግንኙነትዎን ያረጋግጡ።',
      'profile_update_error': 'መገለጫ ማዘመን ላይ ስህተት። እባክዎ እንደገና ይሞክሩ።',
      'min_chars': 'ቢያንስ 3 ፊደሎች',
      'age_18_65': 'ዕድሜ 18 - 65',

      // ── Emergency Screen ──
      'emergency_reminders': 'አስቸኳይ እና ማስታዎሻ',
      'no_alerts': 'ምንም ማንቂያ አልተገኘም',
      'no_alerts_msg': 'ምንም አስቸኳይ ጥያቄ ወይም የብቁነት ማስታዎሻ የለዎትም።',
      'reminder': 'ማስታዎሻ',
      'decline': 'አልቀበልም',
      'accept': 'እቀበላለሁ',
      'accepted_msg': 'አመሰግናለሁ! ምላሽዎ ተመዝግቧል።',
      'declined_msg': 'ይህን ጥያቄ አልተቀበሉም።',
      'response_failed': 'ምላሽ ማቅረብ አልተሳካም። በድጋሚ በመሞከር ላይ...',
      'response_accepted': 'ምላሽ: ተቀብሏል',
      'response_declined': 'ምላሽ: ተቃውሟል',

      // ── History Screen ──
      'no_donations': 'ገና ልገሳ የለም',
      'no_donations_msg': 'ገና ምንም ልገሳ አላደረጉም። ታሪክዎ ሲመዘገብ እዚህ ይታያል።',
      'units_donated': 'የተለገሰ መጠን',
      'bags': 'ከረጢት',

      // ── Appreciation Screen ──
      'appreciation_letters': 'የምስጋና ደብዳቤዎች',
      'no_letters': 'ገና ደብዳቤ አልተቀበሉም',
      'no_letters_msg': 'የደም ባንክ ሰራተኞች የምስጋና ደብዳቤ ሲልኩልዎ እዚህ በሚያምር ሁኔታ ይዘረዘራል።',
      'admin_team': '— የደም ባንክ አስተዳደር ቡድን',
    },

    // ════════════════════════════════════════════════════════════
    // OROMO (Afaan Oromoo)
    // ════════════════════════════════════════════════════════════
    'om': {
      // ── General ──
      'app_title': 'Portaala Kennitaa',
      'cancel': 'Haquu',
      'ok': 'Tole',
      'retry': 'Irra deebi\'i yaali',
      'save': 'Olkaa\'i',
      'loading': 'Fe\'aa jira...',
      'error': 'Dogoggora',
      'success': 'Milkaa\'e',
      'language': 'Afaan',
      'select_language': 'Afaan Filadhu',

      // ── Home Screen ──
      'hello': 'Akkam',
      'welcome': 'Baga Gara Baankii Dhiigaatti Dhuftan!',
      'save_lives': 'Har\'a dhiiga kenninuun lubbuu baraari.',
      'blood_type': 'Gosa Dhiigaa',
      'pending': 'Eegamaa',
      'approved': 'Mirkanaa\'e',
      'pending_approval': 'Mirkaneeffamuu Eegaa',
      'announcements_news': 'Beeksisa fi Oduu',
      'no_announcements': 'Yeroo ammaa beeksisni hin jiru.',
      'donor_services': 'Tajaajila Kennitaa',
      'my_profile': 'Profaayilii Koo',
      'view_edit_profile': 'Profaayilii Ilaali fi Gulaali',
      'emergency_alert': 'Beeksisa Hatattamaa',
      'urgent_requests': 'Gaaffii hatattamaa',
      'donation_history': 'Seenaa Kennaa',
      'your_contributions': 'Gumaacha keessan',
      'appreciation': 'Galata',
      'thank_you_letters': 'Xalayaa galataa',
      'register_donor': 'Akka Kennitaa Dhiigaatti Galmaa\'i',

      // ── Registration Required Dialog ──
      'registration_required': 'Galmee Barbaachisa',
      'registration_required_msg': 'Tajaajila kana argachuuf fi odeeffannoo keessan ilaaluuf akka kennitaa dhiigaatti galmaa\'uu qabdu.',
      'register_now': 'Amma Galmaa\'i',

      // ── Register Screen ──
      'donor_registration': 'Galmee Kennitaa',
      'join_donor': 'Akka Kennitaa Dhiigaatti Makamii',
      'donation_saves': 'Kenninni keessan lubbuu baraara',
      'full_name': 'Maqaa Guutuu',
      'enter_full_name': 'Maqaa guutuu keessan galchaa',
      'phone_number': 'Lakkoofsa Bilbilaa',
      'phone_hint': 'Fkn. 0912345678',
      'gender': 'Saala',
      'select_gender': 'Saala keessan filadhaa',
      'male': 'Dhiira',
      'female': 'Dubartii',
      'age': 'Umurii',
      'age_hint': 'Umurii keessan galchaa (18-65)',
      'address': 'Teessoo',
      'enter_address': 'Teessoo keessan galchaa',
      'register': 'Galmaa\'i',

      // ── Register Validation ──
      'name_required': 'Maqaa guutuu barbaachisa',
      'name_min': 'Maqaan xiqqaatu qubee 3 ta\'uu qaba',
      'phone_required': 'Lakkoofsi bilbilaa barbaachisa',
      'phone_invalid': 'Lakkoofsa bilbilaa sirrii galchaa',
      'gender_required': 'Maaloo saala keessan filadhaa',
      'age_required': 'Umuriin barbaachisa',
      'age_range': 'Umuriin 18 hanga 65 ta\'uu qaba',
      'address_required': 'Teessoon barbaachisa',

      // ── Register Dialogs ──
      'registration_successful': 'Galmeen Milkaa\'e!',
      'registration_success_msg': 'Akka kennittaatti galmooftanii jirtu, akkasumas galmeessi qorannoo laaboraatorii isiniif uumameera.\n\nProfaayiliin keessan mirkaneeffamuu garee yaalaa keenyaatiin eegaa jira.',
      'welcome_back': 'Baga Deebitan!',
      'welcome_back_msg': ', profaayilii kennitaa dhiigaa keessan argannee jirra. Ofumaan seentanii jirtu.',
      'phone_already_registered': 'Lakkoofsi bilbilaa kun duraan maqaa biraatiin galma\'eera.',
      'connection_error': 'Dogoggora walqunnamtii. Maaloo networkii keessan mirkaneessaa irra deebi\'aa yaalaa.',
      'login_failed': 'Seenuun hin milkoofne. Maaloo irra deebi\'aa yaalaa.',
      'registration_failed': 'Galmeen hin milkoofne',

      // ── Profile Screen ──
      'edit_profile': 'Odeeffannoo Profaayilii Gulaali',
      'personal_details': 'Odeeffannoo Dhuunfaa',
      'years_old': 'waggaa',
      'not_specified': 'Hin ibsamne',
      'total_donations': 'Kennaa Waliigalaa',
      'times': 'si\'a',
      'eligible': 'Ulaagaa Guute',
      'yes': 'EEYYEE',
      'no': 'LAKKI',
      'status': 'Haala',
      'save_details': 'Odeeffannoo Olkaa\'i',
      'log_out': 'Ba\'i',
      'confirm_logout': 'Ba\'uu Mirkaneessi',
      'logout_msg': 'Seshinii kennitaa keessanii keessaa ba\'uu akka barbaaddan mirkanaadha?',
      'logout': 'Ba\'i',
      'profile_updated': 'Profaayiliin milkiin haaromfame!',
      'profile_update_failed': 'Profaayilii haaromsuu hin dandeenye',
      'profile_load_failed': 'Profaayilii fe\'uu hin dandeenye',
      'profile_error_msg': 'Sarvarii waliin walqunnamuun dogoggorri uumame. Maaloo walqunnamtii keessan mirkaneessaa.',
      'profile_update_error': 'Profaayilii haaromsuun dogoggora. Maaloo irra deebi\'aa yaalaa.',
      'min_chars': 'Xiqqaatu qubee 3',
      'age_18_65': 'Umurii 18 - 65',

      // ── Emergency Screen ──
      'emergency_reminders': 'Hatattama fi Yaadachiisa',
      'no_alerts': 'Akeekkachiisni Hin Argamne',
      'no_alerts_msg': 'Gaaffii hatattamaa ykn yaadachiisa ulaagaa guutuu hin qabdan.',
      'reminder': 'Yaadachiisa',
      'decline': 'Diduu',
      'accept': 'Fudhachuu',
      'accepted_msg': 'Galatoomaa! Deebiin keessan galma\'eera.',
      'declined_msg': 'Gaaffii kana diddan.',
      'response_failed': 'Deebii galmeessuu hin dandeenye. Irra deebi\'amaa jira...',
      'response_accepted': 'Deebii: Fudhatame',
      'response_declined': 'Deebii: Didame',

      // ── History Screen ──
      'no_donations': 'Hanga Ammaatti Kennaan Hin Jiru',
      'no_donations_msg': 'Hanga ammaatti kennaa hin goone. Seenaan keessan yeroo galma\'u asitti mul\'ata.',
      'units_donated': 'Safartuun Kenname',
      'bags': 'Korojoo',

      // ── Appreciation Screen ──
      'appreciation_letters': 'Xalayaa Galataa',
      'no_letters': 'Hanga Ammaatti Xalayaan Hin Argamne',
      'no_letters_msg': 'Hojjettoonni baankii dhiigaa xalayaa galata ykn badhaasa isinii ergan asitti bareechisnaan tarreeffama.',
      'admin_team': '— Garee Bulchiinsa Baankii Dhiigaa',
    },
  };
}
