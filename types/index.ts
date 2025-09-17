export interface AIModel {
  id: string;
  name: string;
  displayName: string;
  color: string;
  provider: string;
  description?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  modelId?: string;
}

export interface ModelResponse {
  modelId: string;
  message: ChatMessage;
  isLoading: boolean;
  error?: string;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  selectedModels: AIModel[];
  createdAt: Date;
}

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
