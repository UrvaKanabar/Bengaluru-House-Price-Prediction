import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TrendingUp, Building2, Maximize, MapPin,
  BarChart3, ArrowRight, Home, Zap, Layers
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

export default function Dashboard({ onNavigate }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/analytics')
      .then(res => {
        setAnalytics(res.data);
      })
      .catch(err => {
        console.error("Error loading analytics:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Custom high-contrast tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl space-y-1 z-50">
          <p className="text-xs font-bold text-white">{label || payload[0]?.payload?.location}</p>
          <p className="text-xs font-semibold text-emerald-400">
            Avg Valuation: ₹{payload[0]?.value} Lakhs
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-12 pb-12">
      {/* HERO / INTRO SECTION */}
      <div className="glass-card rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-emerald-500/20 bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-emerald-950/30 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          {/* Status Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide uppercase shadow-inner">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Bengaluru Real Estate Valuation Platform</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Bengaluru Property <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Valuation & Market Intelligence
            </span>
          </h1>

          {/* Intro Text */}
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl">
            Get instant, highly accurate property price estimates across Bengaluru's top residential localities. Powered by real estate market analytics from over 13,300 property listings.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            {/* Button 1: Predict House -> Takes user to Predictor Page */}
            <button
              onClick={() => onNavigate('predictor')}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-base flex items-center space-x-3 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
            >
              <span>Calculate Property Valuation</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Button 2: Beside Predict House -> Takes user directly to Market Insights Page */}
            <button
              onClick={() => onNavigate('analytics')}
              className="px-6 py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm flex items-center space-x-2 border border-slate-700/80 transition-all cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>View Market Insights Page</span>
            </button>
          </div>
        </div>
      </div>

      {/* KEY HOUSING STATISTICS GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <span>Bengaluru Real Estate Key Statistics</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Market Data Summary</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Stat 1 */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Analyzed Properties</span>
              <Home className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">13,300+</div>
            <p className="text-xs text-slate-400">Residential properties in Bengaluru</p>
          </div>

          {/* Stat 2 */}
          <div className="glass-card rounded-2xl p-5 border border-emerald-500/30 bg-emerald-500/5 space-y-2">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Average House Price</span>
              <Building2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
              ₹1.12 Cr <span className="text-xs font-normal text-slate-300">(₹112L)</span>
            </div>
            <p className="text-xs text-slate-300">Mean market valuation per property</p>
          </div>

          {/* Stat 3 */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Average Rate / Sqft</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              ₹6,300 <span className="text-sm font-normal text-slate-400">/ sqft</span>
            </div>
            <p className="text-xs text-slate-400">Median price per square foot</p>
          </div>

          {/* Stat 4 */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Average Floor Area</span>
              <Maximize className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">1,557 sqft</div>
            <p className="text-xs text-slate-400">Typical property floor size</p>
          </div>
        </div>
      </div>

      {/* DASHBOARD LOCALITY CHART PREVIEW */}
      <div className="glass-card rounded-2xl p-6 space-y-4 border border-slate-800">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Top Bengaluru Localities Avg Price (₹ Lakhs)</span>
          </h2>
          <button
            onClick={() => onNavigate('analytics')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
          >
            <span>View Full Market Insights</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics?.location_averages || []} margin={{ top: 10, right: 10, left: -10, bottom: 60 }}>
              <XAxis
                dataKey="location"
                stroke="#94a3b8"
                fontSize={10}
                interval={0}
                angle={-35}
                textAnchor="end"
              />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avg_price_lakhs" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* COVERED LOCALITIES IN BENGALURU */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-emerald-400" />
          <span>Covered Localities in Bengaluru</span>
        </h3>
        <p className="text-xs text-slate-400">
          Our pricing engine evaluates neighborhood-level trends across all major micro-markets in Bengaluru:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2 text-xs">
          {[
            "Whitefield", "Electronic City", "Sarjapur Road", "Hebbal",
            "Marathahalli", "Bellandur", "Bannerghatta Road", "Hennur Road",
            "KR Puram", "Thanisandra", "Rajaji Nagar", "Yelahanka",
            "Uttarahalli", "Kanakpura Road", "Raja Rajeshwari Nagar"
          ].map(loc => (
            <div key={loc} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300 font-medium text-center hover:border-emerald-500/30 transition-all">
              {loc}
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM HERO CALL TO ACTION */}
      <div className="glass-card rounded-3xl p-8 sm:p-10 border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 text-center space-y-4 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-3 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to Estimate a Property Valuation?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Enter property details like floor area, bedrooms, bathrooms, and locality to get an instant pricing estimate.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('predictor')}
              className="px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm inline-flex items-center space-x-2 shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <span>Calculate Property Price Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
