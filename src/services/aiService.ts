import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

export async function generateAnswer(
  question: string,
  context: string
): Promise<string> {
  try {
    if (!API_KEY) {
      console.warn(
        '[aiService] Gemini API key is missing. Set EXPO_PUBLIC_GEMINI_API_KEY.'
      );
      return 'I am currently offline. Please set up my API key so I can answer your questions!';
    }

    const genAI = new GoogleGenerativeAI(API_KEY);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });

    const prompt = `You are Layman, a friendly news explainer.

Rules:
- Answer in 1 to 2 short sentences.
- Use very simple English.
- Be direct and clear.
- Do not use jargon.
- Base the answer only on the context below.
- If the context is not enough, say that clearly in simple words.

Context:
${context || 'No article context provided.'}

Question:
${question}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return responseText.replace(/\n+/g, ' ').trim();
  } catch (error) {
    console.error('[aiService] Failed to generate answer:', error);
    return 'I am having trouble processing that right now. Please try again later.';
  }
}