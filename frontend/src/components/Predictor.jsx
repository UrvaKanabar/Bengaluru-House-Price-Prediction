import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, MapPin, Home, Maximize, Bath, Sun, Building2, Calendar, CheckCircle2 } from 'lucide-react';

export default function Predictor() {
  const [sqft, setSqft] = useState(1200);
  const [bhk, setBhk] = useState(2);
  const [bath, setBath] = useState(2);
  const [balcony, setBalcony] = useState(1);
  const [areaType, setAreaType] = useState('Super built-up  Area');
  const [availability, setAvailability] = useState('Ready');
  const [location, setLocation] = useState('Whitefield');

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch available locations
    axios.get('/api/locations')
      .then(res => {
        if (res.data && res.data.locations) {
          setLocations(res.data.locations);
        }
      })
      .catch(err => console.log('Location fetch error:', err));

    // Initial prediction
    handlePredict(1200, 2, 2, 1, 'Super built-up  Area', 'Ready', 'Whitefield');
  }, []);

  const handlePredict = async (
    customSqft = sqft,
    customBhk = bhk,
    customBath = bath,
    customBalcony = balcony,
    customArea = areaType,
    customAvail = availability,
    customLoc = location
  ) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/predict', {
        total_sqft: customSqft,
        bhk: customBhk,
        bath: customBath,
        balcony: customBalcony,
        area_type: customArea,
        availability: customAvail,
        location: customLoc
      });

      if (res.data && res.data.status === 'success') {
        setResult(res.data);
      } else {
        setError(res.data.message || 'Valuation failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const areaTypes = [
    { label: 'Super built-up Area', val: 'Super built-up  Area' },
    { label: 'Built-up Area', val: 'Built-up  Area' },
    { label: 'Plot Area', val: 'Plot  Area' },
    { label: 'Carpet Area', val: 'Carpet  Area' }
  ];

  const presets = [800, 1000, 1200, 1500, 2000, 3000, 4500];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/25 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bengaluru House Price Estimator</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Calculate Property Price Estimate
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Select house specifications (area sqft, room counts, area category, locality) to generate a real-time valuation estimate.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Form Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-800 shadow-xl">
            <div className="pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <span>Property Specifications</span>
              </h2>
            </div>

            {/* Total Area (Sqft) */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-200 flex items-center space-x-1.5">
                  <Maximize className="w-4 h-4 text-emerald-400" />
                  <span>Total Area (Square Feet)</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="300"
                    max="10000"
                    value={sqft}
                    onChange={(e) => setSqft(Number(e.target.value))}
                    className="w-24 bg-slate-950 border border-emerald-500/30 rounded-lg px-2.5 py-1 text-right text-emerald-400 font-mono font-bold text-sm focus:outline-none focus:border-emerald-400"
                  />
                  <span className="text-xs text-slate-400 font-mono">sqft</span>
                </div>
              </div>
              <input
                type="range"
                min="300"
                max="8000"
                step="25"
                value={sqft}
                onChange={(e) => setSqft(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-xs text-slate-400 self-center mr-1">Quick Presets:</span>
                {presets.map((val) => (
                  <button
                    key={val}
                    onClick={() => setSqft(val)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                      sqft === val
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {val} sqft
                  </button>
                ))}
              </div>
            </div>

            {/* BHK & Bathrooms Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* BHK */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200 flex items-center space-x-1.5">
                  <Home className="w-4 h-4 text-emerald-400" />
                  <span>BHK (Bedrooms)</span>
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => setBhk(val)}
                      className={`py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                        bhk === val
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-md'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bathrooms */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200 flex items-center space-x-1.5">
                  <Bath className="w-4 h-4 text-emerald-400" />
                  <span>Bathrooms</span>
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => setBath(val)}
                      className={`py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                        bath === val
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-md'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Balcony & Availability Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Balcony */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200 flex items-center space-x-1.5">
                  <Sun className="w-4 h-4 text-emerald-400" />
                  <span>Balconies</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 1, 2, 3].map((val) => (
                    <button
                      key={val}
                      onClick={() => setBalcony(val)}
                      className={`py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                        balcony === val
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200 flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Property Availability</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Ready to Move', val: 'Ready' },
                    { label: 'Under Construction', val: 'Not Ready' }
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setAvailability(item.val)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        availability === item.val
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Area Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200">Area Category Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {areaTypes.map((item) => (
                  <button
                    key={item.val}
                    onClick={() => setAreaType(item.val)}
                    className={`py-2.5 px-2.5 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                      areaType === item.val
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Select */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200 flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Bengaluru Locality</span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {locations.length > 0 ? (
                  locations.map((loc) => (
                    <option key={loc.name} value={loc.name}>
                      {loc.display_name}
                    </option>
                  ))
                ) : (
                  <option value="Whitefield">Whitefield</option>
                )}
              </select>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => handlePredict()}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 shadow-lg shadow-emerald-500/25 transition-all duration-200 flex items-center justify-center space-x-2 text-base cursor-pointer active:scale-[0.99]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5 fill-slate-950" />
                  <span>Calculate Property Valuation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Prediction Results */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Price Output Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-emerald-500/30 relative overflow-hidden bg-slate-900/90 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                Estimated Valuation
              </span>
              <span className="text-xs font-mono text-slate-400">
                Bengaluru Housing Market
              </span>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
                {error}
              </div>
            )}

            {result?.prediction && (
              <div className="space-y-5 pt-2">
                <div>
                  <div className="text-3xl sm:text-5xl font-black text-white tracking-tight font-mono">
                    {result.prediction.formatted_price}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Approx. ₹{result.prediction.price_rupees.toLocaleString()} INR
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400 font-medium">Estimated Rate</span>
                    <div className="text-sm font-bold text-emerald-400 font-mono">
                      ₹{result.prediction.price_per_sqft.toLocaleString()} / sqft
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400 font-medium">Market Segment</span>
                    <div className="text-sm font-bold text-slate-200">
                      {result.prediction.price_tier}
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-400 space-y-2 border-t border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Property: {sqft} sqft, {bhk} BHK in {location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Spatial Density: {(sqft / (bhk || 1)).toFixed(0)} sqft/BHK</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Valuation Summary Info Card */}
          <div className="glass-card rounded-3xl p-6 space-y-4 border border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Valuation Summary</span>
              <span className="text-xs text-emerald-400 font-semibold">Live Real Estate Data</span>
            </h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200">Location Pricing Factor</div>
                <div className="text-slate-400 text-[11px]">
                  Estimated based on historical transactions in <strong>{location}</strong> for <strong>{areaType.trim()}</strong> properties.
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200">Area Efficiency Ratio</div>
                <div className="text-slate-400 text-[11px]">
                  {sqft} sqft divided across {bhk} BHK provides <strong>{(sqft / (bhk || 1)).toFixed(0)} sqft</strong> per bedroom suite.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
