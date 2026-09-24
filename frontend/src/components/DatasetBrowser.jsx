import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Filter, Building2, MapPin, Database } from 'lucide-react';

export default function DatasetBrowser() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [bhkFilter, setBhkFilter] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/dataset', {
        params: {
          page,
          limit: 12,
          search,
          bhk: bhkFilter,
          sort_by: sortBy,
          sort_order: sortOrder
        }
      });
      if (res.data) {
        setData(res.data.data || []);
        setTotalPages(res.data.total_pages || 1);
        setTotalRecords(res.data.total || 0);
      }
    } catch (err) {
      console.error('Dataset fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, bhkFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Database className="w-6 h-6 text-emerald-400" />
            <span>Bengaluru Dataset Records</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, search, and sort through {totalRecords.toLocaleString()} housing records from <code className="text-emerald-400 font-mono">Bengaluru_House_Data.csv</code>
          </p>
        </div>

        {/* Search & BHK Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search location or society..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 w-64"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </form>

          {/* BHK Pill Selector */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => { setBhkFilter(''); setPage(1); }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                bhkFilter === '' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            {[1, 2, 3, 4].map(b => (
              <button
                key={b}
                onClick={() => { setBhkFilter(String(b)); setPage(1); }}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  bhkFilter === String(b) ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {b} BHK
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dataset Table Container */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Location</th>
                <th className="py-3.5 px-4 font-semibold">Area Type</th>
                <th className="py-3.5 px-4 font-semibold">Size</th>
                <th className="py-3.5 px-4 font-semibold cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => toggleSort('total_sqft_clean')}>
                  <div className="flex items-center space-x-1">
                    <span>Total Sqft</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 font-semibold cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => toggleSort('bath')}>
                  <div className="flex items-center space-x-1">
                    <span>Bath</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 font-semibold">Balcony</th>
                <th className="py-3.5 px-4 font-semibold">Society</th>
                <th className="py-3.5 px-4 font-semibold cursor-pointer hover:text-emerald-400 transition-colors text-right" onClick={() => toggleSort('price')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Price (Lakhs)</span>
                    <ArrowUpDown className="w-3 h-3 text-emerald-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 font-semibold text-right">Rate / Sqft</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading page records...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-white font-semibold flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="truncate max-w-[160px]">{row.location}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {row.area_type.replace('  ', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-emerald-300 font-mono font-bold">{row.size}</td>
                    <td className="py-3 px-4 text-slate-200 font-mono">{row.total_sqft}</td>
                    <td className="py-3 px-4 text-slate-300">{row.bath ?? '-'}</td>
                    <td className="py-3 px-4 text-slate-400">{row.balcony ?? '-'}</td>
                    <td className="py-3 px-4 text-slate-400 max-w-[120px] truncate">{row.society}</td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-400 text-sm">
                      ₹{row.price} L
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400 text-xs">
                      {row.price_per_sqft ? `₹${row.price_per_sqft.toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Showing Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong> ({totalRecords.toLocaleString()} total entries)
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-mono text-emerald-400 bg-emerald-500/10 rounded border border-emerald-500/20">
              {page}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
