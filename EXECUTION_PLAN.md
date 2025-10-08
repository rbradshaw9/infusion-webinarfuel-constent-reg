# Webinar Bridge - Final Execution Plan

**Goal**: Get the app fully working on production + setup local dev environment.

---

## CURRENT STATE ANALYSIS

### ✅ What's Already Done
1. **GitHub Repository**: Code is in `rbradshaw9/infusion-webinarfuel-constent-reg`
2. **Database Server (198.199.69.39)**: 
   - PostgreSQL 14 installed and running
   - Database `webinar_bridge` created
   - Tables `users` and `forms` created via init.sql
   - Remote access configured (listen on all IPs, pg_hba.conf allows connections)
   - Password: CiR43Tx2-
3. **Web Server (mailwizz-tcfa)**:
   - Ubuntu 22.04, Apache with SSL
   - Domain: bridge.thecashflowacademy.com (SSL configured)
   - Code deployed to: /var/www/webinar-bridge
   - Backend dependencies installed (npm install completed)
   - Backend .env file has DB password set
4. **Codebase**:
   - Backend: Node.js + Express + PostgreSQL (via pg driver)
   - Frontend: React + Tailwind CSS
   - All code fixes committed and pushed (DB singleton, Forms API aligned with schema)

### ❌ What's NOT Done
1. Admin user not created in database
2. Backend service (webinar-bridge) not started/enabled
3. Frontend not built for production
4. Apache not serving the frontend build
5. Local dev environment not set up on your Mac

---

## EXECUTION STEPS - PRODUCTION FIRST

### Step 1: Pull Latest Code on Server
SSH to mailwizz-tcfa and run:
```bash
cd /var/www/webinar-bridge
git reset --hard HEAD
git clean -fd
git pull origin main
```

### Step 2: Create Admin User
```bash
cd /var/www/webinar-bridge/backend
node ../database/create-admin.js
```
Expected output: "✅ Default admin user created successfully"

If it fails with "Cannot find module", the script will try to load bcryptjs from backend/node_modules.
If still failing, run: `npm install` again in backend/

### Step 3: Build Frontend
```bash
cd /var/www/webinar-bridge/frontend
npm install
npm run build
```
This creates `frontend/build/` directory with production React app.

### Step 4: Update Apache to Serve Frontend
The Apache vhost needs to:
- Serve frontend/build/ as DocumentRoot
- Proxy /api/* to backend on port 3001
- Handle React routing (redirect all non-API, non-file requests to index.html)

Check current Apache config:
```bash
cat /etc/apache2/sites-available/bridge.thecashflowacademy.com.conf
```

It should look like this (if not, we'll fix it):
```apache
<VirtualHost *:80>
    ServerName bridge.thecashflowacademy.com
    Redirect permanent / https://bridge.thecashflowacademy.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName bridge.thecashflowacademy.com
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/bridge.thecashflowacademy.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/bridge.thecashflowacademy.com/privkey.pem
    
    # Frontend (React build)
    DocumentRoot /var/www/webinar-bridge/frontend/build
    <Directory /var/www/webinar-bridge/frontend/build>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # React Router support
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteCond %{REQUEST_URI} !^/api
        RewriteRule . /index.html [L]
    </Directory>
    
    # Backend API Proxy
    ProxyPreserveHost On
    ProxyPass /api http://localhost:3001/api
    ProxyPassReverse /api http://localhost:3001/api
    
    # Logs
    ErrorLog ${APACHE_LOG_DIR}/bridge-error.log
    CustomLog ${APACHE_LOG_DIR}/bridge-access.log combined
</VirtualHost>
```

Enable required Apache modules if not already:
```bash
sudo a2enmod rewrite proxy proxy_http ssl
sudo systemctl reload apache2
```

### Step 5: Start Backend Service
Check if systemd service exists:
```bash
systemctl status webinar-bridge --no-pager
```

If it doesn't exist, create `/etc/systemd/system/webinar-bridge.service`:
```ini
[Unit]
Description=Webinar Bridge API
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/webinar-bridge/backend
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=append:/var/www/webinar-bridge/logs/backend.log
StandardError=append:/var/www/webinar-bridge/logs/backend-error.log

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable webinar-bridge
sudo systemctl start webinar-bridge
sudo systemctl status webinar-bridge --no-pager
```

### Step 6: Verify Everything Works
1. Backend health check:
   ```bash
   curl http://localhost:3001/api/health
   ```
   Should return: `{"status":"ok","timestamp":"...","version":"1.0.0"}`

2. Frontend access:
   ```bash
   curl -I https://bridge.thecashflowacademy.com
   ```
   Should return 200 OK

3. Login test:
   - Open browser: https://bridge.thecashflowacademy.com
   - Login with:
     - Email: ryan@thecashflowacademy.com
     - Password: CiR43Tx2-
   - Should redirect to dashboard

4. Check logs if any issues:
   ```bash
   tail -f /var/www/webinar-bridge/logs/backend-error.log
   tail -f /var/log/apache2/bridge-error.log
   ```

---

## EXECUTION STEPS - LOCAL DEVELOPMENT

### Step 1: Install Node.js (if needed)
Check version:
```bash
node -v
```
Need 18+ (20+ recommended). Install via: https://nodejs.org or `brew install node`

### Step 2: Setup Backend Locally
```bash
cd /Users/ryanbradshaw/Git\ Projects/infusionsoft-webinarfuel-consent-registration/infusion-webinarfuel-constent-reg/backend

# Create .env file
cp .env.example .env
```

Edit `backend/.env`:
```env
NODE_ENV=development
PORT=3001
JWT_SECRET=local-dev-secret-change-me

# Remote DB (uses production database)
DB_HOST=198.199.69.39
DB_PORT=5432
DB_NAME=webinar_bridge
DB_USER=postgres
DB_PASSWORD=CiR43Tx2-
DB_SSL=false

CORS_ORIGIN=http://localhost:3000
```

Install and run:
```bash
npm install
npm run dev
```

Test: http://localhost:3001/api/health

### Step 3: Setup Frontend Locally
```bash
cd /Users/ryanbradshaw/Git\ Projects/infusionsoft-webinarfuel-consent-registration/infusion-webinarfuel-constent-reg/frontend

npm install
npm start
```

Browser opens at: http://localhost:3000
Login: ryan@thecashflowacademy.com / CiR43Tx2-

---

## TROUBLESHOOTING GUIDE

### Issue: "Cannot find module 'bcryptjs'"
**Solution**: Run `npm install` in backend/ directory

### Issue: Backend won't start - "Database connection error"
**Check**:
1. Is DB server reachable? `ping 198.199.69.39`
2. Is PostgreSQL running? SSH to DB server: `sudo systemctl status postgresql`
3. Is password correct in .env? `cat backend/.env | grep DB_PASSWORD`
4. Test connection: `psql -h 198.199.69.39 -U postgres -d webinar_bridge` (enter password CiR43Tx2-)

### Issue: Frontend shows blank page
**Check**:
1. Browser console for errors (F12)
2. Is backend running? Check http://localhost:3001/api/health
3. CORS error? Backend .env should have CORS_ORIGIN matching frontend URL

### Issue: 404 on production (routes don't work)
**Solution**: Apache needs mod_rewrite enabled and proper RewriteRules (see Step 4 above)

### Issue: SSL certificate error
**Check**: `sudo certbot certificates`
**Renew**: `sudo certbot renew --dry-run`

---

## FINAL CHECKLIST

### Production Server
- [ ] Code pulled from GitHub (latest commit: 876d08d)
- [ ] Admin user created in database
- [ ] Frontend built (`frontend/build/` exists)
- [ ] Apache DocumentRoot points to `frontend/build/`
- [ ] Apache proxies /api to localhost:3001
- [ ] Backend service running (`systemctl status webinar-bridge`)
- [ ] Health check returns OK: `curl http://localhost:3001/api/health`
- [ ] Website accessible: https://bridge.thecashflowacademy.com
- [ ] Login works with ryan@thecashflowacademy.com

### Local Development
- [ ] backend/.env created with correct DB credentials
- [ ] Backend running: `npm run dev` in backend/
- [ ] Frontend running: `npm start` in frontend/
- [ ] Can access http://localhost:3000
- [ ] Can login and see dashboard

---

## NEXT STEPS AFTER EVERYTHING WORKS

1. **Security**:
   - Rotate JWT_SECRET to a strong random value
   - Consider adding rate limiting
   - Setup automated backups for PostgreSQL

2. **Monitoring**:
   - Setup log rotation for backend logs
   - Consider adding error tracking (Sentry, etc.)

3. **Features**:
   - Build the form generator UI
   - Add form template management
   - Implement the actual registration script generation

---

## QUICK COMMAND REFERENCE

**Production Server (mailwizz-tcfa)**:
```bash
# Update code
cd /var/www/webinar-bridge && git pull origin main

# Restart backend
sudo systemctl restart webinar-bridge

# View logs
tail -f /var/www/webinar-bridge/logs/backend-error.log

# Restart Apache
sudo systemctl reload apache2
```

**Local Development**:
```bash
# Backend
cd backend && npm run dev

# Frontend (new terminal)
cd frontend && npm start
```

**Database Server (198.199.69.39)**:
```bash
# Connect to DB
sudo -u postgres psql -d webinar_bridge

# View tables
\dt

# View users
SELECT id, email, name FROM users;

# View forms
SELECT id, name, user_id FROM forms;
```
