const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const getGroqResponse = async (prompt: string): Promise<string> => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{role: 'user', content: prompt}],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq request failed: ${errorText}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? '';
};
