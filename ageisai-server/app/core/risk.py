from enum import Enum


class RiskLabel(str, Enum):
    NORMAL = "normal"
    SUSPICIOUS = "suspicious"
    RISKY = "risky"


def classify_risk(score: float) -> RiskLabel:
    if score >= 0.75:
        return RiskLabel.RISKY
    elif score >= 0.4:
        return RiskLabel.SUSPICIOUS
    return RiskLabel.NORMAL
