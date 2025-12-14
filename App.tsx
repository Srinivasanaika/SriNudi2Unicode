import React, { useState, useEffect } from 'react';
import Converter from './components/Converter';
import HistorySidebar from './components/HistorySidebar';
import { ConversionHistoryItem } from './types';
import { Menu, Github, ExternalLink } from 'lucide-react';

const App: React.FC = () => {
  const [history, setHistory] = useState<ConversionHistoryItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<ConversionHistoryItem | null>(null);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('nudi_conversion_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history when it changes
  useEffect(() => {
    localStorage.setItem('nudi_conversion_history', JSON.stringify(history));
  }, [history]);

  const addToHistory = (original: string, converted: string) => {
    const newItem: ConversionHistoryItem = {
      id: Date.now().toString(),
      original,
      converted,
      timestamp: Date.now(),
    };
    setHistory(prev => [newItem, ...prev].slice(0, 20)); // Keep last 20
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('nudi_conversion_history');
  };

  const handleSelectHistory = (item: ConversionHistoryItem) => {
    setSelectedHistoryItem(item);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen relative font-sans text-gray-900 selection:bg-orange-200 selection:text-orange-900">
      
      {/* Background Theme */}
      <div className="fixed inset-0 -z-10 bg-[#fffbf7]">
        {/* Soft Gradient Mesh */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-50/50 via-white to-red-50/50 opacity-80"></div>
        
        {/* Animated Blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[35rem] h-[35rem] bg-orange-200/30 rounded-full blur-3xl mix-blend-multiply animate-blob"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] bg-red-200/30 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[40rem] h-[40rem] bg-yellow-100/40 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-orange-100/40 rounded-full blur-3xl mix-blend-multiply animate-blob"></div>

        {/* Subtle Noise Texture overlay for polish */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiM1NTUiLz4KPC9zdmc+')]"></div>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-2 rounded-xl shadow-lg shadow-orange-500/20 transform hover:scale-105 transition-transform duration-300">
                <span className="font-bold text-xl tracking-tighter">S</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight tracking-tight text-gray-900 font-display">SriNudi2Unicode</span>
                <span className="text-[10px] font-semibold text-orange-600 uppercase tracking-wider">ASCII to Unicode</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a 
                href="#" 
                className="hidden md:flex items-center text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors bg-white/50 hover:bg-white px-3 py-1.5 rounded-full border border-transparent hover:border-gray-100"
                onClick={(e) => e.preventDefault()}
              >
                <Github className="w-4 h-4 mr-2" />
                Source
              </a>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-xl hover:bg-black/5 text-gray-700 transition-colors relative active:scale-95"
              >
                <Menu className="w-6 h-6" />
                {history.length > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white ring-1 ring-red-100"></span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-0 py-4">
        <Converter 
          addToHistory={addToHistory} 
          selectedHistoryItem={selectedHistoryItem}
        />
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-sm text-gray-500 relative z-10">
        <p className="flex items-center justify-center gap-1.5 bg-white/40 backdrop-blur-sm py-2 px-4 rounded-full inline-block mx-auto shadow-sm border border-white/40">
          Made with <span className="text-red-500 animate-pulse">❤</span> for Kannada
        </p>
      </footer>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 transition-opacity animate-fade-in" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <HistorySidebar 
        history={history}
        onSelect={handleSelectHistory}
        onClear={clearHistory}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

    </div>
  );
};

export default App;