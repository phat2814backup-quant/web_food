const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data.json');
let db = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Helpers to parse numbers with commas (e.g. 2,7 -> 2.7)
const parseNum = (match) => {
  if (!match) return 0;
  return parseFloat(match[1].replace(',', '.'));
};

db.foods.forEach(food => {
  const nut = (food.nutrition || '').toLowerCase();
  food.super_tags = [];

  // Parse values
  const protein = parseNum(nut.match(/protein\s*([\d,.]+)/));
  const vitC = parseNum(nut.match(/vitamin c\s*([\d,.]+)/));
  const iron = parseNum(nut.match(/sắt\s*([\d,.]+)/));
  const calcium = parseNum(nut.match(/canxi\s*([\d,.]+)/));
  
  // Super Logic Thresholds (Approximate for 100g)
  if (protein >= 15) food.super_tags.push("💪 Siêu Protein");
  if (vitC >= 40) food.super_tags.push("🍊 Siêu Vitamin C");
  if (iron >= 2.5) food.super_tags.push("🩸 Siêu Sắt");
  if (calcium >= 150) food.super_tags.push("🦴 Siêu Canxi");
  if (nut.includes('omega') || nut.includes('dha') || nut.includes('epa')) food.super_tags.push("🐟 Siêu Omega-3");
  if (nut.includes('collagen')) food.super_tags.push("✨ Siêu Collagen");
  
  // High antioxidants based on medical prevention count
  if (food.disease_prevention && food.disease_prevention.length >= 3) {
    food.super_tags.push("🛡️ Đa dụng Phòng bệnh");
  }
});

fs.writeFileSync(dataPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Enriched data with Super Tags!');
