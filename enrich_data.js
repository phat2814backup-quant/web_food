const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data.json');
let db = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const superPath = path.join(__dirname, '../source_supper_food.md');
let superContent = '';
try {
  superContent = fs.readFileSync(superPath, 'utf8');
} catch(e) {
  console.error('Khong tim thay source_supper_food.md', e);
}

const parseNum = (match) => {
  if (!match) return 0;
  return parseFloat(match[1].replace(',', '.'));
};

const normalizeStr = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Extract JSON blocks from superContent
let superData = [];
const regex = /{[\s\S]*?}/g;
const matches = superContent.match(regex);
if (matches) {
  // Try to parse all potential JSON structures and collect categories
  let rawContent = superContent;
  // Let's just find "category_name" and "food_name" by simple text search to be safe against bad JSON
  const cats = [];
  const categoryRegex = /"category_name":\s*"([^"]+)"[\s\S]*?"top_foods":\s*\[([\s\S]*?)\]/g;
  let match;
  while ((match = categoryRegex.exec(rawContent)) !== null) {
     const catName = match[1];
     const foodsBlock = match[2];
     const foodRegex = /"food_name":\s*"([^"]+)"/g;
     let foodMatch;
     while ((foodMatch = foodRegex.exec(foodsBlock)) !== null) {
       superData.push({ category: catName, food: foodMatch[1] });
     }
  }
}

// Apply tags
db.foods.forEach(food => {
  const nut = (food.nutrition || '').toLowerCase();
  food.super_tags = [];

  // Parse values for legacy tags
  const protein = parseNum(nut.match(/protein\s*([\d,.]+)/));
  const vitC = parseNum(nut.match(/vitamin c\s*([\d,.]+)/));
  const iron = parseNum(nut.match(/sắt\s*([\d,.]+)/));
  const calcium = parseNum(nut.match(/canxi\s*([\d,.]+)/));
  
  if (protein >= 15) food.super_tags.push("💪 Siêu Protein");
  if (vitC >= 40) food.super_tags.push("🍊 Siêu Vitamin C");
  if (iron >= 2.5) food.super_tags.push("🩸 Siêu Sắt");
  if (calcium >= 150) food.super_tags.push("🦴 Siêu Canxi");
  if (nut.includes('omega') || nut.includes('dha') || nut.includes('epa')) food.super_tags.push("🐟 Siêu Omega-3");
  if (nut.includes('collagen')) food.super_tags.push("✨ Siêu Collagen");
  if (food.disease_prevention && food.disease_prevention.length >= 3) {
    food.super_tags.push("🛡️ Đa dụng Phòng bệnh");
  }

  // Apply new curated tags from source_supper_food.md
  const foodNameNorm = normalizeStr(food.name);
  superData.forEach(sd => {
    const curFoodNameNorm = normalizeStr(sd.food);
    // if "Rau ngot" matches "Rau ngot"
    if (foodNameNorm.includes(curFoodNameNorm) || curFoodNameNorm.includes(foodNameNorm)) {
       // add custom curated tag
       let badge = '✨';
       if(sd.category.includes('Vitamin C')) badge = '🍊';
       if(sd.category.includes('Chống oxy hóa')) badge = '🍷';
       if(sd.category.includes('Omega-3')) badge = '🐟';
       if(sd.category.includes('Protein')) badge = '💪';
       if(sd.category.includes('vi sinh')) badge = '🦠';
       if(sd.category.includes('Bổ máu')) badge = '🩸';
       if(sd.category.includes('phục hồi')) badge = '🌿';
       if(sd.category.includes('Chất xơ')) badge = '🌾';
       
       const tag = `${badge} ${sd.category}`;
       if (!food.super_tags.includes(tag)) {
         food.super_tags.push(tag);
       }
    }
  });

  // Deduplicate tags (remove legacy tags if there's a curated one that's similar)
  // e.g. If has "Vua Vitamin C" remove "Siêu Vitamin C"
  if (food.super_tags.some(t => t.includes('Vua Vitamin C'))) {
     food.super_tags = food.super_tags.filter(t => !t.includes('Siêu Vitamin C'));
  }
  if (food.super_tags.some(t => t.includes('Nguồn Protein'))) {
     food.super_tags = food.super_tags.filter(t => !t.includes('Siêu Protein'));
  }
  if (food.super_tags.some(t => t.includes('Giàu Omega-3'))) {
     food.super_tags = food.super_tags.filter(t => !t.includes('Siêu Omega-3'));
  }
  if (food.super_tags.some(t => t.includes('Vua Bổ máu'))) {
     food.super_tags = food.super_tags.filter(t => !t.includes('Siêu Sắt') && !t.includes('Siêu Canxi'));
  }
});

fs.writeFileSync(dataPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Enriched data with Super Tags (including source_supper_food)!');
