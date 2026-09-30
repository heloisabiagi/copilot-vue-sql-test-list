const db = require('../db');

module.exports = async (req, res) => {
  try {
    const row = await db.get('SELECT id, name, email, age, country FROM users WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'User not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
