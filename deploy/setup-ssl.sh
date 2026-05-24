#!/usr/bin/env bash
# Enable HTTPS with Let's Encrypt (run on the VM after DNS points to this server)
# Usage: sudo ./deploy/setup-ssl.sh yourdomain.com [www.yourdomain.com]
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: sudo ./deploy/setup-ssl.sh yourdomain.com [www.yourdomain.com]"
  echo ""
  echo "Before running:"
  echo "  1. DNS A record for your domain → this VM's external IP"
  echo "  2. GCP firewall allows tcp:80 and tcp:443"
  echo "  3. Site loads at http://yourdomain.com"
  exit 1
fi

DOMAIN="$1"
WWW="${2:-www.$1}"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "==> Checking DNS for $DOMAIN..."
RESOLVED=$(dig +short "$DOMAIN" | tail -n1 || true)
EXTERNAL_IP=$(curl -s -H "Metadata-Flavor: Google" \
  http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip \
  2>/dev/null || true)

if [[ -n "$RESOLVED" && -n "$EXTERNAL_IP" && "$RESOLVED" != "$EXTERNAL_IP" ]]; then
  echo "WARNING: $DOMAIN resolves to $RESOLVED but this VM IP is $EXTERNAL_IP"
  echo "Fix DNS before continuing, or press Ctrl+C."
  read -r -p "Continue anyway? [y/N] " ans
  [[ "${ans,,}" == "y" ]] || exit 1
fi

echo "==> Installing Certbot..."
apt-get update -y
apt-get install -y certbot python3-certbot-nginx

EMAIL="${CERTBOT_EMAIL:-}"
if [[ -z "$EMAIL" ]]; then
  read -r -p "Email for Let's Encrypt renewal notices: " EMAIL
fi

echo "==> Requesting certificate for $DOMAIN and $WWW..."
certbot --nginx -d "$DOMAIN" -d "$WWW" \
  --non-interactive --agree-tos --email "$EMAIL" --redirect

echo "==> Updating NEXTAUTH_URL in .env..."
ENV_FILE="$APP_DIR/.env"
if [[ -f "$ENV_FILE" ]]; then
  if grep -q '^NEXTAUTH_URL=' "$ENV_FILE"; then
    sed -i "s|^NEXTAUTH_URL=.*|NEXTAUTH_URL=\"https://$DOMAIN\"|" "$ENV_FILE"
  else
    echo "NEXTAUTH_URL=\"https://$DOMAIN\"" >> "$ENV_FILE"
  fi
else
  echo "WARNING: $ENV_FILE not found. Set NEXTAUTH_URL=https://$DOMAIN manually."
fi

echo "==> Restarting app..."
systemctl restart altons-carwash
nginx -t && systemctl reload nginx

echo ""
echo "SSL setup complete."
echo "  Site:  https://$DOMAIN"
echo "  Admin: https://$DOMAIN/admin/login"
echo ""
echo "Test renewal: sudo certbot renew --dry-run"
