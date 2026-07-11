"""
Router beta — Gestion des candidatures au programme beta.
"""
from fastapi import APIRouter
from pydantic import BaseModel, EmailStr
from typing import Optional
import logging

from app.services.email import _send, _base_template
from app.config import settings

router = APIRouter(prefix="/beta", tags=["Beta"])
logger = logging.getLogger(__name__)


class BetaSignupRequest(BaseModel):
    full_name: str
    email: EmailStr
    company: Optional[str] = None
    use_case: str
    nb_servers: Optional[str] = None
    how_heard: Optional[str] = None
    message: Optional[str] = None


@router.post("/signup", summary="Candidature programme beta")
def beta_signup(data: BetaSignupRequest):
    admin_email = "younoustchao@gmail.com"

    admin_html = _base_template(f"""
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin-bottom:24px">
        <p style="font-weight:700;color:#1e40af;margin:0">&#128640; Nouvelle candidature Beta Veltrix !</p>
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:8px 0;color:#94a3b8;width:140px">Nom</td>
            <td style="padding:8px 0;font-weight:600">{data.full_name}</td></tr>
        <tr><td style="padding:8px 0;color:#94a3b8">Email</td>
            <td style="padding:8px 0"><a href="mailto:{data.email}">{data.email}</a></td></tr>
        <tr><td style="padding:8px 0;color:#94a3b8">Entreprise</td>
            <td style="padding:8px 0">{data.company or "&mdash;"}</td></tr>
        <tr><td style="padding:8px 0;color:#94a3b8">Cas d usage</td>
            <td style="padding:8px 0">{data.use_case}</td></tr>
        <tr><td style="padding:8px 0;color:#94a3b8">Nb serveurs</td>
            <td style="padding:8px 0">{data.nb_servers or "&mdash;"}</td></tr>
        <tr><td style="padding:8px 0;color:#94a3b8">Via</td>
            <td style="padding:8px 0">{data.how_heard or "&mdash;"}</td></tr>
      </table>

      {f'<div style="background:#f8fafc;border-radius:8px;padding:12px;margin-top:16px"><p style="color:#64748b;font-size:14px;margin:0"><strong>Message :</strong> {data.message}</p></div>' if data.message else ""}

      <div style="margin-top:24px;text-align:center">
        <a href="mailto:{data.email}?subject=Bienvenue dans le programme beta Veltrix&body=Bonjour {data.full_name},"
           style="display:inline-block;background:#2563eb;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
          Repondre a {data.full_name} &rarr;
        </a>
      </div>
    """)

    _send(
        to=admin_email,
        subject=f"Beta Veltrix — {data.full_name} ({data.email})",
        html=admin_html,
    )

    confirm_html = _base_template(f"""
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:24px">
        <p style="font-weight:700;color:#15803d;margin:0">&#9989; Candidature recue !</p>
      </div>

      <h1 style="font-size:20px;color:#1e293b">Bonjour {data.full_name} !</h1>

      <p>Merci d avoir postule au programme beta de Veltrix.
      Votre candidature a bien ete recue.</p>

      <p>Nous vous contacterons <strong>sous 48 heures</strong> pour vous donner
      acces avec <strong>60 jours d essai gratuit</strong>.</p>

      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:20px 0">
        <p style="font-weight:600;color:#1e293b;margin-bottom:8px">
          En attendant, vous pouvez deja :
        </p>
        <ul style="color:#64748b;font-size:14px;padding-left:20px;line-height:2">
          <li>Creer un compte gratuit (3 agents, 30 jours)</li>
          <li>Installer l agent sur votre serveur</li>
          <li>Explorer le dashboard</li>
        </ul>
      </div>

      <div style="text-align:center;margin:24px 0">
        <a href="https://veltrix.ddns.net/register"
           style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">
          Creer mon compte gratuit &rarr;
        </a>
      </div>

      <p style="font-size:13px;color:#94a3b8">
        Des questions ? Repondez directement a cet email ou ecrivez a
        <a href="mailto:contact@veltrix.io" style="color:#2563eb">contact@veltrix.io</a>
      </p>
    """)

    _send(
        to=data.email,
        subject="Candidature beta Veltrix recue — reponse sous 48h 🚀",
        html=confirm_html,
    )

    logger.info(f"Beta signup: {data.email} — {data.use_case}")
    return {"success": True, "message": "Candidature recue"}
