const router = require('express').Router();
const db = require('../db');

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { name, year, email, password } = req.body;
  
  if (!name || !year || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  if (!alphanumericRegex.test(password)) {
    return res.status(400).json({ error: 'Password must be alphanumeric only.' });
  }

  const yearNum = parseInt(year, 10);
  if (yearNum < 1 || yearNum > 4) {
    return res.status(400).json({ error: 'Year must be between 1 and 4.' });
  }

  try {
    // Check if user exists
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email is already registered.' });
    }

    // In a real-world app, you would hash the password here using bcrypt.
    // We are storing it plainly for this beginner project setup.
    await db.query(
      'INSERT INTO users (name, year, email, password) VALUES (?, ?, ?, ?)',
      [name, yearNum, email, password]
    );

    res.status(201).json({ message: 'User signed up successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = users[0];
    
    // In a real-world app, you would use bcrypt.compare() here.
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.status(200).json({ message: 'Login successful!', user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
