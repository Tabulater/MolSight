import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Atom, MessageSquare, Database, Microscope, Dna } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import PDBInput from '../components/PDBInput';
import ParticleBackground from '../components/ParticleBackground';

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pdb' | 'upload'>('pdb');
  const navigate = useNavigate();

  const handleProteinLoaded = (proteinId: string) => {
    navigate(`/viewer/${proteinId}`);
  };

  const handleGetStartedClick = () => {
    document.querySelector('.main-input-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: Microscope,
      title: 'Real PDB Structures',
      description: 'Load authentic protein structures directly from RCSB Protein Data Bank with accurate 3D coordinates'
    },
    {
      icon: Atom,
      title: 'Beautiful Ribbon Visualization',
      description: 'High-fidelity cartoon and ribbon representations with smooth secondary structure rendering'
    },
    {
      icon: Database,
      title: 'Local Storage',
      description: 'Your data stays on your machine with browser-based storage'
    },
    {
      icon: MessageSquare,
      title: 'Smart Measurements',
      description: 'Precise distance, angle, and torsion measurements with export capabilities'
    }
  ];

  const showcaseProteins = [
    {
      id: '8R9U',
      name: 'SARS-CoV-2 Spike Protein',
      description: 'Viral entry mechanism',
      color: 'from-red-500 to-orange-500'
    },
    {
      id: '1BNA',
      name: 'Barnase',
      description: 'Ribonuclease enzyme',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: '2GBP',
      name: 'Glucose Binding Protein',
      description: 'Sugar transport mechanism',
      color: 'from-green-500 to-teal-500'
    },
    {
      id: '1HTM',
      name: 'HIV-1 Protease',
      description: 'Drug target enzyme',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <ParticleBackground />
      
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <Dna className="h-8 w-8 text-cyan-400" />
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Atom className="h-8 w-8 text-cyan-400 opacity-30" />
              </motion.div>
            </div>
            <h1 className="text-2xl font-bold text-white">Molsight</h1>
            <span className="text-xs bg-cyan-600/20 text-cyan-300 px-2 py-1 rounded-full">
              Molecular Visualizer
            </span>
          </motion.div>
          
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <button 
              onClick={handleGetStartedClick}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              Get Started
            </button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-20">
        <div className="text-center">
          <motion.h1 
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Visualize Proteins.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
              Discover Biology.
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Professional-grade protein structure visualization powered by real PDB data. 
            Load any protein structure with a simple 4-letter ID and explore it in stunning 3D ribbon representation.
          </motion.p>

          {/* Main Input Section */}
          <motion.div 
            className="main-input-section max-w-2xl mx-auto bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <div className="flex justify-center mb-6">
              <div className="flex bg-slate-700/50 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('pdb')}
                  className={`px-6 py-3 rounded-md transition-all flex items-center space-x-2 ${
                    activeTab === 'pdb'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Database className="w-4 h-4" />
                  <span>PDB ID</span>
                </button>
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`px-6 py-3 rounded-md transition-all flex items-center space-x-2 ${
                    activeTab === 'upload'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload File</span>
                </button>
              </div>
            </div>

            {activeTab === 'pdb' ? (
              <PDBInput onProteinLoaded={handleProteinLoaded} />
            ) : (
              <FileUpload onProteinLoaded={handleProteinLoaded} />
            )}
          </motion.div>

          {/* Showcase Proteins */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <h3 className="text-2xl font-bold text-white mb-8">Featured Structures</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {showcaseProteins.map((protein, index) => (
                <motion.button
                  key={protein.id}
                  onClick={() => handleProteinLoaded(protein.id)}
                  className="group relative p-6 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300 text-left"
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${protein.color} mb-4 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Atom className="w-6 h-6 text-white" />
                  </div>
                  <div className="font-mono font-bold text-cyan-400 text-lg mb-1">
                    {protein.id}
                  </div>
                  <h4 className="font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {protein.name}
                  </h4>
                  <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                    {protein.description}
                  </p>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 to-blue-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/30 p-6 hover:bg-slate-800/50 transition-all duration-300 group"
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-400">
              <Database className="w-4 h-4" />
              <span className="text-sm">Powered by RCSB Protein Data Bank</span>
            </div>
            <div className="text-sm text-slate-500">
              Built for structural biology research
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;