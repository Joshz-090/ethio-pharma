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
## ✅ Day 1-2 Progress Audit
- [x] OCR Service (`ocr_service.py`) with Tesseract integration.
- [x] Demand Prediction Script (`demand_predictor.py`) prototype.
- [x] 5-Slide Pitch Deck Outline finalized.
- [x] AI README & Run instructions documented.

## 📅 Day 3: Final Logic & Presentation (TODAY)
Today is about "The Brain" and "The Presentation". We need to win over the judges.

1.  **Demand Analytics Integration**:
    *   Connect `docs/ai/demand_predictor.py` to the actual `SearchHistory` database table.
    *   Generate a "Market Insight Report" for Arba Minch (e.g., "High demand for blood pressure meds in Secha").
2.  **AI Prescription Validation (Visual Mockup)**:
    *   Prepare a set of 3 images: A real prescription, a processed OCR output, and the matched medicine in our DB. This will be our "Golden Demo".
3.  **Final Pitch Deck (The Winner Deck)**:
    *   Refine the slides from Day 2.
    *   Add a **Financial/Impact Slide**: "How MedLink reduces medicine wastage by 20% in Arba Minch."
    *   Add a **Demo Slide**: Embed a screenshot of Misiker's dashboard and the POS app side-by-side.
4.  **Project Handover Doc**:
    *   Work on `docs/PROJECT_HANDOVER.md`. Ensure all API keys (masked) and setup instructions are clear.

## 📡 Final Deliverables
- [ ] `docs/MARKET_INSIGHTS.pdf` generated from the search history.
- [ ] Final Presentation PDF/Link ready for 5 PM handover.
- [ ] Successfully demonstrated "Scan-to-Match" flow for the judges.
