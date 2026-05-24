#!/usr/bin/env bash
# Quick recovery when the site looks unstyled or the app won't start.
# Run from project root on the VM: ./deploy/recover-site.sh
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"
SERVICE_NAME="altons-carwash"

echo "==> Recovering site in $APP_DIR"

if [[ ! -f .env ]]; then
  echo "ERROR: .env missing. Copy deploy/.env.production.example to .env first."
  exit 1
fi

echo "==> Dependencies + Prisma..."
npm install --legacy-peer-deps
npx prisma generate
npx prisma db push

echo "==> Clean build..."
rm -rf .next
export NODE_ENV=production
npm run build

echo "==> Restart app..."
sudo systemctl restart "$SERVICE_NAME"
sleep 2
sudo systemctl status "$SERVICE_NAME" --no-pager || true

echo "==> Nginx check..."
sudo nginx -t
sudo systemctl reload nginx

echo ""
echo "If the site still has no styling, check:"
echo "  sudo journalctl -u $SERVICE_NAME -n 50 --no-pager"
echo "  curl -I http://127.0.0.1:3000/"
echo "  curl -I http://127.0.0.1:3000/_next/static/"
echo ""
echo "If HTTPS broke after deploy, re-run:"
echo "  sudo ./deploy/setup-ssl.sh altoncardetail.com"
