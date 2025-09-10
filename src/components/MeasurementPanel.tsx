import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, Triangle, X, Trash2 } from 'lucide-react';

interface MeasurementPanelProps {
  measurements: any[];
  onClear: () => void;
  onRemoveMeasurement: (id: number) => void;
}

const MeasurementPanel: React.FC<MeasurementPanelProps> = ({
  measurements,
  onClear,
  onRemoveMeasurement
}) => {
  return (
    <motion.div
      className="absolute bottom-4 left-4 z-20 bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-xl p-4 max-w-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-medium flex items-center">
          <Ruler className="w-4 h-4 mr-2" />
          Measurements
        </h3>
        <button
          onClick={onClear}
          className="text-slate-400 hover:text-red-400 transition-colors"
          title="Clear all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto">
        <AnimatePresence>
          {measurements.map((measurement) => (
            <motion.div
              key={measurement.id}
              className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              layout
            >
              <div className="flex items-center space-x-2">
                {measurement.type === 'distance' ? (
                  <Ruler className="w-4 h-4 text-accent-400" />
                ) : (
                  <Triangle className="w-4 h-4 text-secondary-400" />
                )}
                <div>
                  <div className="text-white font-mono text-sm">
                    {measurement.type === 'distance' 
                      ? `${measurement.value.toFixed(2)} Å`
                      : `${measurement.value.toFixed(1)}°`
                    }
                  </div>
                  <div className="text-xs text-slate-400">
                    {measurement.atoms.map((atom: any, i: number) => (
                      <span key={i}>
                        {atom.residue}{atom.residueNumber}
                        {i < measurement.atoms.length - 1 ? ' → ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => onRemoveMeasurement(measurement.id)}
                className="text-slate-400 hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {measurements.length === 0 && (
        <p className="text-slate-400 text-sm text-center py-2">
          No measurements yet
        </p>
      )}
    </motion.div>
  );
};

export default MeasurementPanel;