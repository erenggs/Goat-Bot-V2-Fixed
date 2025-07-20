// dragonball.js
const fetch = require('node-fetch'); // if using Node.js

const BASE_URL = 'https://api.goatbot.com/dragonball'; // example endpoint

async function getCharacterPic(characterName) {
  try {
    const response = await fetch(`${BASE_URL}/character?name=${encodeURIComponent(characterName)}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data.image; // assuming the API returns { image: "url" }
  } catch (error) {
    console.error('Failed to fetch Dragon Ball character pic:', error);
    return null;
  }
}

module.exports = { getCharacterPic };
