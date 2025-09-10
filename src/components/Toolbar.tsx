import React from 'react';
import { motion } from 'framer-motion';
import { 
  MousePointer, 
  Ruler, 
  Triangle, 
  Share2, 
  RotateCcw, 
  ZoomIn,
  Trash2,
  Info
} from 'lucide-react';

interface ToolbarProps {
  activeMode: 'select' | 'measure-distance' | 'measure-angle';
  onModeChange: (mode: 'select' | 'measure-distance' | 'measure-angle') => void;
  onShare: () => void;
  onClearMeasurements: () => void;
  selectedAtomsCount: number;
}

const Toolbar: React.FC<ToolbarProps> = ({
  activeMode,
  onModeChange,
  onShare,
  onClearMeasurements,
  selectedAtomsCount
}) => {
  const tools = [
    {
      id: 'select',
      icon: MousePointer,
      label: 'Select',
      description: 'Select atoms and residues'
    },
    {
      id: 'measure-distance',
      icon: Ruler,
      label: 'Distance',
      description: 'Measure distance between atoms'
    },
    {
      id: 'measure-angle',
      icon: Triangle,
      label: 'Angle',
      description: 'Measure bond angles'
    }
  ];

  return (
    <div className="absolute top-4 left-4 z-20 flex flex-col space-y-2">
      {/* Main Tools */}
      <motion.div 
        className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-xl p-2 flex space-x-1"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {tools.map((tool) => (
          <motion.button
            key={tool.id}
            onClick={() => onModeChange(tool.id as any)}
            className={`p-3 rounded-lg transition-all relative group ${
              activeMode === tool.id
                ? 'bg-primary-600 text-white shadow-lg'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={tool.description}
          >
            <tool.icon className="w-5 h-5" />
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {tool.label}
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Status Info */}
      {activeMode !== 'select' && (
        <motion.div 
          className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg p-3 text-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center space-x-2 text-slate-300">
            <Info className="w-4 h-4" />
            <span>
              {activeMode === 'measure-distance' 
                ? `Select ${selectedAtomsCount === 0 ? 'first' : 'second'} atom`
                : `Select atom ${selectedAtomsCount + 1} of 3`
              }
            </span>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div 
        className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-xl p-2 flex space-x-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <motion.button
          onClick={onClearMeasurements}
          className="p-3 rounded-lg text-slate-300 hover:text-white hover:bg-red-600/20 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Clear all measurements"
        >
          <Trash2 className="w-5 h-5" />
        </motion.button>

        <motion.button
          onClick={onShare}
          className="p-3 rounded-lg text-slate-300 hover:text-white hover:bg-green-600/20 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Share view"
        >
          <Share2 className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Toolbar;