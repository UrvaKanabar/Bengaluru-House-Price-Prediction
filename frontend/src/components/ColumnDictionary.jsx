import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Database, Layers, CheckCircle, AlertTriangle, Hash, FileText, Filter, Code2, HelpCircle } from 'lucide-react';

export default function ColumnDictionary() {
  const [columnsData, setColumnsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('raw'); // 'raw' or 'model'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios.get('/api/columns')
      .then(res => {
        setColumnsData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Column fetch error:', err);
        setLoading(false);
      });
  }, []);

  const filteredRawCols = columnsData?.raw_columns?.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredModelCols = columnsData?.model_columns?.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/40 border border-slate-800">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold">
            <Table className="w-3.5 h-3.5" />
            <span>Dataset Schema & Column Viewer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Dataset Feature Dictionary & Columns
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Detailed breakdown of all 9 original dataset columns from <code className="text-emerald-400 bg-slate-950 px-2 py-0.5 rounded font-mono">Bengaluru_House_Data.csv</code> and the engineered model features.
          </p>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Toggle sub-tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-start">
          <button
            onClick={() => setActiveSubTab('raw')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'raw'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Original CSV Columns ({columnsData?.raw_columns?.length || 9})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('model')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'model'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Model One-Hot Features ({columnsData?.model_columns?.length || 28})</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search column names..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
          <Filter className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading dataset column metadata...</p>
        </div>
      ) : activeSubTab === 'raw' ? (
        /* Raw Columns View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRawCols.map((col) => {
            const isTarget = col.name === 'price';
            return (
              <div
                key={col.name}
                className={`glass-card glass-card-hover rounded-2xl p-6 space-y-4 relative overflow-hidden flex flex-col justify-between border ${
                  isTarget ? 'border-emerald-500/40 bg-emerald-950/20' : 'border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  {/* Column Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-lg text-white">{col.name}</span>
                        {isTarget && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500 text-slate-950">
                            Target Y
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-emerald-400 font-mono">{col.type}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {col.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800/80">
                  {/* Quick stats grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                      <span className="text-[10px] text-slate-500 block">Null Values</span>
                      <span className={col.null_count > 0 ? 'text-amber-400 font-semibold' : 'text-slate-300'}>
                        {col.null_count.toLocaleString()} {col.null_count > 0 ? `(${(col.null_count / 13320 * 100).toFixed(1)}%)` : '✓ 0'}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                      <span className="text-[10px] text-slate-500 block">Unique Values</span>
                      <span className="text-slate-300 font-semibold">{col.unique_count.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Sample values */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">
                      Sample Values
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {col.samples.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300"
                        >
                          {String(s)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Preprocessing / Encoding info */}
                  <div className="pt-2 text-[11px] text-slate-400 flex items-start space-x-1.5 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40">
                    <Code2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{col.encoding}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Encoded Model Features View */
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>Features in model_columns.pkl ({filteredModelCols.length})</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Used in Linear Regression & Random Forest</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredModelCols.map((col, idx) => (
              <div
                key={col.name}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/30 transition-all flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-mono font-bold text-slate-100 flex items-center space-x-1.5">
                    <span className="text-[10px] text-slate-500">#{idx + 1}</span>
                    <span>{col.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">{col.description}</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    col.category === 'Numerical Model Feature'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-teal-500/10 text-teal-300 border border-teal-500/20'
                  }`}
                >
                  {col.category === 'Numerical Model Feature' ? 'NUMERIC' : 'ONE-HOT'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
