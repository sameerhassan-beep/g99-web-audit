const fs = require('fs');
const path = require('path');

const agentsDir = path.join(__dirname, '../src/agents');
const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.ts') && f !== 'BaseAgent.ts');

for (const file of files) {
  const filePath = path.join(agentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace import
  content = content.replace(/import \{ groq \} from '@ai-sdk\/groq';/g, "import { google } from '@ai-sdk/google';");

  // Replace model. Use gemini-1.5-flash for cost optimization
  content = content.replace(/model: groq\([^)]+\)/g, "model: google('gemini-1.5-flash')");

  // Some agents might have different base64 handling for Gemini if needed, 
  // but AI SDK normalizes image inputs as base64 data URIs perfectly for Gemini too.
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
}
