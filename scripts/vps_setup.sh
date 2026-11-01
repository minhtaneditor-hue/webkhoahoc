#!/bin/bash
# VPS Setup Script for Next.js
apt update && apt upgrade -y
apt install -y curl wget git build-essential nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2
# Configure Nginx
cat > /etc/nginx/sites-available/nextjs <<EON
server {
    listen 80;
    server_name 103.97.126.54;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EON
ln -sf /etc/nginx/sites-available/nextjs /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl restart nginx
ufw allow 2018/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
