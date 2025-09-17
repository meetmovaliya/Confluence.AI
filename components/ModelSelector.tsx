import { useState } from 'react';
import { AIModel } from '@/types';
import { Plus, X, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

interface ModelSelectorProps {
  availableModels: AIModel[];
  selectedModels: AIModel[];
  onAddModel: (model: AIModel) => void;
  onRemoveModel: (modelId: string) => void;
}

export default function ModelSelector({
  availableModels,
  selectedModels,
  onAddModel,
  onRemoveModel
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const unselectedModels = availableModels.filter(
    model => !selectedModels.find(selected => selected.id === model.id)
  );

  return (
    <div className="flex items-center gap-3">
      {/* Selected Models */}
      <div className="flex items-center gap-2">
        {selectedModels.map((model) => (
          <div
            key={model.id}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-white',
              'bg-gradient-to-r', model.color
            )}
          >
            <span>{model.displayName}</span>
            <button
              onClick={() => onRemoveModel(model.id)}
              className="p-0.5 hover:bg-white/20 rounded-full transition-colors"
              title="Remove model"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Add Model Dropdown */}
      {unselectedModels.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
              'bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white',
              'border border-gray-600/50 hover:border-gray-500/50 transition-colors'
            )}
          >
            <Plus size={14} />
            Add Model
            <ChevronDown 
              size={14} 
              className={clsx('transition-transform', isOpen && 'rotate-180')} 
            />
          </button>

          {isOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />
              
              {/* Dropdown */}
              <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 border border-gray-700/50 rounded-xl shadow-xl z-20 overflow-hidden">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-400 px-2 py-1 mb-1">
                    Available Models
                  </div>
                  {unselectedModels.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        onAddModel(model);
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-2 hover:bg-gray-700/50 rounded-lg transition-colors text-left"
                    >
                      <div className={clsx(
                        'w-3 h-3 rounded-full bg-gradient-to-r',
                        model.color
                      )}></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-200">
                          {model.displayName}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {model.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Model Count */}
      <div className="text-sm text-gray-400">
        Models ({selectedModels.length})
      </div>
    </div>
  );
}
