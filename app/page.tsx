'use client';

import { useState, useCallback, useEffect } from 'react';
import { AIModel, ChatMessage } from '@/types';
import { AVAILABLE_MODELS, DEFAULT_MODELS } from '@/lib/constants';
import ModelCard from '@/components/ModelCard';
import MessageInput from '@/components/MessageInput';
import ModelSelector from '@/components/ModelSelector';
import { clsx } from 'clsx';
import { generateId } from '@/lib/utils';

export default function Home() {
  const [selectedModels, setSelectedModels] = useState<AIModel[]>(DEFAULT_MODELS);
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [bestResponseId, setBestResponseId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showModuleSelector, setShowModuleSelector] = useState(false);
  const [fullScreenModel, setFullScreenModel] = useState<AIModel | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addModel = useCallback((model: AIModel) => {
    setSelectedModels(prev => [...prev, model]);
    // Only initialize empty conversation if it doesn't exist
    setConversations(prev => ({
      ...prev,
      [model.id]: prev[model.id] || []  // Preserve existing conversation or create empty array
    }));
  }, []);

  const removeModel = useCallback((modelId: string) => {
    setSelectedModels(prev => prev.filter(m => m.id !== modelId));
    // Keep conversation history - don't delete it
    // setConversations(prev => {
    //   const newConversations = { ...prev };
    //   delete newConversations[modelId];
    //   return newConversations;
    // });
    if (bestResponseId?.startsWith(modelId)) {
      setBestResponseId(null);
    }
  }, [bestResponseId]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || selectedModels.length === 0) return;

    setIsLoading(true);
    setBestResponseId(null);

    // Add user message to all conversations
    const userMessage: ChatMessage = {
      id: generateId(),
      content: message,
      role: 'user',
      timestamp: new Date()
    };

    const updatedConversations = { ...conversations };
    selectedModels.forEach(model => {
      updatedConversations[model.id] = [
        ...(updatedConversations[model.id] || []),
        userMessage
      ];
    });
    setConversations(updatedConversations);

    try {
      // Prepare conversation history for each model
      const conversationHistory: Record<string, Array<{ role: string; content: string }>> = {};
      selectedModels.forEach(model => {
        conversationHistory[model.id] = (updatedConversations[model.id] || [])
          .slice(0, -1) // Exclude the current message
          .map(msg => ({
            role: msg.role,
            content: msg.content
          }));
      });

      // Send message to all models via API route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelIds: selectedModels.map(m => m.id),
          message,
          conversationHistory
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const responses = await response.json();

      // Add AI responses to conversations
      setConversations(prev => {
        const newConversations = { ...prev };
        
        selectedModels.forEach(model => {
          const response = responses[model.id];
          const aiMessage: ChatMessage = {
            id: generateId(),
            content: response.error || response.content,
            role: 'assistant',
            timestamp: new Date()
          };

          newConversations[model.id] = [
            ...(newConversations[model.id] || []),
            aiMessage
          ];
        });

        return newConversations;
      });
    } catch (error) {
      console.error('Error sending messages:', error);
      
      // Add error messages to all conversations
      setConversations(prev => {
        const newConversations = { ...prev };
        
        selectedModels.forEach(model => {
          const errorMessage: ChatMessage = {
            id: generateId(),
            content: 'Failed to get response. Please try again.',
            role: 'assistant',
            timestamp: new Date()
          };

          newConversations[model.id] = [
            ...(newConversations[model.id] || []),
            errorMessage
          ];
        });

        return newConversations;
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedModels, conversations]);

  const copyResponse = useCallback(async (modelId: string) => {
    const modelConversation = conversations[modelId] || [];
    const lastAssistantMessage = modelConversation
      .filter(m => m.role === 'assistant')
      .pop();

    if (lastAssistantMessage) {
      try {
        await navigator.clipboard.writeText(lastAssistantMessage.content);
        // Could add a toast notification here
        console.log('Response copied to clipboard');
      } catch (error) {
        console.error('Failed to copy response:', error);
      }
    }
  }, [conversations]);

  const pickBest = useCallback((modelId: string) => {
    const responseId = `${modelId}-${Date.now()}`;
    setBestResponseId(bestResponseId === responseId ? null : responseId);

    // Set full screen mode
    const model = selectedModels.find(m => m.id === modelId);
    if (model) {
      setFullScreenModel(model);
    }
  }, [bestResponseId, selectedModels]);

  const exitFullScreen = useCallback(() => {
    setFullScreenModel(null);
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Animated background particles - only render on client */}
      {mounted && (
        <div className="particles">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${4 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Header with Logo */}
      <header className="glass border-b border-gray-700/50 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* Left Side - Logo Only */}
          <div
            className="flex items-center gap-3 group cursor-pointer"
            onClick={() => window.location.reload()}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center glow-blue pulse-glow group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
              <span className="text-white font-bold text-lg group-hover:rotate-12 transition-transform duration-300">D</span>
            </div>
            <div className="group-hover:translate-x-1 transition-transform duration-300">
              <h1 className="text-xl font-bold gradient-text group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">Dhanraj.AI</h1>
              <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Compare AI models in real-time</p>
            </div>
          </div>

          {/* Right Side - Module Bars + Toggle Button */}
          <div className="flex items-center gap-3">
            {/* Module Bars - Show when expanded */}
            {showModuleSelector && (
              <div className="flex flex-wrap gap-4 ml-4">
                {AVAILABLE_MODELS.map((model) => {
                  const isSelected = selectedModels.some(m => m.id === model.id);
                  return (
                    <button
                      key={model.id}
                      onClick={(e) => {
                        e.preventDefault();
                        if (isSelected) {
                          removeModel(model.id);
                        } else {
                          addModel(model);
                        }
                      }}
                      className={clsx(
                        'px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap hover:scale-110 hover:shadow-lg hover:-translate-y-0.5',
                        isSelected
                          ? 'bg-gradient-to-r text-white shadow-lg transform scale-105 ring-2 ring-white/20'
                          : 'bg-gray-700/50 hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-500 text-gray-300 hover:text-white'
                      )}
                      style={{
                        background: isSelected ? `linear-gradient(135deg, ${model.color.replace('from-', '').replace('to-', '').replace('-500', '')})` : undefined
                      }}
                    >
                      <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
                      <span className="truncate max-w-20">{model.provider}</span>
                      {isSelected && <span className="text-xs opacity-75">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Module Toggle Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowModuleSelector(!showModuleSelector);
              }}
              className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 hover:scale-105"
            >
              <span className={`transform transition-transform ${showModuleSelector ? '' : 'rotate-180'}`}>
                ◀
              </span>
              <span>Models</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full p-4 overflow-hidden">
          {fullScreenModel ? (
            /* Full Screen Mode */
            <div className="h-full relative">
              <button
                onClick={exitFullScreen}
                className="absolute top-4 right-4 z-10 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <span>✕</span>
                <span>Exit Full Screen</span>
              </button>
              <div className="h-full pt-16">
                <ModelCard
                  model={fullScreenModel}
                  messages={conversations[fullScreenModel.id] || []}
                  isLoading={isLoading}
                  onRemove={() => {
                    removeModel(fullScreenModel.id);
                    setFullScreenModel(null);
                  }}
                  onCopy={() => copyResponse(fullScreenModel.id)}
                  onPickBest={() => pickBest(fullScreenModel.id)}
                  isBest={bestResponseId?.startsWith(fullScreenModel.id) || false}
                />
              </div>
            </div>
          ) : selectedModels.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-3xl font-bold">AI</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-200 mb-2">Welcome to Dhanraj.AI</h2>
                <p className="text-gray-400 mb-6 max-w-md">
                  Click the "Models" button above to select AI models and start comparing their responses in real-time.
                </p>
                <div className="text-sm text-gray-500">
                  Choose from DeepSeek, Llama, Mistral, and Gemini models
                </div>
              </div>
            </div>
          ) : (
            <div className={clsx(
              'grid gap-8 h-full overflow-hidden',
              selectedModels.length === 1 && 'grid-cols-1 grid-rows-1',
              selectedModels.length === 2 && 'grid-cols-1 lg:grid-cols-2 grid-rows-3 lg:grid-rows-1',
              selectedModels.length === 3 && 'grid-cols-1 lg:grid-cols-3 grid-rows-4 lg:grid-rows-1',
              selectedModels.length >= 4 && 'grid-cols-2 lg:grid-cols-4 grid-rows-3 lg:grid-rows-1'
            )}>
              {selectedModels.map((model) => (
                <div key={model.id} className="h-full overflow-hidden">
                  <ModelCard
                    model={model}
                    messages={conversations[model.id] || []}
                    isLoading={isLoading}
                    onRemove={() => removeModel(model.id)}
                    onCopy={() => copyResponse(model.id)}
                    onPickBest={() => pickBest(model.id)}
                    isBest={bestResponseId?.startsWith(model.id) || false}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Message Input */}
      <div className="flex-shrink-0">
        <MessageInput
          onSendMessage={sendMessage}
          isLoading={isLoading}
          modelCount={selectedModels.length}
        />
      </div>
    </div>
  );
}
