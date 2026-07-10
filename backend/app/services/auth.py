import secrets
import re
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import settings
from app.models.organization import Organization, PlanType
from app.models.user import User, UserRole
from app.schemas.auth import RegisterRequest, LoginRequest
from app.services.email import send_welcome_email


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_slug(name: str) -> str:
    slug = name.lower()
    slug = re.sub(r"[àáâãäå]", "a", slug)
    slug = re.sub(r"[èéêë]", "e", slug)
    slug = re.sub(r"[ìíîï]", "i", slug)
    slug = re.sub(r"[òóôõö]", "o", slug)
    slug = re.sub(r"[ùúûü]", "u", slug)
    slug = re.sub(r"[ç]", "c", slug)
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"[\s-]+", "-", slug).strip("-")
    return slug


def make_unique_slug(name: str, db: Session) -> str:
    base_slug = create_slug(name)
    slug = base_slug
    counter = 2
    while db.query(Organization).filter(Organization.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1
    return slug


def create_access_token(user_id: str, organization_id: str) -> tuple[str, int]:
    expires_delta = timedelta(minutes=settings.access_token_expire_minutes)
    expire = datetime.utcnow() + expires_delta

    payload = {
        "sub": str(user_id),
        "org": str(organization_id),
        "exp": expire,
        "iat": datetime.utcnow(),
    }

    token = jwt.encode(
        payload,
        settings.secret_key,
        algorithm=settings.algorithm
    )
    return token, int(expires_delta.total_seconds())


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm]
        )
        return payload
    except JWTError:
        return None


def register_user(data: RegisterRequest, db: Session) -> tuple[User, str, int]:
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise ValueError("Un compte existe deja avec cet email")

    slug = make_unique_slug(data.organization_name, db)
    org = Organization(
        name=data.organization_name,
        slug=slug,
        plan=PlanType.FREE,
        max_agents=3,
        is_active=True,
        trial_ends_at=datetime.utcnow() + timedelta(days=30),
    )
    db.add(org)
    db.flush()

    user = User(
        email=data.email.lower(),
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        phone=data.phone,
        role=UserRole.OWNER,
        is_active=True,
        is_verified=False,
        organization_id=org.id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    db.refresh(org)

    try:
        send_welcome_email(to_email=user.email, full_name=user.full_name,
                          organization_name=org.name)
    except Exception:
        pass

    token, expires_in = create_access_token(str(user.id), str(org.id))
    return user, token, expires_in


def login_user(data: LoginRequest, db: Session) -> tuple[User, str, int]:
    generic_error = "Email ou mot de passe incorrect"

    user = db.query(User).filter(
        User.email == data.email.lower()
    ).first()

    if not user:
        raise ValueError(generic_error)

    if not verify_password(data.password, user.hashed_password):
        raise ValueError(generic_error)

    if not user.is_active:
        raise ValueError("Ce compte a ete desactive. Contactez le support.")

    token, expires_in = create_access_token(str(user.id), str(user.organization_id))
    return user, token, expires_in
