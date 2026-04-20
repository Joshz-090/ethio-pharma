import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/tracked_medication.dart';
import '../services/notification_service.dart';

class MedicationTrackerNotifier extends StateNotifier<List<TrackedMedication>> {
  MedicationTrackerNotifier() : super(_mockMedications) {
    _scheduleAll();
  }

  static final List<TrackedMedication> _mockMedications = [
    TrackedMedication(
      id: '1',
      name: 'Amoxicillin',
      dosage: '500mg - 1 Tablet',
      scheduleTime: const TimeOfDay(hour: 8, minute: 0),
      instructions: 'Take after breakfast',
      isTakenToday: true,
    ),
    TrackedMedication(
      id: '2',
      name: 'Paracetamol',
      dosage: '1000mg - 2 Tablets',
      scheduleTime: const TimeOfDay(hour: 14, minute: 30),
      instructions: 'Take with plenty of water',
      isTakenToday: false,
    ),
    TrackedMedication(
      id: '3',
      name: 'Metformin',
      dosage: '850mg - 1 Tablet',
      scheduleTime: const TimeOfDay(hour: 20, minute: 0),
      instructions: 'Take with evening meal',
      isTakenToday: false,
    ),
  ];

  Future<void> _scheduleAll() async {
    for (final med in state) {
      await NotificationService().scheduleMedicationReminder(
        id: int.parse(med.id),
        title: 'Time for your ${med.name}',
        body: 'Dosage: ${med.dosage}. ${med.instructions}',
        scheduledTime: med.scheduleTime,
      );
    }
  }

  void toggleTaken(String id) {
    state = [
      for (final med in state)
        if (med.id == id) med.copyWith(isTakenToday: !med.isTakenToday) else med,
    ];
  }

  void addMedication(TrackedMedication med) {
    state = [...state, med];
    _scheduleAll();
  }

  void removeMedication(String id) {
    state = state.where((m) => m.id != id).toList();
    NotificationService().cancelAll().then((_) => _scheduleAll());
  }
}

final medicationTrackerProvider =
    StateNotifierProvider<MedicationTrackerNotifier, List<TrackedMedication>>((ref) {
  return MedicationTrackerNotifier();
});
