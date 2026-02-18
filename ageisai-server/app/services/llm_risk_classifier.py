import re
from typing import List


# Sensitive patterns (case-insensitive)
SENSITIVE_PATTERNS = [
    r"\bpassword\b",
    r"\bapi\s*key\b",
    r"\bsecret\b",
    r"\bdatabase\s*access\b",
    r"\bprivate\s*data\b",
    r"\bcredentials\b",
]

# Jailbreak / safety bypass patterns
JAILBREAK_PATTERNS = [
    r"ignore\s+(previous|all)\s+instructions",
    r"act\s+as\s+(system|admin)",
    r"bypass\s+safety",
    r"developer\s+mode",
]

_sensitive_re = re.compile("|".join(f"(?:{p})" for p in SENSITIVE_PATTERNS), re.IGNORECASE)
_jailbreak_re = re.compile("|".join(f"(?:{p})" for p in JAILBREAK_PATTERNS), re.IGNORECASE)


def _pattern_score(text: str, pattern: re.Pattern, max_matches: int = 5) -> float:
    """Return score in [0, 1] based on number of pattern matches."""
    if not text:
        return 0.0
    matches = pattern.findall(text)
    count = min(len(matches), max_matches)
    return min(1.0, count / max_matches)


def compute_llm_risk(prompt: str, response: str = "") -> dict:
    """
    Compute risk for an LLM event from prompt and response.
    Returns dict with riskScore, riskLabel, flags.
    """
    combined = f"{prompt}\n{response}"
    flags: List[str] = []

    sensitive_matches = _sensitive_re.findall(combined)
    sensitive_count = len(sensitive_matches) if sensitive_matches else 0
    sensitive_score = min(1.0, sensitive_count / 5.0)
    if sensitive_count:
        flags.append("sensitive_content")

    jailbreak_matches = _jailbreak_re.findall(combined)
    jailbreak_count = len(jailbreak_matches) if jailbreak_matches else 0
    jailbreak_score = min(1.0, jailbreak_count / 5.0)
    if jailbreak_count:
        flags.append("jailbreak_pattern")

    length_risk = min(1.0, len(prompt) / 2000.0)
    if length_risk >= 0.8:
        flags.append("long_prompt")

    risk_score = 0.5 * sensitive_score + 0.3 * jailbreak_score + 0.2 * length_risk
    risk_score = min(1.0, max(0.0, risk_score))

    from app.core.risk import classify_risk

    risk_label = classify_risk(risk_score)

    return {
        "riskScore": round(risk_score, 4),
        "riskLabel": risk_label.value,
        "flags": flags,
    }
