from pydantic import BaseModel
from typing import Optional, Dict
from uuid import UUID


class RiskProfileRequest(BaseModel):
    age: Optional[int] = None
    monthly_income: Optional[float] = None
    savings: Optional[float] = None
    liabilities: Optional[float] = None
    scenario_responses: Optional[Dict[str, int]] = None
    goals: Optional[list[dict]] = None


class RiskProfileResponse(BaseModel):
    id: UUID
    version: int
    age: Optional[int] = None
    monthly_income: Optional[float] = None
    savings: Optional[float] = None
    liabilities: Optional[float] = None
    scenario_responses: Optional[Dict[str, int]] = None
    risk_score: Optional[int] = None
    risk_persona: Optional[str] = None
    is_current: bool

    model_config = {"from_attributes": True}
