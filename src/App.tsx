import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import EnhancedViewerPage from './pages/EnhancedViewerPage';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/viewer/:proteinId?" element={<EnhancedViewerPage />} />
          <Route path="/viewer/:proteinId/annotation/:annotationId" element={<EnhancedViewerPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;