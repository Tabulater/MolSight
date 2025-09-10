import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, AlertCircle, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onProteinLoaded: (proteinId: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onProteinLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.match(/\.(pdb|cif)$/i)) {
      setError('Please upload a .pdb or .cif file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Simulate file upload and processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock protein ID
      const proteinId = `protein_${Date.now()}`;
      
      setSuccess(true);
      setTimeout(() => {
        onProteinLoaded(proteinId);
      }, 1000);
      
    } catch (err) {
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <motion.div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging 
            ? 'border-primary-400 bg-primary-400/10' 
            : success
            ? 'border-green-400 bg-green-400/10'
            : error
            ? 'border-red-400 bg-red-400/10'
            : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/20'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          type="file"
          accept=".pdb,.cif"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
          disabled={uploading}
        />
        
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center space-y-4">
            {uploading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Upload className="w-12 h-12 text-primary-400" />
              </motion.div>
            ) : success ? (
              <CheckCircle className="w-12 h-12 text-green-400" />
            ) : error ? (
              <AlertCircle className="w-12 h-12 text-red-400" />
            ) : (
              <File className="w-12 h-12 text-slate-400" />
            )}
            
            <div>
              <p className="text-lg font-medium text-white mb-1">
                {uploading ? 'Processing...' : 
                 success ? 'Upload Complete!' :
                 error ? 'Upload Failed' :
                 'Drop your .pdb file here'}
              </p>
              <p className="text-sm text-slate-400">
                {uploading ? 'Analyzing structure...' :
                 success ? 'Redirecting to viewer...' :
                 error ? error :
                 'or click to browse files'}
              </p>
            </div>
          </div>
        </label>
      </motion.div>

      <div className="text-center">
        <p className="text-xs text-slate-500">
          Supported formats: .pdb, .cif • Max file size: 50MB
        </p>
      </div>
    </div>
  );
};

export default FileUpload;