# Deployment Checklist

## Pre-Deployment

- [ ] Server running Ubuntu 22.04+
- [ ] Domain `bridge.thecashflowacademy.com` pointing to server
- [ ] PostgreSQL server running at `198.199.69.39`
- [ ] PostgreSQL database `webinar_bridge` created
- [ ] PostgreSQL user credentials ready

## Deployment Steps

1. **Deploy Application**
   ```bash
   sudo chmod +x deploy.sh
   sudo ./deploy.sh bridge.thecashflowacademy.com admin@thecashflowacademy.com
   ```

2. **Configure Database Password**
   ```bash
   sudo nano /var/www/webinar-bridge/backend/.env
   # Update DB_PASSWORD line with actual PostgreSQL password
   ```

3. **Initialize Database Schema**
   ```bash
   # On PostgreSQL server (198.199.69.39):
   psql -U postgres -d webinar_bridge -f /path/to/init.sql
   ```

4. **Create Default Admin User**
   ```bash
   # On web server:
   cd /var/www/webinar-bridge
   source backend/.env
   node database/create-admin.js
   ```

5. **Restart Services**
   ```bash
   sudo systemctl restart webinar-bridge
   sudo systemctl restart apache2
   ```

## Verification

- [ ] Visit https://bridge.thecashflowacademy.com
- [ ] Login with ryan@thecashflowacademy.com / CiR43Tx2-
- [ ] Create a test form
- [ ] Generate code successfully
- [ ] Check robots.txt at /robots.txt
- [ ] Verify SSL certificate

## Security Checks

- [ ] Database connection secure
- [ ] JWT tokens working
- [ ] SEO blocking active (robots.txt + meta tags)
- [ ] CORS configured properly
- [ ] Helmet.js security headers active

## Troubleshooting

### Service Issues
```bash
sudo systemctl status webinar-bridge
sudo journalctl -u webinar-bridge -f
```

### Database Issues
```bash
cd /var/www/webinar-bridge
source backend/.env
node -e "const Database = require('./backend/models/database'); const db = new Database(); db.connect().then(() => console.log('✅ DB Connected')).catch(console.error);"
```

### SSL Issues
```bash
sudo certbot --apache -d bridge.thecashflowacademy.com
```

## Default Configuration

- **Domain:** bridge.thecashflowacademy.com
- **Admin Email:** ryan@thecashflowacademy.com  
- **Admin Password:** CiR43Tx2-
- **Database:** PostgreSQL @ 198.199.69.39:5432/webinar_bridge
- **API Port:** 3001
- **Frontend:** React with Tailwind CSS
- **SEO Protection:** Enabled (robots.txt + meta tags)