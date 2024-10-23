export const config = {
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY,
  assistantId: import.meta.env.VITE_ASSISTANT_ID,
};

// Validate environment variables
if (!config.openaiApiKey) {
  console.error('Missing VITE_OPENAI_API_KEY environment variable');
}

if (!config.assistantId) {
  console.error('Missing VITE_ASSISTANT_ID environment variable');
}

export default config;