/**
 * server.js — minimal sample app for the k6 assignment.
 *
 * Endpoints:
 *   POST /api/login    { username, password } -> { token, expiresIn }
 *   GET  /api/profile  Authorization: Bearer <token> -> { id, username, email, fullName }
 *   GET  /             simple homepage (for manual sanity checks)
 *
 * Tokens are short-lived on purpose (default 60s) so a k6 run of a few
 * minutes will actually exercise the refresh logic in auth-load-test.js
 * instead of logging in once and coasting for the whole test.
 *
 * Run:
 *   npm install
 *   node server.js
 *   # then point k6 at it:
 *   k6 run tests/auth-load-test.js -e BASE_URL=http://localhost:3000
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'sample-app-dev-secret';
const TOKEN_TTL_SECONDS = Number(process.env.TOKEN_TTL_SECONDS || 60);

// Load the same 500 users the k6 script uses, so credentials line up
// out of the box.
const users = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'users.json'), 'utf-8')
);
const usersByUsername = new Map(users.map((u) => [u.username, u]));

// Basic request log so you can see load hitting the app during the test.
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(
      `${new Date().toISOString()} ${req.method} ${req.path} -> ${res.statusCode} (${Date.now() - start}ms)`
    );
  });
  next();
});

app.get('/', (req, res) => {
  res.status(200).send(`
    <html>
      <head><title>Sample App</title></head>
      <body>
        <h1>Sample App Homepage</h1>
        <p>This app is running with ${users.length} seeded users and a
        ${TOKEN_TTL_SECONDS}s token TTL.</p>
      </body>
    </html>
  `);
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const user = usersByUsername.get(username);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'invalid credentials' });
  }

  const token = jwt.sign(
    { sub: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: TOKEN_TTL_SECONDS }
  );

  return res.status(200).json({
    token,
    expiresIn: TOKEN_TTL_SECONDS, // seconds — matches what auth-load-test.js reads
    user: { id: user.id, username: user.username },
  });
});

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'missing bearer token' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      // Covers both expired tokens and tampered/invalid ones —
      // this is the 401 path your k6 script's reactive refresh handles.
      return res.status(401).json({ error: 'token expired or invalid' });
    }
    req.userId = decoded.sub;
    next();
  });
}

app.get('/api/profile', requireAuth, (req, res) => {
  const user = users.find((u) => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: 'user not found' });
  }
  return res.status(200).json({
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
  });
});

app.listen(PORT, () => {
  console.log(`Sample app listening on http://localhost:${PORT}`);
  console.log(`Loaded ${users.length} users. Token TTL: ${TOKEN_TTL_SECONDS}s`);
});
