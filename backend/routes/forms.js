const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');
const { 
  createForm, 
  getFormsByUserId, 
  getFormById, 
  updateForm, 
  deleteForm 
} = require('../models/Form');

const router = express.Router();

// Get all forms for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const forms = await getFormsByUserId(req.user.userId);
    res.json({ forms });
  } catch (error) {
    console.error('Get forms error:', error);
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

// Get specific form
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const form = await getFormById(req.params.id, req.user.userId);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json({ form });
  } catch (error) {
    console.error('Get form error:', error);
    res.status(500).json({ error: 'Failed to fetch form' });
  }
});

// Create new form
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      infusionsoft_app,
      infusionsoft_form_id,
      webinarfuel_webinar_id,
      webinarfuel_api_key,
      custom_fields,
      settings
    } = req.body;

    // Validate required fields
    if (!name || !infusionsoft_app || !infusionsoft_form_id || !webinarfuel_webinar_id || !webinarfuel_api_key) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, infusionsoft_app, infusionsoft_form_id, webinarfuel_webinar_id, webinarfuel_api_key' 
      });
    }

    const formData = {
      user_id: req.user.userId,
      name,
      infusionsoft_app,
      infusionsoft_form_id,
      webinarfuel_webinar_id,
      webinarfuel_api_key,
      custom_fields: custom_fields || {},
      settings: settings || {}
    };

    const formId = await createForm(formData);
    const createdForm = await getFormById(formId, req.user.userId);

    res.status(201).json({ 
      message: 'Form created successfully',
      form: createdForm 
    });
  } catch (error) {
    console.error('Create form error:', error);
    res.status(500).json({ error: 'Failed to create form' });
  }
});

// Update form
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const formId = req.params.id;
    const updates = req.body;
    
    // Verify form belongs to user
    const existingForm = await getFormById(formId, req.user.userId);
    if (!existingForm) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Ensure JSON fields are objects if provided
    if (updates.custom_fields && typeof updates.custom_fields !== 'object') {
      try { updates.custom_fields = JSON.parse(updates.custom_fields); } catch (_) {}
    }
    if (updates.settings && typeof updates.settings !== 'object') {
      try { updates.settings = JSON.parse(updates.settings); } catch (_) {}
    }

    await updateForm(formId, updates);
    const updatedForm = await getFormById(formId, req.user.userId);

    res.json({ 
      message: 'Form updated successfully',
      form: updatedForm 
    });
  } catch (error) {
    console.error('Update form error:', error);
    res.status(500).json({ error: 'Failed to update form' });
  }
});

// Delete form
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const formId = req.params.id;
    
    // Verify form belongs to user
    const existingForm = await getFormById(formId, req.user.userId);
    if (!existingForm) {
      return res.status(404).json({ error: 'Form not found' });
    }

    await deleteForm(formId);
    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Delete form error:', error);
    res.status(500).json({ error: 'Failed to delete form' });
  }
});

module.exports = router;