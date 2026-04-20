"""Demand predictor prototype for MedLink.

Given medicine names, this script queries MedLink inventory/search endpoints and
returns a simple urgency estimate for restocking decisions.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass, asdict
from typing import Iterable

import requests


@dataclass
class DemandPrediction:
    medicine: str
    weekly_searches: int
    restock_urgency: str


def _urgency_from_inventory(total_quantity: int) -> str:
    if total_quantity <= 10:
        return "HIGH"
    if total_quantity <= 40:
        return "MEDIUM"
    return "LOW"


def _simulated_weekly_searches(total_quantity: int) -> int:
    # MVP heuristic: lower stock implies higher search pressure.
    if total_quantity <= 10:
        return 45
    if total_quantity <= 40:
        return 30
    return 12


def predict_demand(
    medicine_names: Iterable[str],
    base_url: str = "http://127.0.0.1:8000/api",
    token: str | None = None,
) -> list[dict]:
    """Predict demand trends using inventory endpoint snapshots.

    Args:
        medicine_names: Sequence of medicine names.
        base_url: API base URL ending in /api.
        token: Optional JWT token for authenticated inventory access.

    Returns:
        List of dictionaries like:
        [{"medicine": "Amoxicillin", "weekly_searches": 45, "restock_urgency": "HIGH"}]
    """
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    predictions: list[DemandPrediction] = []

    for medicine in medicine_names:
        response = requests.get(
            f"{base_url}/inventory/",
            params={"search": medicine},
            headers=headers,
            timeout=15,
        )
        response.raise_for_status()
        items = response.json()

        if not isinstance(items, list):
            items = []

        total_quantity = 0
        for item in items:
            med_name = str(item.get("medicine", {}).get("name", "")).lower()
            if medicine.lower() in med_name:
                total_quantity += int(item.get("quantity", 0) or 0)

        prediction = DemandPrediction(
            medicine=medicine.title(),
            weekly_searches=_simulated_weekly_searches(total_quantity),
            restock_urgency=_urgency_from_inventory(total_quantity),
        )
        predictions.append(prediction)

    return [asdict(p) for p in predictions]


def main() -> None:
    parser = argparse.ArgumentParser(description="Predict medicine demand from MedLink inventory")
    parser.add_argument("medicines", nargs="+", help="Medicine names to analyze")
    parser.add_argument("--base-url", default="http://127.0.0.1:8000/api", help="API base URL")
    parser.add_argument("--token", default=None, help="Optional JWT access token")
    args = parser.parse_args()

    result = predict_demand(args.medicines, base_url=args.base_url, token=args.token)
    print(result)


if __name__ == "__main__":
    main()
