import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ProteinViewerProps {
  proteinId?: string;
  onAtomSelect: (atom: any) => void;
  selectedAtoms: any[];
  measurements: any[];
  annotations: any[];
}

const ProteinViewer: React.FC<ProteinViewerProps> = ({
  proteinId,
  onAtomSelect,
  selectedAtoms,
  measurements,
  annotations
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (proteinId && iframeRef.current) {
      // Use NGL Viewer via iframe for protein visualization
      const nglUrl = `https://nglviewer.org/ngl/api/staging/?load=${proteinId}`;
      iframeRef.current.src = nglUrl;
    }
  }, [proteinId]);

  const handleViewerClick = (event: React.MouseEvent) => {
    // Mock atom selection for demonstration
    const mockAtom = {
      id: Math.random(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 100,
      element: 'C',
      residue: 'ALA',
      residueNumber: Math.floor(Math.random() * 200) + 1
    };
    onAtomSelect(mockAtom);
  };

  if (!proteinId) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-800">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 border-4 border-slate-600 rounded-full flex items-center justify-center">
            <div className="w-12 h-12 bg-slate-600 rounded-full"></div>
          </div>
          <p className="text-slate-400">No protein loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-slate-900">
      {/* NGL Viewer iframe */}
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        title="Protein Structure Viewer"
        onClick={handleViewerClick}
      />

      {/* Overlay for measurements display */}
      <div className="absolute inset-0 pointer-events-none">
        {measurements.map((measurement, index) => (
          <motion.div
            key={measurement.id}
            className="absolute bg-accent-500/90 text-white px-2 py-1 rounded text-sm font-mono"
            style={{
              top: `${20 + index * 30}px`,
              left: '20px'
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {measurement.type === 'distance' 
              ? `${measurement.value.toFixed(2)} Å`
              : `${measurement.value.toFixed(1)}°`
            }
          </motion.div>
        ))}
      </div>

      {/* Annotation markers */}
      {annotations.map((annotation) => (
        <motion.div
          key={annotation.id}
          className="absolute w-4 h-4 bg-secondary-400 border-2 border-white rounded-full cursor-pointer shadow-lg"
          style={{
            left: `${annotation.coordinates.x}%`,
            top: `${annotation.coordinates.y}%`
          }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        />
      ))}

      {/* Loading overlay */}
      <motion.div
        className="absolute inset-0 bg-slate-900/80 flex items-center justify-center"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1, delay: 2 }}
        style={{ pointerEvents: 'none' }}
      >
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-white">Loading protein structure...</p>
        </div>
      </motion.div>
    </div>
  );
};

export default ProteinViewer;