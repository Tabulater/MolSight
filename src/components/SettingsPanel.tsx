import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  X, 
  Monitor, 
  Palette, 
  Sliders, 
  Eye, 
  Atom,
  Layers,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  RotateCw,
  Zap,
  Save,
  RotateCcw
} from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    backgroundColor: string;
    ambientLighting: number;
    quality: 'low' | 'medium' | 'high';
    antialiasing: boolean;
    shadows: boolean;
    autoRotate: boolean;
    rotationSpeed: number;
    atomScale: number;
    bondScale: number;
    showHydrogens: boolean;
    showWater: boolean;
    colorScheme: 'chainid' | 'element' | 'residue' | 'bfactor';
    transparency: number;
    soundEnabled: boolean;
    theme: 'dark' | 'light';
  };
  onSettingsChange: (settings: any) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange
}) => {
  const [activeTab, setActiveTab] = useState<'display' | 'rendering' | 'interaction' | 'advanced'>('display');

  const updateSetting = (key: string, value: any) => {
    const newSettings = {
      ...settings,
      [key]: value
    };
    onSettingsChange(newSettings);
    
    // Apply settings immediately to the viewer
    applySettingsToViewer(key, value, newSettings);
  };

  const applySettingsToViewer = (key: string, value: any, allSettings: any) => {
    // Apply background color to the main container
    if (key === 'backgroundColor') {
      const viewerContainer = document.querySelector('#viewport');
      if (viewerContainer) {
        (viewerContainer as HTMLElement).style.backgroundColor = value;
      }
      // Also apply to the main page background
      document.body.style.backgroundColor = value;
    }

    // Apply theme changes
    if (key === 'theme') {
      const root = document.documentElement;
      if (value === 'light') {
        root.classList.add('light-theme');
        root.classList.remove('dark-theme');
      } else {
        root.classList.add('dark-theme');
        root.classList.remove('light-theme');
      }
    }

    // Apply auto-rotation
    if (key === 'autoRotate' && window.NGL) {
      const stage = (window as any).nglStage;
      if (stage) {
        if (value) {
          stage.setSpin([0, 1, 0], allSettings.rotationSpeed);
        } else {
          stage.setSpin(null);
        }
      }
    }

    // Apply rotation speed
    if (key === 'rotationSpeed' && allSettings.autoRotate && window.NGL) {
      const stage = (window as any).nglStage;
      if (stage) {
        stage.setSpin([0, 1, 0], value);
      }
    }

    // Apply quality settings
    if (key === 'quality' && window.NGL) {
      const stage = (window as any).nglStage;
      if (stage) {
        const qualityMap = {
          'low': { sampleLevel: 0, impostor: false },
          'medium': { sampleLevel: 1, impostor: true },
          'high': { sampleLevel: 2, impostor: true }
        };
        const qualitySettings = qualityMap[value as keyof typeof qualityMap];
        stage.setParameters(qualitySettings);
      }
    }

    // Apply lighting changes
    if (key === 'ambientLighting' && window.NGL) {
      const stage = (window as any).nglStage;
      if (stage) {
        stage.setParameters({ ambientIntensity: value });
      }
    }

    // Apply transparency
    if (key === 'transparency' && window.NGL) {
      const component = (window as any).nglComponent;
      if (component) {
        component.reprList.forEach((repr: any) => {
          repr.setParameters({ opacity: 1 - (value / 100) });
        });
      }
    }

    // Apply color scheme changes
    if (key === 'colorScheme' && window.NGL) {
      const component = (window as any).nglComponent;
      if (component) {
        component.reprList.forEach((repr: any) => {
          repr.setParameters({ color: value });
        });
      }
    }

    // Apply atom and bond scaling
    if ((key === 'atomScale' || key === 'bondScale') && window.NGL) {
      const component = (window as any).nglComponent;
      if (component) {
        component.reprList.forEach((repr: any) => {
          if (repr.type === 'ball+stick') {
            repr.setParameters({ 
              radiusScale: key === 'atomScale' ? value : repr.getParameters().radiusScale,
              bondScale: key === 'bondScale' ? value : repr.getParameters().bondScale
            });
          }
        });
      }
    }

    // Show/hide hydrogens and water
    if ((key === 'showHydrogens' || key === 'showWater') && window.NGL) {
      const component = (window as any).nglComponent;
      if (component) {
        // This would require more complex NGL integration
        console.log(`${key} setting changed to:`, value);
      }
    }
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      backgroundColor: '#0a0e1a',
      ambientLighting: 0.4,
      quality: 'high' as 'low' | 'medium' | 'high',
      antialiasing: true,
      shadows: true,
      autoRotate: false,
      rotationSpeed: 0.01,
      atomScale: 1.0,
      bondScale: 0.3,
      showHydrogens: false,
      showWater: false,
      colorScheme: 'chainid' as 'chainid' | 'element' | 'residue' | 'bfactor',
      transparency: 0,
      soundEnabled: true,
      theme: 'dark' as 'dark' | 'light'
    };
    
    onSettingsChange(defaultSettings);
    
    // Apply all default settings
    Object.entries(defaultSettings).forEach(([key, value]) => {
      applySettingsToViewer(key, value, defaultSettings);
    });
  };

  const tabs = [
    { id: 'display', label: 'Display', icon: Monitor },
    { id: 'rendering', label: 'Rendering', icon: Palette },
    { id: 'interaction', label: 'Interaction', icon: Sliders },
    { id: 'advanced', label: 'Advanced', icon: Settings }
  ];

  const colorSchemes = [
    { id: 'chainid', label: 'Chain ID', description: 'Color by protein chain' },
    { id: 'element', label: 'Element', description: 'Color by atomic element' },
    { id: 'residue', label: 'Residue', description: 'Color by amino acid type' },
    { id: 'bfactor', label: 'B-Factor', description: 'Color by temperature factor' }
  ];

  const qualityOptions = [
    { id: 'low', label: 'Low', description: 'Better performance' },
    { id: 'medium', label: 'Medium', description: 'Balanced quality' },
    { id: 'high', label: 'High', description: 'Best visual quality' }
  ];

  const backgroundColors = [
    { color: '#0a0e1a', label: 'Deep Navy' },
    { color: '#000000', label: 'Black' },
    { color: '#1a1a1a', label: 'Dark Gray' },
    { color: '#2d3748', label: 'Slate' },
    { color: '#ffffff', label: 'White' },
    { color: '#f7fafc', label: 'Light Gray' }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[20000] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Viewer Settings</h2>
                <p className="text-sm text-slate-400">Customize your 3D visualization experience</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={resetToDefaults}
                className="flex items-center space-x-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm">Reset</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex h-[600px]">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900/50 border-r border-slate-700 p-4">
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-cyan-600 text-white shadow-lg'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'display' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Monitor className="w-5 h-5 mr-2" />
                      Display Settings
                    </h3>
                  </div>

                  {/* Background Color */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Background Color
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {backgroundColors.map((bg) => (
                        <button
                          key={bg.color}
                          onClick={() => updateSetting('backgroundColor', bg.color)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            settings.backgroundColor === bg.color
                              ? 'border-cyan-400 shadow-lg ring-2 ring-cyan-400/20'
                              : 'border-slate-600 hover:border-slate-500'
                          }`}
                          style={{ backgroundColor: bg.color }}
                        >
                          <div className="text-xs font-medium text-center" style={{ 
                            color: bg.color === '#ffffff' || bg.color === '#f7fafc' ? '#000' : '#fff' 
                          }}>
                            {bg.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Scheme */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Color Scheme
                    </label>
                    <div className="space-y-2">
                      {colorSchemes.map((scheme) => (
                        <button
                          key={scheme.id}
                          onClick={() => updateSetting('colorScheme', scheme.id)}
                          className={`w-full p-3 rounded-lg border transition-all text-left ${
                            settings.colorScheme === scheme.id
                              ? 'border-cyan-400 bg-cyan-600/20 text-white ring-2 ring-cyan-400/20'
                              : 'border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white'
                          }`}
                        >
                          <div className="font-medium">{scheme.label}</div>
                          <div className="text-xs opacity-75">{scheme.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Theme */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Interface Theme
                    </label>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => updateSetting('theme', 'dark')}
                        className={`flex-1 p-3 rounded-lg border transition-all flex items-center justify-center space-x-2 ${
                          settings.theme === 'dark'
                            ? 'border-cyan-400 bg-cyan-600/20 text-white ring-2 ring-cyan-400/20'
                            : 'border-slate-600 hover:border-slate-500 text-slate-300'
                        }`}
                      >
                        <Moon className="w-4 h-4" />
                        <span>Dark</span>
                      </button>
                      <button
                        onClick={() => updateSetting('theme', 'light')}
                        className={`flex-1 p-3 rounded-lg border transition-all flex items-center justify-center space-x-2 ${
                          settings.theme === 'light'
                            ? 'border-cyan-400 bg-cyan-600/20 text-white ring-2 ring-cyan-400/20'
                            : 'border-slate-600 hover:border-slate-500 text-slate-300'
                        }`}
                      >
                        <Sun className="w-4 h-4" />
                        <span>Light</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'rendering' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Palette className="w-5 h-5 mr-2" />
                      Rendering Quality
                    </h3>
                  </div>

                  {/* Quality */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Rendering Quality
                    </label>
                    <div className="space-y-2">
                      {qualityOptions.map((quality) => (
                        <button
                          key={quality.id}
                          onClick={() => updateSetting('quality', quality.id)}
                          className={`w-full p-3 rounded-lg border transition-all text-left ${
                            settings.quality === quality.id
                              ? 'border-cyan-400 bg-cyan-600/20 text-white ring-2 ring-cyan-400/20'
                              : 'border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white'
                          }`}
                        >
                          <div className="font-medium">{quality.label}</div>
                          <div className="text-xs opacity-75">{quality.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ambient Lighting */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Ambient Lighting: {(settings.ambientLighting * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.ambientLighting}
                      onChange={(e) => updateSetting('ambientLighting', parseFloat(e.target.value))}
                      className="w-full slider"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Dark</span>
                      <span>Bright</span>
                    </div>
                  </div>

                  {/* Transparency */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Global Transparency: {settings.transparency}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={settings.transparency}
                      onChange={(e) => updateSetting('transparency', parseInt(e.target.value))}
                      className="w-full slider"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Opaque</span>
                      <span>Transparent</span>
                    </div>
                  </div>

                  {/* Toggle Options */}
                  <div className="space-y-4">
                    {[
                      { key: 'antialiasing', label: 'Anti-aliasing', description: 'Smooth edges for better quality' },
                      { key: 'shadows', label: 'Shadows', description: 'Enhanced depth perception' },
                      { key: 'showHydrogens', label: 'Show Hydrogens', description: 'Display hydrogen atoms' },
                      { key: 'showWater', label: 'Show Water', description: 'Display water molecules' }
                    ].map((option) => (
                      <div key={option.key} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div>
                          <div className="text-white font-medium">{option.label}</div>
                          <div className="text-xs text-slate-400">{option.description}</div>
                        </div>
                        <button
                          onClick={() => updateSetting(option.key, !settings[option.key as keyof typeof settings])}
                          className={`w-12 h-6 rounded-full transition-all relative ${
                            settings[option.key as keyof typeof settings]
                              ? 'bg-cyan-600'
                              : 'bg-slate-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${
                            settings[option.key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'interaction' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Sliders className="w-5 h-5 mr-2" />
                      Interaction Settings
                    </h3>
                  </div>

                  {/* Auto Rotate */}
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div>
                      <div className="text-white font-medium flex items-center">
                        <RotateCw className="w-4 h-4 mr-2" />
                        Auto Rotate
                      </div>
                      <div className="text-xs text-slate-400">Automatically rotate the structure</div>
                    </div>
                    <button
                      onClick={() => updateSetting('autoRotate', !settings.autoRotate)}
                      className={`w-12 h-6 rounded-full transition-all relative ${
                        settings.autoRotate ? 'bg-cyan-600' : 'bg-slate-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${
                        settings.autoRotate ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  {/* Rotation Speed */}
                  {settings.autoRotate && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        Rotation Speed: {(settings.rotationSpeed * 1000).toFixed(0)}
                      </label>
                      <input
                        type="range"
                        min="0.005"
                        max="0.05"
                        step="0.005"
                        value={settings.rotationSpeed}
                        onChange={(e) => updateSetting('rotationSpeed', parseFloat(e.target.value))}
                        className="w-full slider"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>Slow</span>
                        <span>Fast</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Sound */}
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div>
                      <div className="text-white font-medium flex items-center">
                        {settings.soundEnabled ? <Volume2 className="w-4 h-4 mr-2" /> : <VolumeX className="w-4 h-4 mr-2" />}
                        Sound Effects
                      </div>
                      <div className="text-xs text-slate-400">Audio feedback for interactions</div>
                    </div>
                    <button
                      onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
                      className={`w-12 h-6 rounded-full transition-all relative ${
                        settings.soundEnabled ? 'bg-cyan-600' : 'bg-slate-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${
                        settings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'advanced' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Zap className="w-5 h-5 mr-2" />
                      Advanced Settings
                    </h3>
                  </div>

                  {/* Atom Scale */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Atom Scale: {settings.atomScale.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={settings.atomScale}
                      onChange={(e) => updateSetting('atomScale', parseFloat(e.target.value))}
                      className="w-full slider"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Small</span>
                      <span>Large</span>
                    </div>
                  </div>

                  {/* Bond Scale */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Bond Scale: {settings.bondScale.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      value={settings.bondScale}
                      onChange={(e) => updateSetting('bondScale', parseFloat(e.target.value))}
                      className="w-full slider"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Thin</span>
                      <span>Thick</span>
                    </div>
                  </div>

                  {/* Performance Warning */}
                  <div className="p-4 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Zap className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <div>
                        <div className="text-yellow-300 font-medium">Performance Note</div>
                        <div className="text-yellow-200/80 text-sm mt-1">
                          Higher quality settings may impact performance on older devices. 
                          Adjust settings based on your hardware capabilities.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div className="p-4 bg-cyan-600/20 border border-cyan-600/30 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Eye className="w-5 h-5 text-cyan-400 mt-0.5" />
                      <div>
                        <div className="text-cyan-300 font-medium">Live Preview</div>
                        <div className="text-cyan-200/80 text-sm mt-1">
                          All settings are applied immediately to the 3D viewer. 
                          Changes are automatically saved to your browser.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-slate-700 bg-slate-900/50">
            <div className="text-sm text-slate-400">
              Settings are automatically saved and applied in real-time
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={resetToDefaults}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors"
              >
                Reset to Defaults
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SettingsPanel;