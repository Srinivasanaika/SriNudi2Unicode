import React, { useRef, useEffect, useState } from 'react';
import { X, Camera, RefreshCw } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Get base64 data (remove prefix for API)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64Data = dataUrl.split(',')[1];
        onCapture(base64Data);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
          <h3 className="text-white font-medium flex items-center gap-2">
            <Camera className="w-4 h-4" /> Scan Text
          </h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-black/40 text-white hover:bg-white/20 transition-all backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Viewport */}
        <div className="relative aspect-[3/4] sm:aspect-video bg-black flex items-center justify-center">
          {error ? (
            <div className="text-red-400 text-center p-6">
              <p>{error}</p>
              <button onClick={startCamera} className="mt-4 px-4 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20">
                Try Again
              </button>
            </div>
          ) : (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
          )}
          {/* Capture Guide */}
          {!error && (
            <div className="absolute inset-8 border-2 border-white/30 rounded-lg pointer-events-none flex flex-col justify-between p-2">
              <div className="w-full flex justify-between">
                <div className="w-4 h-4 border-l-2 border-t-2 border-white"></div>
                <div className="w-4 h-4 border-r-2 border-t-2 border-white"></div>
              </div>
              <div className="w-full flex justify-between">
                <div className="w-4 h-4 border-l-2 border-b-2 border-white"></div>
                <div className="w-4 h-4 border-r-2 border-b-2 border-white"></div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-6 bg-gray-900 flex justify-center items-center gap-8">
           <button 
             onClick={handleCapture}
             disabled={!!error}
             className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <div className="w-12 h-12 rounded-full bg-orange-500 border-2 border-white"></div>
           </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default CameraModal;