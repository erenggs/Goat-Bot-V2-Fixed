// jjk.js
const express = require('express');
const app = express();
const PORT = 3000;

// Sample Jujutsu Kaisen character images
const jjkPics = [
  'https://i.imgur.com/0y3WvLd.jpg', // Gojo Satoru
  'https://i.imgur.com/AQ6I3zd.jpg', // Itadori Yuji
  'https://i.imgur.com/ujplh8z.jpg', // Megumi Fushiguro
  'https://i.imgur.com/znh7vHx.jpg', // Nobara Kugisaki
  'https://i.imgur.com/Lz1aKAl.jpg', // Sukuna
  'https://i.imgur.com/29UmHWI.jpg', // Toji Fushiguro
  'https://i.imgur.com/V3ZJdx4.jpg', // Geto Suguru
];

// Route to get a random JJK image
app.get('/api/jjk', (req, res) => {
  const randomPic = jjkPics[Math.floor(Math.random() * jjkPics.length)];
  res.json({
    status: 'success',
    character: 'Jujutsu Kaisen',
    image: randomPic,
  });
});

app.listen(PORT, () => {
  console.log(`✅ JJK API running at http://localhost:${PORT}/api/jjk`);
});
