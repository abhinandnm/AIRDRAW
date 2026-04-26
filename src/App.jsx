import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useHandTracking } from './hooks/useHandTracking';
import DrawingCanvas from './components/DrawingCanvas';
import Toolbar from './components/Toolbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Sparkles, MousePointer2, Info, Hand } from 'lucide-react';
import confetti from 'canvas-confetti';

function App() {
  const videoRef = useRef(null);
  const bgVideoRef = useRef(null);
  const { handLandmarker, isLoading, error } = useHandTracking();
  const [handLandmarks, setHandLandmarks] = useState([]);
  const [color, setColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(15);
  const [isErasing, setIsErasing] = useState(false);
  const [mode, setMode] = useState('normal');
  const [clearSignal, setClearSignal] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [videoAspectRatio, setVideoAspectRatio] = useState(16/9);

  // Setup Camera
  useEffect(() => {
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: false
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
        if (bgVideoRef.current) bgVideoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera error:", err);
      }
    };
    setupCamera();
  }, []);

  const handleVideoLoad = (e) => {
    const { videoWidth, videoHeight } = e.target;
    if (videoWidth && videoHeight) {
      setVideoAspectRatio(videoWidth / videoHeight);
    }
  };

  // Prediction Loop
  useEffect(() => {
    let lastVideoTime = -1;
    let requestRef;

    const predict = () => {
      if (videoRef.current && handLandmarker && videoRef.current.readyState >= 2) {
        const startTimeMs = performance.now();
        if (videoRef.current.currentTime !== lastVideoTime) {
          lastVideoTime = videoRef.current.currentTime;
          const results = handLandmarker.detectForVideo(videoRef.current, startTimeMs);
          setHandLandmarks(results.landmarks);
        }
      }
      requestRef = requestAnimationFrame(predict);
    };

    if (!isLoading && handLandmarker) predict();
    return () => cancelAnimationFrame(requestRef);
  }, [handLandmarker, isLoading]);

  const handleClear = useCallback(() => {
    setClearSignal(prev => prev + 1);
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.8 },
      colors: ['#6366f1', '#a855f7', '#ec4899', '#fbbf24']
    });
  }, []);

  const handleDownload = useCallback(() => {
    const canvases = document.querySelectorAll('canvas');
    if (canvases.length > 0) {
      const mainCanvas = canvases[0];
      const link = document.createElement('a');
      link.download = `airdraw-${Date.now()}.png`;
      link.href = mainCanvas.toDataURL();
      link.click();
    }
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-black">
        <h1 className="text-2xl font-bold text-red-500">Camera or AI Error</h1>
        <p className="text-white-60">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden">
      {/* Background Effects */}
      <div className="scanline" />
      <div className="bg-glow top-[-10%] left-[-10%]" />
      <div className="bg-glow bottom-[-10%] right-[-10%]" />

      {/* Background Video */}
      <video
        ref={bgVideoRef}
        autoPlay playsInline muted
        className="absolute inset-0 w-full h-full object-cover grayscale opacity-10 mirror"
        style={{ filter: 'blur(15px) brightness(0.2)' }}
      />

      {/* Main Container */}
      <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
        {/* Workspace */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative glass glass-blur overflow-hidden flex items-center justify-center shadow-2xl"
          style={{ 
            width: '100%', 
            height: '100%', 
            maxWidth: `calc(min(90vw, 75vh * ${videoAspectRatio}))`,
            maxHeight: `calc(min(75vh, 90vw / ${videoAspectRatio}))`,
            aspectRatio: videoAspectRatio,
            marginBottom: '100px'
          }}
        >
          <video
            ref={videoRef}
            onLoadedMetadata={handleVideoLoad}
            autoPlay playsInline muted
            className="absolute inset-0 w-full h-full object-fill mirror"
          />
          <DrawingCanvas 
            handLandmarks={handLandmarks} 
            color={color} 
            brushSize={brushSize}
            isErasing={isErasing}
            mode={mode}
            clearSignal={clearSignal}
          />
        </motion.div>
      </div>

      {/* UI Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-black-90 backdrop-blur-2xl flex flex-col items-center justify-center gap-6"
          >
            <Sparkles className="w-16 h-16 text-purple-500 animate-pulse" />
            <h2 className="text-3xl font-bold text-white tracking-widest">CALIBRATING AI</h2>
            <div className="w-48 h-1 bg-white-10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className="w-full h-full bg-purple-500"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toolbar 
        color={color} setColor={setColor} 
        brushSize={brushSize} setBrushSize={setBrushSize}
        isErasing={isErasing} setIsErasing={setIsErasing}
        mode={mode} setMode={setMode}
        onClear={handleClear}
        onDownload={handleDownload}
      />

      {/* Header */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-50">
        <h1 className="text-3xl font-black tracking-[0.4em] text-white glitch-hover">
          AIR<span className="text-purple-500">DRAW</span>
        </h1>
        <div className="flex items-center gap-2 glass glass-blur px-4 py-1-5 rounded-full border border-white-10">
          <div className={`w-2 h-2 rounded-full ${handLandmarks.length > 0 ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white-60">
            {handLandmarks.length > 0 ? 'Precision Active' : 'Aligning Sensor'}
          </span>
        </div>
      </div>

      {/* Floating Info */}
      <button 
        onClick={() => setShowInstructions(true)}
        className="fixed bottom-8 right-8 glass glass-blur p-4 hover:bg-white-10 transition-all z-50 rounded-2xl"
      >
        <Info size={24} className="text-white-60" />
      </button>

      {/* Instructions Modal */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-200 bg-black-80 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setShowInstructions(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="glass glass-blur w-full max-w-md p-10 flex flex-col gap-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-6">
                <div className="p-4 bg-purple-20 rounded-3xl text-purple-400">
                  <Hand size={40} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Pro Setup</h2>
                  <p className="text-white-40">Precision Air Drawing</p>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="glass-card flex items-center gap-6 p-4">
                  <div className="w-10 h-10 rounded-full bg-white-10 flex items-center justify-center text-sm font-bold">1</div>
                  <p className="text-white text-base">Point your <span className="text-purple-400 font-bold underline underline-offset-4">Index Finger</span> up to draw.</p>
                </div>
                <div className="glass-card flex items-center gap-6 p-4">
                  <div className="w-10 h-10 rounded-full bg-white-10 flex items-center justify-center text-sm font-bold">2</div>
                  <p className="text-white text-base">Use your <span className="text-purple-400 font-bold">Mouse</span> for pixel-perfect detail.</p>
                </div>
              </div>

              <button 
                onClick={() => setShowInstructions(false)}
                className="primary w-full py-5 rounded-2xl text-2xl font-bold"
              >
                Enter Studio
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
