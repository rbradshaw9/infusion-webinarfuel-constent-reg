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
      infusionsoft_html,
      webinar_fuel_url,
      session_id,
      widget_id,
      widget_version
    } = req.body;

    // Validate required fields
    if (!name || !infusionsoft_html || !session_id || !widget_id || !widget_version) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, infusionsoft_html, session_id, widget_id, widget_version' 
      });
    }

    // Parse WebinarFuel URL if provided
    let parsedWidgetId = widget_id;
    let parsedVersion = widget_version;
    
    if (webinar_fuel_url) {
      const urlMatch = webinar_fuel_url.match(/\/widgets\/(\d+)\/(\d+)\/elements/);
      if (urlMatch) {
        parsedWidgetId = urlMatch[1];
        parsedVersion = urlMatch[2];
      }
    }

    const formData = {
      id: uuidv4(),
      user_id: req.user.userId,
      name,
      infusionsoft_html,
      webinar_fuel_url: webinar_fuel_url || null,
      session_id,
      widget_id: parsedWidgetId,
      widget_version: parsedVersion,
      status: 'draft'
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

    // Parse WebinarFuel URL if provided
    if (updates.webinar_fuel_url) {
      const urlMatch = updates.webinar_fuel_url.match(/\/widgets\/(\d+)\/(\d+)\/elements/);
      if (urlMatch) {
        updates.widget_id = urlMatch[1];
        updates.widget_version = urlMatch[2];
      }
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