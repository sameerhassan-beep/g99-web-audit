const fs = require('fs');
const path = require('path');

const agentsDir = path.join(__dirname, '../src/agents');
const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.ts') && f !== 'BaseAgent.ts');

for (const file of files) {
  const filePath = path.join(agentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace model
  content = content.replace(/gemini-1\.5-flash/g, "gemini-2.5-flash");
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file} to gemini-2.5-flash`);
}
