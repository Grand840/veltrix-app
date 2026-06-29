# Image de base Python 3.12 slim (légère)
FROM python:3.12-slim

# Définir le dossier de travail dans le container
WORKDIR /app

# Copier d'abord requirements.txt seul
# (optimisation cache Docker : si requirements ne change pas,
# Docker ne réinstalle pas les packages à chaque build)
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copier le reste du code
COPY . .

# Port exposé par FastAPI
EXPOSE 8000

# Commande de démarrage avec hot-reload pour le développement
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
# --reload : relance automatiquement si le code change
