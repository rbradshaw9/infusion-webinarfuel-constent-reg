# Webinar Bridge Admin System

A secure admin system for generating Infusionsoft + WebinarFuel integration forms with PostgreSQL database support and SEO protection. Designed for bridge.thecashflowacademy.com with default admin user ryan@thecashflowacademy.com.

## 🚀 Features

- **Dual Integration**: Seamless integration with both Infusionsoft and WebinarFuel
- **Form Validation**: Automatic validation of Infusionsoft form HTML
- **Smart Parsing**: Auto-extract WebinarFuel widget information from URLs  
- **Responsive Design**: Mobile-optimized registration forms
- **SMS Consent Management**: Intelligent handling of phone number submission based on consent
- **UTM Tracking**: Automatic UTM parameter capture and forwarding
- **User Management**: Secure authentication and user accounts
- **One-Click Deployment**: Automated server setup and SSL configuration

## 📋 Requirements

- Ubuntu 20.04+ server
- Root access
- Domain name pointing to your server
- WebinarFuel account with API access
- Infusionsoft account

## 🛠 Installation

### Option 1: One-Click Deployment (Recommended)

```bash
# On your server, clone this repository
git clone https://github.com/yourusername/webinar-bridge.git
cd webinar-bridge

# Run the deployment script
sudo bash deploy.sh bridge.yourdomain.com admin@yourdomain.com
```

### Option 2: Manual Setup

1. **Install Dependencies**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt-get install -y nodejs sqlite3 git
```

2. **Setup Project**
```bash
sudo mkdir -p /var/www/webinar-bridge
sudo cp -r . /var/www/webinar-bridge/
cd /var/www/webinar-bridge
```

3. **Install Backend Dependencies**
```bash
cd backend
npm install --production
```

4. **Install Frontend Dependencies & Build**
```bash
cd ../frontend
npm install
npm run build
```

5. **Initialize Database**
```bash
cd ..
sqlite3 database/webinar-bridge.db < database/init.sql
```

6. **Configure Apache** (see deploy.sh for full configuration)

## 📖 Usage

### 1. Initial Setup

1. Visit `https://bridge.yourdomain.com`
2. Create your admin account
3. Go to Settings and add your WebinarFuel Bearer Token

### 2. Creating a Registration Form

1. Click "New Form" in the dashboard
2. Enter a descriptive name for your form
3. **Add WebinarFuel Configuration:**
   - Paste your WebinarFuel widget URL (e.g., `https://app.webinarfuel.com/webinars/12345/widgets/67890/10001/elements`)
   - Enter the Session ID from WebinarFuel
   - Widget ID and Version will auto-populate from the URL

4. **Add Infusionsoft Form HTML:**
   - Copy the complete form HTML from your Infusionsoft form builder
   - Paste it into the HTML field

5. Click "Create Form"

### 3. Generating the Registration Form

1. Edit your saved form
2. Click "Generate Form"  
3. The system will validate your configuration and generate a complete HTML file
4. Download or view the generated registration form

### 4. Using the Generated Form

- Host the generated HTML file on your website
- The form will automatically handle submissions to both platforms
- Phone numbers are only sent to WebinarFuel if SMS consent is checked
- All UTM parameters are automatically captured and forwarded

## 🔧 Configuration

### Environment Variables

Create `/var/www/webinar-bridge/backend/.env`:

```bash
NODE_ENV=production
PORT=3001
DB_PATH=/var/www/webinar-bridge/database/webinar-bridge.db
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGINS=https://bridge.yourdomain.com
```

### WebinarFuel Configuration

You'll need:
- **Bearer Token**: From WebinarFuel API settings
- **Session ID**: From your webinar session
- **Widget ID & Version**: From the widget URL

### Infusionsoft Configuration

Your Infusionsoft form must include:
- Email field (`inf_field_Email`)
- Form XID (`inf_form_xid`) 
- Form name (`inf_form_name`)
- Optional: First name, last name, phone fields
- Optional: SMS consent checkbox

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- SQL injection protection
- XSS protection with Helmet.js
- CORS configuration
- SSL/TLS encryption

## 🚀 Generated Form Features

- **Responsive Design**: Works perfectly on mobile and desktop
- **Floating Labels**: Modern, animated form labels
- **Validation**: Client-side and server-side validation
- **Loading States**: User-friendly feedback during submission
- **Error Handling**: Graceful error handling and user feedback
- **UTM Preservation**: Automatic UTM parameter handling
- **Dual Submission**: Simultaneous submission to both platforms

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/bearer-token` - Update WebinarFuel bearer token

### Forms Management
- `GET /api/forms` - List user's forms
- `POST /api/forms` - Create new form
- `GET /api/forms/:id` - Get specific form
- `PUT /api/forms/:id` - Update form
- `DELETE /api/forms/:id` - Delete form

### Code Generation
- `POST /api/generate/validate` - Validate Infusionsoft HTML
- `POST /api/generate/form/:id` - Generate registration form
- `GET /api/generate/form/:filename` - Download generated form

## 🛡️ Backup & Maintenance

The deployment script automatically sets up:
- Daily database backups
- Log rotation
- Systemd service management

**Manual backup:**
```bash
/var/www/webinar-bridge/backup.sh
```

**Service management:**
```bash
sudo systemctl status webinar-bridge
sudo systemctl restart webinar-bridge
sudo systemctl logs webinar-bridge
```

## 🐛 Troubleshooting

### Common Issues

1. **Form Generation Fails**
   - Check if Bearer Token is configured
   - Validate Infusionsoft HTML has required fields
   - Verify WebinarFuel credentials

2. **Service Won't Start**
   ```bash
   sudo journalctl -u webinar-bridge -f
   ```

3. **Database Issues**
   ```bash
   sqlite3 /var/www/webinar-bridge/database/webinar-bridge.db ".tables"
   ```

4. **Permission Issues**
   ```bash
   sudo chown -R www-data:www-data /var/www/webinar-bridge
   ```

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Support

For issues and questions:
1. Check the troubleshooting section
2. Review server logs
3. Create an issue on GitHub

---

**Built for The Cash Flow Academy** 🚀