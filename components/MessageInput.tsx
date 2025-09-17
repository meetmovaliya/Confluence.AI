import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  modelCount: number;
}

export default function MessageInput({ onSendMessage, isLoading, modelCount }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-700/50 bg-gray-900/80 backdrop-blur-sm p-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={modelCount > 0 ? "Ask me anything..." : "Add some AI models to start chatting"}
              disabled={isLoading || modelCount === 0}
              className={clsx(
                'w-full px-4 py-3 pr-12 bg-gray-800/50 border border-gray-700/50 rounded-xl',
                'text-gray-200 placeholder-gray-500 resize-none',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'min-h-[52px] max-h-32'
              )}
              rows={1}
              style={{
                height: 'auto',
                minHeight: '52px'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 128) + 'px';
              }}
            />
            
            {/* Status indicator */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isLoading ? (
                <Loader2 className="animate-spin text-blue-400" size={20} />
              ) : (
                <div className={clsx(
                  'flex items-center gap-1 text-xs',
                  modelCount > 0 ? 'text-green-400' : 'text-gray-500'
                )}>
                  <div className={clsx(
                    'w-2 h-2 rounded-full',
                    modelCount > 0 ? 'bg-green-400' : 'bg-gray-500'
                  )}></div>
                  {modelCount > 0 ? `${modelCount} models ready` : 'No models'}
                </div>
              )}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!message.trim() || isLoading || modelCount === 0}
            className={clsx(
              'flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              message.trim() && !isLoading && modelCount > 0
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-blue-500/25'
                : 'bg-gray-700/50 text-gray-500'
            )}
            title="Send message"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          Press Enter to send • Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}
