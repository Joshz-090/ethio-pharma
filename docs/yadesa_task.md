# Yadesa's Mobile App Tasks (Ethio-Pharma)

## 1. Geolocation & Nearby Pharmacies
- [ ] Use the `latitude` and `longitude` fields from the `pharmacy` object in the API response.
- [ ] Calculate the distance between the user's current location and the pharmacy using the `geolocator` package.
- [ ] Sort/Filter search results by distance.

## 2. Medicine Search & Display
- [ ] Parse the new `requires_prescription` boolean from the `medicine` object.
- [ ] Display a prominent "Requires Prescription" badge on the search result card if true.
- [ ] The `image_url` field is now optional. Provide a fallback placeholder icon if the URL is null or fails to load.

## 3. Categories
- [ ] Implement a horizontal Category filter at the top of the home screen.
- [ ] Use the new `Category` object returned by the API (which includes `id`, `name`, and `icon` fields).
- [ ] Parse the `icon` string (e.g. `bi-pill`) and map it to equivalent Flutter icons.
