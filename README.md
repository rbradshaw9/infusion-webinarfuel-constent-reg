# WebinarFuel Registration Form Generator

A powerful tool for generating dual-registration forms that submit to both Infusionsoft and WebinarFuel simultaneously.

## 🚀 Live Demo

Deploy to Vercel for instant access: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rbradshaw9/infusion-webinarfuel-constent-reg)

## 🚀 Quick Start

1. **Visit the live site** (or open `index.html` locally)
2. **Login** with password: `admin123`
3. **Create a new form** and fill in your configuration  
4. **Generate the embed code** and copy it to your website's custom HTML block

No installation, no servers, no complexity - just paste and go!

## 📋 What It Does

This tool generates HTML registration forms that submit to **both**:
- **Infusionsoft** (your CRM/form processor)
- **WebinarFuel** (your webinar platform)

The forms include:
- ✅ UTM parameter tracking (automatically captured and stored)
- ✅ SMS consent checkbox (optional phone number submission)
- ✅ Floating label UI with modern design
- ✅ E.164 phone normalization (+1 prefix)
- ✅ Duplicate submission prevention
- ✅ Error handling and validation

## 🔧 How to Use

### Quick Import Method (Recommended!)

The easiest way to configure a form:

1. **Copy your Infusionsoft form HTML** from your Infusionsoft account
2. **Paste it** into the "Paste Infusionsoft Form HTML" field
3. **Click "🔍 Extract Infusionsoft Data"** - All fields auto-populate!
4. **Paste your WebinarFuel widget URL** (from the embed script or widget settings)
5. **Click "🔍 Extract WebinarFuel Data"** - Widget ID, version, and token extracted!
6. **Enter the Session ID manually** (this changes per webinar session)
7. **Save and generate!**

### Manual Method

If you prefer to enter values manually:

### Step 1: Get Your Configuration Values

You'll need these values from Infusionsoft and WebinarFuel:

**From Infusionsoft:**
- Form Action URL (e.g., `https://yv932.infusionsoft.com/app/form/process/...`)
- Form XID (the unique identifier in the URL)
- Form Name (internal name)

**From WebinarFuel:**
- Session ID (the webinar session)
- Widget ID (the embed widget)
- Widget Version (the version number)
- Bearer Token (API authentication)

### Step 2: Create and Configure

1. Open `admin.html` in your browser
2. Login with `admin123` (change this after first login!)
3. Click "+ New" to create a form
4. Fill in all the configuration fields
5. Click "💾 Save Form"

### Step 3: Generate and Deploy

1. Click "🚀 Generate Code"
2. Copy the generated HTML or download it
3. Paste it on your website or landing page

## 🔐 Security

- **Change the password immediately** after first login (click "Change Password")
- All data is stored in your browser's localStorage (private to you)
- No server required means no attack surface
- Share the generated forms only (not the admin.html file)

## 📝 Files

- `admin.html` - The admin tool (keep this private!)
- `registration-script.html` - Example of a generated form

## 💡 Tips

- **Infusionsoft Form HTML**: Copy the entire `<form>...</form>` block from your Infusionsoft form builder
- **WebinarFuel URL formats** that work:
  - Embed script URL: `https://embed.webby.app/embed/viewers?widget_id=78139&version_id=129684&token=...`
  - Widget page URL: `https://embed.webby.app/embed/viewers/78139/129684`
  - Any URL with widget_id and version_id parameters
- **Session ID** must be entered manually (it's unique per webinar session, not per widget)
- **Test your forms** before going live
- **Save multiple form configurations** for different webinars
- **Export forms** by downloading the generated code
- **Back up your data** by exporting forms (localStorage is browser-specific)

## 🔄 Migration from Complex Setup

If you had the previous Node.js/React setup:
- All forms from the old database can be manually recreated
- The generated HTML is the same, just simpler to manage
- No servers to maintain or deploy

## 📞 Support

For issues with:
- **Infusionsoft integration** - Check your form action URL and XID
- **WebinarFuel integration** - Verify your session ID, widget ID, version, and bearer token
- **UTM tracking** - Open browser console to see parameter capture logs

---

**That's it!** Simple, fast, and it just works. 🎉
