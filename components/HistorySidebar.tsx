import React from 'react';
import { ConversionHistoryItem } from '../types';
import { History, Trash2, ArrowRight } from 'lucide-react';

interface HistorySidebarProps {
  history: ConversionHistoryItem[];
  onSelect: (item: ConversionHistoryItem) => void;
  onClear: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelect, onClear, isOpen, onClose }) => {
  return (
    <div 
      className={`fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center space-x-2 text-gray-800">
          <History className="w-5 h-5" />
          <h2 className="font-semibold">History</h2>
        </div>
        <button 
          onClick={onClose} 
          className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col h-[calc(100%-4rem)]">
        {history.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
            <History className="w-12 h-12 mb-3 opacity-20" />
            <p>No recent conversions</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className="w-full text-left p-3 rounded-lg border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all group"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs text-gray-400 font-mono">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate mb-1 font-mono">{item.original}</p>
                <p className="text-sm text-gray-800 font-medium truncate kannada-text">{item.converted}</p>
              </button>
            ))}
          </div>
        )}

        {history.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <button
              onClick={onClear}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorySidebar;