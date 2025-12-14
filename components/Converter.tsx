import React, { useState, useEffect, useRef } from 'react';
import { ArrowRightLeft, Copy, Check, RotateCcw, Sparkles, AlertCircle, Camera, Upload, ClipboardPaste, FileText, ImageIcon } from 'lucide-react';
import { convertNudiToUnicode, extractTextFromImage } from '../services/geminiService';
import { AppState, ToastNotification, ConversionHistoryItem } from '../types';
import CameraModal from './CameraModal';

interface ConverterProps {
  addToHistory: (original: string, converted: string) => void;
  selectedHistoryItem: ConversionHistoryItem | null;
}

const Converter: React.FC<ConverterProps> = ({ addToHistory, selectedHistoryItem }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [scanning, setScanning] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load selected history item into view
  useEffect(() => {
    if (selectedHistoryItem) {
      setInput(selectedHistoryItem.original);
      setOutput(selectedHistoryItem.converted);
      setState(AppState.SUCCESS);
    }
  }, [selectedHistoryItem]);

  const handleConvert = async (textToConvert = input) => {
    if (!textToConvert.trim()) return;

    setState(AppState.CONVERTING);
    setErrorMsg(null);
    try {
      const result = await convertNudiToUnicode(textToConvert);
      setOutput(result);
      setState(AppState.SUCCESS);
      addToHistory(textToConvert, result);
    } catch (error) {
      setState(AppState.ERROR);
      setErrorMsg("Failed to convert. Please check your connection and try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && state !== AppState.CONVERTING) {
        handleConvert();
      }
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setState(AppState.IDLE);
    setErrorMsg(null);
  };

  // --- Input Methods ---

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInput(text);
        // Optional: Auto-convert on paste? Let's user decide.
      }
    } catch (err) {
      console.error('Failed to read clipboard', err);
      // Fallback: Focus textarea so user can manually paste (Ctrl+V)
      // Note: Firefox requires user permission or specific context for readText
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset value so same file can be selected again
    e.target.value = '';
  };

  const processFile = async (file: File) => {
    if (file.type.startsWith('image/')) {
      // Process Image
      setScanning(true);
      setErrorMsg(null);
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = (reader.result as string).split(',')[1];
          const extractedText = await extractTextFromImage(base64String, file.type);
          setInput(extractedText);
          setScanning(false);
          handleConvert(extractedText);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setScanning(false);
        setErrorMsg("Failed to extract text from image.");
      }
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      // Process Text File
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setInput(text);
        handleConvert(text);
      };
      reader.readAsText(file);
    } else {
      setErrorMsg("Unsupported file type. Please use .txt, .png, .jpg, or .jpeg files.");
    }
  };

  const handleCameraCapture = async (base64Image: string) => {
    setScanning(true);
    setErrorMsg(null);
    try {
      const extractedText = await extractTextFromImage(base64Image, 'image/jpeg');
      setInput(extractedText);
      setScanning(false);
      handleConvert(extractedText);
    } catch (err) {
      setScanning(false);
      setErrorMsg("Failed to process captured image.");
    }
  };

  // --- Drag and Drop Handlers ---

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 lg:p-8">
      
      <CameraModal 
        isOpen={isCameraOpen} 
        onClose={() => setIsCameraOpen(false)} 
        onCapture={handleCameraCapture} 
      />

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div>
           <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-2 h-8 bg-orange-500 rounded-full"></span>
            Converter
           </h2>
           <p className="text-sm text-gray-500 mt-1">Paste Nudi text or upload images</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleClear}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all shadow-sm"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear
          </button>
          <button
            onClick={() => handleConvert()}
            disabled={state === AppState.CONVERTING || scanning || !input.trim()}
            className={`flex items-center px-6 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all shadow-md
              ${state === AppState.CONVERTING || scanning || !input.trim() 
                ? 'bg-orange-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 hover:shadow-lg'}`}
          >
            {state === AppState.CONVERTING || scanning ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {scanning ? 'Scanning...' : 'Converting...'}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Convert with AI
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 relative">
        
        {/* Input Section */}
        <div 
          className="flex flex-col group relative"
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          {/* Input Toolbar */}
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">Input (Nudi ASCII)</label>
            <div className="flex gap-1">
              <button 
                onClick={handlePaste}
                title="Paste from Clipboard"
                className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
              >
                <ClipboardPaste className="w-4 h-4" />
              </button>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload}
                accept=".txt,.png,.jpg,.jpeg,image/*" 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                title="Upload File or Image"
                className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
              >
                <Upload className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => setIsCameraOpen(true)}
                title="Scan with Camera"
                className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={scanning}
              placeholder={scanning ? "Analyzing image for text..." : "Type, paste, or drag & drop files here.\nSupports: .txt, .png, .jpg, .jpeg\nExample: PÀ£ÀßqÀ"}
              className={`w-full h-80 p-5 rounded-2xl bg-white border shadow-sm text-gray-800 font-mono text-base resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none 
                ${isDragOver ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200' : 'border-gray-200'}
                ${scanning ? 'opacity-50' : 'opacity-100'}
              `}
              spellCheck={false}
            />
            
            {/* Drag Overlay */}
            {isDragOver && (
              <div className="absolute inset-0 z-10 bg-white/90 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-orange-500 text-orange-600">
                <Upload className="w-10 h-10 mb-2 animate-bounce" />
                <span className="font-semibold">Drop file to scan</span>
              </div>
            )}

            {/* Scanning Overlay */}
            {scanning && (
              <div className="absolute inset-0 z-10 bg-white/80 rounded-2xl flex flex-col items-center justify-center backdrop-blur-sm">
                <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mb-3"></div>
                <span className="text-orange-600 font-medium">Extracting Text from Image...</span>
              </div>
            )}

            <div className="absolute top-0 right-0 h-full w-2 bg-gradient-to-l from-gray-50/50 to-transparent pointer-events-none rounded-r-2xl" />
          </div>
          <div className="flex justify-between mt-1 px-1">
             <span className="text-xs text-gray-400">Supports .txt, .png, .jpg</span>
             <span className="text-xs text-gray-400">{input.length} chars</span>
          </div>
        </div>

        {/* Divider for Mobile */}
        <div className="lg:hidden flex justify-center py-2 text-gray-400">
           <ArrowRightLeft className="w-6 h-6 rotate-90" />
        </div>

        {/* Desktop Arrow Overlay */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-white p-3 rounded-full shadow-lg border border-gray-100 text-orange-500">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
        </div>

        {/* Output Section */}
        <div className="flex flex-col group">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">Output (Unicode)</label>
            {output && (
              <button 
                onClick={handleCopy}
                className="text-xs flex items-center text-orange-600 hover:text-orange-700 font-medium transition-colors bg-orange-50 px-2 py-1 rounded-md"
              >
                {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                {copied ? 'Copied' : 'Copy Result'}
              </button>
            )}
          </div>
          
          <div className="relative flex-1">
            <textarea
              readOnly
              value={output}
              placeholder="Converted Unicode text will appear here..."
              className={`w-full h-80 p-5 rounded-2xl bg-gray-50 border border-gray-200 shadow-inner text-gray-900 text-xl resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none kannada-text
                ${state === AppState.CONVERTING ? 'opacity-70 animate-pulse' : 'opacity-100'}
              `}
            />
            {state === AppState.ERROR && (
               <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl backdrop-blur-sm">
                 <div className="text-center p-4">
                   <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
                   <p className="text-red-600 font-medium">{errorMsg}</p>
                 </div>
               </div>
            )}
          </div>
          <div className="flex justify-end mt-1 px-1">
             <span className="text-xs text-gray-400">{output.length} chars</span>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
         <div className="bg-blue-100 p-2 rounded-lg text-blue-600 shrink-0">
           <Sparkles className="w-5 h-5" />
         </div>
         <div>
           <h3 className="text-sm font-semibold text-blue-900">Powered by Gemini AI</h3>
           <p className="text-sm text-blue-700 mt-1">
             This tool uses Google's advanced Gemini 2.5 Flash model to intelligently convert font encodings. 
             It also supports <strong>Optical Character Recognition (OCR)</strong> to extract text from images and screenshots directly in the browser.
           </p>
         </div>
      </div>
    </div>
  );
};

export default Converter;