Install-Module -Name Posh-SSH -Force -Scope CurrentUser -ErrorAction SilentlyContinue
Import-Module Posh-SSH

$pass = ConvertTo-SecureString 'AGENTiX@2025' -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential('root', $pass)
$session = New-SSHSession -ComputerName '76.13.250.173' -Credential $cred -AcceptKey -Force

Write-Host "Connected to VPS. Starting deployment..."

$deployScript = @'
export DEBIAN_FRONTEND=noninteractive
DOMAIN="aisummitjaipur.aiagentixdev.com"
REPO="https://github.com/aiagentix2025-cmyk/ai-summit-jaipur.git"
WEBROOT="/var/www/$DOMAIN"

echo "==> Installing Nginx, Git, Certbot..."
apt-get update -q -y
apt-get install -y nginx certbot python3-certbot-nginx git

echo "==> Cloning repo..."
rm -rf "$WEBROOT"
git clone "$REPO" "$WEBROOT"
chown -R www-data:www-data "$WEBROOT"
chmod -R 755 "$WEBROOT"

echo "==> Writing Nginx config..."
cat > /etc/nginx/sites-available/$DOMAIN <<NGINX
server {
    listen 80;
    server_name $DOMAIN;
    root $WEBROOT;
    index index.html;
    location / { try_files \$uri \$uri/ =404; }
    gzip on;
    gzip_types text/plain text/css application/javascript text/xml;
    location ~* \.(png|jpg|jpeg|gif|ico|svg|woff2|css|js)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
NGINX

ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN
nginx -t && systemctl reload nginx

echo "==> Nginx running. Testing HTTP..."
sleep 2
curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN || echo "DNS not propagated yet - site is ready on server"

echo "==> Attempting SSL..."
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email aiagentix2025@gmail.com --redirect 2>&1 || echo "SSL will be available once DNS propagates (usually 5-30 mins)"

echo ""
echo "DEPLOYMENT COMPLETE"
echo "Site: https://$DOMAIN"
echo "Files: $WEBROOT"
'@

$result = Invoke-SSHCommand -SessionId $session.SessionId -Command $deployScript -TimeOut 180
$result.Output
$result.Error

Remove-SSHSession -SessionId $session.SessionId
Write-Host "SSH session closed."
