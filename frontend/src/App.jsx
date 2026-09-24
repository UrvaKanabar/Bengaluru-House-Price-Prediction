import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Predictor from './components/Predictor';
import AnalyticsDashboard from './components/AnalyticsDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [healthStatus, setHealthStatus] = useState(false);
  const [theme, setTheme] = useState('midnight');

  useEffect(() => {
    const checkHealth = () => {
      axios.get('/api/health')
        .then(res => {
          if (res.data && res.data.status === 'healthy') {
            setHealthStatus(true);
          } else {
            setHealthStatus(false);
          }
        })
        .catch(() => setHealthStatus(false));
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const getThemeClass = () => {
    switch (theme) {
      case 'royal':
        return 'theme-royal bg-[#090d16] text-slate-100';
      case 'navy':
        return 'theme-navy bg-[#0b132b] text-slate-100';
      case 'light':
        return 'theme-light bg-slate-50 text-slate-900';
      default:
        return 'theme-midnight bg-slate-950 text-slate-100';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-emerald-500 selection:text-slate-950 transition-colors duration-300 ${getThemeClass()}`}>
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        healthStatus={healthStatus}
        currentTheme={theme}
        setTheme={setTheme}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
        {activeTab === 'predictor' && <Predictor />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/80 bg-slate-950/90 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-bold text-slate-200">Bengaluru Property Valuation Platform</p>
            <p className="text-[11px] text-slate-400">Real estate price estimates and market intelligence across Bengaluru</p>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <button onClick={() => setActiveTab('dashboard')} className="hover:text-emerald-400 transition-colors">Dashboard</button>
            <button onClick={() => setActiveTab('predictor')} className="hover:text-emerald-400 transition-colors">Price Estimator</button>
            <button onClick={() => setActiveTab('analytics')} className="hover:text-emerald-400 transition-colors">Market Insights</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
