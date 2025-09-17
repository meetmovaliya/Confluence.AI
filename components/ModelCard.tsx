import { useState } from 'react';
import { AIModel, ChatMessage as ChatMessageType } from '@/types';
import { Copy, Award, X } from 'lucide-react';
import { clsx } from 'clsx';
import ChatMessage from './ChatMessage';
import { copyToClipboard } from '@/lib/utils';

interface ModelCardProps {
  model: AIModel;
  messages: ChatMessageType[];
  isLoading: boolean;
  error?: string;
  onRemove: () => void;
  onCopy: () => void;
  onPickBest: () => void;
  isBest: boolean;
}

export default function ModelCard({
  model,
  messages,
  isLoading,
  error,
  onRemove,
  onCopy,
  onPickBest,
  isBest
}: ModelCardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [copyTimeout, setCopyTimeout] = useState<NodeJS.Timeout | null>(null);

  const lastAssistantMessage = messages
    .filter(m => m.role === 'assistant')
    .pop();

  return (
    <div className="flex flex-col h-full bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden hover:bg-gray-800/60 hover:border-gray-600/60 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 group hover:ring-1 hover:ring-purple-500/30">
      {/* Header */}
      <div className={clsx(
        'relative p-4 bg-gradient-to-r text-white font-semibold text-center group-hover:scale-105 group-hover:shadow-lg transition-all duration-500',
        model.color
      )}>
        <button
          onClick={onRemove}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
          title="Remove model"
        >
          <X size={16} />
        </button>

        <h3 className="text-lg font-bold">{model.displayName}</h3>
        <p className="text-sm opacity-90">{model.provider}</p>

        {isBest && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Award className="text-yellow-300" size={20} />
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-4 overflow-y-auto min-h-0 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-400 py-20 px-16 w-full max-w-lg mx-auto">
              <div className="mb-12">
                {/* Enhanced Animated Circle */}
                <div className="relative w-32 h-32 mx-auto mb-10">
                  {/* Outer rotating ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-1 animate-spin" style={{ animationDuration: '3s' }}>
                    <div className="w-full h-full rounded-full bg-gray-900/80 backdrop-blur-sm"></div>
                  </div>
                  {/* Inner gradient circle */}
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500/30 via-purple-500/40 to-pink-500/30 flex items-center justify-center animate-pulse">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                      <span className="text-white text-2xl font-bold animate-bounce" style={{ animationDuration: '2s' }}>AI</span>
                    </div>
                  </div>
                  {/* Floating particles */}
                  <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute top-1/2 -right-3 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
                </div>

                <p className="text-2xl font-bold text-gray-200 mb-4 animate-fade-in">Ready to chat!</p>
                <p className="text-base text-gray-300 leading-relaxed mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>{model.description}</p>
              </div>
              <div className="text-sm text-gray-500 opacity-80 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                Start a conversation to see responses from this AI model
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLoading={message.role === 'assistant' && isLoading && message === messages[messages.length - 1]}
                error={message.role === 'assistant' && error && message === messages[messages.length - 1] ? error : undefined}
                modelName={model.provider}
              />
            ))}
          </div>
        )}

        {/* Loading state for new message */}
        {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <div className="flex gap-3 p-4 rounded-lg mb-3 bg-gray-800/60 border border-gray-600/50 shadow-lg">
            <div className="flex-shrink-0 relative">
              {/* Outer rotating ring */}
              <div className="w-8 h-8 rounded-full border-2 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-0.5 animate-spin">
                <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                  {/* Inner pulsing dot */}
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              {/* Orbiting dots */}
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
                <div className="absolute top-0 left-1/2 w-1 h-1 bg-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-ping"></div>
              </div>
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s', animationDelay: '0.5s' }}>
                <div className="absolute top-1/2 right-0 w-1 h-1 bg-purple-400 rounded-full transform translate-x-1/2 -translate-y-1/2 animate-ping"></div>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-white text-sm font-semibold mb-1 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {model.provider}
              </div>
              <div className="text-gray-300 text-sm flex items-center gap-2">
                <span className="animate-pulse">Thinking</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1 h-1 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-700/50 bg-gray-800/30 group-hover:bg-gray-700/40 transition-colors duration-500">
        <div className="flex gap-2">
          <button
            onClick={async () => {
              if (lastAssistantMessage) {
                try {
                  await copyToClipboard(lastAssistantMessage.content);
                  setIsCopied(true);

                  // Clear existing timeout
                  if (copyTimeout) {
                    clearTimeout(copyTimeout);
                  }

                  // Reset after 2 seconds
                  const timeout = setTimeout(() => {
                    setIsCopied(false);
                    setCopyTimeout(null);
                  }, 2000);

                  setCopyTimeout(timeout);
                } catch (error) {
                  console.error('Failed to copy response:', error);
                }
              }
            }}
            disabled={!lastAssistantMessage}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-md',
              lastAssistantMessage
                ? isCopied
                  ? 'bg-green-600/50 hover:bg-green-600 text-green-300 shadow-lg'
                  : 'text-white shadow-lg hover:scale-110'
                : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
            )}
            style={{
              background: lastAssistantMessage && !isCopied
                ? model.color.includes('from-')
                  ? `linear-gradient(135deg, ${model.color.replace('from-', '').replace(' to-', ',').replace('-500', '')})`
                  : model.color
                : undefined
            }}
            title="Copy last response"
          >
            <Copy size={14} className="group-hover:rotate-12 transition-transform duration-300" />
            {isCopied ? 'Copied' : 'Copy'}
          </button>

          <button
            onClick={onPickBest}
            disabled={!lastAssistantMessage}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-md',
              isBest
                ? 'text-white shadow-lg border-2'
                : lastAssistantMessage
                ? 'text-white shadow-lg hover:scale-110'
                : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
            )}
            style={{
              background: lastAssistantMessage
                ? model.color.includes('from-')
                  ? `linear-gradient(135deg, ${model.color.replace('from-', '').replace(' to-', ',').replace('-500', '')})`
                  : model.color
                : undefined,
              borderColor: isBest
                ? model.color.includes('from-')
                  ? model.color.replace('from-', '').replace(' to-', '').replace('-500', '').split(',')[0]
                  : model.color
                : undefined
            }}
            title={isBest ? 'Best response' : 'Pick as best'}
          >
            <Award size={14} className="group-hover:scale-110 transition-transform duration-300" />
            {isBest ? 'Best' : 'Pick best'}
          </button>
        </div>
      </div>
    </div>
  );
}
