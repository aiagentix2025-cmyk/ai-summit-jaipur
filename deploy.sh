#!/bin/bash
# ============================================================
# AGENTiX — Deploy to aisummitjaipur.aiagentixdev.com
# Run as root on Ubuntu 24.04 VPS
# ============================================================

set -e

DOMAIN="aisummitjaipur.aiagentixdev.com"
REPO="https://github.com/aiagentix2025-cmyk/ai-summit-jaipur.git"
WEBROOT="/var/www/$DOMAIN"

echo "▶ Installing Nginx + Certbot..."
apt-get update -q
apt-get install -y nginx certbot python3-certbot-nginx git

echo "▶ Cloning repo to $WEBROOT..."
rm -rf "$WEBROOT"
git clone "$REPO" "$WEBROOT"
chown -R www-data:www-data "$WEBROOT"
chmod -R 755 "$WEBROOT"

echo "▶ Writing Nginx config..."
cat > /etc/nginx/sites-available/$DOMAIN <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    root $WEBROOT;
    index index.html;

    location / {
        try_files \$uri \$uri/ =404;
    }

    # Cache static assets
    location ~* \.(png|jpg|jpeg|gif|ico|svg|woff2|woff|css|js)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN

echo "▶ Testing Nginx config..."
nginx -t

echo "▶ Reloading Nginx..."
systemctl reload nginx

echo "▶ Getting SSL certificate from Let's Encrypt..."
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email aiagentix2025@gmail.com --redirect

echo ""
echo "✅ DONE! Your site is live at: https://$DOMAIN"
echo ""
