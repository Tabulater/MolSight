import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  RotateCcw, 
  ZoomIn, 
  MousePointer, 
  Ruler, 
  Triangle, 
  Share2, 
  MessageSquare, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import ProteinViewer from '../components/ProteinViewer';
import AnnotationSidebar from '../components/AnnotationSidebar';
import MeasurementPanel from '../components/MeasurementPanel';
import Toolbar from '../components/Toolbar';

const ViewerPage: React.FC = () => {
  const { proteinId, annotationId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMode, setActiveMode] = useState<'select' | 'measure-distance' | 'measure-angle'>('select');
  const [selectedAtoms, setSelectedAtoms] = useState<any[]>([]);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);

  const handleAtomSelect = (atom: any) => {
    if (activeMode === 'select') {
      setSelectedAtoms([atom]);
    } else if (activeMode === 'measure-distance') {
      if (selectedAtoms.length === 1) {
        const distance = calculateDistance(selectedAtoms[0], atom);
        setMeasurements(prev => [...prev, {
          type: 'distance',
          atoms: [selectedAtoms[0], atom],
          value: distance,
          id: Date.now()
        }]);
        setSelectedAtoms([]);
      } else {
        setSelectedAtoms([atom]);
      }
    } else if (activeMode === 'measure-angle') {
      if (selectedAtoms.length === 2) {
        const angle = calculateAngle(selectedAtoms[0], selectedAtoms[1], atom);
        setMeasurements(prev => [...prev, {
          type: 'angle',
          atoms: [selectedAtoms[0], selectedAtoms[1], atom],
          value: angle,
          id: Date.now()
        }]);
        setSelectedAtoms([]);
      } else {
        setSelectedAtoms(prev => [...prev, atom]);
      }
    }
  };

  const calculateDistance = (atom1: any, atom2: any): number => {
    const dx = atom1.x - atom2.x;
    const dy = atom1.y - atom2.y;
    const dz = atom1.z - atom2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  };

  const calculateAngle = (atom1: any, atom2: any, atom3: any): number => {
    // Calculate angle between three atoms (atom2 is the vertex)
    const v1 = { x: atom1.x - atom2.x, y: atom1.y - atom2.y, z: atom1.z - atom2.z };
    const v2 = { x: atom3.x - atom2.x, y: atom3.y - atom2.y, z: atom3.z - atom2.z };
    
    const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);
    
    return Math.acos(dot / (mag1 * mag2)) * (180 / Math.PI);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/viewer/${proteinId}`;
    await navigator.clipboard.writeText(url);
    // Show toast notification
  };

  const clearMeasurements = () => {
    setMeasurements([]);
    setSelectedAtoms([]);
  };

  return (
    <div className="h-screen bg-slate-900 flex overflow-hidden">
      {/* Main Viewer Area */}
      <div className="flex-1 relative">
        {/* Toolbar */}
        <Toolbar
          activeMode={activeMode}
          onModeChange={setActiveMode}
          onShare={handleShare}
          onClearMeasurements={clearMeasurements}
          selectedAtomsCount={selectedAtoms.length}
        />

        {/* 3D Viewer */}
        <ProteinViewer
          proteinId={proteinId}
          onAtomSelect={handleAtomSelect}
          selectedAtoms={selectedAtoms}
          measurements={measurements}
          annotations={annotations}
        />

        {/* Sidebar Toggle */}
        <motion.button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 right-4 z-20 bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg p-3 text-slate-300 hover:text-white hover:bg-slate-700/90 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {sidebarOpen ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </motion.button>
      </div>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: sidebarOpen ? 400 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-slate-800 border-l border-slate-700 overflow-hidden"
      >
        <div className="w-96 h-full">
          <AnnotationSidebar
            proteinId={proteinId}
            selectedAtoms={selectedAtoms}
            annotations={annotations}
            onAnnotationsChange={setAnnotations}
          />
        </div>
      </motion.div>

      {/* Measurements Panel */}
      {measurements.length > 0 && (
        <MeasurementPanel
          measurements={measurements}
          onClear={clearMeasurements}
          onRemoveMeasurement={(id) => 
            setMeasurements(prev => prev.filter(m => m.id !== id))
          }
        />
      )}
    </div>
  );
};

export default ViewerPage;