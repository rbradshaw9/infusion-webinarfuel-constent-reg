const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio');
const { authenticateToken } = require('../middleware/auth');
const { getFormById, updateForm } = require('../models/Form');
const { getUserById } = require('../models/User');

const router = express.Router();

// Validate Infusionsoft form HTML
router.post('/validate', authenticateToken, async (req, res) => {
  try {
    const { infusionsoft_html } = req.body;
    
    if (!infusionsoft_html) {
      return res.status(400).json({ error: 'Infusionsoft HTML is required' });
    }

    const validation = validateInfusionsoftForm(infusionsoft_html);
    res.json(validation);
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ error: 'Failed to validate form' });
  }
});

// Generate registration form code
router.post('/form/:id', authenticateToken, async (req, res) => {
  try {
    const formId = req.params.id;
    
    // Get form data
    const form = await getFormById(formId, req.user.userId);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Get user's bearer token
    const user = await getUserById(req.user.userId);
    if (!user.bearer_token) {
      return res.status(400).json({ 
        error: 'Bearer token not configured. Please update your settings.' 
      });
    }

    // Validate form before generating
    const validation = validateInfusionsoftForm(form.infusionsoft_html);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Form validation failed',
        details: validation.errors 
      });
    }

    // Generate the registration form
    const generatedHtml = generateRegistrationForm({
      infusionsoftHtml: form.infusionsoft_html,
      sessionId: form.session_id,
      widgetId: form.widget_id,
      widgetVersion: form.widget_version,
      bearerToken: user.bearer_token
    });

    // Save generated form to file system
    const generatedDir = path.join(__dirname, '../../generated');
    await fs.mkdir(generatedDir, { recursive: true });
    
    const filename = `${form.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${formId.slice(0, 8)}.html`;
    const filePath = path.join(generatedDir, filename);
    
    await fs.writeFile(filePath, generatedHtml, 'utf8');

    // Update form status
    await updateForm(formId, { 
      status: 'generated',
      generated_filename: filename,
      generated_at: new Date().toISOString()
    });

    res.json({
      message: 'Form generated successfully',
      filename,
      downloadUrl: `/forms/${filename}`,
      html: generatedHtml
    });
  } catch (error) {
    console.error('Generate form error:', error);
    res.status(500).json({ error: 'Failed to generate form' });
  }
});

// Get generated form content
router.get('/form/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../generated', filename);
    
    res.sendFile(filePath, (err) => {
      if (err) {
        res.status(404).json({ error: 'Generated form not found' });
      }
    });
  } catch (error) {
    console.error('Get generated form error:', error);
    res.status(500).json({ error: 'Failed to get generated form' });
  }
});

// Validation function for Infusionsoft forms
function validateInfusionsoftForm(html) {
  const $ = cheerio.load(html);
  const errors = [];
  const warnings = [];

  // Check for form element
  const form = $('form');
  if (form.length === 0) {
    errors.push('No form element found in HTML');
    return { isValid: false, errors, warnings };
  }

  // Check for action URL
  const action = form.attr('action');
  if (!action || !action.includes('infusionsoft.com')) {
    errors.push('Invalid or missing Infusionsoft action URL');
  }

  // Check for required fields
  const requiredFields = [
    { name: 'inf_field_Email', label: 'Email field' },
    { name: 'inf_form_xid', label: 'Form XID' },
    { name: 'inf_form_name', label: 'Form name' }
  ];

  requiredFields.forEach(field => {
    const element = $(`input[name="${field.name}"]`);
    if (element.length === 0) {
      errors.push(`Missing required field: ${field.label}`);
    }
  });

  // Check for consent checkbox
  const consentCheckbox = $('input[type="checkbox"][name*="consent"], input[type="checkbox"][name*="sms"], input[type="checkbox"][name*="opt"]');
  if (consentCheckbox.length === 0) {
    warnings.push('No SMS consent checkbox found. Users will not be able to opt-in for SMS notifications.');
  }

  // Check for first name and last name fields
  const firstName = $('input[name="inf_field_FirstName"]');
  const lastName = $('input[name="inf_field_LastName"]');
  
  if (firstName.length === 0) {
    warnings.push('First name field not found');
  }
  if (lastName.length === 0) {
    warnings.push('Last name field not found');
  }

  // Check for phone field
  const phone = $('input[name="inf_field_Phone1"]');
  if (phone.length === 0) {
    warnings.push('Phone field not found');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fieldsFound: {
      email: $('input[name="inf_field_Email"]').length > 0,
      firstName: firstName.length > 0,
      lastName: lastName.length > 0,
      phone: phone.length > 0,
      consent: consentCheckbox.length > 0
    }
  };
}

// Generate registration form HTML
function generateRegistrationForm({ infusionsoftHtml, sessionId, widgetId, widgetVersion, bearerToken }) {
  const $ = cheerio.load(infusionsoftHtml);
  
  // Find the form and add WebinarFuel data attributes
  const form = $('form');
  form.attr('data-wf-session-id', sessionId);
  form.attr('data-wf-widget-id', widgetId);
  form.attr('data-wf-widget-version', widgetVersion);
  form.attr('data-wf-widget-name', 'Embed');
  form.attr('data-wf-bearer-token', bearerToken);
  
  // Find consent checkbox and set data-consent-id
  const consentCheckbox = $('input[type="checkbox"]').last();
  if (consentCheckbox.length > 0) {
    const consentId = consentCheckbox.attr('id') || consentCheckbox.attr('name');
    if (consentId) {
      form.attr('data-consent-id', consentId);
    }
  }

  // Read the template file and inject the form
  const templatePath = path.join(__dirname, '../templates/registration-form.html');
  const template = require('fs').readFileSync(templatePath, 'utf8');
  
  // Replace placeholders in template
  const generatedHtml = template
    .replace('{{FORM_HTML}}', $.html())
    .replace(/{{TIMESTAMP}}/g, new Date().toISOString());
  
  return generatedHtml;
}

module.exports = router;