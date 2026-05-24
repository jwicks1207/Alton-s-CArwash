#!/usr/bin/env bash
# Build and deploy (run from project root on the VM)
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

SERVICE_NAME="altons-carwash"
NODE_ENV="${NODE_ENV:-production}"

echo "==> Deploying from $APP_DIR"

if [[ ! -f .env ]]; then
  echo "ERROR: .env not found. Copy deploy/.env.production.example to .env and configure it."
  exit 1
fi

echo "==> Installing dependencies..."
npm install --legacy-peer-deps

echo "==> Database setup..."
npx prisma generate
npx prisma db push
npm run db:seed || true

echo "==> Building Next.js..."
export NODE_ENV=production
npm run build

DEPLOY_USER="$(whoami)"

echo "==> Installing systemd service..."
sudo cp deploy/altons-carwash.service /etc/systemd/system/
sudo sed -i "s|/var/www/altons-carwash|$APP_DIR|g" /etc/systemd/system/${SERVICE_NAME}.service
sudo sed -i "s|User=www-data|User=$DEPLOY_USER|g" /etc/systemd/system/${SERVICE_NAME}.service
sudo sed -i "s|Group=www-data|Group=$DEPLOY_USER|g" /etc/systemd/system/${SERVICE_NAME}.service
sudo systemctl daemon-reload
sudo systemctl enable "$SERVICE_NAME"
sudo systemctl restart "$SERVICE_NAME"

echo "==> Configuring Nginx..."
sudo cp deploy/nginx-altons-carwash.conf /etc/nginx/sites-available/altons-carwash
sudo sed -i "s|/var/www/altons-carwash|$APP_DIR|g" /etc/nginx/sites-available/altons-carwash
sudo ln -sf /etc/nginx/sites-available/altons-carwash /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

echo ""
echo "Deploy complete."
echo "  App:  sudo systemctl status $SERVICE_NAME"
echo "  Logs: sudo journalctl -u $SERVICE_NAME -f"
echo ""
echo "Open http://$(curl -s -H Metadata-Flavor:Google http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip 2>/dev/null || echo 'YOUR_VM_IP')"
