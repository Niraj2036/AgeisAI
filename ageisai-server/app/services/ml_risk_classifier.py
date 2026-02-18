from typing import Any, Dict, List, Optional

from app.core.risk import RiskLabel, classify_risk


def _confidence_risk(probabilities: List[float]) -> float:
    """1 - max(probability). Higher when model is uncertain."""
    if not probabilities:
        return 0.0
    return 1.0 - max(probabilities)


def _drift_risk(drift_score: float) -> float:
    """Normalize drift score to 0-1 (assume 0-100 range)."""
    return min(1.0, max(0.0, drift_score / 100.0))


def _outlier_risk(
    features: Optional[Dict[str, Any]],
    feature_stats: Optional[Dict[str, Dict[str, float]]],
) -> float:
    """Compute z-score based outlier risk vs feature_stats."""
    if not features or not feature_stats:
        return 0.0
    max_z = 0.0
    for name, value in features.items():
        if name not in feature_stats:
            continue
        stats = feature_stats[name]
        mean = stats.get("mean", 0.0)
        std = stats.get("std", 1.0)
        if std <= 0:
            continue
        try:
            x = float(value)
            z = abs((x - mean) / std)
            max_z = max(max_z, z)
        except (TypeError, ValueError):
            continue
    # Cap: 3+ z-scores -> full risk
    return min(1.0, max_z / 3.0)


def compute_ml_risk(
    prediction: Any,
    probabilities: Optional[List[float]] = None,
    drift_score: float = 0.0,
    feature_stats: Optional[Dict[str, Dict[str, float]]] = None,
    features: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Compute risk for an ML event.
    Returns dict with riskScore, riskLabel, factors.
    """
    probs = probabilities or []
    confidence = _confidence_risk(probs)
    drift = _drift_risk(drift_score)
    outlier = _outlier_risk(features, feature_stats)

    risk_score = 0.4 * confidence + 0.3 * drift + 0.3 * outlier
    risk_score = min(1.0, max(0.0, risk_score))
    risk_label = classify_risk(risk_score)

    return {
        "riskScore": round(risk_score, 4),
        "riskLabel": risk_label.value,
        "factors": {
            "confidence_risk": round(confidence, 4),
            "drift_risk": round(drift, 4),
            "outlier_risk": round(outlier, 4),
        },
    }
