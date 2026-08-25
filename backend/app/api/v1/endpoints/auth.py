from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.application.dtos.identity import (
    TokenRefreshRequest,
    TokenResponse,
    TwoFactorSetupResponse,
    TwoFactorVerifyRequest,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.application.services.auth import AuthService
from app.core.database import get_db
from app.infrastructure.models.identity import User

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: Request,
    data: UserRegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Register a new user account and provision their initial tenant organization."""
    client_ip = request.client.host if request.client else None
    return await AuthService.register_user(db=db, data=data, ip_address=client_ip)


@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def login(
    request: Request,
    data: UserLoginRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Authenticate with email and password to receive JWT credentials."""
    client_ip = request.client.host if request.client else None
    return await AuthService.login_user(db=db, data=data, ip_address=client_ip)


@router.post("/refresh", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def refresh(
    data: TokenRefreshRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Rotate and refresh an expired or expiring access token."""
    return await AuthService.refresh_tokens(db=db, data=data)


@router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Retrieve current authenticated user profile."""
    return UserResponse.model_validate(current_user)


@router.post("/2fa/setup", response_model=TwoFactorSetupResponse)
async def setup_2fa(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TwoFactorSetupResponse:
    """Generate a 2FA secret and QR provisioning URI."""
    return await AuthService.setup_2fa(db=db, user_id=current_user.id)


@router.post("/2fa/verify", status_code=status.HTTP_200_OK)
async def verify_2fa(
    data: TwoFactorVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Verify and enable Two-Factor Authentication."""
    success = await AuthService.verify_2fa(db=db, user_id=current_user.id, data=data)
    return {"message": "Two-factor authentication enabled successfully.", "verified": success}
