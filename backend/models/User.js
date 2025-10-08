const db = require('./database');

// Create user
async function createUser({ email, password, name }) {
  const result = await db.run(
    `INSERT INTO users (email, password, name, created_at, updated_at) 
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     RETURNING id`,
    [email, password, name]
  );
  return result.rows[0].id;
}

// Get user by email
async function getUserByEmail(email) {
  return await db.get(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
}

// Get user by ID
async function getUserById(id) {
  return await db.get(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
}

// Update user
async function updateUser(id, updates) {
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
  
  return await db.run(
    `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1}`,
    [...values, id]
  );
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  updateUser
};