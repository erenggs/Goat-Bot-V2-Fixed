const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// Fake "VIP" token
const VIP_TOKEN = "my-vip-secret-token";

// Middleware to check VIP access
function checkVipAccess(req, res, next) {
  const token = req.headers['x-vip-token'];
  if (token === VIP_TOKEN) {
    next(); // allow access
  } else {
    res.status(403).json({ error: "Access denied. VIPs only." });
  }
}

// Public route
app.get('/', (req, res) => {
  res.send('Welcome to the Host API!');
});

// VIP-only route
app.get('/vip-area', checkVipAccess, (req, res) => {
  res.json({
    message: "Welcome, VIP!",
    perks: ["Faster hosting", "Exclusive features", "No ads"],
  });
});

// Add VIP members dynamically (optional)
app.post('/vip-add', (req, res) => {
  const { token } = req.body;
  if (token === VIP_TOKEN) {
    res.json({ message: "You're already a VIP." });
  } else {
    res.status(400).json({ error: "Invalid VIP token request." });
  }
});

app.listen(PORT, () => {
  console.log(`VIP API running at http://localhost:${PORT}`);
});
