import { createGroq } from '@ai-sdk/groq';

// Create a Groq client instance for the AI SDK
// It automatically uses the GROQ_API_KEY environment variable.
export const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
});

/**
 * Standard text generation model using Groq (Llama 3 8B is extremely fast and cheap)
 */
export const defaultChatModel = groq('llama3-8b-8192');

/**
 * Advanced model for complex reasoning or tool-calling tasks
 */
export const advancedChatModel = groq('llama3-70b-8192');
