const db = require('./database');

// Create form
async function createForm(formData) {
  const {
    user_id,
    name,
    infusionsoft_app,
    infusionsoft_form_id,
    webinarfuel_webinar_id,
    webinarfuel_api_key,
    custom_fields = {},
    settings = {}
  } = formData;

  const result = await db.run(
    `INSERT INTO forms (
      user_id, name, infusionsoft_app, infusionsoft_form_id, 
      webinarfuel_webinar_id, webinarfuel_api_key, custom_fields, 
      settings, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id`,
    [
      user_id, name, infusionsoft_app, infusionsoft_form_id,
      webinarfuel_webinar_id, webinarfuel_api_key, 
      JSON.stringify(custom_fields), JSON.stringify(settings)
    ]
  );
  
  return result.rows[0].id;
}

// Get forms by user ID
async function getFormsByUserId(userId) {
  return await db.all(
    `SELECT id, name, infusionsoft_app, infusionsoft_form_id, 
            webinarfuel_webinar_id, created_at, updated_at
     FROM forms 
     WHERE user_id = $1 
     ORDER BY updated_at DESC`,
    [userId]
  );
}

// Get form by ID
async function getFormById(id, userId) {
  return await db.get(
    'SELECT * FROM forms WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
}

// Update form
async function updateForm(id, updates) {
  const fields = Object.keys(updates);
  const values = Object.values(updates).map(value => 
    typeof value === 'object' ? JSON.stringify(value) : value
  );
  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
  
  return await db.run(
    `UPDATE forms SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1}`,
    [...values, id]
  );
}

// Delete form
async function deleteForm(id) {
  return await db.run(
    'DELETE FROM forms WHERE id = $1',
    [id]
  );
}

module.exports = {
  createForm,
  getFormsByUserId,
  getFormById,
  updateForm,
  deleteForm
};