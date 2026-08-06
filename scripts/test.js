const fs = require('fs');
const db = require('../data.json');
const content = fs.readFileSync('../data_source/Source_medical.md', 'utf8');

const matches = [...content.matchAll(/\"id\":\s*\"([^\"]+)\"/g)].map(m => m[1]);
const uniqueIds = [...new Set(matches)];

function normalizeStr(str) {
  if (!str) return "";
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

const acronymMap = {
  "rng": "rau ngot",
  "rm": "rau muong",
  "bd": "bi do",
  "md": "muop dang",
  "dtau": "trai dau tam",
  "toi": "toi",
  "gung": "gung",
  "nghe": "nghe",
  "rcn": "rau chum ngay",
  "ct": "can tay",
  "toi_den": "toi den"
};

let unmapped = [];
uniqueIds.forEach(id => {
  const mappedName = acronymMap[id.toLowerCase()] || id;
  const targetNorm = normalizeStr(mappedName);
  
  const found = db.foods.find(f => normalizeStr(f.name).includes(targetNorm) || targetNorm.includes(normalizeStr(f.name)));
  if (!found) {
    unmapped.push(id);
  }
});

console.log('Unmapped IDs:', unmapped.join(', '));
