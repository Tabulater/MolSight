import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader, AlertCircle, CheckCircle } from 'lucide-react';

interface PDBSearchProps {
  onProteinLoaded: (proteinId: string) => void;
}

const PDBSearch: React.FC<PDBSearchProps> = ({ onProteinLoaded }) => {
  const [pdbId, setPdbId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pdbId.match(/^[0-9][A-Za-z0-9]{3}$/)) {
      setError('Please enter a valid 4-character PDB ID (e.g., 1ABC)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate PDB API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful fetch
      setSuccess(true);
      setTimeout(() => {
        onProteinLoaded(pdbId.toUpperCase());
      }, 1000);
      
    } catch (err) {
      setError('PDB ID not found. Please check the ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const exampleIds = ['8R9U', '8R99', '1BNA', '2GBP', '1HTM'];

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={pdbId}
            onChange={(e) => setPdbId(e.target.value.toUpperCase())}
            placeholder="Enter PDB ID (e.g., 8R9U)"
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all"
            maxLength={4}
            disabled={loading}
          />
          
          {success && (
            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
          )}
          
          {error && (
            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-400" />
          )}
        </div>

        {error && (
          <motion.p 
            className="text-red-400 text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.p>
        )}

        <motion.button
          type="submit"
          disabled={loading || !pdbId || success}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Fetching from PDB...</span>
            </>
          ) : success ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Loading Viewer...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Import from PDB Bank</span>
            </>
          )}
        </motion.button>
      </form>

      <div className="border-t border-slate-600 pt-4">
        <p className="text-sm text-slate-400 mb-2">Try these examples:</p>
        <div className="flex flex-wrap gap-2">
          {exampleIds.map((id) => (
            <button
              key={id}
              onClick={() => setPdbId(id)}
              className="px-3 py-1 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-md text-sm transition-colors"
              disabled={loading}
            >
              {id}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PDBSearch;