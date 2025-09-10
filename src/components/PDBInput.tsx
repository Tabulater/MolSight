import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader, AlertCircle, CheckCircle, Database, Zap } from 'lucide-react';

interface PDBInputProps {
  onProteinLoaded: (proteinId: string) => void;
  className?: string;
}

const PDBInput: React.FC<PDBInputProps> = ({ onProteinLoaded, className = '' }) => {
  const [pdbId, setPdbId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validatePDBId = (id: string): boolean => {
    // PDB IDs are 4 characters: 1 digit followed by 3 alphanumeric characters
    return /^[0-9][A-Za-z0-9]{3}$/.test(id);
  };

  const checkPDBExists = async (id: string): Promise<boolean> => {
    try {
      // Try to fetch the actual PDB file to verify it exists
      const pdbUrl = `https://files.rcsb.org/download/${id.toUpperCase()}.pdb`;
      const response = await fetch(pdbUrl, { method: 'HEAD' });
      return response.ok;
    } catch {
      // If CORS or network issues, assume it exists if format is valid
      return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanId = pdbId.trim().toUpperCase();
    
    if (!cleanId) {
      setError('Please enter a PDB ID');
      return;
    }

    if (!validatePDBId(cleanId)) {
      setError('Please enter a valid 4-character PDB ID (e.g., 8R9U)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // For now, skip the existence check and let the viewer handle it
      // This avoids CORS issues and lets NGL handle the actual validation
      setSuccess(true);
      
      // Small delay for visual feedback
      setTimeout(() => {
        onProteinLoaded(cleanId);
      }, 800);
      
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().slice(0, 4);
    setPdbId(value);
    setError(null);
    setSuccess(false);
  };

  const exampleIds = [
    { id: '8R9U', name: 'SARS-CoV-2 Spike' },
    { id: '8R99', name: 'COVID-19 Protease' },
    { id: '1BNA', name: 'Barnase' },
    { id: '2GBP', name: 'Glucose Binding' },
    { id: '1HTM', name: 'HIV-1 Protease' },
    { id: '1CRN', name: 'Crambin' }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mb-4"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Database className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">Load Protein Structure</h2>
        <p className="text-slate-400">Enter a PDB ID to visualize protein structures in beautiful 3D</p>
      </div>

      {/* Input Form */}
      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Database className="h-5 w-5 text-slate-400" />
          </div>
          
          <input
            type="text"
            value={pdbId}
            onChange={handleInputChange}
            placeholder="Enter PDB ID (e.g., 8R9U)"
            className={`w-full pl-12 pr-12 py-4 bg-slate-700/50 border-2 rounded-xl text-white placeholder-slate-400 text-lg font-mono tracking-wider text-center focus:outline-none transition-all ${
              error 
                ? 'border-red-500 focus:border-red-400' 
                : success
                ? 'border-green-500 focus:border-green-400'
                : 'border-slate-600 focus:border-cyan-500'
            }`}
            maxLength={4}
            disabled={loading || success}
            autoComplete="off"
            spellCheck={false}
          />
          
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            {loading && <Loader className="h-5 w-5 text-cyan-400 animate-spin" />}
            {success && <CheckCircle className="h-5 w-5 text-green-400" />}
            {error && <AlertCircle className="h-5 w-5 text-red-400" />}
          </div>
        </div>

        {error && (
          <motion.div 
            className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg p-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={loading || !pdbId || success}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all flex items-center justify-center space-x-3 shadow-lg"
          whileHover={{ scale: loading || success ? 1 : 1.02 }}
          whileTap={{ scale: loading || success ? 1 : 0.98 }}
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Loading Structure...</span>
            </>
          ) : success ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Loading Viewer...</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              <span>Load Protein</span>
            </>
          )}
        </motion.button>
      </motion.form>

      {/* Examples */}
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="text-center">
          <span className="text-sm text-slate-400">Try these examples:</span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {exampleIds.map(({ id, name }) => (
            <motion.button
              key={id}
              onClick={() => setPdbId(id)}
              className="p-3 bg-slate-700/30 hover:bg-slate-600/50 border border-slate-600/50 hover:border-slate-500 rounded-lg text-left transition-all group"
              disabled={loading || success}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="font-mono font-bold text-cyan-400 group-hover:text-cyan-300">
                {id}
              </div>
              <div className="text-xs text-slate-400 group-hover:text-slate-300 truncate">
                {name}
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Info */}
      <motion.div 
        className="text-center text-xs text-slate-500 space-y-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <p>Structures loaded from RCSB Protein Data Bank</p>
        <p>Supports all PDB format files with 3D coordinates</p>
      </motion.div>
    </div>
  );
};

export default PDBInput;