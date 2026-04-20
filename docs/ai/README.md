# AI Prototypes (Hanan)

This folder contains Day 2 AI prototypes for the hackathon pitch.

## Files
- `ocr_service.py`: Extract likely medicine names from prescription images.
- `demand_predictor.py`: Estimate weekly demand and restock urgency from inventory API snapshots.

## Install Dependencies

From the AI folder itself:

```bash
pip install -r requirements.txt
```

Or from the backend virtual environment if you want to keep everything in one shell:

```bash
cd backend
source venv/bin/activate
pip install pytesseract pillow requests
```

System package for OCR engine:

```bash
sudo apt update
sudo apt install -y tesseract-ocr
```

## Run OCR Prototype

```bash
python ../docs/ai/ocr_service.py /path/to/prescription-image.jpg
```

Print raw OCR text too:

```bash
python ../docs/ai/ocr_service.py /path/to/prescription-image.jpg --show-text
```

Example output:

```json
{"image": "sample.jpg", "medicines": ["Amoxicillin", "Paracetamol"]}
```

Notes:
- The OCR helper is intentionally lightweight and does not change backend deployment.
- It uses standard Python packages plus `pytesseract` and `Pillow`.
- For best results, use a clear image with strong contrast.

## Run Demand Predictor Prototype

```bash
python ../docs/ai/demand_predictor.py amoxicillin paracetamol --base-url http://127.0.0.1:8000/api --token <ACCESS_TOKEN>
```

Example output:

```json
[
  {"medicine": "Amoxicillin", "weekly_searches": 45, "restock_urgency": "HIGH"},
  {"medicine": "Paracetamol", "weekly_searches": 30, "restock_urgency": "MEDIUM"}
]
```
