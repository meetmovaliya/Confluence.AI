import { OpenRouterResponse } from '@/types';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function sendMessageToModel(
  modelId: string,
  message: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set in the environment variables.');
  }
  try {

    const messages = [
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://dhanraj.ai',
        'X-Title': 'Dhanraj.AI - AI Model Comparison'
      },
      body: JSON.stringify({
        model: modelId,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data: OpenRouterResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response generated');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error(`Error calling ${modelId}:`, error);
    throw error;
  }
}

export async function sendMessageToMultipleModels(
  modelIds: string[],
  message: string,
  conversationHistory: Record<string, Array<{ role: string; content: string }>> = {}
): Promise<Record<string, { content: string; error?: string }>> {
  const promises = modelIds.map(async (modelId) => {
    try {
      const history = conversationHistory[modelId] || [];
      const content = await sendMessageToModel(modelId, message, history);
      return { modelId, content };
    } catch (error) {
      return { 
        modelId, 
        content: '', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  const results = await Promise.all(promises);
  
  return results.reduce((acc, result) => {
    acc[result.modelId] = {
      content: result.content,
      error: result.error
    };
    return acc;
  }, {} as Record<string, { content: string; error?: string }>);
}
