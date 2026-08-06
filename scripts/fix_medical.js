const fs = require('fs');

const paths = ['data_source/Source_medical.md', 'data_source/Source_fer_food_benh.md'];

for (const path of paths) {
  if (!fs.existsSync(path)) continue;
  let content = fs.readFileSync(path, 'utf8');

  // Let's replace the common consensus text entirely.
  content = content.replace(/_These search results were found and analyzed using Consensus, an AI-powered search engine for research\. Try it at https:\/\/consensus\.app\. © 2026 Consensus NLP, Inc\. Personal, non-commercial use only; redistribution requires copyright holders’ consent\._/g, '');

  // Fix the broken JSON strings
  content = content.replace(/tim m\s+## References/g, 'tim mạch"\n      }\n    ]\n  }\n]\n```\n\n## References');
  content = content.replace(/tim m\s*```json/g, 'tim mạch"\n      }\n    ]\n  }\n]\n```\n```json');
  
  // Fix the broken JSON string at "rượu dâu,
  content = content.replace(/"Làm mứt, rượu dâu,[\s\n]*Dưới đây là dữ liệu JSON/g, '"Làm mứt, rượu dâu"]\n  }\n]\n```\n\nDưới đây là dữ liệu JSON');

  // Fix missing { in disease_prevention
  content = content.replace(/"disease_prevention": \[\s*"disease":/g, '"disease_prevention": [\n      {\n        "disease":');

  fs.writeFileSync(path, content, 'utf8');
  console.log('Fixed ' + path);
}
