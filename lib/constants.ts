import { AIModel } from '@/types';

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: 'deepseek/deepseek-r1-0528:free',
    name: 'deepseek/deepseek-r1-0528:free',
    displayName: 'DeepSeek R1 0528',
    color: 'from-purple-500 to-pink-500',
    provider: 'DeepSeek',
    description: 'Advanced reasoning model with strong analytical capabilities'
  },
  {
    id: 'meta-llama/llama-3.3-8b-instruct:free',
    name: 'meta-llama/llama-3.3-8b-instruct:free',
    displayName: 'Meta Llama 3.3 8B',
    color: 'from-green-500 to-emerald-500',
    provider: 'Meta',
    description: 'Large language model optimized for instruction following'
  },
  {
    id: 'mistralai/mistral-7b-instruct:free',
    name: 'mistralai/mistral-7b-instruct:free',
    displayName: 'Mistral 7B Instruct',
    color: 'from-orange-500 to-amber-500',
    provider: 'Mistral AI',
    description: 'Efficient and capable instruction-tuned model'
  },
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'google/gemini-2.0-flash-exp:free',
    displayName: 'Google Gemini 2.0 Flash',
    color: 'from-blue-500 to-cyan-500',
    provider: 'Google',
    description: 'Fast and experimental multimodal AI model'
  }
];

export const DEFAULT_MODELS = AVAILABLE_MODELS.slice(0, 4);

export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
