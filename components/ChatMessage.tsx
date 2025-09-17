import { ChatMessage as ChatMessageType } from '@/types';
import { User, Bot } from 'lucide-react';
import { clsx } from 'clsx';
import { formatTimestamp } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
  isLoading?: boolean;
  error?: string;
  modelName?: string;
}

export default function ChatMessage({ message, isLoading, error, modelName }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={clsx(
      'flex gap-3 p-4 rounded-lg mb-3',
      isUser
        ? 'bg-blue-500/10 border border-blue-500/20'
        : 'bg-gray-800/50 border border-gray-700/50'
    )}>
      <div className={clsx(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
        isUser
          ? 'bg-blue-500/20 text-blue-400'
          : 'bg-gray-700/50 text-gray-300'
      )}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={clsx(
            'text-xs font-medium',
            isUser ? 'text-blue-400' : 'text-gray-300'
          )}>
            {isUser ? 'You' : (modelName || 'AI')}
          </span>
          <span className="text-xs text-gray-500">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
        
        {isLoading ? (
          <div className="flex items-center gap-2 text-gray-400">
            <div className="animate-spin w-4 h-4 border-2 border-gray-600 border-t-gray-400 rounded-full"></div>
            <span className="text-sm">Thinking...</span>
          </div>
        ) : error ? (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded p-2">
            <span className="font-medium">Error:</span> {error}
          </div>
        ) : (
          <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
        )}
      </div>
    </div>
  );
}
