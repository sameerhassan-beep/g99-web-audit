const { generateText } = require('ai');
const { createGoogleGenerativeAI } = require('@ai-sdk/google');

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
});

async function test() {
  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: 'Hello, what model are you?',
    });
    console.log("Success with gemini-2.5-flash:", text);
  } catch (err) {
    console.error("Failed:", err.message);
  }
}
test();
