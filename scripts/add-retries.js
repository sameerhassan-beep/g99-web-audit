const fs = require('fs');
const path = require('path');

const agentsDir = path.join(__dirname, '../src/agents');
const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.ts') && f !== 'BaseAgent.ts');

for (const file of files) {
  const filePath = path.join(agentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Inject maxRetries if not present
  if (!content.includes('maxRetries:')) {
    content = content.replace(/model: google\('gemini-2\.5-flash'\),/g, "model: google('gemini-2.5-flash'),\n        maxRetries: 7,");
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file} to add maxRetries`);
  } else {
    console.log(`${file} already has maxRetries`);
  }
}
