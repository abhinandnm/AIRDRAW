import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Eraser, Trash2, Download, PenTool } from 'lucide-react';

const COLORS = [
  '#ffffff', '#ff0000', '#00ff00', '#0000ff', 
  '#ffff00', '#ff00ff', '#00ffff', '#ffa500'
];

const Controls = ({ 
  color, setColor, 
  brushSize, setBrushSize, 
  isErasing, setIsErasing, 
  onClear, onDownload 
}) => {
  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="glass glass-blur p-4 flex flex-col gap-6 fixed left-6 top-1/2 -translate-y-1/2 z-50"
      style={{ width: '70px' }}
    >
      {/* Tool Selection */}
      <div className="flex flex-col gap-3 items-center">
        <button 
          onClick={() => setIsErasing(false)}
          className={`p-3 rounded-xl transition-all ${!isErasing ? 'primary' : 'bg-white-5 hover:bg-white-10'}`}
          title="Pen"
        >
          <PenTool size={22} />
        </button>
        <button 
          onClick={() => setIsErasing(true)}
          className={`p-3 rounded-xl transition-all ${isErasing ? 'primary' : 'bg-white-5 hover:bg-white-10'}`}
          title="Eraser"
        >
          <Eraser size={22} />
        </button>
      </div>

      <div className="h-full bg-white-10 w-full" style={{ height: '1px' }} />

      {/* Color Selection */}
      <div className="flex flex-col gap-3 items-center">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => {
              setColor(c);
              setIsErasing(false);
            }}
            className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-125"
            style={{ 
              backgroundColor: c, 
              borderColor: color === c && !isErasing ? 'white' : 'transparent' 
            }}
          />
        ))}
      </div>

      <div className="h-full bg-white-10 w-full" style={{ height: '1px' }} />

      {/* Brush Size */}
      <div className="flex flex-col gap-3 items-center py-4">
        <div className="h-24 w-1 bg-white-10 rounded-full relative">
            <input 
            type="range" 
            min="2" 
            max="40" 
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="absolute -rotate-90 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 cursor-pointer"
            style={{ appearance: 'none', background: 'transparent' }}
            />
        </div>
        <span className="text-xs font-bold text-white-40 uppercase tracking-tighter mt-2">{brushSize}px</span>
      </div>

      <div className="h-full bg-white-10 w-full" style={{ height: '1px' }} />

      {/* Actions */}
      <div className="flex flex-col gap-3 items-center">
        <button 
          onClick={onClear}
          className="p-3 rounded-xl bg-red-10 hover:bg-red-500 text-red-400 transition-all"
          title="Clear Canvas"
        >
          <Trash2 size={22} />
        </button>
        <button 
          onClick={onDownload}
          className="p-3 rounded-xl bg-green-10 hover:bg-green-500 text-green-400 transition-all"
          title="Download Image"
        >
          <Download size={22} />
        </button>
      </div>
    </motion.div>
  );
};

export default Controls;
