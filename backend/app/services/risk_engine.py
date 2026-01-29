"""Weighted risk scoring engine."""


def calculate_risk_score(
    age: int | None,
    monthly_income: float | None,
    savings: float | None,
    liabilities: float | None,
    scenario_responses: dict | None,
) -> tuple[int, str]:
    """Calculate risk score (1-10) and persona from onboarding data."""
    score = 5.0  # neutral baseline

    # Age factor (weight: 20%)
    if age is not None:
        if age < 25:
            score += 1.0
        elif age < 35:
            score += 0.5
        elif age < 45:
            score += 0.0
        elif age < 55:
            score -= 0.5
        else:
            score -= 1.0

    # Income vs liabilities ratio (weight: 20%)
    if monthly_income and monthly_income > 0:
        liability_ratio = (liabilities or 0) / (monthly_income * 12)
        if liability_ratio < 0.2:
            score += 1.0
        elif liability_ratio < 0.5:
            score += 0.5
        elif liability_ratio < 1.0:
            score -= 0.5
        else:
            score -= 1.0

    # Savings buffer (weight: 15%)
    if monthly_income and monthly_income > 0 and savings:
        months_buffer = savings / monthly_income
        if months_buffer > 12:
            score += 0.75
        elif months_buffer > 6:
            score += 0.25
        elif months_buffer < 3:
            score -= 0.75

    # Scenario responses (weight: 45%)
    if scenario_responses:
        scenario_scores = list(scenario_responses.values())
        if scenario_scores:
            avg_scenario = sum(scenario_scores) / len(scenario_scores)
            # Scenario answers are on 1-5 scale (1=conservative, 5=aggressive)
            score += (avg_scenario - 3) * 0.9

    # Clamp to 1-10
    final_score = max(1, min(10, round(score)))

    # Determine persona
    if final_score <= 2:
        persona = "Conservative"
    elif final_score <= 4:
        persona = "Moderate Conservative"
    elif final_score <= 6:
        persona = "Moderate"
    elif final_score <= 8:
        persona = "Moderate Aggressive"
    else:
        persona = "Aggressive"

    return final_score, persona
