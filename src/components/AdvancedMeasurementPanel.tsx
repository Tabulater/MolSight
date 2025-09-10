import React from 'react';
import { motion } from 'framer-motion';
import { Ruler, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface MeasurementData {
  id: number;
  type: 'distance' | 'angle' | 'torsion';
  value: number;
}

interface AdvancedMeasurementPanelProps {
  measurements: MeasurementData[];
  onClear: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const AdvancedMeasurementPanel: React.FC<AdvancedMeasurementPanelProps> = ({
  measurements,
  onClear,
  isCollapsed,
  onToggleCollapse
}) => {
  if (isCollapsed) {
    return (
      <motion.div
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-xl p-3"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
      >
        <button
          onClick={onToggleCollapse}
          className="flex items-center space-x-2 text-white hover:text-cyan-400 transition-colors"
        >
          <Ruler className="w-5 h-5" />
          <span className="font-medium">{measurements.length}</span>
          <ChevronUp className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg overflow-hidden max-w-sm w-[90%]"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
    >
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-white">
            {measurements.length} measurement{measurements.length !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClear}
              className="p-1 text-slate-400 hover:text-red-400 transition-colors"
              title="Clear all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleCollapse}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
        {measurements.length > 0 && (
          <div className="mt-2 space-y-2">
            {measurements.map((measurement) => (
              <div key={measurement.id} className="flex items-center space-x-2 text-sm text-slate-300 p-2 bg-slate-700/30 rounded">
                <Ruler className="w-4 h-4 flex-shrink-0" />
                <span className="font-mono">
                  {measurement.value.toFixed(2)} {measurement.type === 'distance' ? 'Å' : '°'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdvancedMeasurementPanel;
export default AdvancedMeasurementPanel;