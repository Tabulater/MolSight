import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MousePointer, 
  Ruler, 
  Triangle, 
  RotateCw,
  Share2, 
  RotateCcw, 
  ZoomIn,
  ZoomOut,
  Trash2,
  Info,
  Settings,
  Layers,
  Eye,
  Download,
  Bookmark,
  History,
  Grid3X3,
  Target,
  Zap,
  ChevronDown,
  Bell,
  Users
} from 'lucide-react';

interface ToolbarProps {
  activeMode: 'select' | 'measure-distance' | 'measure-angle' | 'measure-torsion';
  onModeChange: (mode: 'select' | 'measure-distance' | 'measure-angle' | 'measure-torsion') => void;
  onShare: () => void;
  onClearMeasurements: () => void;
  onExportView: () => void;
  onBookmarkView: () => void;
  selectedAtomsCount: number;
  measurementCount: number;
  viewMode: string;
  onViewModeChange: (mode: string) => void;
  onOpenSettings: () => void;
}

const EnhancedToolbar: React.FC<ToolbarProps> = ({
  activeMode,
  onModeChange,
  onShare,
  onClearMeasurements,
  onExportView,
  onBookmarkView,
  selectedAtomsCount,
  measurementCount,
  viewMode,
  onViewModeChange,
  onOpenSettings
}) => {
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(3);

  // Refs for dropdown positioning
  const viewMenuRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (viewMenuRef.current && !viewMenuRef.current.contains(event.target as Node)) {
        setShowViewMenu(false);
      }
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tools = [
    {
      id: 'select',
      icon: MousePointer,
      label: 'Select',
      description: 'Select atoms and residues',
      shortcut: 'S',
      color: 'cyan'
    },
    {
      id: 'measure-distance',
      icon: Ruler,
      label: 'Distance',
      description: 'Measure distance between atoms',
      shortcut: 'D',
      color: 'orange'
    },
    {
      id: 'measure-angle',
      icon: Triangle,
      label: 'Angle',
      description: 'Measure bond angles',
      shortcut: 'A',
      color: 'purple'
    },
    {
      id: 'measure-torsion',
      icon: RotateCw,
      label: 'Torsion',
      description: 'Measure torsion angles',
      shortcut: 'T',
      color: 'green'
    }
  ];

  const viewModes = [
    { id: 'cartoon', label: 'Cartoon', icon: '🎭', description: 'Secondary structure ribbons' },
    { id: 'ribbon', label: 'Ribbon', icon: '🎀', description: 'Smooth backbone ribbons' },
    { id: 'ball-stick', label: 'Ball & Stick', icon: '⚪', description: 'Atomic detail view' },
    { id: 'surface', label: 'Surface', icon: '🏔️', description: 'Molecular surface' }
  ];

  const getToolColor = (toolId: string, isActive: boolean) => {
    const tool = tools.find(t => t.id === toolId);
    if (!tool) return isActive ? 'bg-cyan-600' : 'bg-slate-700';
    
    const colors = {
      cyan: isActive ? 'bg-cyan-600 border-cyan-400' : 'bg-slate-700 border-slate-600',
      orange: isActive ? 'bg-orange-600 border-orange-400' : 'bg-slate-700 border-slate-600',
      purple: isActive ? 'bg-purple-600 border-purple-400' : 'bg-slate-700 border-slate-600',
      green: isActive ? 'bg-green-600 border-green-400' : 'bg-slate-700 border-slate-600'
    };
    
    return colors[tool.color as keyof typeof colors];
  };

  const getStatusText = () => {
    if (activeMode === 'select') {
      return selectedAtomsCount > 0 ? `${selectedAtomsCount} atom${selectedAtomsCount > 1 ? 's' : ''} selected` : 'Click to select atoms';
    }
    
    const requirements = {
      'measure-distance': 2,
      'measure-angle': 3,
      'measure-torsion': 4
    };
    
    const required = requirements[activeMode];
    const remaining = required - selectedAtomsCount;
    
    if (remaining > 0) {
      return `Select ${remaining} more atom${remaining > 1 ? 's' : ''}`;
    }
    
    return 'Ready to measure';
  };

  const mockNotifications = [
    { id: 1, message: 'New measurement added', time: '2m ago', type: 'info' },
    { id: 2, message: 'Structure analysis complete', time: '5m ago', type: 'success' },
    { id: 3, message: 'Collaboration invite received', time: '10m ago', type: 'info' }
  ];

  const markAllAsRead = () => {
    setNotifications(0);
    setShowNotifications(false);
  };

  return (
    <>
      {/* Dropdown Portal Container - Highest z-index */}
      {(showViewMenu || showShareMenu || showNotifications) && (
        <div className="fixed inset-0 z-[10000] pointer-events-none">
          {/* View Menu Dropdown */}
          <AnimatePresence>
            {showViewMenu && viewMenuRef.current && (
              <motion.div
                className="absolute bg-slate-800/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-2 shadow-2xl min-w-64 pointer-events-auto"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{
                  left: viewMenuRef.current.getBoundingClientRect().left,
                  top: viewMenuRef.current.getBoundingClientRect().bottom + 8,
                }}
              >
                {viewModes.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      onViewModeChange(mode.id);
                      setShowViewMenu(false);
                    }}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
                      viewMode === mode.id
                        ? 'bg-cyan-600 text-white'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                    title={mode.description}
                  >
                    <span className="text-lg">{mode.icon}</span>
                    <div className="text-left">
                      <div className="font-medium">{mode.label}</div>
                      <div className="text-xs opacity-75">{mode.description}</div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Share Menu Dropdown */}
          <AnimatePresence>
            {showShareMenu && shareMenuRef.current && (
              <motion.div
                className="absolute bg-slate-800/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-2 shadow-2xl min-w-48 pointer-events-auto"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{
                  left: shareMenuRef.current.getBoundingClientRect().left,
                  top: shareMenuRef.current.getBoundingClientRect().bottom + 8,
                }}
              >
                <button
                  onClick={() => {
                    onShare();
                    setShowShareMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Link</span>
                </button>
                <button 
                  onClick={() => {
                    onBookmarkView();
                    setShowShareMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>Bookmark View</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notifications Dropdown - Centered */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                className="fixed inset-0 z-[10001] flex items-center justify-center p-4 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div 
                  className="bg-slate-800/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-3 border-b border-slate-700">
                    <h3 className="font-medium text-white">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {mockNotifications.map((notification) => (
                      <div key={notification.id} className="p-3 hover:bg-slate-700/50 transition-colors">
                        <div className="text-sm text-slate-300">{notification.message}</div>
                        <div className="text-xs text-slate-500 mt-1">{notification.time}</div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-slate-700">
                    <button 
                      onClick={markAllAsRead}
                      className="text-sm text-cyan-400 hover:text-cyan-300"
                    >
                      Mark all as read
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Main Toolbar */}
      <div className="fixed top-20 left-4 z-[100] flex flex-col space-y-3">
        {/* Top Action Controls */}
        <motion.div 
          className="bg-slate-800/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-3 shadow-2xl"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
        >
          <div className="flex space-x-2">
            {/* Share Menu */}
            <div className="relative" ref={shareMenuRef}>
              <motion.button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="p-3 rounded-xl bg-green-600/20 hover:bg-green-600/30 text-green-400 hover:text-green-300 transition-all border border-green-600/30 flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="w-5 h-5" />
                <ChevronDown className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifications(!showNotifications);
                }}
                className={`p-2 rounded-lg transition-all relative ${
                  showNotifications ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Bell size={20} />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {Math.min(notifications, 9)}
                  </span>
                )}
              </button>
            </div>

            {/* Collaborators */}
            <motion.button
              className="p-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 hover:text-purple-300 transition-all border border-purple-600/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Collaborators"
            >
              <Users className="w-5 h-5" />
            </motion.button>

            {/* Settings */}
            <motion.button
              onClick={onOpenSettings}
              className="p-3 rounded-xl bg-slate-600/20 hover:bg-slate-600/30 text-slate-400 hover:text-slate-300 transition-all border border-slate-600/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Main Tools Panel */}
        <motion.div 
          className="bg-slate-800/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-3 shadow-2xl"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1, type: "spring", stiffness: 300 }}
        >
          <div className="flex space-x-2">
            {tools.map((tool, index) => (
              <motion.div
                key={tool.id}
                className="relative group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <motion.button
                  onClick={() => onModeChange(tool.id as any)}
                  className={`p-3 rounded-xl transition-all border-2 relative ${getToolColor(tool.id, activeMode === tool.id)} ${
                    activeMode === tool.id
                      ? 'text-white shadow-lg scale-105'
                      : 'text-slate-300 hover:text-white hover:bg-slate-600/80 hover:scale-105'
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  title={`${tool.description} (${tool.shortcut})`}
                >
                  <tool.icon className="w-5 h-5" />
                  
                  {/* Active indicator */}
                  {activeMode === tool.id && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    />
                  )}

                  {/* Keyboard shortcut tooltip */}
                  <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-slate-900/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[10001]">
                    <div className="font-medium">{tool.label}</div>
                    <div className="text-slate-400">Press {tool.shortcut}</div>
                  </div>
                </motion.button>
              </motion.div>
            ))}
          </div>

          {/* Tool status */}
          <motion.div 
            className="mt-3 px-3 py-2 bg-slate-700/50 rounded-lg"
            layout
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm">
                <Info className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">{getStatusText()}</span>
              </div>
              {measurementCount > 0 && (
                <div className="text-xs text-slate-400">
                  {measurementCount} measurement{measurementCount > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* View Controls */}
        <motion.div 
          className="bg-slate-800/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-3 shadow-2xl"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2, type: "spring", stiffness: 300 }}
        >
          <div className="flex space-x-2">
            <div className="relative" ref={viewMenuRef}>
              <motion.button
                onClick={() => setShowViewMenu(!showViewMenu)}
                className="p-3 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-all border border-slate-600 flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Layers className="w-5 h-5" />
                <span className="text-sm">{viewModes.find(v => v.id === viewMode)?.label || 'View'}</span>
                <ChevronDown className="w-4 h-4" />
              </motion.button>
            </div>

            <motion.button
              onClick={onClearMeasurements}
              className="p-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 transition-all border border-red-600/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Clear all measurements"
            >
              <Trash2 className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        {(selectedAtomsCount > 0 || measurementCount > 0) && (
          <motion.div 
            className="bg-slate-800/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-3 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-2 text-sm">
              {selectedAtomsCount > 0 && (
                <div className="flex items-center justify-between text-slate-300">
                  <span>Selected:</span>
                  <span className="font-mono font-bold text-cyan-400">{selectedAtomsCount}</span>
                </div>
              )}
              {measurementCount > 0 && (
                <div className="flex items-center justify-between text-slate-300">
                  <span>Measurements:</span>
                  <span className="font-mono font-bold text-orange-400">{measurementCount}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default EnhancedToolbar;