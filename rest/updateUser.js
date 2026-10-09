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
    const result = await db.run('UPDATE users SET name = ?, email = ?, age = ?, country = ? WHERE id = ?', [name, email, parsedAge, country, req.params.id]);
    if (result.changes === 0) return res.status(404).json({ error: 'User not found' });
    const user = await db.get('SELECT id, name, email, age, country FROM users WHERE id = ?', [req.params.id]);
    res.json(user);
  } catch (err) {
    if (db.isDuplicateEmailError(err)) return res.status(409).json({ error: 'Email already in use' });
    res.status(500).json({ error: err.message });
  }
};
