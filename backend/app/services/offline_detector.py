import asyncio
import logging
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.agent import Agent, AgentStatus
from app.models.user import User, UserRole
from app.models.alert import AlertMetric
from app.services.alerts import create_agent_down_alert, auto_resolve_alert
from app.services.email import send_agent_down_alert

logger = logging.getLogger(__name__)

OFFLINE_THRESHOLD_SECONDS = 120


def check_offline_agents(db: Session) -> dict:
    now = datetime.utcnow()
    threshold = now - timedelta(seconds=OFFLINE_THRESHOLD_SECONDS)

    result = {
        "checked": 0,
        "went_offline": 0,
        "went_online": 0,
        "alerts_created": 0,
        "alerts_resolved": 0,
    }

    agents_to_offline = db.query(Agent).filter(
        Agent.status == AgentStatus.ONLINE,
        Agent.is_active == True,
        Agent.last_seen_at < threshold,
    ).all()

    for agent in agents_to_offline:
        agent.status = AgentStatus.OFFLINE
        agent.updated_at = now
        result["went_offline"] += 1
        result["checked"] += 1
        alert = create_agent_down_alert(agent, db)
        if alert:
            result["alerts_created"] += 1
            logger.warning("Agent offline detecte: " + agent.name + " (last_seen: " + str(agent.last_seen_at) + ")")
            try:
                owner = db.query(User).filter(
                    User.organization_id == agent.organization_id,
                    User.role == UserRole.OWNER,
                    User.is_active == True,
                ).first()
                if owner:
                    last_seen_str = f"il y a plus de {OFFLINE_THRESHOLD_SECONDS // 60} minutes"
                    send_agent_down_alert(
                        to_email=owner.email,
                        full_name=owner.full_name,
                        agent_name=agent.name,
                        hostname=agent.hostname,
                        last_seen_ago=last_seen_str,
                    )
            except Exception as e:
                logger.error(f"Erreur envoi email alerte: {e}")

    agents_back_online = db.query(Agent).filter(
        Agent.status == AgentStatus.ONLINE,
        Agent.is_active == True,
        Agent.last_seen_at >= threshold,
    ).all()

    for agent in agents_back_online:
        resolved = auto_resolve_alert(agent.id, AlertMetric.AGENT_DOWN, db)
        if resolved:
            result["alerts_resolved"] += 1
            result["went_online"] += 1

    db.commit()
    return result


async def offline_detector_loop():
    logger.info("Offline detector demarre (intervalle: 120s)")
    while True:
        await asyncio.sleep(OFFLINE_THRESHOLD_SECONDS)
        db = SessionLocal()
        try:
            result = check_offline_agents(db)
            if result["went_offline"] > 0 or result["alerts_created"] > 0:
                logger.info(
                    f"Offline check: {result['went_offline']} offline, "
                    f"{result['alerts_created']} alertes creees, "
                    f"{result['alerts_resolved']} resolues"
                )
        except Exception as e:
            logger.error(f"Erreur offline detector: {e}")
        finally:
            db.close()

