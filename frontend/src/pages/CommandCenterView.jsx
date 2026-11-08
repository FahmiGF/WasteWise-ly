import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { 
  IconShield, IconTrendingUp, IconAlertTriangle, IconRefresh, 
  IconTruck, IconSparkles, IconCheck, IconRecycle, IconBuilding,
  IconMapPin, IconCamera
} from '../components/Icons';

export default function CommandCenterView() {
  const [analytics, setAnalytics] = useState({
    total_smart_bins: 248,
    critical_bins_count: 3,
    average_fill_percentage: 64.2,
    total_active_weight_kg: 12840.0,
    total_monthly_collected_ton: 148.6,
    city_recycling_rate_pct: 68.4,
    co2e_avoided_ton: 222.9,
    landfill_diverted_pct: 74.2,
    active_trucks: 8,
    active_marketplace_orders: 12
  });

  const [forecast, setForecast] = useState([]);
  const [bins, setBins] = useState([]);
  const [selectedBin, setSelectedBin] = useState(null);
  const [dumpingReports, setDumpingReports] = useState([]);

  // Map overlays
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [autoTickEnabled, setAutoTickEnabled] = useState(false);

  // Simulator controls
  const [simFill, setSimFill] = useState(94.0);
  const [simWeight, setSimWeight] = useState(48.5);
  const [simMessage, setSimMessage] = useState('');

  const autoTickTimerRef = useRef(null);

  useEffect(() => {
    loadData();
    return () => {
      if (autoTickTimerRef.current) clearInterval(autoTickTimerRef.current);
    };
  }, []);

  const loadData = async () => {
    try {
      const [anRes, fcRes, binsRes, dpRes] = await Promise.all([
        api.getAnalyticsOverview().catch(() => null),
        api.getForecast().catch(() => []),
        api.getBins().catch(() => []),
        api.getDumpingReports().catch(() => [])
      ]);
      if (anRes) setAnalytics(anRes);
      if (fcRes && fcRes.length) setForecast(fcRes);
      if (binsRes && binsRes.length) {
        setBins(binsRes);
        if (!selectedBin) setSelectedBin(binsRes[0]);
      }
      if (dpRes && dpRes.length) {
        setDumpingReports(dpRes);
      }
    } catch (e) {
      console.warn("Failed to load command center data:", e);
    }
  };

  // Toggle Auto-Tick IoT Stream
  const toggleAutoTick = () => {
    if (autoTickEnabled) {
      clearInterval(autoTickTimerRef.current);
      setAutoTickEnabled(false);
    } else {
      setAutoTickEnabled(true);
      autoTickTimerRef.current = setInterval(async () => {
        try {
          const res = await api.streamIoTTick();
          if (res && res.updated_bins) {
            setBins(res.updated_bins);
          }
        } catch {
          // Fallback local jitter if backend is offline
          setBins(prev => prev.map(b => {
            const delta = (Math.random() - 0.45) * 2.5;
            const newFill = Math.min(100, Math.max(10, Math.round(b.fill_percentage + delta)));
            return { ...b, fill_percentage: newFill };
          }));
        }
      }, 2500);
    }
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    if (!selectedBin) return;
    try {
      const res = await api.simulateBin(selectedBin.id, parseFloat(simFill), parseFloat(simWeight));
      setSimMessage(`Telemetri bin ${selectedBin.code} berhasil diperbarui! Status: ${res.bin.status}`);
      loadData();
      setTimeout(() => setSimMessage(''), 3500);
    } catch (err) {
      alert("Gagal mengirim simulasi: " + err.message);
    }
  };

  const handleUpdateDumpingStatus = async (reportId, newStatus) => {
    try {
      await api.updateDumpingStatus(reportId, newStatus);
      setDumpingReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
    } catch {
      // Optimistic local update
      setDumpingReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-forest-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-forest-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-800 border border-forest-700 text-xs font-mono text-forest-200 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>COMMAND CENTER · DINAS LINGKUNGAN HIDUP (DLH) KOTA SURABAYA</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Pusat Komando & Analitik Sirkular Cerdas 🌐</h1>
          <p className="text-xs text-forest-300">
            Monitoring Spasial Real-Time · 248 Smart Bins · AI CVRP Fleets · Environmental Index
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Auto-Tick Toggle */}
          <button
            onClick={toggleAutoTick}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition border ${
              autoTickEnabled 
                ? 'bg-emerald-500 text-carbon-950 border-emerald-400 shadow-md animate-pulse' 
                : 'bg-forest-800 hover:bg-forest-700 text-forest-200 border-forest-700'
            }`}
          >
            <span>⚡ {autoTickEnabled ? 'Streaming IoT Aktif (2.5s)' : 'Mulai Streaming IoT'}</span>
          </button>

          <button
            onClick={loadData}
            className="px-3.5 py-2 bg-forest-800 hover:bg-forest-700 text-forest-200 hover:text-white rounded-xl text-xs font-medium border border-forest-700 flex items-center gap-1.5 transition"
          >
            <IconRefresh className="w-3.5 h-3.5" />
            <span>Sinkronisasi</span>
          </button>
        </div>
      </div>

      {/* Top 4 Critical City KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-carbon-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-carbon-400 uppercase tracking-wider block">Waste Collected</span>
          <div className="text-2xl font-black text-carbon-900 font-mono tracking-tight">
            12,840 <span className="text-xs font-normal text-carbon-500">kg</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <IconTrendingUp className="w-3.5 h-3.5" />
            <span>+12.4% vs minggu lalu</span>
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-carbon-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-carbon-400 uppercase tracking-wider block">Recycling Rate Kota</span>
          <div className="text-2xl font-black text-forest-700 font-mono tracking-tight">
            {analytics.city_recycling_rate_pct}%
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <IconTrendingUp className="w-3.5 h-3.5" />
            <span>Target Kota 70% (Hampir tercapai)</span>
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-carbon-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-carbon-400 uppercase tracking-wider block">Online Smart Bins</span>
          <div className="text-2xl font-black text-carbon-900 font-mono tracking-tight flex items-center gap-2">
            248
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              99.2% Online
            </span>
          </div>
          <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1">
            <IconAlertTriangle className="w-3.5 h-3.5" />
            <span>{analytics.critical_bins_count} Bin Butuh Penjemputan</span>
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-carbon-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-carbon-400 uppercase tracking-wider block">CO2e Dihindari</span>
          <div className="text-2xl font-black text-carbon-900 font-mono tracking-tight">
            {analytics.co2e_avoided_ton} <span className="text-xs font-normal text-carbon-500">Ton</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <IconShield className="w-3.5 h-3.5" />
            <span>Diversi TPA: {analytics.landfill_diverted_pct}%</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive Map & Smart Bin Clusters */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-carbon-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-carbon-100">
            <div>
              <h3 className="font-bold text-sm text-carbon-900 flex items-center gap-2">
                <span>Peta Geospasial Smart Bins Kota Surabaya</span>
                <span className="text-[10px] bg-forest-100 text-forest-800 px-2 py-0.5 rounded-full font-mono">
                  PostGIS Live
                </span>
              </h3>
              <p className="text-[11px] text-carbon-500">Klik titik smart bin untuk memeriksa telemetri sensor ultrasonik dan timbangan.</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Heatmap overlay button */}
              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition border ${
                  showHeatmap 
                    ? 'bg-amber-100 text-amber-900 border-amber-300' 
                    : 'bg-carbon-100 text-carbon-700 border-carbon-200 hover:bg-carbon-200'
                }`}
              >
                🔥 {showHeatmap ? 'Sembunyikan Heatmap' : 'Overlay Heatmap Densitas'}
              </button>

              {/* Map Legend */}
              <div className="hidden sm:flex items-center gap-2 text-[10px] font-medium text-carbon-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Normal</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> High</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span> Critical</span>
              </div>
            </div>
          </div>

          {/* Graphical Map Representation */}
          <div className="relative aspect-video bg-carbon-950 rounded-2xl overflow-hidden border border-carbon-800 flex items-center justify-center p-4">
            {/* Grid Pattern overlay */}
            <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#35A875_1px,transparent_1px),linear-gradient(to_bottom,#35A875_1px,transparent_1px)] bg-[size:30px_30px]"></div>

            {/* Heatmap Density Simulation Layer */}
            {showHeatmap && (
              <div className="absolute inset-0 pointer-events-none opacity-50 bg-[radial-gradient(circle_at_30%_35%,rgba(239,68,68,0.7)_0%,transparent_35%),radial-gradient(circle_at_65%_45%,rgba(245,158,11,0.6)_0%,transparent_40%),radial-gradient(circle_at_50%_75%,rgba(16,185,129,0.5)_0%,transparent_45%)] transition-all duration-700"></div>
            )}

            {/* City District Boundaries Label */}
            <div className="absolute top-3 left-3 text-[11px] font-mono text-forest-300 bg-carbon-900/80 px-2.5 py-1 rounded border border-carbon-700">
              SEKTOR: SURABAYA PUSAT & SELATAN · WGS84
            </div>

            {/* Interactive Bin Pins */}
            <div className="relative w-full h-full">
              {bins.map((b, idx) => {
                const posX = 18 + ((idx * 27) % 68);
                const posY = 22 + ((idx * 33) % 58);
                const isSelected = selectedBin?.id === b.id;

                return (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBin(b);
                      setSimFill(b.fill_percentage);
                      setSimWeight(b.weight_kg);
                    }}
                    style={{ left: `${posX}%`, top: `${posY}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-2xl transition transform hover:scale-125 focus:outline-none ${
                      isSelected ? 'ring-4 ring-emerald-400 scale-120 z-20' : 'z-10'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold font-mono shadow-lg ${
                      b.fill_percentage >= 80 ? 'bg-red-600 animate-pulse' :
                      b.fill_percentage >= 60 ? 'bg-amber-500' :
                      'bg-forest-600'
                    }`}>
                      {b.fill_percentage}%
                    </div>
                    <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-carbon-900/90 text-white text-[9px] px-1.5 py-0.2 rounded font-mono">
                      {b.code}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom map overlay */}
            <div className="absolute bottom-3 right-3 text-[10px] text-carbon-400 font-mono">
              WGS84 Lat -7.2575 · Lng 112.7521 · PostGIS v3.4
            </div>
          </div>

          {/* Selected Bin Details */}
          {selectedBin && (
            <div className="p-4 bg-forest-50 rounded-2xl border border-forest-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-forest-700 uppercase font-mono">{selectedBin.code} · {selectedBin.category}</span>
                <h4 className="font-bold text-sm text-carbon-900 mt-0.5">{selectedBin.name}</h4>
                <p className="text-carbon-500 text-[11px]">{selectedBin.facility_name}</p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-carbon-400 block">Ketinggian</span>
                  <span className={`font-bold ${selectedBin.fill_percentage >= 80 ? 'text-red-600 font-black' : 'text-carbon-900'}`}>
                    {selectedBin.fill_percentage}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-carbon-400 block">Berat Sensor</span>
                  <span className="font-bold text-carbon-900">{selectedBin.weight_kg} Kg</span>
                </div>
                <div>
                  <span className="text-[10px] text-carbon-400 block">Baterai IoT</span>
                  <span className="font-bold text-emerald-700">{selectedBin.battery_percentage}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Real-Time IoT Telemetry Simulator Console */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-carbon-200 shadow-sm space-y-4">
          <div className="pb-3 border-b border-carbon-100">
            <span className="text-[10px] font-bold text-forest-700 uppercase tracking-wider font-mono">IoT TEST BENCH</span>
            <h3 className="font-bold text-sm text-carbon-900 mt-0.5">ESP32 Telemetry Simulator</h3>
            <p className="text-[11px] text-carbon-500">Uji respon sistem terhadap perubahan sensor ultrasonik & load cell.</p>
          </div>

          {simMessage && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 animate-in fade-in">
              {simMessage}
            </div>
          )}

          {selectedBin && (
            <form onSubmit={handleSimulate} className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-carbon-700">Ultrasonic Fill Level:</span>
                  <span className="font-mono font-bold text-forest-700">{simFill}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={simFill}
                  onChange={(e) => setSimFill(e.target.value)}
                  className="w-full accent-forest-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-carbon-400 font-mono mt-1">
                  <span>0% (Kosong)</span>
                  <span className="text-amber-600">60%</span>
                  <span className="text-red-600">80% Kritis</span>
                  <span className="text-red-700 font-bold">100% Overflow</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-carbon-700">HX711 Load Cell (Kg):</span>
                  <span className="font-mono font-bold text-forest-700">{simWeight} Kg</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={simWeight}
                  onChange={(e) => setSimWeight(e.target.value)}
                  className="w-full accent-forest-600 cursor-pointer"
                />
              </div>

              <div className="p-3 bg-carbon-50 rounded-xl text-[11px] text-carbon-600 space-y-1">
                <p>Bin Target: <b className="text-carbon-900">{selectedBin.code}</b></p>
                <p>Status Diprediksi: <b className={simFill >= 80 ? 'text-red-600' : 'text-emerald-700'}>
                  {simFill >= 95 ? 'OVERFLOW' : simFill >= 80 ? 'CRITICAL (Pemicu CVRP)' : simFill >= 60 ? 'HIGH' : 'NORMAL'}
                </b></p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-forest-700 hover:bg-forest-800 active:scale-95 text-white font-semibold rounded-xl text-xs transition shadow-sm"
              >
                Kirim Telemetri Sensor ESP32
              </button>
            </form>
          )}

          {/* AI 7-Day Waste Volume Forecast */}
          <div className="pt-4 border-t border-carbon-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-carbon-400 uppercase tracking-wider">AI Forecast 7 Hari</span>
              <span className="text-[10px] font-mono text-forest-700 font-semibold">XGBoost v2</span>
            </div>
            
            <div className="space-y-1.5">
              {forecast.slice(0, 4).map((f, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-forest-50/60">
                  <span className="font-medium text-carbon-800">{f.date}</span>
                  <span className="font-mono font-bold text-forest-900">{f.predicted_ton} Ton</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                    f.overflow_risk === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {f.overflow_risk}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Civic Illegal Dumping Case Management Table */}
      <div className="bg-white rounded-3xl p-6 border border-carbon-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-carbon-100">
          <div>
            <span className="text-[10px] font-bold text-forest-700 uppercase tracking-wider font-mono">PENGAWASAN TPA LIAR & CIVIC REPORTING</span>
            <h3 className="font-bold text-sm text-carbon-900 mt-0.5">Penanganan Laporan Tumpukan Sampah Liar (Illegal Dumping)</h3>
            <p className="text-[11px] text-carbon-500">Laporan foto dan koordinat GPS dari masyarakat Surabaya untuk ditindaklanjuti tim satgas DLH.</p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl">
            {dumpingReports.filter(r => r.status !== 'CLEANED_UP').length} Kasus Belum Selesai
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dumpingReports.map((report) => (
            <div key={report.id} className="p-4 rounded-2xl border border-carbon-200 hover:border-forest-300 transition space-y-3 bg-white">
              <div className="relative aspect-video rounded-xl bg-carbon-100 overflow-hidden border border-carbon-200">
                <img src={report.photo_url} alt="Laporan" className="w-full h-full object-cover" />
                <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  report.status === 'CLEANED_UP' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                  report.status === 'INVESTIGATING' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                  'bg-red-100 text-red-800 border border-red-300 animate-pulse'
                }`}>
                  {report.status}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-xs text-carbon-900">{report.location_name}</h4>
                <p className="text-[11px] text-carbon-600 line-clamp-2 mt-0.5">{report.description}</p>
                <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-carbon-400">
                  <span>Pelapor: {report.reporter_name}</span>
                  <span>Est. Volume: {report.estimated_volume_m3} m³</span>
                </div>
              </div>

              <div className="pt-2 border-t border-carbon-100 flex items-center justify-between gap-2">
                {report.status === 'REPORTED' && (
                  <button
                    onClick={() => handleUpdateDumpingStatus(report.id, 'INVESTIGATING')}
                    className="w-full py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-semibold border border-blue-200 transition"
                  >
                    Tugaskan Satgas Inspeksi
                  </button>
                )}
                {report.status === 'INVESTIGATING' && (
                  <button
                    onClick={() => handleUpdateDumpingStatus(report.id, 'CLEANED_UP')}
                    className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 transition"
                  >
                    Tandai Bersih (Cleaned Up)
                  </button>
                )}
                {report.status === 'CLEANED_UP' && (
                  <span className="w-full text-center py-1.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200">
                    ✓ Selesai Dibersihkan
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
