const fs = require('fs');

const path = 'data_source/Source_medical.md';
let content = fs.readFileSync(path, 'utf8');

// The file has several truncated JSON blocks that end with something like:
// "explanation": "... tim m
// 
// _These search results...
//
// We will use a regex to fix this by replacing the text from the truncated string up to the `_These search results...`
// Since it's hard to guess the exact truncation, we can just replace everything from `_These search results` up to `## References` and add `"` if needed, but it's easier to just find the broken `tim m` and close it.

// Let's replace the common consensus text entirely.
content = content.replace(/_These search results were found and analyzed using Consensus, an AI-powered search engine for research\. Try it at https:\/\/consensus\.app\. © 2026 Consensus NLP, Inc\. Personal, non-commercial use only; redistribution requires copyright holders’ consent\._/g, '');

// There is a specific broken line: "nguy cơ bệnh chuyển hóa và tim m"
content = content.replace(/tim m\s+## References/g, 'tim mạch"\n      }\n    ]\n  }\n]\n```\n## References');
content = content.replace(/tim m\s*```json/g, 'tim mạch"\n      }\n    ]\n  }\n]\n```\n```json');

// Wait, the text is:
// "... tim m\n \n\n \n## References\n```json" (because we removed the Consensus string)

content = content.replace(/tim m\s+## References/g, 'tim mạch"\n      }\n    ]\n  }\n]\n```\n\n## References');

// Let's also close any other unclosed strings that we might have missed. 
// A better way is to just let a resilient JSON parser handle it, or we just fix the known instances.
fs.writeFileSync(path, content, 'utf8');
console.log('Fixed Source_medical.md');
