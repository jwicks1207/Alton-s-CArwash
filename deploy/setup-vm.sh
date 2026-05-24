#!/usr/bin/env bash
# Run once on a fresh Ubuntu 22.04 VM (as a user with sudo)
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/altons-carwash}"

echo "==> Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

echo "==> Installing Node.js 20..."
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "==> Installing Nginx and Certbot..."
sudo apt-get install -y nginx certbot python3-certbot-nginx

echo "==> Creating app directory: $APP_DIR"
sudo mkdir -p "$APP_DIR"
sudo chown -R "$USER:$USER" /var/www

echo "==> Enabling services..."
sudo systemctl enable nginx

echo ""
echo "Setup complete."
echo "Next steps:"
echo "  1. Place project files in $APP_DIR"
echo "  2. cp deploy/.env.production.example .env && nano .env"
echo "  3. ./deploy/deploy.sh"
