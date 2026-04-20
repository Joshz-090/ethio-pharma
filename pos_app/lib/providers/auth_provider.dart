import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

const _tokenKey = 'access_token';

class AuthState {
  final String? token;
  final bool isLoading;
  final String? error;
  final String? firstName;
  final String? lastName;
  final String? email;

  const AuthState({this.token, this.isLoading = false, this.error, this.firstName, this.lastName, this.email});

  bool get isAuthenticated => token != null && token!.isNotEmpty;
  String get displayName => (firstName != null && firstName!.isNotEmpty) ? '$firstName $lastName' : 'User';

  AuthState copyWith({String? token, bool? isLoading, String? error, String? firstName, String? lastName, String? email}) {
    return AuthState(
      token: token ?? this.token,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      email: email ?? this.email,
    );
  }
}

class AuthNotifier extends Notifier<AuthState> {
  @override
  AuthState build() {
    _loadToken();
    return const AuthState();
  }

  Future<void> _loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_tokenKey);
    final fName = prefs.getString('user_first_name');
    final lName = prefs.getString('user_last_name');
    final email = prefs.getString('user_email');
    
    if (token != null && token.isNotEmpty) {
      state = AuthState(
        token: token,
        firstName: fName,
        lastName: lName,
        email: email,
      );
      await ApiService().init();
    }
  }

  Future<bool> login({
    required String email,
    required String password,
  }) async {
    state = const AuthState(isLoading: true);

    final normalizedEmail = email.trim();
    if (normalizedEmail.isEmpty || password.isEmpty) {
      state = const AuthState(error: 'Email and password are required.');
      return false;
    }

    final success = await ApiService().login(normalizedEmail, password);
    
    if (success) {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString(_tokenKey);
      
      // In a real app, login would return user details. 
      // For now, we'll try to use the email or existing info.
      state = AuthState(
        token: token,
        email: normalizedEmail,
        firstName: prefs.getString('user_first_name'),
        lastName: prefs.getString('user_last_name'),
      );
      return true;
    } else {
      state = const AuthState(error: 'Invalid email or password.');
      return false;
    }
  }

  Future<bool> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    required String phoneNumber,
  }) async {
    state = const AuthState(isLoading: true);

    final normalizedEmail = email.trim();
    if (normalizedEmail.isEmpty || password.isEmpty || firstName.trim().isEmpty || lastName.trim().isEmpty || phoneNumber.trim().isEmpty) {
      state = const AuthState(error: 'All fields are required.');
      return false;
    }

    final error = await ApiService().register(
      email: normalizedEmail,
      password: password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber: phoneNumber.trim(),
    );
    
    if (error == null) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_first_name', firstName.trim());
      await prefs.setString('user_last_name', lastName.trim());
      await prefs.setString('user_email', normalizedEmail);
      
      // Auto-login after successful registration
      return await login(email: normalizedEmail, password: password);
    } else {
      state = AuthState(error: error);
      return false;
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove('user_first_name');
    await prefs.remove('user_last_name');
    await prefs.remove('user_email');
    ApiService().logout();
    state = const AuthState();
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(
  AuthNotifier.new,
);
