"""
Service email Veltrix — base sur Resend.
Resend : 3 000 emails/mois gratuits, SDK Python officiel.
"""
import logging
from typing import Optional
from app.config import settings

logger = logging.getLogger(__name__)


def _get_resend():
    if not settings.resend_api_key:
        return None
    try:
        import resend
        resend.api_key = settings.resend_api_key
        return resend
    except ImportError:
        logger.warning("Package resend non installe")
        return None


def _send(to: str, subject: str, html: str, text: str = "") -> bool:
    resend = _get_resend()
    if not resend:
        logger.info(f"[EMAIL SKIP] RESEND_API_KEY non configuree - sujet: {subject}")
        return False
    try:
        params = {
            "from": f"{settings.from_name} <{settings.from_email}>",
            "to": [to],
            "subject": subject,
            "html": html,
        }
        if text:
            params["text"] = text
        response = resend.Emails.send(params)
        logger.info(f"[EMAIL OK] {to} - {subject} - id: {response.get('id', 'unknown')}")
        return True
    except Exception as e:
        logger.error(f"[EMAIL ERROR] {to} - {subject} - {e}")
        return False


def _base_template(content: str) -> str:
    return f"""\
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Veltrix</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f8fafc; color: #1e293b; }}
    .wrapper {{ max-width: 600px; margin: 0 auto; padding: 40px 16px; }}
    .card {{ background: #ffffff; border-radius: 16px; padding: 40px;
             border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }}
    .logo {{ display: flex; align-items: center; gap: 10px; margin-bottom: 32px; }}
    .logo-icon {{ width: 36px; height: 36px; background: #2563eb; border-radius: 8px;
                  display: flex; align-items: center; justify-content: center; }}
    .logo-text {{ font-size: 18px; font-weight: 700; color: #1e293b; }}
    h1 {{ font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 12px; }}
    p {{ font-size: 15px; color: #64748b; line-height: 1.6; margin-bottom: 16px; }}
    .btn {{ display: inline-block; background: #2563eb; color: #ffffff !important;
            padding: 12px 28px; border-radius: 10px; font-weight: 600;
            font-size: 14px; text-decoration: none; margin: 8px 0; }}
    .btn:hover {{ background: #1d4ed8; }}
    .divider {{ height: 1px; background: #e2e8f0; margin: 24px 0; }}
    .badge {{ display: inline-block; padding: 4px 12px; border-radius: 99px;
              font-size: 12px; font-weight: 600; margin-bottom: 16px; }}
    .badge-red    {{ background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }}
    .badge-green  {{ background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }}
    .badge-blue   {{ background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }}
    .metric-box {{ background: #f8fafc; border-radius: 10px; padding: 16px;
                   border: 1px solid #e2e8f0; margin: 16px 0; }}
    .metric-label {{ font-size: 12px; color: #94a3b8; font-weight: 500;
                     text-transform: uppercase; letter-spacing: 0.05em; }}
    .metric-value {{ font-size: 28px; font-weight: 700; color: #1e293b; margin-top: 4px; }}
    .footer {{ text-align: center; margin-top: 32px; font-size: 12px; color: #94a3b8; }}
    .footer a {{ color: #64748b; text-decoration: none; }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo">
        <div class="logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
            <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
          </svg>
        </div>
        <span class="logo-text">Veltrix</span>
      </div>
      {content}
    </div>
    <div class="footer">
      <p>(c) 2025 Veltrix . Made in Togo</p>
      <p style="margin-top:4px">
        <a href="https://veltrix.ddns.net">veltrix.ddns.net</a> .
        <a href="mailto:contact@veltrix.io">contact@veltrix.io</a>
      </p>
    </div>
  </div>
</body>
</html>"""


def send_welcome_email(
    to_email: str,
    full_name: Optional[str],
    organization_name: str,
) -> bool:
    name = full_name or to_email.split("@")[0]
    html = _base_template(f"""
      <div class="badge badge-blue">Bienvenue sur Veltrix</div>
      <h1>Bonjour {name} !</h1>
      <p>Votre compte pour <strong>{organization_name}</strong> est pret. Vous beneficiez de <strong>30 jours d'essai gratuit</strong> avec jusqu'a 3 agents de monitoring.</p>
      <div class="divider"></div>
      <p><strong>Pour commencer en 3 etapes :</strong></p>
      <p><span style="font-size:18px">1</span>&nbsp;<strong>Connectez-vous a votre dashboard</strong><br><span style="color:#94a3b8;font-size:14px;margin-left:28px">Accedez a vos metriques en temps reel</span></p>
      <p><span style="font-size:18px">2</span>&nbsp;<strong>Creez votre premier agent</strong><br><span style="color:#94a3b8;font-size:14px;margin-left:28px">Nommez votre serveur et recuperez la cle d'installation</span></p>
      <p><span style="font-size:18px">3</span>&nbsp;<strong>Installez l'agent sur votre serveur</strong><br><span style="color:#94a3b8;font-size:14px;margin-left:28px">Une commande suffit. Metriques disponibles en moins d'une minute.</span></p>
      <div style="text-align:center;margin:28px 0">
        <a href="https://veltrix.ddns.net/dashboard" class="btn">Acceder a mon dashboard &rarr;</a>
      </div>
      <div class="divider"></div>
      <p style="font-size:13px;color:#94a3b8">Des questions ? Repondez directement a cet email ou contactez-nous a <a href="mailto:contact@veltrix.io" style="color:#2563eb">contact@veltrix.io</a></p>
    """)
    text = f"Bonjour {name} !\n\nVotre compte Veltrix pour {organization_name} est pret.\n\nPour commencer :\n1. Connectez-vous : https://veltrix.ddns.net/dashboard\n2. Creez votre premier agent\n3. Installez l'agent sur votre serveur\n\nDes questions ? contact@veltrix.io"
    return _send(to=to_email, subject=f"Bienvenue sur Veltrix, {name} !", html=html, text=text)


def send_agent_down_alert(
    to_email: str,
    full_name: Optional[str],
    agent_name: str,
    hostname: Optional[str],
    last_seen_ago: str,
    dashboard_url: str = "https://veltrix.ddns.net/dashboard",
) -> bool:
    name = full_name or to_email.split("@")[0]
    host_info = f" ({hostname})" if hostname else ""
    html = _base_template(f"""
      <div class="badge badge-red">Agent hors ligne</div>
      <h1>Alerte : {agent_name} ne repond plus</h1>
      <p>Bonjour {name}, l'agent <strong>{agent_name}</strong>{host_info} n'a pas envoye de metriques depuis <strong>{last_seen_ago}</strong>.</p>
      <div class="metric-box">
        <div class="metric-label">Agent concerne</div>
        <div class="metric-value" style="font-size:18px">{agent_name}</div>
        {f'<div style="color:#94a3b8;font-size:13px;margin-top:4px">{hostname}</div>' if hostname else ""}
      </div>
      <p><strong>Causes possibles :</strong></p>
      <ul style="font-size:14px;color:#64748b;padding-left:20px;line-height:2">
        <li>Le serveur est eteint ou redemarre</li>
        <li>Probleme reseau entre le serveur et Veltrix</li>
        <li>L'agent Go a plante (redemarrer avec systemctl restart veltrix-agent)</li>
      </ul>
      <div style="text-align:center;margin:28px 0">
        <a href="{dashboard_url}" class="btn">Voir le dashboard &rarr;</a>
      </div>
      <div class="divider"></div>
      <p style="font-size:12px;color:#94a3b8">Cette alerte sera automatiquement resolue quand l'agent se reconnectera.</p>
    """)
    text = f"Alerte Veltrix - Agent hors ligne\n\n{agent_name}{host_info} n'a pas repondu depuis {last_seen_ago}.\n\nDashboard : {dashboard_url}"
    return _send(to=to_email, subject=f"Alerte : {agent_name} hors ligne - Veltrix", html=html, text=text)


def send_metric_alert(
    to_email: str,
    full_name: Optional[str],
    agent_name: str,
    metric_label: str,
    current_value: float,
    threshold_value: float,
    severity: str,
    dashboard_url: str = "https://veltrix.ddns.net/dashboard",
) -> bool:
    name = full_name or to_email.split("@")[0]
    emoji = "CRITICAL" if severity == "critical" else "WARNING"
    badge_class = "badge-red" if severity == "critical" else "badge-blue"
    color = "#dc2626" if severity == "critical" else "#d97706"
    html = _base_template(f"""
      <div class="badge {badge_class}">{emoji} Alerte {severity}</div>
      <h1>{metric_label} eleve sur {agent_name}</h1>
      <p>Bonjour {name}, un seuil d'alerte a ete declenche sur <strong>{agent_name}</strong>.</p>
      <div class="metric-box" style="border-color:{color};background:#fefefe">
        <div class="metric-label">{metric_label} actuel</div>
        <div class="metric-value" style="color:{color}">{current_value:.1f}%</div>
        <div style="color:#94a3b8;font-size:13px;margin-top:4px">Seuil {severity} : {threshold_value:.0f}%</div>
      </div>
      <div style="text-align:center;margin:28px 0">
        <a href="{dashboard_url}" class="btn">Voir le dashboard &rarr;</a>
      </div>
      <div class="divider"></div>
      <p style="font-size:12px;color:#94a3b8">Cette alerte sera resolue automatiquement quand la valeur redescend sous le seuil.</p>
    """)
    text = f"{emoji} Alerte Veltrix - {metric_label} eleve\n\nAgent : {agent_name}\n{metric_label} actuel : {current_value:.1f}%\nSeuil {severity} : {threshold_value:.0f}%\n\nDashboard : {dashboard_url}"
    return _send(to=to_email, subject=f"{emoji} {metric_label} a {current_value:.0f}% sur {agent_name} - Veltrix", html=html, text=text)


def send_daily_report(
    to_email: str,
    full_name: Optional[str],
    agents_online: int,
    agents_total: int,
    alerts_today: int,
    dashboard_url: str = "https://veltrix.ddns.net/dashboard",
) -> bool:
    name = full_name or to_email.split("@")[0]
    health_emoji = "OK" if agents_online == agents_total and alerts_today == 0 else "ATTENTION"
    html = _base_template(f"""
      <div class="badge badge-blue">Rapport quotidien</div>
      <h1>{health_emoji} Resume de votre infrastructure</h1>
      <p>Bonjour {name}, voici votre resume Veltrix du jour.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:24px 0">
        <div class="metric-box" style="text-align:center">
          <div class="metric-label">En ligne</div>
          <div class="metric-value" style="color:#16a34a">{agents_online}</div>
        </div>
        <div class="metric-box" style="text-align:center">
          <div class="metric-label">Total agents</div>
          <div class="metric-value">{agents_total}</div>
        </div>
        <div class="metric-box" style="text-align:center">
          <div class="metric-label">Alertes</div>
          <div class="metric-value" style="color:{"#dc2626" if alerts_today > 0 else "#16a34a"}">{alerts_today}</div>
        </div>
      </div>
      <div style="text-align:center;margin:24px 0">
        <a href="{dashboard_url}" class="btn">Voir le dashboard &rarr;</a>
      </div>
    """)
    return _send(to=to_email, subject=f"{health_emoji} Rapport Veltrix - {agents_online}/{agents_total} agents en ligne", html=html)
