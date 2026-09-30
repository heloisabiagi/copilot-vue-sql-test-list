const db = require('../db');

module.exports = async (req, res) => {
  const { name, email, age } = req.body;
  const country = typeof req.body.country === 'string' ? req.body.country.trim() : '';
  const rawAge = age === undefined || age === null ? '' : String(age).trim();
  const parsedAge = Number(rawAge);

  if (!name || !email || !country || rawAge === '' || !Number.isFinite(parsedAge)) {
    return res.status(400).json({ error: 'Name, email, valid age and country required' });
  }

  try {
    const result = await db.run('INSERT INTO users (name, email, age, country) VALUES (?, ?, ?, ?)', [name, email, parsedAge, country]);
    const user = await db.get('SELECT id, name, email, age, country FROM users WHERE id = ?', [result.id]);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
