import '../models/medicine.dart';

const List<Medicine> mockMedicineCatalog = [
  Medicine(
    id: '1',
    name: 'Amoxicillin 500mg',
    sku: 'AMX-500',
    price: 120.0,
    stock: 24,
    pharmacyName: 'Arba Minch General Pharmacy',
    distanceKm: 0.8,
    pharmacyLatitude: 6.0354,
    pharmacyLongitude: 37.5528,
    pharmacyAddress: 'Sikela, Arba Minch',
  ),
  Medicine(
    id: '2',
    name: 'Paracetamol 500mg',
    sku: 'PCM-500',
    price: 35.0,
    stock: 65,
    pharmacyName: 'Sikela Care Pharmacy',
    distanceKm: 1.2,
    pharmacyLatitude: 6.0309,
    pharmacyLongitude: 37.5486,
    pharmacyAddress: 'Sikela Road, Arba Minch',
  ),
  Medicine(
    id: '3',
    name: 'Ibuprofen 400mg',
    sku: 'IBP-400',
    price: 55.0,
    stock: 19,
    pharmacyName: 'Abaya Road Pharmacy',
    distanceKm: 2.1,
    pharmacyLatitude: 6.0246,
    pharmacyLongitude: 37.5615,
    pharmacyAddress: 'Abaya Junction, Arba Minch',
  ),
  Medicine(
    id: '4',
    name: 'Cetirizine 10mg',
    sku: 'CTZ-10',
    price: 42.0,
    stock: 28,
    pharmacyName: 'Heritage Health Pharmacy',
    distanceKm: 1.6,
    pharmacyLatitude: 6.0418,
    pharmacyLongitude: 37.5584,
    pharmacyAddress: 'Kebele 04, Arba Minch',
  ),
  Medicine(
    id: '5',
    name: 'Metformin 500mg',
    sku: 'MTF-500',
    price: 88.0,
    stock: 31,
    pharmacyName: 'Arba Minch Central Pharmacy',
    distanceKm: 0.5,
    pharmacyLatitude: 6.0342,
    pharmacyLongitude: 37.5469,
    pharmacyAddress: 'Main Market, Arba Minch',
  ),
  Medicine(
    id: '6',
    name: 'Vitamin C 1000mg',
    sku: 'VIT-C-1K',
    price: 150.0,
    stock: 13,
    pharmacyName: 'Sikela Community Pharmacy',
    distanceKm: 3.4,
    pharmacyLatitude: 6.0471,
    pharmacyLongitude: 37.5398,
    pharmacyAddress: 'Sikela North, Arba Minch',
  ),
  Medicine(
    id: '7',
    name: 'Cough Syrup 100ml',
    sku: 'CS-100',
    price: 95.0,
    stock: 17,
    pharmacyName: 'MedLife Pharmacy',
    distanceKm: 2.8,
    pharmacyLatitude: 6.0268,
    pharmacyLongitude: 37.5702,
    pharmacyAddress: 'Nech Sar Street, Arba Minch',
  ),
  Medicine(
    id: '8',
    name: 'Omeprazole 20mg',
    sku: 'OMP-20',
    price: 60.0,
    stock: 22,
    pharmacyName: 'Lake View Pharmacy',
    distanceKm: 1.9,
    pharmacyLatitude: 6.0396,
    pharmacyLongitude: 37.5654,
    pharmacyAddress: 'Lake View Quarter, Arba Minch',
  ),
];

List<Medicine> searchMockMedicines(String query) {
  final normalized = query.trim().toLowerCase();

  if (normalized.isEmpty) {
    return mockMedicineCatalog;
  }

  return mockMedicineCatalog
      .where(
        (medicine) =>
            medicine.name.toLowerCase().contains(normalized) ||
            medicine.pharmacyName.toLowerCase().contains(normalized) ||
            medicine.sku.toLowerCase().contains(normalized),
      )
      .toList();
}
