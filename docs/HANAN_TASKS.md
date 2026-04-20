# 🧠 Docs & AI Intelligence Plan: Hanan

Hanan, your role is the most strategic. You need to make the system "Smart" and ensure our documentation is winning-quality for the project judges.

## 📅 Day 2: AI Features & Pitch (TOMORROW)
1.  **Prescription OCR**:
    *   In `docs/ai/ocr_service.py`, use the `pytesseract` library to extract text from a medicine prescription image.
    *   Run: `pip install pytesseract pillow`.
    *   Write a function `def extract_medicine_names(image_path: str) -> list[str]` that reads the image and returns a list of potential medicine names.
    *   Test it against a sample prescription scan and log the output.
2.  **Demand Predictor**:
    *   In `docs/ai/demand_predictor.py`, write a function that takes medicine names as input and queries the backend API.
    *   Return a list like: `[{"medicine": "Amoxicillin", "weekly_searches": 45, "restock_urgency": "HIGH"}]`.
3.  **Pitch Deck Slides**:
    *   Create a Google Slides or PowerPoint file with exactly **5 slides**:
        *   Slide 1: The Problem (People in Arba Minch can't find medicine fast).
        *   Slide 2: The Solution (MedLink: Search, Reserve, Pickup).
        *   Slide 3: The Technology (Show the architecture diagram).
        *   Slide 4: The Team (Eyasu, Yadesa, Misiker, Hanan - with roles).
        *   Slide 5: Live Demo QR Code linking to `https://ethio-pharma.onrender.com/api/`.

    ### Day 2 Implementation Status
    - `docs/ai/ocr_service.py`: Implemented with `extract_medicine_names(image_path: str) -> list[str]`
    - `docs/ai/demand_predictor.py`: Implemented demand prediction helper
    - `docs/ai/README.md`: Added install + run instructions for both AI prototypes
    - `docs/pitch_deck_outline.md`: Added 5-slide ready outline for judges
