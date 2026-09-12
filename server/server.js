const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

app.use('/api/students',    require('./routes/students'));
app.use('/api/courses',     require('./routes/courses'));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/api/attendance',  require('./routes/attendance'));
app.use('/api/grades',      require('./routes/grades'));
app.use('/api/dashboard',   require('./routes/dashboard'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', message: 'SMS API is running 🎓' }));
app.get('/', (_req, res) => res.json({ status: 'ok', message: 'SMS API is running 🎓' }));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(` SMS Backend Server running on http://localhost:${PORT}`));