import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from app.application.dtos.identity import UserLoginRequest
from app.application.services.auth import AuthService
from app.infrastructure.seed.enterprise_seeder import EnterpriseDataSeeder


@pytest.mark.asyncio
async def test_enterprise_data_seeder(db_session: AsyncSession):
    seed_result = await EnterpriseDataSeeder.seed_demo_organization(db=db_session)
    await db_session.commit()

    assert seed_result["status"] == "seed_complete"
    assert seed_result["organization_id"] is not None

    # Verify admin user can authenticate
    login_res = await AuthService.login_user(
        db=db_session,
        data=UserLoginRequest(
            email="demo_executive@acme-enterprise.com",
            password="DemoEnterprisePass123!",
        ),
    )
    assert login_res.access_token is not None
    assert login_res.user.email == "demo_executive@acme-enterprise.com"
