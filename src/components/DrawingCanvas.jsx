import React, { useRef, useEffect, useState, useCallback } from 'react';

const DrawingCanvas = ({ handLandmarks, color, brushSize, isErasing, clearSignal, mode }) => {
  const canvasRef = useRef(null);
  const cursorCanvasRef = useRef(null);
  const pathsRef = useRef([]); 
  const currentPathRef = useRef(null);
  const lastPointRef = useRef(null);
  const smoothedPointRef = useRef(null);
  const particlesRef = useRef([]);
  const requestRef = useRef();
  const isMouseDown = useRef(false);

  // Smoothing constant (0 to 1, lower = smoother but more lag)
  const SMOOTHING = 0.4;

  // Clear canvas
  useEffect(() => {
    if (clearSignal) {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      pathsRef.current = [];
      particlesRef.current = [];
    }
  }, [clearSignal]);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      [canvasRef, cursorCanvasRef].forEach(ref => {
        if (ref.current) {
          const parent = ref.current.parentElement;
          // Use precise bounding rect for better accuracy
          const rect = parent.getBoundingClientRect();
          ref.current.width = rect.width;
          ref.current.height = rect.height;
        }
      });
      redrawPaths();
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const redrawPaths = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pathsRef.current.forEach(path => {
      if (path.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = path.isErasing ? '#000000' : path.color;
      ctx.lineWidth = path.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (!path.isErasing) {
        ctx.shadowBlur = path.mode === 'glitter' ? 15 : 6;
        ctx.shadowColor = path.color;
      }

      if (path.isErasing) {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    });
    ctx.globalCompositeOperation = 'source-over';
  };

  const addPoint = useCallback((x, y) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const newPoint = { x, y };

    if (!currentPathRef.current) {
      currentPathRef.current = { points: [newPoint], color, size: brushSize, isErasing, mode };
    } else {
      currentPathRef.current.points.push(newPoint);
    }

    ctx.beginPath();
    ctx.strokeStyle = isErasing ? '#000000' : color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (!isErasing) {
      ctx.shadowBlur = mode === 'glitter' ? 15 : 8;
      ctx.shadowColor = color;
      
      const count = mode === 'glitter' ? 5 : 2;
      for(let i=0; i<count; i++) {
          particlesRef.current.push({
              x, y, 
              vx: (Math.random() - 0.5) * (mode === 'glitter' ? 4 : 2), 
              vy: (Math.random() - 0.5) * (mode === 'glitter' ? 4 : 2),
              size: Math.random() * (mode === 'glitter' ? 4 : 2),
              color: mode === 'glitter' ? `hsl(${Math.random() * 360}, 100%, 70%)` : color,
              alpha: 1
          });
      }
    }

    if (isErasing) {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }

    if (lastPointRef.current) {
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = 'source-over';
    lastPointRef.current = newPoint;
  }, [color, brushSize, isErasing, mode]);

  const endPath = useCallback(() => {
    if (currentPathRef.current) {
      pathsRef.current.push(currentPathRef.current);
      currentPathRef.current = null;
    }
    lastPointRef.current = null;
    smoothedPointRef.current = null;
  }, []);

  const handleMouseDown = (e) => {
    isMouseDown.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    addPoint(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    addPoint(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseUp = () => {
    isMouseDown.current = false;
    endPath();
  };

  const animate = useCallback(() => {
    const ctx = cursorCanvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, cursorCanvasRef.current.width, cursorCanvasRef.current.height);

    particlesRef.current = particlesRef.current.filter(p => p.alpha > 0);
    particlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.02;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color.startsWith('hsl') ? p.color : `${p.color}${Math.floor(p.alpha * 255).toString(16).padStart(2, '0')}`;
      if (p.color.startsWith('hsl')) ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    if (handLandmarks && handLandmarks.length > 0) {
      const hand = handLandmarks[0];
      const indexTip = hand[8];
      const x = (1 - indexTip.x) * cursorCanvasRef.current.width;
      const y = indexTip.y * cursorCanvasRef.current.height;

      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2 + 4, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Target dot for precision
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [handLandmarks, color, brushSize]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);

  // Hand Logic with Smoothing
  useEffect(() => {
    if (!handLandmarks || handLandmarks.length === 0 || !canvasRef.current) {
      endPath();
      return;
    }

    const hand = handLandmarks[0];
    const indexTip = hand[8];
    const middleTip = hand[12];
    const ringTip = hand[16];
    const pinkyTip = hand[20];
    
    const isIndexExtended = indexTip.y < middleTip.y - 0.02 && 
                            indexTip.y < ringTip.y - 0.02 && 
                            indexTip.y < pinkyTip.y - 0.02;

    if (isIndexExtended) {
      const rawX = (1 - indexTip.x) * canvasRef.current.width;
      const rawY = indexTip.y * canvasRef.current.height;
      
      // Apply Smoothing
      let targetX = rawX;
      let targetY = rawY;
      
      if (smoothedPointRef.current) {
        targetX = smoothedPointRef.current.x + (rawX - smoothedPointRef.current.x) * SMOOTHING;
        targetY = smoothedPointRef.current.y + (rawY - smoothedPointRef.current.y) * SMOOTHING;
      }
      
      smoothedPointRef.current = { x: targetX, y: targetY };
      addPoint(targetX, targetY);
    } else {
      endPath();
    }
  }, [handLandmarks, addPoint, endPath]);

  return (
    <div 
      className="absolute inset-0 z-30" 
      style={{ cursor: 'crosshair' }}
      onMouseDown={handleMouseDown} 
      onMouseMove={handleMouseMove} 
      onMouseUp={handleMouseUp} 
      onMouseLeave={handleMouseUp}
    >
      <div className="absolute top-4 right-4 glass px-3 py-1 rounded-full text-[10px] font-mono text-white/60 pointer-events-none">
        {handLandmarks.length > 0 ? `Tracking: Precision Mode` : 'No Hand'}
      </div>
      
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />
      <canvas ref={cursorCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-20" />
    </div>
  );
};

export default DrawingCanvas;
