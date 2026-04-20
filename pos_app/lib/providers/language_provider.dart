import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LanguageNotifier extends StateNotifier<Locale> {
  LanguageNotifier() : super(const Locale('en')) {
    _loadSync();
  }

  Future<void> _loadSync() async {
    final prefs = await SharedPreferences.getInstance();
    final code = prefs.getString('language_code') ?? 'en';
    state = Locale(code);
  }

  Future<void> setLanguage(String code) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('language_code', code);
    state = Locale(code);
  }

  bool get isAmharic => state.languageCode == 'am';
}

final languageProvider = StateNotifierProvider<LanguageNotifier, Locale>((ref) {
  return LanguageNotifier();
});

class Trans {
  static String t(BuildContext context, String key) {
    final locale = Localizations.localeOf(context);
    final isAm = locale.languageCode == 'am';

    if (isAm) {
      return _am[key] ?? _en[key] ?? key;
    }
    return _en[key] ?? key;
  }

  static const Map<String, String> _en = {
    'hello': 'Hello, Alex 👋',
    'search_hint': 'Search medicines...',
    'nearby': 'Nearby Pharmacies',
    'trending': 'Trending in Arba Minch 🔥',
    'recent': 'Your Recent History',
    'featured': 'Featured Medicines',
    'details': 'Details',
    'description': 'Description',
    'review': 'Review',
    'instructions': 'Instructions',
    'product_summary': 'Product Summary',
    'reserve': 'Reserve Medicine',
    'processing': 'Processing...',
    'success': 'Reservation Success!',
    'held_for': 'Held for 60 mins. View in "Orders" tab.',
    'ok': 'OK',
    'total_cost': 'Total Cost',
    'track_reminder': 'Smart Reminder',
    'track_desc': 'Activate daily tracking and get notified locally.',
    'find_nearby': 'Find Nearby Availability',
    'categories': 'Categories',
    'all': 'All',
    'tablets': 'Tablets',
    'drops': 'Drops',
    'syrup': 'Syrup',
    'first_aid': 'First Aid',
    'home': 'Home',
    'orders': 'Orders',
    'explore': 'Explore',
    'profile': 'Profile',
    'scanner': 'AI Scanner',
    'found': 'Found',
    'cool': 'Cool!',
    'login_to_reserve': 'Please login to reserve.',
    'schedule': 'Schedule',
    'hello_prefix': 'Hello',
    'welcome_user': 'Welcome User',
    'guest_session': 'Guest Session',
  };

  static const Map<String, String> _am = {
    'hello': 'ሰላም አሌክስ 👋',
    'search_hint': 'መድኃኒቶችን ይፈልጉ...',
    'nearby': 'በአቅራቢያ ያሉ ፋርማሲዎች',
    'trending': 'በአርባ ምንጭ ተወዳጅ የሆኑ 🔥',
    'recent': 'የቅርብ ጊዜ ታሪክዎ',
    'featured': 'ተለይተው የቀረቡ መድኃኒቶች',
    'details': 'ዝርዝር መረጃ',
    'description': 'መግለጫ',
    'review': 'ግምገማ',
    'instructions': 'መመሪያዎች',
    'product_summary': 'የምርት ማጠቃለያ',
    'reserve': 'መድኃኒቱን ያስይዙ',
    'processing': 'በሂደት ላይ ነው...',
    'success': 'በተሳካ ሁኔታ ተይዟል!',
    'held_for': 'ለ 60 ደቂቃ ተይዟል። በ "ትዕዛዞች" ትር ውስጥ ይመልከቱ።',
    'ok': 'እሺ',
    'total_cost': 'ጠቅላላ ዋጋ',
    'track_reminder': 'ብልህ ማሳሰቢያ',
    'track_desc': 'ዕለታዊ ክትትልን ያግብሩ እና ማሳወቂያ ያግኙ።',
    'find_nearby': 'በአቅራቢያ መኖሩን ይፈልጉ',
    'categories': 'ምድቦች',
    'all': 'ሁሉም',
    'tablets': 'ኪኒኖች',
    'drops': 'ጠብታዎች',
    'syrup': 'ሲሮፕ',
    'first_aid': 'የመጀመሪያ እርዳታ',
    'home': 'መነሻ',
    'orders': 'ትዕዛዞች',
    'explore': 'ያስሱ',
    'profile': 'መገለጫ',
    'scanner': 'AI ስካነር',
    'found': 'ተገኝቷል',
    'cool': 'በጣም አሪፍ!',
    'login_to_reserve': 'እባክዎ ለመያዝ መጀመሪያ ይግቡ ወይም ይመዝገቡ።',
    'schedule': 'መርሐግብር',
    'hello_prefix': 'ሰላም',
    'welcome_user': 'እንኳን ደህና መጡ',
    'guest_session': 'የእንግዳ ቆይታ',
  };
}

extension TransExtension on String {
  String tr(BuildContext context) {
    return Trans.t(context, this);
  }
}
