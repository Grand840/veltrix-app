from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.organization import Organization
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
    MessageResponse,
)
from app.services.auth import register_user, login_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Creer un compte",
)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    try:
        user, token, expires_in = register_user(data, db)
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            expires_in=expires_in,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Se connecter",
)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    try:
        user, token, expires_in = login_user(data, db)
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            expires_in=expires_in,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Mon profil",
)
def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    org = db.query(Organization).filter(
        Organization.id == current_user.organization_id
    ).first()

    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        phone=current_user.phone,
        role=current_user.role.value,
        is_verified=current_user.is_verified,
        organization_id=str(current_user.organization_id),
        organization_name=org.name if org else "N/A",
    )


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Se deconnecter",
)
def logout(current_user: User = Depends(get_current_user)):
    return MessageResponse(
        message="Deconnexion reussie",
        success=True
    )
