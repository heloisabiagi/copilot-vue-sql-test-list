const db = require('../db');

module.exports = async (req, res) => {
  try {
    const rows = await db.all('SELECT id, name, email, age, country FROM users ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
