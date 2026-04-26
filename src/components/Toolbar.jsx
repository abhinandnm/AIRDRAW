import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Eraser, Trash2, Download, MousePointer2, Sparkles, Wand2, Type } from 'lucide-react';

const COLORS = [
  '#ffffff', '#ff3333', '#33ff33', '#3333ff', 
  '#ffff33', '#ff33ff', '#33ffff', '#ffa500'
];

const Toolbar = ({ 
  color, setColor, 
  brushSize, setBrushSize, 
  isErasing, setIsErasing, 
  mode, setMode,
  onClear, onDownload 
}) => {
  return (
    <div 
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 glass glass-blur px-8 py-4 rounded-3xl"
      style={{ boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}
    >
      {/* Colors */}
      <div className="flex items-center gap-3 pr-6 border-r border-white-10">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => {
              setColor(c);
              setIsErasing(false);
            }}
            className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-125"
            style={{ 
              backgroundColor: c, 
              borderColor: color === c && !isErasing ? 'white' : 'transparent' 
            }}
          />
        ))}
        <div className="relative group">
            <input 
                type="color" 
                value={color} 
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded-full cursor-pointer border-none bg-transparent"
            />
        </div>
      </div>

      {/* Effects & Tools */}
      <div className="flex items-center gap-4 px-6 border-r border-white-10">
        <button 
          onClick={() => { setIsErasing(false); setMode('normal'); }}
          className={`p-3 rounded-xl transition-all ${!isErasing && mode === 'normal' ? 'primary' : 'bg-white-5 hover:bg-white-10'}`}
          title="Normal Brush"
        >
          <MousePointer2 size={24} />
        </button>
        <button 
          onClick={() => { setIsErasing(false); setMode('glitter'); }}
          className={`p-3 rounded-xl transition-all ${!isErasing && mode === 'glitter' ? 'primary text-yellow-300' : 'bg-white-5 hover:bg-white-10'}`}
          title="Glitter Effect"
        >
          <Sparkles size={24} />
        </button>
        <button 
          onClick={() => setIsErasing(true)}
          className={`p-3 rounded-xl transition-all ${isErasing ? 'primary' : 'bg-white-5 hover:bg-white-10'}`}
          title="Eraser"
        >
          <Eraser size={24} />
        </button>
      </div>

      {/* Brush Size */}
      <div className="flex items-center gap-4 px-6 border-r border-white-10">
        <input 
          type="range" 
          min="2" 
          max="50" 
          value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
          className="w-32 cursor-pointer"
        />
        <span className="text-xs font-bold text-white-40 w-8">{brushSize}px</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pl-6">
        <button 
          onClick={onClear}
          className="p-3 rounded-xl bg-red-10 hover:bg-red-500 text-red-400 hover:text-white transition-all"
          title="Clear Canvas"
        >
          <Trash2 size={24} />
        </button>
        <button 
          onClick={onDownload}
          className="p-3 rounded-xl bg-green-10 hover:bg-green-500 text-green-400 hover:text-white transition-all"
          title="Download"
        >
          <Download size={24} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
