const fs = require('fs');
const content = fs.readFileSync('../data_source/Source_medical.md', 'utf8');
const matches = [...content.matchAll(/\"id\":\s*\"([^\"]+)\"[\s\S]*?\"explanation\":\s*\"([^\"]+)\"/g)];
matches.forEach(m => {
  console.log(m[1], ':', m[2].substring(0, 50).replace(/\n/g, ' '));
});
