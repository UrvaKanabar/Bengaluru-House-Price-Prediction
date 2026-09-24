import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { BarChart3, TrendingUp, Building2, Layers, Award } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/analytics')
      .then(res => {
        setAnalytics(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Analytics fetch error:', err);
        setLoading(false);
      });
  }, []);

  // Custom High-Contrast Tooltip 1: Location Price
  const LocTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl space-y-1 z-50">
          <p className="text-xs font-bold text-white">{data.location}</p>
          <p className="text-xs font-semibold text-emerald-400">
            Average Valuation: ₹{data.avg_price_lakhs} Lakhs
          </p>
          <p className="text-[11px] text-slate-300">
            Average Sqft Rate: ₹{data.avg_price_per_sqft?.toLocaleString()} / sqft
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom High-Contrast Tooltip 2: BHK Price
  const BHKTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl space-y-1 z-50">
          <p className="text-xs font-bold text-white">{data.bhk}</p>
          <p className="text-xs font-semibold text-cyan-400">
            Average Price: ₹{data.avg_price} Lakhs
          </p>
          <p className="text-[11px] text-slate-300">
            Listings Count: {data.count} properties
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom High-Contrast Tooltip 3: Area Type
  const AreaTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl space-y-1 z-50">
          <p className="text-xs font-bold text-white">{data.area_type}</p>
          <p className="text-xs font-semibold text-amber-400">
            Average Price: ₹{data.avg_price} Lakhs
          </p>
          <p className="text-[11px] text-slate-300">
            Listings Volume: {data.count} properties
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-400">Loading Bengaluru market insights & aggregate data...</p>
      </div>
    );
  }

  const locAverages = analytics?.location_averages || [];
  const bhkData = analytics?.bhk_distribution || [];
  const areaData = analytics?.area_type_distribution || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-emerald-500/20">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
          <BarChart3 className="w-7 h-7 text-emerald-400" />
          <span>Bengaluru Housing Market Visual Insights</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl">
          Visual market benchmarks comparing average valuations, price per square foot across top micro-markets, bedroom configurations, and property area types.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CHART 1: Top Localities Average Price */}
        <div className="glass-card rounded-3xl p-6 space-y-4 border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Top Localities Avg Price (₹ Lakhs)</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-400">Neighborhood Mean</span>
          </div>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locAverages} margin={{ top: 10, right: 10, left: -10, bottom: 60 }}>
                <XAxis
                  dataKey="location"
                  stroke="#94a3b8"
                  fontSize={10}
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip content={<LocTooltip />} />
                <Bar dataKey="avg_price_lakhs" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Average Price by BHK Configuration */}
        <div className="glass-card rounded-3xl p-6 space-y-4 border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>Average Property Price by BHK Size</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-400">1 BHK to 6 BHK</span>
          </div>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bhkData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <XAxis dataKey="bhk" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip content={<BHKTooltip />} />
                <Bar dataKey="avg_price" fill="#06b6d4" radius={[6, 6, 0, 0]}>
                  {bhkData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#38bdf8', '#0284c7', '#0369a1', '#075985', '#0c4a6e'][index % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: Rate Per Sq.Ft Locality Leaderboard */}
        <div className="glass-card rounded-3xl p-6 space-y-4 border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Award className="w-4 h-4 text-purple-400" />
              <span>Locality Rate per Sq.Ft (₹ / sqft)</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-400">Price Density</span>
          </div>
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locAverages.slice(0, 8)} layout="vertical" margin={{ left: 30, right: 20, top: 10, bottom: 10 }}>
                <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                <YAxis type="category" dataKey="location" stroke="#94a3b8" fontSize={10} width={120} />
                <Tooltip content={<LocTooltip />} />
                <Bar dataKey="avg_price_per_sqft" fill="#a855f7" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Area Category Type Breakdown */}
        <div className="glass-card rounded-3xl p-6 space-y-4 border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Area Category Pricing Impact</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-400">Super Built-up vs Plot vs Carpet</span>
          </div>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <XAxis dataKey="area_type" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip content={<AreaTooltip />} />
                <Bar dataKey="avg_price" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
