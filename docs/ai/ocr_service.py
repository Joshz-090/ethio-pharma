"""Prescription OCR helper for MedLink demo use.

This module extracts likely medicine names from a prescription image using
pytesseract. It stays intentionally lightweight so it can be used as a docs
prototype without affecting backend deployment.
"""

from __future__ import annotations

import argparse
from difflib import get_close_matches
import re
from pathlib import Path
from typing import Iterable

import pytesseract
from PIL import Image, ImageEnhance, ImageFilter, ImageOps


# Demo list of common medicine names used for filtering OCR text noise.
KNOWN_MEDICINES = {
    "amoxicillin",
    "paracetamol",
    "ibuprofen",
    "metformin",
    "omeprazole",
    "azithromycin",
    "ceftriaxone",
    "ciprofloxacin",
    "diclofenac",
    "insulin",
}


def _preprocess_image(image: Image.Image) -> Image.Image:
    """Improve contrast and clarity before OCR."""
    image = ImageOps.exif_transpose(image)
    image = image.convert("L")
    image = ImageOps.autocontrast(image)
    image = image.filter(ImageFilter.MedianFilter(size=3))
    image = ImageEnhance.Sharpness(image).enhance(2.0)
    image = ImageEnhance.Contrast(image).enhance(1.8)

    width, height = image.size
    if width < 1600:
        image = image.resize((width * 2, height * 2))

    return image


def _normalize_tokens(text: str) -> list[str]:
    tokens = re.findall(r"[A-Za-z][A-Za-z0-9-]{2,}", text.lower())
    return [token.strip("-_") for token in tokens]


def _match_known_medicines(tokens: Iterable[str]) -> list[str]:
    found = []
    seen = set()
    for token in tokens:
        if token in KNOWN_MEDICINES and token not in seen:
            seen.add(token)
            found.append(token.title())
            continue

        close_matches = get_close_matches(token, KNOWN_MEDICINES, n=1, cutoff=0.84)
        if close_matches:
            normalized = close_matches[0]
            if normalized not in seen:
                seen.add(normalized)
                found.append(normalized.title())
    return found


def _extract_confident_tokens(image: Image.Image) -> list[str]:
    """Use OCR word-level data and keep only reasonably confident tokens."""
    data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT, config="--oem 3 --psm 6")
    tokens = []
    seen = set()
    for text, conf in zip(data.get("text", []), data.get("conf", [])):
        if not text:
            continue

        token = re.sub(r"[^A-Za-z0-9-]", "", text).lower().strip("-_")
        if len(token) < 3 or token in seen:
            continue

        try:
            confidence = float(conf)
        except (TypeError, ValueError):
            confidence = -1

        if confidence >= 35 or token in KNOWN_MEDICINES:
            seen.add(token)
            tokens.append(token)

    return tokens


def extract_medicine_names(image_path: str) -> list[str]:
    """Extract possible medicine names from a prescription image.

    Args:
        image_path: Path to a prescription image file.

    Returns:
        List of unique medicine-like names. If no known medicine is detected,
        returns top cleaned OCR tokens as fallback.
    """
    path = Path(image_path)
    if not path.exists():
        raise FileNotFoundError(f"Image not found: {path}")

    image = Image.open(path)
    processed_image = _preprocess_image(image)

    raw_text = pytesseract.image_to_string(processed_image, config="--oem 3 --psm 6")
    tokens = _normalize_tokens(raw_text)
    if not tokens:
        tokens = _extract_confident_tokens(processed_image)

    matched = _match_known_medicines(tokens)
    if matched:
        return matched

    # Safety-first fallback: if no medicine-like word is detected, return
    # an empty list instead of guessing and showing misleading results.
    return []


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract medicine names from prescription image")
    parser.add_argument("image_path", help="Path to prescription image")
    parser.add_argument("--show-text", action="store_true", help="Print raw OCR text for debugging")
    args = parser.parse_args()

    image = Image.open(Path(args.image_path))
    processed_image = _preprocess_image(image)
    raw_text = pytesseract.image_to_string(processed_image, config="--oem 3 --psm 6")
    names = extract_medicine_names(args.image_path)

    output = {"image": args.image_path, "medicines": names}
    if args.show_text:
        output["raw_text"] = raw_text.strip()
    print(output)


if __name__ == "__main__":
    main()
