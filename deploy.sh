#!/bin/bash

# Webinar Bridge Deployment Script
# Usage: sudo bash deploy.sh [domain] [ssl_email]
# Example: sudo bash deploy.sh bridge.thecashflowacademy.com admin@thecashflowacademy.com

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=${1:-"bridge.thecashflowacademy.com"}
SSL_EMAIL=${2:-"admin@thecashflowacademy.com"}
PROJECT_DIR="/var/www/webinar-bridge"
SERVICE_NAME="webinar-bridge"
API_PORT="3001"

echo -e "${BLUE}🚀 Starting Webinar Bridge Deployment${NC}"
echo -e "${YELLOW}Domain: ${DOMAIN}${NC}"
echo -e "${YELLOW}SSL Email: ${SSL_EMAIL}${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (use sudo)"
fi

# Update system packages
echo -e "${BLUE}📦 Updating system packages...${NC}"
apt update && apt upgrade -y
print_status "System updated"

# Install required packages
echo -e "${BLUE}📋 Installing dependencies...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs postgresql-client certbot python3-certbot-apache git
print_status "Dependencies installed"

# Verify installations
node_version=$(node --version)
npm_version=$(npm --version)
print_status "Node.js $node_version and npm $npm_version installed"

# Create project directory
echo -e "${BLUE}📁 Setting up project structure...${NC}"
mkdir -p $PROJECT_DIR/{backend,frontend,generated,logs,database}
cd $PROJECT_DIR
print_status "Project directory created"

# Copy application files from current directory
echo -e "${BLUE}📂 Copying application files...${NC}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cp -r $SCRIPT_DIR/* ./ 2>/dev/null || echo "Copying from script directory"
print_status "Application files copied"

# Set ownership and permissions
chown -R www-data:www-data $PROJECT_DIR
chmod -R 755 $PROJECT_DIR
chmod -R 766 $PROJECT_DIR/logs
chmod -R 766 $PROJECT_DIR/database
chmod -R 766 $PROJECT_DIR/generated
print_status "Permissions set"

# Install backend dependencies
echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
cd $PROJECT_DIR/backend
if [ -f "package.json" ]; then
    npm install --production
    print_status "Backend dependencies installed"
else
    print_error "package.json not found in backend directory"
fi

# Install frontend dependencies and build
echo -e "${BLUE}🏗️  Building frontend...${NC}"
cd $PROJECT_DIR/frontend
if [ -f "package.json" ]; then
    npm install
    npm run build
    print_status "Frontend built successfully"
else
    print_error "package.json not found in frontend directory"
fi

# Initialize database
echo -e "${BLUE}🗄️  Setting up database connection...${NC}"
cd $PROJECT_DIR

# Create .env file for backend with PostgreSQL configuration
cat > backend/.env << 'ENVEOF'
NODE_ENV=production
PORT=3001
JWT_SECRET=$(openssl rand -base64 32)
DB_HOST=198.199.69.39
DB_PORT=5432
DB_NAME=webinar_bridge
DB_USER=postgres
DB_PASSWORD=your_postgresql_password_here
DB_SSL=false
CORS_ORIGIN=https://bridge.thecashflowacademy.com
ENVEOF

echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Update the DB_PASSWORD in backend/.env with your actual PostgreSQL password${NC}"
echo -e "${YELLOW}⚠️  Then run the following commands on your PostgreSQL server (198.199.69.39):${NC}"
echo -e "${YELLOW}   1. psql -U postgres -d webinar_bridge -f database/init.sql${NC}"
echo -e "${YELLOW}   2. cd ${PROJECT_DIR} && source backend/.env && node database/create-admin.js${NC}"
echo ""
print_status "Database configuration created"

# Create systemd service
echo -e "${BLUE}⚙️  Creating systemd service...${NC}"
cat > /etc/systemd/system/${SERVICE_NAME}.service << EOF
[Unit]
Description=Webinar Bridge API Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=${PROJECT_DIR}/backend
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=5
EnvironmentFile=${PROJECT_DIR}/backend/.env

# Logging
StandardOutput=append:${PROJECT_DIR}/logs/api.log
StandardError=append:${PROJECT_DIR}/logs/api-error.log

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable $SERVICE_NAME
systemctl start $SERVICE_NAME
print_status "Systemd service created and started"

# Configure Apache virtual host
echo -e "${BLUE}🌐 Configuring Apache virtual host...${NC}"
a2enmod rewrite proxy proxy_http ssl headers

cat > /etc/apache2/sites-available/${DOMAIN}.conf << EOF
<VirtualHost *:80>
    ServerName ${DOMAIN}
    DocumentRoot ${PROJECT_DIR}/frontend/dist
    
    # Redirect API calls to Node.js backend
    ProxyPreserveHost On
    ProxyPass /api/ http://localhost:${API_PORT}/api/
    ProxyPassReverse /api/ http://localhost:${API_PORT}/api/
    
    # Serve static generated forms
    Alias /forms ${PROJECT_DIR}/generated
    <Directory "${PROJECT_DIR}/generated">
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>
    
    # Frontend files
    <Directory "${PROJECT_DIR}/frontend/dist">
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Handle React routing
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    ErrorLog \${APACHE_LOG_DIR}/${DOMAIN}-error.log
    CustomLog \${APACHE_LOG_DIR}/${DOMAIN}-access.log combined
</VirtualHost>
EOF

a2ensite ${DOMAIN}.conf
systemctl reload apache2
print_status "Apache virtual host configured"

# Get SSL certificate
echo -e "${BLUE}🔒 Obtaining SSL certificate...${NC}"
certbot --apache -d ${DOMAIN} --email ${SSL_EMAIL} --agree-tos --non-interactive --redirect
print_status "SSL certificate obtained"

# Final status check
echo -e "${BLUE}🔍 Checking service status...${NC}"
if systemctl is-active --quiet $SERVICE_NAME; then
    print_status "Webinar Bridge API is running"
else
    print_error "Webinar Bridge API failed to start"
fi

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo -e "   • Domain: https://${DOMAIN}"
echo -e "   • API Port: ${API_PORT}"
echo -e "   • Project Directory: ${PROJECT_DIR}"
echo -e "   • Service: ${SERVICE_NAME}"
echo ""
echo -e "${YELLOW}📚 Access your admin panel at: https://${DOMAIN}${NC}"