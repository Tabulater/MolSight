import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut,
  Download,
  Camera,
  Play,
  Pause,
  RotateCw,
  Home,
  Loader,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

// NGL Viewer types
declare global {
  interface Window {
    NGL: any;
    nglStage: any;
    nglComponent: any;
  }
}

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

interface NGLProteinViewerProps {
  proteinId?: string;
  onAtomSelect: (atom: AtomInfo) => void;
  selectedAtoms: AtomInfo[];
  measurements: any[];
  annotations: any[];
  viewMode: 'cartoon' | 'ball-stick' | 'surface' | 'ribbon';
  onViewModeChange: (mode: 'cartoon' | 'ball-stick' | 'surface' | 'ribbon') => void;
}

const NGLProteinViewer: React.FC<NGLProteinViewerProps> = ({
  proteinId,
  onAtomSelect,
  selectedAtoms,
  measurements,
  annotations,
  viewMode,
  onViewModeChange
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const componentRef = useRef<any>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [nglLoaded, setNglLoaded] = useState(false);
  const [proteinInfo, setProteinInfo] = useState<any>(null);

  // Load NGL Viewer library
  useEffect(() => {
    const loadNGL = async () => {
      try {
        // Check if NGL is already loaded
        if (window.NGL) {
          setNglLoaded(true);
          return;
        }

        // Load NGL from CDN
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/ngl@2.0.0-dev.39/dist/ngl.js';
        script.async = true;
        script.onload = () => {
          console.log('NGL library loaded successfully');
          setNglLoaded(true);
        };
        script.onerror = (e) => {
          console.error('Failed to load NGL library:', e);
          setError('Failed to load 3D visualization library. Please refresh the page.');
        };
        
        document.head.appendChild(script);

        return () => {
          if (document.head.contains(script)) {
            document.head.removeChild(script);
          }
        };
      } catch (err) {
        console.error('Error loading NGL:', err);
        setError('Failed to initialize 3D viewer');
      }
    };

    loadNGL();
  }, []);

  // Initialize NGL Stage
  const initializeStage = useCallback(() => {
    if (!viewportRef.current || !window.NGL || !nglLoaded) {
      console.log('Cannot initialize stage:', { viewport: !!viewportRef.current, NGL: !!window.NGL, nglLoaded });
      return;
    }

    try {
      console.log('Initializing NGL stage...');
      
      // Clear any existing stage
      if (stageRef.current) {
        stageRef.current.dispose();
      }

      // Create NGL Stage with enhanced settings
      const stage = new window.NGL.Stage(viewportRef.current, {
        backgroundColor: '#0a0e1a', // Deep navy blue background
        cameraType: 'perspective',
        fog: false,
        quality: 'high',
        sampleLevel: 2,
        workerDefault: true,
        impostor: true,
        clipNear: 0,
        clipFar: 100,
        lightColor: 0xffffff,
        lightIntensity: 1.0,
        ambientColor: 0x404040,
        ambientIntensity: 0.4
      });

      console.log('NGL stage created successfully');

      // Enhanced mouse controls
      stage.mouseControls.add('drag-left', (stage: any, dx: number, dy: number) => {
        stage.trackballControls.rotate(dx, dy);
      });

      stage.mouseControls.add('drag-right', (stage: any, dx: number, dy: number) => {
        stage.trackballControls.zoom(dy);
      });

      stage.mouseControls.add('scroll', (stage: any, delta: number) => {
        stage.trackballControls.zoom(delta);
      });

      // Handle window resize
      const handleResize = () => {
        if (stage) {
          stage.handleResize();
        }
      };
      window.addEventListener('resize', handleResize);

      stageRef.current = stage;
      window.nglStage = stage; // Make stage globally accessible for settings

      return () => {
        window.removeEventListener('resize', handleResize);
        if (stage) {
          stage.dispose();
        }
      };
    } catch (err) {
      console.error('Failed to initialize NGL stage:', err);
      setError('Failed to initialize 3D viewer. Please refresh the page.');
    }
  }, [nglLoaded]);

  // Fetch protein metadata from RCSB API
  const fetchProteinInfo = useCallback(async (pdbId: string) => {
    try {
      const response = await fetch(`https://data.rcsb.org/rest/v1/core/entry/${pdbId.toLowerCase()}`);
      if (response.ok) {
        const data = await response.json();
        setProteinInfo({
          title: data.struct?.title || 'Unknown Protein',
          resolution: data.rcsb_entry_info?.resolution_combined?.[0] || 'N/A',
          method: data.exptl?.[0]?.method || 'Unknown',
          organism: data.rcsb_entity_source_organism?.[0]?.ncbi_scientific_name || 'Unknown',
          chains: data.rcsb_entry_info?.polymer_entity_count_protein || 0,
          depositionDate: data.rcsb_accession_info?.deposit_date || 'Unknown'
        });
      }
    } catch (err) {
      console.warn('Could not fetch protein metadata:', err);
    }
  }, []);

  // Load protein structure from PDB
  const loadProteinStructure = useCallback(async (pdbId: string) => {
    if (!stageRef.current || !pdbId) {
      console.log('Cannot load protein:', { stage: !!stageRef.current, pdbId });
      return;
    }

    console.log(`Loading protein structure: ${pdbId}`);
    setIsLoading(true);
    setError(null);
    setLoadingProgress(0);

    try {
      // Clear existing structures
      stageRef.current.removeAllComponents();
      componentRef.current = null;

      // Fetch protein metadata
      fetchProteinInfo(pdbId);

      // Simulate loading progress
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Load structure from RCSB PDB
      const pdbUrl = `https://files.rcsb.org/download/${pdbId.toUpperCase()}.pdb`;
      console.log(`Loading from URL: ${pdbUrl}`);
      
      const component = await stageRef.current.loadFile(pdbUrl, {
        ext: 'pdb',
        defaultRepresentation: false
      });

      console.log('Protein structure loaded successfully');
      clearInterval(progressInterval);
      setLoadingProgress(100);

      componentRef.current = component;
      window.nglComponent = component; // Make component globally accessible for settings

      // Apply initial representation based on view mode
      applyRepresentation(component, viewMode);

      // Auto-view the structure with animation
      component.autoView(1000);

      setTimeout(() => {
        setIsLoading(false);
      }, 500);

    } catch (err) {
      console.error('Failed to load protein structure:', err);
      setError(`Failed to load protein ${pdbId.toUpperCase()}. The structure may not exist or there may be a network issue.`);
      setIsLoading(false);
    }
  }, [viewMode, fetchProteinInfo]);

  // Apply different representations with distinct differences
  const applyRepresentation = useCallback((component: any, mode: string) => {
    if (!component) {
      console.log('No component to apply representation to');
      return;
    }

    console.log(`Applying representation: ${mode}`);

    // Clear existing representations
    component.removeAllRepresentations();

    const commonParams = {
      opacity: 1.0,
      quality: 'high',
      smoothSheet: true
    };

    try {
      switch (mode) {
        case 'cartoon':
          // Traditional cartoon with thick ribbons and clear secondary structure
          component.addRepresentation('cartoon', {
            ...commonParams,
            color: 'chainid',
            aspectRatio: 5,
            subdiv: 10,
            radialSegments: 20,
            capped: true,
            smoothSheet: true
          });
          break;

        case 'ribbon':
          // Thinner, more elegant ribbon representation
          component.addRepresentation('ribbon', {
            ...commonParams,
            color: 'residueindex',
            aspectRatio: 2,
            subdiv: 8,
            radialSegments: 16,
            smoothSheet: true
          });
          break;

        case 'ball-stick':
          component.addRepresentation('ball+stick', {
            ...commonParams,
            color: 'element',
            aspectRatio: 2,
            bondScale: 0.3,
            bondSpacing: 0.75,
            radiusScale: 0.8
          });
          break;

        case 'surface':
          component.addRepresentation('surface', {
            ...commonParams,
            color: 'hydrophobicity',
            surfaceType: 'ms',
            probeRadius: 1.4,
            scaleFactor: 2,
            smooth: 2,
            opacity: 0.8
          });
          // Add cartoon backbone for context
          component.addRepresentation('cartoon', {
            color: 'chainid',
            opacity: 0.3,
            aspectRatio: 2
          });
          break;
      }

      // Add selection representation for selected atoms
      if (selectedAtoms.length > 0) {
        const selectionString = selectedAtoms.map(atom => 
          `${atom.residueNumber}:${atom.chain}.${atom.atomName}`
        ).join(' or ');
        
        component.addRepresentation('ball+stick', {
          sele: selectionString,
          color: 'cyan',
          aspectRatio: 3,
          bondScale: 0.5,
          radiusScale: 1.5,
          opacity: 0.9
        });
      }

      console.log(`Representation ${mode} applied successfully`);
    } catch (err) {
      console.error('Error applying representation:', err);
    }
  }, [selectedAtoms]);

  // Handle view mode changes
  useEffect(() => {
    if (componentRef.current) {
      applyRepresentation(componentRef.current, viewMode);
    }
  }, [viewMode, applyRepresentation]);

  // Initialize stage when NGL is loaded
  useEffect(() => {
    if (nglLoaded) {
      console.log('NGL loaded, initializing stage...');
      const cleanup = initializeStage();
      return cleanup;
    }
  }, [nglLoaded, initializeStage]);

  // Load protein when proteinId changes
  useEffect(() => {
    if (proteinId && stageRef.current && nglLoaded) {
      console.log('Loading protein:', proteinId);
      loadProteinStructure(proteinId);
    }
  }, [proteinId, loadProteinStructure, nglLoaded]);

  // Auto-rotation effect
  useEffect(() => {
    if (!stageRef.current) return;

    if (isAutoRotating) {
      try {
        // Start auto-rotation using NGL's setSpin method
        stageRef.current.setSpin([0, 1, 0], 0.01);
      } catch (err) {
        console.warn('Auto-rotation not supported:', err);
      }
    } else {
      try {
        // Stop auto-rotation
        stageRef.current.setSpin(null);
      } catch (err) {
        console.warn('Could not stop auto-rotation:', err);
      }
    }

    // Cleanup function to stop rotation when component unmounts
    return () => {
      if (stageRef.current) {
        try {
          stageRef.current.setSpin(null);
        } catch (err) {
          console.warn('Could not stop rotation on cleanup:', err);
        }
      }
    };
  }, [isAutoRotating]);

  // Control functions
  const resetView = () => {
    if (componentRef.current) {
      componentRef.current.autoView(1000);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewportRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const takeScreenshot = () => {
    if (stageRef.current) {
      stageRef.current.makeImage({
        factor: 2,
        antialias: true,
        trim: false,
        transparent: false
      }).then((blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${proteinId}_structure.png`;
        a.click();
        URL.revokeObjectURL(url);
      }).catch((err: any) => {
        console.error('Screenshot failed:', err);
      });
    }
  };

  const handleAtomClick = useCallback((pickingProxy: any) => {
    if (pickingProxy && pickingProxy.atom) {
      const atom = pickingProxy.atom;
      const atomInfo: AtomInfo = {
        id: `${atom.index}`,
        element: atom.element,
        residue: atom.resname,
        residueNumber: atom.resno,
        chain: atom.chainname,
        x: atom.x,
        y: atom.y,
        z: atom.z,
        atomName: atom.atomname,
        bFactor: atom.bfactor,
        occupancy: atom.occupancy
      };
      onAtomSelect(atomInfo);
    }
  }, [onAtomSelect]);

  // Set up click handling
  useEffect(() => {
    if (stageRef.current) {
      stageRef.current.signals.clicked.add(handleAtomClick);
      return () => {
        if (stageRef.current?.signals?.clicked) {
          stageRef.current.signals.clicked.remove(handleAtomClick);
        }
      };
    }
  }, [handleAtomClick]);

  if (!proteinId) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <motion.div 
          className="text-center max-w-md"
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
              <div className="absolute top-2 left-2 w-6 h-6 bg-red-500 rounded-full shadow-lg" />
              <div className="absolute bottom-2 right-2 w-4 h-4 bg-blue-500 rounded-full shadow-lg" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-green-500 rounded-full shadow-lg" />
            </motion.div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Ready for Protein Visualization</h3>
          <p className="text-slate-400 mb-4">Enter a PDB ID to load and visualize protein structures in beautiful 3D ribbon representation</p>
          <div className="text-sm text-slate-500">
            Try: 8R9U, 1BNA, 2GBP, 1HTM
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
      {/* Fixed Floating Controls - Changed from absolute to fixed */}
      <motion.div 
        className="fixed top-20 right-4 z-30 bg-slate-800/90 backdrop-blur-md border border-slate-600/50 rounded-xl p-4 space-y-3 max-w-xs"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">Visualization</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              className={`p-1 rounded transition-colors ${
                isAutoRotating ? 'text-cyan-400 bg-cyan-400/20' : 'text-slate-400 hover:text-white'
              }`}
              title={isAutoRotating ? "Stop rotation" : "Auto rotate"}
            >
              {isAutoRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={resetView}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Reset view"
            >
              <Home className="w-4 h-4" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Toggle fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        {/* View Mode Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { mode: 'cartoon', label: 'Cartoon', icon: '🎭', desc: 'Thick secondary structure ribbons' },
            { mode: 'ribbon', label: 'Ribbon', icon: '🎀', desc: 'Thin smooth backbone ribbons' },
            { mode: 'ball-stick', label: 'Ball & Stick', icon: '⚪', desc: 'Atomic detail view' },
            { mode: 'surface', label: 'Surface', icon: '🏔️', desc: 'Molecular surface representation' }
          ].map(({ mode, label, icon, desc }) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode as any)}
              className={`p-2 rounded-lg text-xs transition-all group relative ${
                viewMode === mode
                  ? 'bg-cyan-600 text-white shadow-lg'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
              title={desc}
            >
              <div className="text-lg mb-1">{icon}</div>
              <div className="font-medium">{label}</div>
            </button>
          ))}
        </div>

        {/* Protein Information */}
        {proteinInfo && !isLoading && (
          <div className="pt-3 border-t border-slate-600/50">
            <h4 className="text-sm font-medium text-white mb-2">Structure Info</h4>
            <div className="space-y-1 text-xs text-slate-400">
              <div><span className="text-slate-300">Resolution:</span> {proteinInfo.resolution}Å</div>
              <div><span className="text-slate-300">Method:</span> {proteinInfo.method}</div>
              <div><span className="text-slate-300">Chains:</span> {proteinInfo.chains}</div>
              {proteinInfo.organism !== 'Unknown' && (
                <div><span className="text-slate-300">Organism:</span> {proteinInfo.organism}</div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* NGL Viewport */}
      <div 
        ref={viewportRef} 
        id="viewport"
        className="w-full h-full"
        style={{ minHeight: '100%' }}
      />

      {/* Annotation Markers */}
      <AnimatePresence>
        {annotations.map((annotation) => (
          <motion.div
            key={annotation.id}
            className="absolute cursor-pointer group z-25"
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
            <div className="absolute inset-0 bg-cyan-400 rounded-full animate-ping opacity-20" />
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-slate-900/95 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap max-w-xs z-30">
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
            className="absolute inset-0 bg-slate-900/95 flex items-center justify-center z-40"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center max-w-md">
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
                <h3 className="text-xl font-semibold text-white mb-2">
                  Loading {proteinId?.toUpperCase()}
                </h3>
                <p className="text-slate-400 mb-4">
                  {proteinInfo?.title || 'Fetching structure from RCSB Protein Data Bank...'}
                </p>
                
                {/* Progress Bar */}
                <div className="w-64 mx-auto mb-4">
                  <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${loadingProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 mt-2">{loadingProgress}% complete</div>
                </div>

                <div className="flex items-center justify-center space-x-2">
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

      {/* Error Overlay */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="absolute inset-0 bg-slate-900/95 flex items-center justify-center z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center max-w-md">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Loading Failed</h3>
              <p className="text-slate-400 mb-6">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  if (proteinId) loadProteinStructure(proteinId);
                }}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Structure Info Badge - Changed from absolute to fixed */}
      {proteinId && !isLoading && !error && (
        <motion.div
          className="fixed bottom-4 left-4 z-30 bg-slate-800/90 backdrop-blur-md border border-slate-600/50 rounded-lg px-4 py-2 max-w-xs"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="text-white font-mono text-sm font-bold">{proteinId.toUpperCase()}</div>
          {proteinInfo && (
            <>
              <div className="text-slate-400 text-xs truncate">
                {proteinInfo.title}
              </div>
              <div className="text-slate-500 text-xs">
                {viewMode} • {proteinInfo.resolution}Å • {proteinInfo.method}
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* NGL Loading Status */}
      {!nglLoaded && (
        <div className="absolute inset-0 bg-slate-900/95 flex items-center justify-center z-50">
          <div className="text-center">
            <Loader className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-white mb-2">Initializing 3D Viewer</h3>
            <p className="text-slate-400">Loading NGL molecular graphics library...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NGLProteinViewer;