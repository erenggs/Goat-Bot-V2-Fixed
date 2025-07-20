// kamegoku.js

const kameGoku = {
  name: "Goku2",
  powerLevel: 9001,
  transformations: [
    "Super Saiyan",
    "Super Saiyan 2",
    "Super Saiyan 3",
    "Super Saiyan God",
    "Super Saiyan Blue",
    "Ultra Instinct"
  ],

  // Get current power level
  getPowerLevel() {
    return this.powerLevel;
  },

  // Increase power level by a multiplier
  powerUp(multiplier = 2) {
    this.powerLevel *= multiplier;
    return this.powerLevel;
  },

  // Get all transformations
  getTransformations() {
    return this.transformations;
  },

  // Check if a transformation exists
  hasTransformation(transformationName) {
    return this.transformations.includes(transformationName);
  },

  // Simulate a Kamehameha attack
  kamehameha() {
    return `${this.name} fires a Kamehameha with power level ${this.powerLevel}!`;
  }
};

module.exports = kameGoku;
