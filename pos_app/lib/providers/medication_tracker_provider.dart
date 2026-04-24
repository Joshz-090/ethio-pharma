import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/tracked_medication.dart';
import '../services/notification_service.dart';

class MedicationTrackerNotifier extends StateNotifier<List<TrackedMedication>> {
  static const String _storageKey = 'medication_schedule_v2';

  MedicationTrackerNotifier() : super([]) {
    _loadFromStorage();
    _listenToNotifications();
  }

  void _listenToNotifications() {
    NotificationService().onNotificationResponse.listen((response) {
      if (response.actionId == 'take_now' && response.payload != null) {
        takeMedication(response.payload!);
      }
    });
  }

  Future<void> _loadFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    final data = prefs.getString(_storageKey);
    if (data != null) {
      final List<dynamic> decoded = jsonDecode(data);
      state = decoded.map((item) => TrackedMedication.fromJson(item)).toList();
    }
    
    // Check if app was launched from a "Take Now" notification action
    final launchDetails = await NotificationService().getAppLaunchDetails();
    if (launchDetails?.notificationResponse?.actionId == 'take_now') {
      final payload = launchDetails!.notificationResponse!.payload;
      if (payload != null) {
        takeMedication(payload);
      }
    }

    _cleanAndSchedule();
  }

  Future<void> _saveToStorage() async {
    final prefs = await SharedPreferences.getInstance();
    final data = jsonEncode(state.map((m) => m.toJson()).toList());
    await prefs.setString(_storageKey, data);
  }

  Future<void> _cleanAndSchedule() async {
    // Remove completed ones if needed, but let's keep them for history for now
    // Schedule notifications for all upcoming meds
    await NotificationService().cancelAll();
    
    for (final med in state) {
      if (!med.isCompleted && med.tabletsRemaining > 0) {
        final notificationId = med.id.hashCode.abs() % 100000;
        await NotificationService().scheduleMedicationReminder(
          id: notificationId,
          title: '💊 Time for your ${med.name}',
          body: 'Take 1 tablet. (${med.tabletsRemaining} remaining)',
          scheduledTime: med.nextScheduledTime,
          payload: med.id,
        );
      }
    }
  }

  Future<void> addMedication({
    required String name,
    required int totalTablets,
    required int frequencyHours,
    required DateTime firstDose,
  }) async {
    final newMed = TrackedMedication(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      name: name,
      totalTablets: totalTablets,
      tabletsRemaining: totalTablets,
      frequencyHours: frequencyHours,
      nextScheduledTime: firstDose,
    );

    state = [...state, newMed];
    await _saveToStorage();
    await _cleanAndSchedule();
  }

  Future<void> takeMedication(String id) async {
    state = [
      for (final med in state)
        if (med.id == id && !med.isCompleted)
          _processDose(med)
        else
          med,
    ];
    await _saveToStorage();
    await _cleanAndSchedule();
  }

  TrackedMedication _processDose(TrackedMedication med) {
    final remaining = med.tabletsRemaining - 1;
    final isDone = remaining <= 0;
    
    return med.copyWith(
      tabletsRemaining: remaining,
      lastTakenTime: DateTime.now(),
      nextScheduledTime: DateTime.now().add(Duration(hours: med.frequencyHours)),
      isCompleted: isDone,
    );
  }

  Future<void> removeMedication(String id) async {
    state = state.where((m) => m.id != id).toList();
    await _saveToStorage();
    await _cleanAndSchedule();
  }
}

final medicationTrackerProvider =
    StateNotifierProvider<MedicationTrackerNotifier, List<TrackedMedication>>((ref) {
  return MedicationTrackerNotifier();
});
