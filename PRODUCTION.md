# 🚀 Production Deployment Guide

## Server Requirements
- Ubuntu 22.04+ server
- Domain `bridge.thecashflowacademy.com` pointing to server IP
- PostgreSQL database server at `198.199.69.39` 
- Root/sudo access

## Quick Deployment

### 1. Connect to your server
```bash
ssh root@your-server-ip
```

### 2. Run the deployment script
```bash
# Download and run deployment (use your actual PostgreSQL password)
wget https://raw.githubusercontent.com/rbradshaw9/infusion-webinarfuel-constent-reg/main/deploy.sh
chmod +x deploy.sh
sudo ./deploy.sh bridge.thecashflowacademy.com ryan@thecashflowacademy.com your_actual_postgres_password
```

**Note:** The PostgreSQL database should already be set up on 198.199.69.39 with:
- Database: `webinar_bridge` 
- Tables: `users` and `forms` created
- Remote connections enabled
- Password configured for `postgres` user

### 3. Initialize database (on PostgreSQL server 198.199.69.39)
```bash
# Connect to PostgreSQL server
ssh postgres@198.199.69.39

# Create database and run schema
createdb webinar_bridge
psql -d webinar_bridge -f /path/to/init.sql
```

### 4. Restart and verify (if needed)
```bash
sudo systemctl restart webinar-bridge
sudo systemctl status webinar-bridge
```

## Access Your Application

🎉 **Your app is now live at:** https://bridge.thecashflowacademy.com

### Default Login Credentials
- **Email:** ryan@thecashflowacademy.com
- **Password:** CiR43Tx2-

## Verification Checklist

- [ ] Website loads at https://bridge.thecashflowacademy.com
- [ ] SSL certificate is working (green lock icon)
- [ ] Login works with default credentials
- [ ] Can create and edit forms
- [ ] Form generation produces HTML code
- [ ] robots.txt blocks search engines (/robots.txt)

## Troubleshooting

### Check service status
```bash
sudo systemctl status webinar-bridge
sudo journalctl -u webinar-bridge -f
```

### Test database connection
```bash
cd /var/www/webinar-bridge
source backend/.env
node -e "
const Database = require('./backend/models/database');
const db = new Database();
db.connect().then(() => {
  console.log('✅ Database connected successfully');
  process.exit(0);
}).catch(err => {
  console.error('❌ Database connection failed:', err.message);
  process.exit(1);
});
"
```

### Restart everything
```bash
sudo systemctl restart webinar-bridge
sudo systemctl restart apache2
```

### Check Apache configuration
```bash
sudo apache2ctl configtest
sudo systemctl status apache2
```

## What the Deploy Script Does

1. **System Setup:**
   - Updates Ubuntu packages
   - Installs Node.js 18, PostgreSQL client, Apache, Certbot

2. **Application Setup:**
   - Clones from GitHub repository
   - Installs backend dependencies (Express, JWT, bcryptjs, pg)
   - Installs frontend dependencies (React, Tailwind CSS)
   - Builds React production bundle

3. **Service Configuration:**
   - Creates systemd service for API server
   - Configures Apache virtual host
   - Sets up SSL with Let's Encrypt
   - Configures automatic redirects (HTTP → HTTPS)

4. **Security:**
   - Sets proper file permissions
   - Configures CORS headers
   - Enables security headers via Helmet.js
   - Blocks search engine indexing

## File Structure on Server

```
/var/www/webinar-bridge/
├── backend/
│   ├── .env                 # Database config (YOU MUST EDIT THIS)
│   ├── server.js           # Main API server
│   ├── models/             # Database models
│   └── routes/             # API endpoints
├── frontend/
│   └── dist/               # Built React app
├── database/
│   ├── init.sql           # Database schema
│   └── create-admin.js    # Admin user creation
└── logs/                  # Application logs
```

## Environment Variables (.env)

The deploy script creates `/var/www/webinar-bridge/backend/.env`:

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=[auto-generated]
DB_HOST=198.199.69.39
DB_PORT=5432
DB_NAME=webinar_bridge
DB_USER=postgres
DB_PASSWORD=your_postgresql_password_here  # ⚠️ UPDATE THIS
DB_SSL=false
CORS_ORIGIN=https://bridge.thecashflowacademy.com
```

## Next Steps

1. **Test the application** with the default login
2. **Change the default admin password** in the Settings page
3. **Create your first form** to test the integration
4. **Verify form generation** produces working HTML
5. **Test the generated forms** on a test page

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review logs with `sudo journalctl -u webinar-bridge -f`
3. Verify domain DNS points to the correct server
4. Ensure PostgreSQL server at 198.199.69.39 is accessible

The application is now ready for production use! 🎊