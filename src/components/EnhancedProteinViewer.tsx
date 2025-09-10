import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut,
  Eye,
  EyeOff,
  Layers,
  Atom
} from 'lucide-react';

interface AtomInfo {
  id: string;
  element: string;
  residue: string;
  residueNumber: number;
  chain: string;
  x: number;
  y: number;
  z: number;
  atomName: string;
  bFactor?: number;
  occupancy?: number;
}

interface EnhancedProteinViewerProps {
  proteinId?: string;
  onAtomSelect: (atom: AtomInfo) => void;
  selectedAtoms: AtomInfo[];
  measurements: any[];
  annotations: any[];
  viewMode: 'cartoon' | 'ball-stick' | 'surface' | 'ribbon';
  onViewModeChange: (mode: 'cartoon' | 'ball-stick' | 'surface' | 'ribbon') => void;
}

const EnhancedProteinViewer: React.FC<EnhancedProteinViewerProps> = ({
  proteinId,
  onAtomSelect,
  selectedAtoms,
  measurements,
  annotations,
  viewMode,
  onViewModeChange
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredAtom, setHoveredAtom] = useState<AtomInfo | null>(null);
  const [viewerControls, setViewerControls] = useState({
    showHydrogens: false,
    showWater: false,
    showSurface: false,
    transparency: 0
  });

  const mockAtoms: AtomInfo[] = [
    { id: '1', element: 'C', residue: 'ALA', residueNumber: 42, chain: 'A', x: 25.5, y: 30.2, z: 15.8, atomName: 'CA', bFactor: 20.5, occupancy: 1.0 },
    { id: '2', element: 'N', residue: 'GLU', residueNumber: 156, chain: 'A', x: 45.2, y: 60.8, z: 25.3, atomName: 'NE2', bFactor: 18.3, occupancy: 1.0 },
    { id: '3', element: 'O', residue: 'SER', residueNumber: 78, chain: 'B', x: 65.7, y: 40.1, z: 35.9, atomName: 'OG', bFactor: 22.1, occupancy: 1.0 },
    { id: '4', element: 'S', residue: 'CYS', residueNumber: 123, chain: 'A', x: 55.3, y: 75.4, z: 45.2, atomName: 'SG', bFactor: 25.8, occupancy: 1.0 }
  ];

  useEffect(() => {
    if (proteinId && iframeRef.current) {
      setIsLoading(true);
      const nglUrl = `https://nglviewer.org/ngl/api/staging/?load=${proteinId}&stage=${viewMode}`;
      iframeRef.current.src = nglUrl;
      
      // Simulate loading time
      const timer = setTimeout(() => setIsLoading(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [proteinId, viewMode]);

  const handleViewerClick = useCallback((event: React.MouseEvent) => {
    if (!viewerRef.current) return;
    
    const rect = viewerRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    // Find closest mock atom for demonstration
    const closestAtom = mockAtoms.reduce((closest, atom) => {
      const distance = Math.sqrt(Math.pow(atom.x - x, 2) + Math.pow(atom.y - y, 2));
      return distance < Math.sqrt(Math.pow(closest.x - x, 2) + Math.pow(closest.y - y, 2)) ? atom : closest;
    });

    onAtomSelect(closestAtom);
  }, [onAtomSelect]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getElementColor = (element: string) => {
    const colors: { [key: string]: string } = {
      'C': '#909090',
      'N': '#3050F8',
      'O': '#FF0D0D',
      'S': '#FFFF30',
      'P': '#FF8000',
      'H': '#FFFFFF'
    };
    return colors[element] || '#909090';
  };

  if (!proteinId) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-32 h-32 mx-auto mb-6 relative">
            <motion.div
              className="w-full h-full border-4 border-slate-600 rounded-full relative"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute top-2 left-2 w-6 h-6 bg-cyan-400 rounded-full shadow-lg" />
              <div className="absolute bottom-2 right-2 w-4 h-4 bg-orange-400 rounded-full shadow-lg" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-blue-500 rounded-full shadow-lg" />
            </motion.div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Protein Loaded</h3>
          <p className="text-slate-400">Upload a structure file or search the PDB database</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={viewerRef} className="w-full h-full relative bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
      {/* Enhanced Controls Panel */}
      <motion.div 
        className="absolute top-4 right-4 z-20 bg-slate-800/80 backdrop-blur-md border border-slate-600/50 rounded-xl p-4 space-y-3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">View Mode</span>
          <button
            onClick={toggleFullscreen}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {[
            { mode: 'cartoon', label: 'Cartoon', icon: '🎭' },
            { mode: 'ball-stick', label: 'Ball & Stick', icon: '⚪' },
            { mode: 'surface', label: 'Surface', icon: '🏔️' },
            { mode: 'ribbon', label: 'Ribbon', icon: '🎀' }
          ].map(({ mode, label, icon }) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode as any)}
              className={`p-2 rounded-lg text-xs transition-all ${
                viewMode === mode
                  ? 'bg-cyan-600 text-white shadow-lg'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              <div className="text-lg mb-1">{icon}</div>
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-600/50">
          {[
            { key: 'showHydrogens', label: 'Hydrogens', icon: <Atom className="w-3 h-3" /> },
            { key: 'showWater', label: 'Water', icon: <Eye className="w-3 h-3" /> },
            { key: 'showSurface', label: 'Surface', icon: <Layers className="w-3 h-3" /> }
          ].map(({ key, label, icon }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center space-x-1">
                {icon}
                <span>{label}</span>
              </span>
              <button
                onClick={() => setViewerControls(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                className={`w-8 h-4 rounded-full transition-all ${
                  viewerControls[key as keyof typeof viewerControls]
                    ? 'bg-cyan-600'
                    : 'bg-slate-600'
                }`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                  viewerControls[key as keyof typeof viewerControls] ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Protein Information Panel */}
      {hoveredAtom && (
        <motion.div
          className="absolute bottom-4 left-4 z-20 bg-slate-800/90 backdrop-blur-md border border-slate-600/50 rounded-xl p-4 max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <h3 className="text-white font-semibold mb-3 flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: getElementColor(hoveredAtom.element) }}
            />
            Atom Information
          </h3>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-slate-400">Element:</div>
              <div className="text-white font-mono">{hoveredAtom.element}</div>
              <div className="text-slate-400">Residue:</div>
              <div className="text-white font-mono">{hoveredAtom.residue}{hoveredAtom.residueNumber}</div>
              <div className="text-slate-400">Chain:</div>
              <div className="text-white font-mono">{hoveredAtom.chain}</div>
              <div className="text-slate-400">Atom Name:</div>
              <div className="text-white font-mono">{hoveredAtom.atomName}</div>
            </div>
            <div className="pt-2 border-t border-slate-600/50">
              <div className="text-xs text-slate-400 space-y-1">
                <div>Coordinates: ({hoveredAtom.x.toFixed(2)}, {hoveredAtom.y.toFixed(2)}, {hoveredAtom.z.toFixed(2)})</div>
                {hoveredAtom.bFactor && <div>B-Factor: {hoveredAtom.bFactor.toFixed(1)}</div>}
                {hoveredAtom.occupancy && <div>Occupancy: {hoveredAtom.occupancy.toFixed(2)}</div>}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* NGL Viewer iframe */}
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        title="Enhanced Protein Structure Viewer"
        onClick={handleViewerClick}
        style={{ filter: isLoading ? 'blur(2px)' : 'none' }}
      />

      {/* Interactive Atom Overlays */}
      {mockAtoms.map((atom) => (
        <motion.div
          key={atom.id}
          className="absolute cursor-pointer group"
          style={{
            left: `${atom.x}%`,
            top: `${atom.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          onMouseEnter={() => setHoveredAtom(atom)}
          onMouseLeave={() => setHoveredAtom(null)}
          onClick={() => onAtomSelect(atom)}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          <div 
            className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
              selectedAtoms.some(selected => selected.id === atom.id)
                ? 'border-cyan-400 shadow-lg shadow-cyan-400/50'
                : 'border-white/50 group-hover:border-white'
            }`}
            style={{ backgroundColor: getElementColor(atom.element) }}
          />
          
          {/* Atom label */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-slate-900/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {atom.residue}{atom.residueNumber}
          </div>
        </motion.div>
      ))}

      {/* Measurement Overlays */}
      <AnimatePresence>
        {measurements.map((measurement, index) => (
          <motion.div
            key={measurement.id}
            className="absolute z-10"
            style={{
              left: `${20 + (index % 3) * 120}px`,
              top: `${60 + Math.floor(index / 3) * 40}px`
            }}
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="bg-orange-600/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg shadow-lg border border-orange-500/50">
              <div className="text-sm font-mono font-bold">
                {measurement.type === 'distance' 
                  ? `${measurement.value.toFixed(2)} Å`
                  : `${measurement.value.toFixed(1)}°`
                }
              </div>
              <div className="text-xs opacity-80">
                {measurement.atoms.map((atom: AtomInfo, i: number) => (
                  <span key={i}>
                    {atom.residue}{atom.residueNumber}
                    {i < measurement.atoms.length - 1 ? ' → ' : ''}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Annotation Markers */}
      <AnimatePresence>
        {annotations.map((annotation) => (
          <motion.div
            key={annotation.id}
            className="absolute cursor-pointer group"
            style={{
              left: `${annotation.coordinates.x}%`,
              top: `${annotation.coordinates.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 border-2 border-white rounded-full shadow-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            
            {/* Pulse animation */}
            <div className="absolute inset-0 bg-cyan-400 rounded-full animate-ping opacity-20" />
            
            {/* Preview tooltip */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-slate-900/95 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap max-w-xs">
              <div className="font-medium">{annotation.comment.substring(0, 50)}...</div>
              <div className="text-xs text-slate-400">Click to view thread</div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="absolute inset-0 bg-slate-900/90 flex items-center justify-center z-30"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center">
              <motion.div
                className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-xl font-semibold text-white mb-2">Loading Protein Structure</h3>
                <p className="text-slate-400">Analyzing molecular geometry...</p>
                <div className="mt-4 flex items-center justify-center space-x-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-cyan-400 rounded-full"
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        delay: i * 0.2 
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Protein Info Badge */}
      {proteinId && !isLoading && (
        <motion.div
          className="absolute bottom-4 right-4 z-20 bg-slate-800/80 backdrop-blur-md border border-slate-600/50 rounded-lg px-4 py-2"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="text-white font-mono text-sm font-bold">{proteinId.toUpperCase()}</div>
          <div className="text-slate-400 text-xs">{viewMode} view</div>
        </motion.div>
      )}
    </div>
  );
};

export default EnhancedProteinViewer;