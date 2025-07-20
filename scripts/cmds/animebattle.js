const express = require('express');
const app = express();
const port = 3000;

// Sample anime character data
const characters = {
  Goku: { power: 95, anime: "Dragon Ball" },
  Naruto: { power: 92, anime: "Naruto" },
  Luffy: { power: 90, anime: "One Piece" },
  Gojo: { power: 94, anime: "Jujutsu Kaisen" },
  Ichigo: { power: 91, anime: "Bleach" }
};

// Get all characters
app.get('/characters', (req, res) => {
  res.json(Object.keys(characters));
});

// Get specific character
app.get('/character/:name', (req, res) => {
  const name = req.params.name;
  const char = characters[name];
  if (!char) return res.status(404).json({ error: 'Character not found' });
  res.json({ name, ...char });
});

// Battle endpoint
app.get('/battle', (req, res) => {
  const { char1, char2 } = req.query;
  const fighter1 = characters[char1];
  const fighter2 = characters[char2];

  if (!fighter1 || !fighter2) {
    return res.status(400).json({ error: 'Both characters must exist' });
  }

  // Basic logic: add randomness to power
  const score1 = fighter1.power + Math.random() * 10;
  const score2 = fighter2.power + Math.random() * 10;

  let result;
  if (score1 > score2) {
    result = `${char1} wins!`;
  } else if (score2 > score1) {
    result = `${char2} wins!`;
  } else {
    result = `It's a draw!`;
  }

  res.json({
    fighter1: { name: char1, power: fighter1.power },
    fighter2: { name: char2, power: fighter2.power },
    result
  });
});

app.listen(port, () => {
  console.log(`🔥 animeBattle.js API running at http://localhost:${port}`);
});
