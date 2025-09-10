import { useState, useEffect, FC } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home,
  Settings,
  Maximize2,
  X,
  Download,
  Atom,
  LayoutGrid,
  Move3d as Move3D,
  Ruler,
  Gauge,
  CornerDownLeft as Angle
} from 'lucide-react';
import NGLProteinViewer from '../components/NGLProteinViewer';

// Define types
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

interface MeasurementData {
  id: number;
  type: 'distance' | 'angle' | 'torsion';
  atoms: AtomInfo[];
  value: number;
  timestamp: Date;
  highlighted: boolean;
}

interface ToolButtonProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const ToolButton: FC<ToolButtonProps> = ({ 
  icon: Icon, 
  label, 
  active = false, 
  onClick,
  disabled = false
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-2 rounded-lg flex flex-col items-center justify-center space-y-1 transition-colors ${
      active 
        ? 'bg-blue-600/20 text-blue-400' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    title={label}
  >
    <Icon className="w-5 h-5" />
    <span className="text-xs">{label}</span>
  </button>
);

const EnhancedViewerPage: React.FC = () => {
  const { proteinId } = useParams();
  
  // UI State
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<'select' | 'measure-distance' | 'measure-angle' | 'measure-torsion'>('select');
  const [selectedAtoms, setSelectedAtoms] = useState<AtomInfo[]>([]);
  const [measurements, setMeasurements] = useState<MeasurementData[]>([]);
  const [annotations] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'cartoon' | 'ball-stick' | 'surface' | 'ribbon'>('cartoon');

  // Settings State with localStorage persistence
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('proteinViewerSettings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return {
      backgroundColor: '#0a0e1a',
      ambientLighting: 0.4,
      quality: 'high' as const,
      antialiasing: true,
      shadows: true,
      autoRotate: false,
      rotationSpeed: 0.01,
      atomScale: 1.0,
      bondScale: 0.3,
      showHydrogens: false,
      showWater: false,
      colorScheme: 'chainid' as const,
      transparency: 0,
      soundEnabled: true,
      theme: 'dark' as const
    };
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('proteinViewerSettings', JSON.stringify(settings));
  }, [settings]);

  // Apply settings to the page background and body
  useEffect(() => {
    document.body.style.backgroundColor = settings.backgroundColor;
    const root = document.documentElement;
    
    if (settings.theme === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    } else {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    }

    return () => {
      document.body.style.backgroundColor = '';
      root.classList.remove('light-theme', 'dark-theme');
    };
  }, [settings.backgroundColor, settings.theme]);

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const calculateMeasurement = (atoms: AtomInfo[], type: string): number => {
    if (atoms.length < 2) return 0;
    
    switch (type) {
        case 'measure-distance':
          if (atoms.length === 2) {
            const dx = atoms[0].x - atoms[1].x;
            const dy = atoms[0].y - atoms[1].y;
            const dz = atoms[0].z - atoms[1].z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
          }
          return 0;
          
        case 'measure-angle':
          if (atoms.length === 3) {
            const v1 = {
              x: atoms[0].x - atoms[1].x,
              y: atoms[0].y - atoms[1].y,
              z: atoms[0].z - atoms[1].z
            };
            const v2 = {
              x: atoms[2].x - atoms[1].x,
              y: atoms[2].y - atoms[1].y,
              z: atoms[2].z - atoms[1].z
            };
            
            const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
            const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
            const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);
            
            return Math.acos(dot / (mag1 * mag2)) * (180 / Math.PI);
          }
          return 0;
          
        case 'measure-torsion':
          if (atoms.length === 4) {
            // Simplified torsion angle calculation
            const b1 = {
              x: atoms[1].x - atoms[0].x,
              y: atoms[1].y - atoms[0].y,
              z: atoms[1].z - atoms[0].z
            };
            const b2 = {
              x: atoms[2].x - atoms[1].x,
              y: atoms[2].y - atoms[1].y,
              z: atoms[2].z - atoms[1].z
            };
            const b3 = {
              x: atoms[3].x - atoms[2].x,
              y: atoms[3].y - atoms[2].y,
              z: atoms[3].z - atoms[2].z
            };
            
            // Cross products
            const n1 = {
              x: b1.y * b2.z - b1.z * b2.y,
              y: b1.z * b2.x - b1.x * b2.z,
              z: b1.x * b2.y - b1.y * b2.x
            };
            const n2 = {
              x: b2.y * b3.z - b2.z * b3.y,
              y: b2.z * b3.x - b2.x * b3.z,
              z: b2.x * b3.y - b2.y * b3.x
            };
            
            // Normalize n1 and n2
            const n1Mag = Math.sqrt(n1.x * n1.x + n1.y * n1.y + n1.z * n1.z);
            const n2Mag = Math.sqrt(n2.x * n2.x + n2.y * n2.y + n2.z * n2.z);
            
            if (n1Mag === 0 || n2Mag === 0) return 0;
            
            n1.x /= n1Mag; n1.y /= n1Mag; n1.z /= n1Mag;
            n2.x /= n2Mag; n2.y /= n2Mag; n2.z /= n2Mag;
            
            // Calculate angle between n1 and n2
            let angle = Math.acos(n1.x * n2.x + n1.y * n2.y + n1.z * n2.z);
            
            // Determine sign of angle
            const m1 = {
              x: n1.y * b2.z - n1.z * b2.y,
              y: n1.z * b2.x - n1.x * b2.z,
              z: n1.x * b2.y - n1.y * b2.x
            };
            
            if ((m1.x * n2.x + m1.y * n2.y + m1.z * n2.z) < 0) {
              angle = -angle;
            }
            
            return angle * (180 / Math.PI);
          }
          return 0;

        default:
          return 0;
      }
  };

  const formatMeasurementValue = (measurement: MeasurementData): string => {
    switch (measurement.type) {
      case 'distance':
        return `${measurement.value.toFixed(2)} Å`;
      case 'angle':
      case 'torsion':
        return `${measurement.value.toFixed(1)}°`;
      default:
        return measurement.value.toFixed(2);
    }
  };

  const handleAtomSelect = (atom: AtomInfo) => {
    if (activeMode === 'select') {
      setSelectedAtoms([atom]);
    } else {
      const requiredAtoms = {
        'measure-distance': 2,
        'measure-angle': 3,
        'measure-torsion': 4
      } as const;

      const required = requiredAtoms[activeMode];
      const newSelection = [...selectedAtoms, atom];

      if (newSelection.length === required) {
        const measurement: MeasurementData = {
          id: Date.now(),
          type: activeMode.replace('measure-', '') as 'distance' | 'angle' | 'torsion',
          atoms: newSelection,
          value: calculateMeasurement(newSelection, activeMode),
          timestamp: new Date(),
          highlighted: false
        };

        setMeasurements((prev: MeasurementData[]) => [...prev, measurement]);
        setSelectedAtoms([]);
      } else if (newSelection.length < required) {
        setSelectedAtoms(newSelection);
      } else {
        setSelectedAtoms([atom]);
      }
    }
  };

  const handleExportMeasurements = () => {
    const data = measurements.map(m => ({
      type: m.type,
      value: m.value,
      atoms: m.atoms.map(a => `${a.residue}${a.residueNumber}`).join(' → '),
      timestamp: m.timestamp.toISOString()
    }));
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'measurements.json';
    a.click();
    URL.revokeObjectURL(url);
  };


  return (
    <div 
      className="h-screen flex flex-col bg-slate-900 text-white overflow-hidden"
      style={{ 
        background: `linear-gradient(to bottom right, ${settings.backgroundColor}, #0f172a)`
      }}
    >
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top toolbar */}
        <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700/50 p-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => window.history.back()}
              className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
            >
              <Home className="w-5 h-5" />
            </button>
            <h1 className="text-white font-medium ml-2">Protein Viewer</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
              title="Toggle fullscreen"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main viewer area */}
        <div className="flex-1 overflow-hidden relative">
          <NGLProteinViewer 
            proteinId={proteinId || '1CRN'} 
            onAtomSelect={handleAtomSelect}
            selectedAtoms={selectedAtoms}
            measurements={measurements}
            annotations={annotations}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
          
          {/* Measurement controls - Moved to left side */}
          <div className="absolute top-4 left-4 bg-slate-800/80 backdrop-blur-md rounded-xl p-2 flex flex-col space-y-2 border border-slate-700/50">
            <ToolButton
              icon={Move3D}
              label="Select"
              active={activeMode === 'select'}
              onClick={() => setActiveMode('select')}
            />
            <ToolButton
              icon={Ruler}
              label="Distance"
              active={activeMode === 'measure-distance'}
              onClick={() => setActiveMode('measure-distance')}
            />
            <ToolButton
              icon={Angle}
              label="Angle"
              active={activeMode === 'measure-angle'}
              onClick={() => setActiveMode('measure-angle')}
            />
            <ToolButton
              icon={Gauge}
              label="Torsion"
              active={activeMode === 'measure-torsion'}
              onClick={() => setActiveMode('measure-torsion')}
            />
            
            <div className="border-t border-slate-700/50 my-1"></div>
            
            <ToolButton
              icon={LayoutGrid}
              label="Cartoon"
              active={viewMode === 'cartoon'}
              onClick={() => setViewMode('cartoon')}
            />
            <ToolButton
              icon={Atom}
              label="Ball & Stick"
              active={viewMode === 'ball-stick'}
              onClick={() => setViewMode('ball-stick')}
            />
          </div>
          
          {/* Measurement display */}
          {measurements.length > 0 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-800/80 backdrop-blur-md rounded-lg p-3 max-w-md w-full border border-slate-700/50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-slate-300">Measurements</h3>
                <div className="flex space-x-1">
                  <button 
                    onClick={handleExportMeasurements}
                    className="p-1 rounded hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
                    title="Export measurements"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setMeasurements([])}
                    className="p-1 rounded hover:bg-slate-700/50 text-slate-300 hover:text-red-400 transition-colors"
                    title="Clear all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {measurements.map((m) => (
                  <div 
                    key={m.id} 
                    className="flex justify-between items-center p-2 rounded hover:bg-slate-700/50"
                  >
                    <div className="text-sm">
                      <span className="text-slate-400">{m.type}: </span>
                      <span className="font-mono">
                        {m.atoms.map((a, i) => (
                          <span key={i}>
                            {a.residue}{a.residueNumber}.{a.atomName}
                            {i < m.atoms.length - 1 ? ' - ' : ''}
                          </span>
                        ))}
                        <span className="ml-2 text-blue-400">{formatMeasurementValue(m)}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {settingsOpen && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            className="bg-slate-800/95 backdrop-blur-md rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Settings</h2>
              <button 
                onClick={() => setSettingsOpen(false)}
                className="p-1 rounded-full hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-3">Appearance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Theme</label>
                      <select
                        value={settings.theme}
                        onChange={(e) => setSettings({...settings, theme: e.target.value as 'dark' | 'light'})}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Background Color</label>
                      <input
                        type="color"
                        value={settings.backgroundColor}
                        onChange={(e) => setSettings({...settings, backgroundColor: e.target.value})}
                        className="w-full h-10 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-3">Rendering</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Quality</label>
                      <select
                        value={settings.quality}
                        onChange={(e) => setSettings({...settings, quality: e.target.value as 'low' | 'medium' | 'high'})}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Color Scheme</label>
                      <select
                        value={settings.colorScheme}
                        onChange={(e) => setSettings({...settings, colorScheme: e.target.value as 'chainid' | 'element' | 'residue' | 'bfactor'})}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="chainid">Chain</option>
                        <option value="element">Element</option>
                        <option value="residue">Residue</option>
                        <option value="bfactor">B-Factor</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setSettingsOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setSettingsOpen(false)}
                      className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}


      {/* Loading Overlay for page transitions */}
      {!proteinId && (
        <motion.div
          className="absolute inset-0 bg-slate-900/90 flex items-center justify-center z-50"
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
            <h3 className="text-xl font-semibold text-white mb-2">Loading Protein Data</h3>
            <p className="text-slate-400">Preparing molecular visualization...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EnhancedViewerPage;