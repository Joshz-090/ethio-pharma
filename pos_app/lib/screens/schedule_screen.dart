import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../providers/medication_tracker_provider.dart';
import '../models/tracked_medication.dart';
import '../services/notification_service.dart';

class ScheduleScreen extends ConsumerStatefulWidget {
  const ScheduleScreen({super.key});

  @override
  ConsumerState<ScheduleScreen> createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends ConsumerState<ScheduleScreen> {
  @override
  Widget build(BuildContext context) {
    final medications = ref.watch(medicationTrackerProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAF9),
      appBar: AppBar(
        title: const Text('Medication Schedule', style: TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF13231A))),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_active_outlined, color: Colors.blueAccent),
            tooltip: 'Test Notification',
            onPressed: () async {
              await NotificationService().showInstantNotification(
                title: '✅ MedLink Notification Test',
                body: 'Great! Your medication reminders are now properly configured and ready to use.',
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.add_circle_outline_rounded, color: Color(0xFF34C759), size: 28),
            onPressed: () => _showAddMedicationDialog(context),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: medications.isEmpty
          ? _buildEmptyState()
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: medications.length,
              itemBuilder: (context, index) {
                return _MedicationCard(medication: medications[index]);
              },
            ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.calendar_today_rounded, size: 80, color: Colors.grey[300]),
          const SizedBox(height: 16),
          const Text('No medications scheduled', style: TextStyle(fontSize: 18, color: Colors.grey, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text('Tap the + icon to add a reminder', style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }

  void _showAddMedicationDialog(BuildContext context) {
    final nameController = TextEditingController();
    final tabletsController = TextEditingController();
    int selectedFrequency = 8;
    DateTime selectedTime = DateTime.now().add(const Duration(minutes: 1));

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom, left: 24, right: 24, top: 24),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Add Medication', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF13231A))),
              const SizedBox(height: 24),
              TextField(
                controller: nameController,
                decoration: InputDecoration(
                  labelText: 'Medicine Name',
                  filled: true,
                  fillColor: Colors.grey[50],
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: tabletsController,
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(
                        labelText: 'Total Tablets',
                        filled: true,
                        fillColor: Colors.grey[50],
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(color: Colors.grey[50], borderRadius: BorderRadius.circular(16)),
                      child: DropdownButton<int>(
                        value: selectedFrequency,
                        isExpanded: true,
                        underline: const SizedBox(),
                        items: [6, 8, 12, 24].map((h) => DropdownMenuItem(value: h, child: Text('Every $h hrs'))).toList(),
                        onChanged: (val) => setModalState(() => selectedFrequency = val!),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              ListTile(
                title: const Text('Start Time'),
                subtitle: Text(
                  MediaQuery.of(context).alwaysUse24HourFormat
                      ? DateFormat('MMM d, HH:mm').format(selectedTime)
                      : DateFormat('MMM d, h:mm a').format(selectedTime),
                ),
                trailing: const Icon(Icons.access_time_rounded),
                onTap: () async {
                  final date = await showDatePicker(
                    context: context,
                    useRootNavigator: true,
                    initialDate: selectedTime,
                    firstDate: DateTime.now(),
                    lastDate: DateTime.now().add(const Duration(days: 365)),
                  );
                  if (date != null) {
                    final time = await showTimePicker(
                      context: context,
                      useRootNavigator: true,
                      initialTime: TimeOfDay.fromDateTime(selectedTime),
                    );
                    if (time != null) {
                      setModalState(() {
                        selectedTime = DateTime(date.year, date.month, date.day, time.hour, time.minute);
                      });
                    }
                  }
                },
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  if (nameController.text.isNotEmpty && tabletsController.text.isNotEmpty) {
                    ref.read(medicationTrackerProvider.notifier).addMedication(
                      name: nameController.text,
                      totalTablets: int.parse(tabletsController.text),
                      frequencyHours: selectedFrequency,
                      firstDose: selectedTime,
                    );
                    Navigator.pop(context);
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF13231A),
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 56),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text('Save Schedule', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}

class _MedicationCard extends ConsumerWidget {
  final TrackedMedication medication;
  const _MedicationCard({required this.medication});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bool isOverdue = medication.nextScheduledTime.isBefore(DateTime.now());

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: (medication.isCompleted ? Colors.grey : const Color(0xFF34C759)).withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  medication.isCompleted ? Icons.check_circle_outline : Icons.medication_rounded,
                  color: medication.isCompleted ? Colors.grey : const Color(0xFF34C759),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      medication.name,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        color: const Color(0xFF13231A),
                        decoration: medication.isCompleted ? TextDecoration.lineThrough : null,
                      ),
                    ),
                    Text(
                      'Every ${medication.frequencyHours} hours • ${medication.tabletsRemaining} left',
                      style: TextStyle(color: Colors.grey[600], fontSize: 14),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.delete_outline_rounded, color: Colors.redAccent, size: 20),
                onPressed: () => ref.read(medicationTrackerProvider.notifier).removeMedication(medication.id),
              ),
            ],
          ),
          const Divider(height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Next Dose', style: TextStyle(color: Colors.grey, fontSize: 12)),
                    Text(
                      medication.isCompleted 
                          ? 'Completed' 
                          : (MediaQuery.of(context).alwaysUse24HourFormat
                              ? DateFormat('HH:mm').format(medication.nextScheduledTime)
                              : DateFormat('h:mm a').format(medication.nextScheduledTime)),
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: medication.isCompleted ? Colors.grey : (isOverdue ? Colors.red : const Color(0xFF13231A)),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              if (!medication.isCompleted)
                _CountdownWidget(targetTime: medication.nextScheduledTime),
              const SizedBox(width: 8),
              if (!medication.isCompleted)
                ElevatedButton(
                  onPressed: () => ref.read(medicationTrackerProvider.notifier).takeMedication(medication.id),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isOverdue ? Colors.orangeAccent : const Color(0xFF34C759),
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                  ),
                  child: Text(isOverdue ? 'Take Late' : 'Take Now', style: const TextStyle(fontWeight: FontWeight.bold)),
                ),
            ],
          ),
          if (!medication.isCompleted) ...[
            const SizedBox(height: 16),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: SizedBox(
                height: 6,
                child: LinearProgressIndicator(
                  value: medication.tabletsRemaining / medication.totalTablets,
                  backgroundColor: Colors.grey[200],
                  valueColor: AlwaysStoppedAnimation<Color>(
                    medication.tabletsRemaining < 5 ? Colors.redAccent : const Color(0xFF34C759)
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _CountdownWidget extends StatelessWidget {
  final DateTime targetTime;
  const _CountdownWidget({required this.targetTime});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<int>(
      stream: Stream.periodic(const Duration(seconds: 1), (i) => i),
      builder: (context, snapshot) {
        final now = DateTime.now();
        final difference = targetTime.difference(now);
        
        if (difference.isNegative) {
          return const Text('OVERDUE', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 12));
        }

        final hours = difference.inHours;
        final minutes = difference.inMinutes % 60;
        final seconds = difference.inSeconds % 60;

        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFF13231A).withValues(alpha: 0.05),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            '${hours.toString().padLeft(2, '0')}:${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}',
            style: const TextStyle(
              fontFamily: 'monospace',
              fontWeight: FontWeight.bold,
              color: Color(0xFF13231A),
              fontSize: 13,
            ),
          ),
        );
      },
    );
  }
}
