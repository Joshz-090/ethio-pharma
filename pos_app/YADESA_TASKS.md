# 📱 Yadesa's Mobile Integration Guide (Patient App)

This guide provides the technical map for connecting the Flutter mobile app to the Ethio-Pharma production backend.

## 🔗 Connection Info
- **Production URL**: `https://ethio-pharma.onrender.com/api`
- **Interactive Documentation**: `https://ethio-pharma.onrender.com/api/docs/`
- **Format**: All requests must use `Content-Type: application/json`

---

## 🔐 Step 1: Authentication (JWT)
Before making any requests for reservations, you must log the user in.
- **Endpoint**: `POST /token/`
- **Payload**: `{"email": "...", "password": "..."}`
- **Note**: Save the `access` token in secure storage. All subsequent private requests must include the header: 
  `Authorization: Bearer <your_access_token>`

---

## 🔍 Step 2: Medicine Search (The Public View)
Patients need to find medicines and see which pharmacies have them.
- **Endpoint**: `GET /medicines/inventory/`
- **Location-Based Search (FREE)**: 
  - To show nearest pharmacies first, send the user's GPS like this: `GET /api/medicines/inventory/?search=Insulin&lat=6.023&long=37.551`
  - The backend will automatically sort the results by distance for you.
- **UI Tip**: Use `flutter_map` with OpenStreetMap. It is 100% free (Google Maps will charge you).
- **JSON Response**: You will get a list. Each item contains `pharmacy` details, `medicine` details, `price`, and `quantity`.

---

## 🛒 Step 3: Real-Time Reservation (Atomic Logic)
When a patient clicks "Reserve," you must create a 60-minute hold.
- **Endpoint**: `POST /reservations/` (Requires Auth)
- **Payload**: 
  ```json
  {
    "inventory_item": "UUID_OF_INVENTORY_ITEM",
    "quantity": 1
  }
  ```
- **Backend Logic**: This call automatically deducts the stock from the pharmacy. You must show a countdown timer of 60 minutes to the user.

---

## 📸 Step 4: AI Prescription Scanner (Hanan's Bridge)
To allow patients to take a photo of a prescription and get auto-filled results.
- **Endpoint**: `POST /ai/ocr/`
- **Method**: Multipart/Form-data (Upload Image)
- **Field Name**: `image`
- **Response**: `{"medicines": ["Amoxicillin", "Paracetamol"], ...}`

---

## 📈 Step 5: Demand Predictor (AI Insights)
Used for the home screen or "Hot Medicines" section.
- **Endpoint**: `GET /ai/predict/`
- **Query Params**: `?medicines=Insulin&medicines=Amoxicillin`
- **Response**: Tells you if a drug is in high demand or out of stock across Arba Minch.

---

### 💡 Pro-Tips for Yadesa:
1.  **Error Handling**: If a reservation fails because stock is gone, the backend will return a `400 Bad Request`. Show a message: "Sorry, someone just took the last box!"
2.  **Debounced Search**: When the user is typing in the search bar, wait 300ms before calling the API to save battery and data.
3.  **Coordinate Handling**: The `pharmacy` object contains location data. Use this with a map plugin to show the distance from the patient.

**Happy Coding, Yadesa! The backend is ready for you.**
