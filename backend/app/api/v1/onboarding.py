from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.database import get_db
from app.models.user import User
from app.models.risk_profile import RiskProfile
from app.models.goal import Goal
from app.schemas.onboarding import RiskProfileRequest, RiskProfileResponse
from app.utils.security import get_current_user
from app.services.risk_engine import calculate_risk_score

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


@router.post("/risk-profile", response_model=RiskProfileResponse)
async def create_risk_profile(
    request: RiskProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Mark previous profiles as not current
    await db.execute(
        update(RiskProfile)
        .where(RiskProfile.user_id == current_user.id, RiskProfile.is_current == True)
        .values(is_current=False)
    )

    # Get version number
    result = await db.execute(
        select(RiskProfile).where(RiskProfile.user_id == current_user.id)
    )
    existing = result.scalars().all()
    version = len(existing) + 1

    # Calculate risk
    risk_score, risk_persona = calculate_risk_score(
        request.age, request.monthly_income, request.savings,
        request.liabilities, request.scenario_responses,
    )

    profile = RiskProfile(
        user_id=current_user.id,
        version=version,
        age=request.age,
        monthly_income=request.monthly_income,
        savings=request.savings,
        liabilities=request.liabilities,
        scenario_responses=request.scenario_responses,
        risk_score=risk_score,
        risk_persona=risk_persona,
        is_current=True,
    )
    db.add(profile)

    # Save goals if provided
    if request.goals:
        for g in request.goals:
            db.add(Goal(
                user_id=current_user.id,
                goal_name=g.get("goal_name", ""),
                target_amount=g.get("target_amount", 0),
                horizon_years=g.get("horizon_years", 1),
            ))

    # Mark onboarding complete
    current_user.onboarding_completed = True
    await db.flush()

    return profile


@router.get("/risk-profile", response_model=RiskProfileResponse | None)
async def get_risk_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(RiskProfile)
        .where(RiskProfile.user_id == current_user.id, RiskProfile.is_current == True)
    )
    return result.scalar_one_or_none()
