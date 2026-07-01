"""
Tests automatises — Authentification (register, login, /me, securite)
"""
import pytest


class TestRegister:
    """Tests de l'endpoint POST /api/v1/auth/register"""

    def test_register_success(self, client):
        """Inscription valide → 201 + token JWT"""
        response = client.post("/api/v1/auth/register", json={
            "email": "new@veltrix.io",
            "password": "ValidPass1",
            "full_name": "New User",
            "organization_name": "New Org",
        })
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["expires_in"] > 0
        assert len(data["access_token"].split(".")) == 3

    def test_register_duplicate_email(self, client, registered_user):
        """Email deja utilise → 400"""
        response = client.post("/api/v1/auth/register", json={
            "email": registered_user["email"],
            "password": "AnotherPass1",
            "organization_name": "Another Org",
        })
        assert response.status_code == 400
        assert "deja" in response.json()["detail"].lower()

    def test_register_weak_password_too_short(self, client):
        """Mot de passe trop court → 422"""
        response = client.post("/api/v1/auth/register", json={
            "email": "weak@test.io",
            "password": "abc",
            "organization_name": "Test",
        })
        assert response.status_code == 422

    def test_register_weak_password_no_uppercase(self, client):
        """Mot de passe sans majuscule → 422"""
        response = client.post("/api/v1/auth/register", json={
            "email": "weak2@test.io",
            "password": "nouppercase1",
            "organization_name": "Test",
        })
        assert response.status_code == 422

    def test_register_weak_password_no_digit(self, client):
        """Mot de passe sans chiffre → 422"""
        response = client.post("/api/v1/auth/register", json={
            "email": "weak3@test.io",
            "password": "NoDigitHere",
            "organization_name": "Test",
        })
        assert response.status_code == 422

    def test_register_invalid_email(self, client):
        """Email invalide → 422"""
        response = client.post("/api/v1/auth/register", json={
            "email": "pas-un-email",
            "password": "ValidPass1",
            "organization_name": "Test",
        })
        assert response.status_code == 422

    def test_register_creates_organization(self, client):
        """L'inscription cree automatiquement une organisation"""
        response = client.post("/api/v1/auth/register", json={
            "email": "orgtest@veltrix.io",
            "password": "OrgTest123",
            "organization_name": "Mon Entreprise Test",
        })
        assert response.status_code == 201
        token = response.json()["access_token"]

        me_resp = client.get("/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"})
        assert me_resp.status_code == 200
        assert me_resp.json()["organization_name"] == "Mon Entreprise Test"
        assert me_resp.json()["role"] == "owner"


class TestLogin:
    """Tests de l'endpoint POST /api/v1/auth/login"""

    def test_login_success(self, client, registered_user):
        """Login valide → 200 + token"""
        response = client.post("/api/v1/auth/login", json={
            "email": registered_user["email"],
            "password": registered_user["password"],
        })
        assert response.status_code == 200
        assert "access_token" in response.json()

    def test_login_wrong_password(self, client, registered_user):
        """Mauvais mot de passe → 401 avec message generique"""
        response = client.post("/api/v1/auth/login", json={
            "email": registered_user["email"],
            "password": "WrongPass1",
        })
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()

    def test_login_unknown_email(self, client):
        """Email inconnu → 401 avec MEME message (anti-enumeration)"""
        response = client.post("/api/v1/auth/login", json={
            "email": "nonexistent@veltrix.io",
            "password": "SomePass1",
        })
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()

    def test_login_error_messages_identical(self, client, registered_user):
        """Message d'erreur identique pour email inconnu et mauvais mdp"""
        wrong_pass = client.post("/api/v1/auth/login", json={
            "email": registered_user["email"],
            "password": "WrongPass99",
        })
        unknown_email = client.post("/api/v1/auth/login", json={
            "email": "nobody@veltrix.io",
            "password": "WrongPass99",
        })
        assert wrong_pass.json()["detail"] == unknown_email.json()["detail"]


class TestGetMe:
    """Tests de l'endpoint GET /api/v1/auth/me"""

    def test_get_me_authenticated(self, client, registered_user, auth_headers):
        """Token valide → profil utilisateur"""
        response = client.get("/api/v1/auth/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == registered_user["email"]
        assert "hashed_password" not in data
        assert "id" in data
        assert "organization_id" in data

    def test_get_me_no_token(self, client):
        """Sans token → 403"""
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 403

    def test_get_me_invalid_token(self, client):
        """Token invalide → 401"""
        response = client.get("/api/v1/auth/me",
            headers={"Authorization": "Bearer token_bidon_ici"})
        assert response.status_code == 401

    def test_get_me_never_exposes_password(self, client, auth_headers):
        """Le hash du mot de passe ne doit jamais apparaitre dans la reponse"""
        response = client.get("/api/v1/auth/me", headers=auth_headers)
        response_text = response.text
        assert "hashed_password" not in response_text
        assert "$2b$" not in response_text
