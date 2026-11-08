import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { 
  IconTruck, IconMapPin, IconCheck, IconCamera, IconQrCode, 
  IconRefresh, IconAlertTriangle, IconSparkles, IconTrendingUp,
  IconShield
} from '../components/Icons';

export default function CollectorView() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Proof of Collection State
  const [proofPhoto, setProofPhoto] = useState('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600');
  const [weightKg, setWeightKg] = useState('145.0');
  const [submitting, setSubmitting] = useState(false);

  // Live Driver Simulation States
  const [simRunning, setSimRunning] = useState(false);
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);
  const [simSpeed, setSimSpeed] = useState(0);
  const [simTruckLoad, setSimTruckLoad] = useState(1420);
  const [simDistanceKm, setSimDistanceKm] = useState(14.2);
  const [simLogs, setSimLogs] = useState([
    { time: '13:45', msg: 'Armada A-01 keluar dari Depo Wonokromo menuju Rute Utara.' }
  ]);
  const simTimerRef = useRef(null);

  // Sample verified photos for quick selection
  const samplePhotos = [
    { name: 'Kompaktor Surabaya', url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600' },
    { name: 'Tumpukan Bale Plastik', url: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=600' },
    { name: 'Kontainer Logistik TPST', url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600' }
  ];

  useEffect(() => {
    loadTasks();
    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, []);

  const loadTasks = async () => {
    try {
      const data = await api.getTasks();
      if (data && data.length) {
        setTasks(data);
        if (!selectedTask) setSelectedTask(data[0]);
      }
    } catch (e) {
      console.warn("Failed to load tasks:", e);
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    setSubmitting(true);
    try {
      await api.completeTask(selectedTask.id, proofPhoto, parseFloat(weightKg));
      setModalOpen(false);
      loadTasks();
      alert(`Tugas ${selectedTask.task_code} berhasil diselesaikan dengan bobot aktual ${weightKg} Kg!`);
    } catch (err) {
      alert("Gagal menyelesaikan tugas: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Start / Pause Truck Simulation
  const toggleSimulation = () => {
    if (simRunning) {
      clearInterval(simTimerRef.current);
      setSimRunning(false);
      setSimSpeed(0);
      setSimLogs(prev => [{ time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), msg: 'Simulasi armada dijeda oleh pengemudi.' }, ...prev.slice(0, 9)]);
    } else {
      setSimRunning(true);
      setSimSpeed(38);
      setSimLogs(prev => [{ time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), msg: 'Simulasi perjalanan CVRP aktif. Menuju titik singgah berikutnya.' }, ...prev.slice(0, 9)]);
      
      simTimerRef.current = setInterval(() => {
        setSimDistanceKm(prev => Math.max(0.2, (prev - 0.3)));
        setSimSpeed(Math.floor(32 + Math.random() * 16));
        
        setCurrentWaypointIndex(prevIdx => {
          const totalWp = selectedTask?.waypoints?.length || 4;
          const next = (prevIdx + 1) % totalWp;
          const targetWp = selectedTask?.waypoints?.[next]?.name || `Titik Singgah #${next + 1}`;
          const addedKg = Math.floor(40 + Math.random() * 30);
          
          setSimTruckLoad(load => Math.min(3500, load + addedKg));
          setSimLogs(logs => [
            { 
              time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
              msg: `Tiba di ${targetWp} · Mengangkat bin · Muatan bertambah +${addedKg} kg.` 
            },
            ...logs.slice(0, 9)
          ]);
          return next;
        });
      }, 3500);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProofPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const currentWp = selectedTask?.waypoints?.[currentWaypointIndex] || { name: 'Smart Bin SB-001 (Taman Bungkul)', target_weight_kg: 180 };
  const loadPercentage = Math.min(100, Math.round((simTruckLoad / 3500) * 100));

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-forest-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-forest-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-800 border border-forest-700 text-xs font-mono text-forest-200 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>DRIVER CVRP LOGISTICS CONSOLE · ACTIVE SHIFT</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Armada Pengangkutan Sampah Pintar 🚛</h1>
          <p className="text-xs text-forest-300">
            Pengemudi: <span className="font-semibold text-white">Rudi Hartono</span> · No. Polisi: <span className="font-mono text-white">L 9821 AB</span> · Kompaktor Hidrolik A-01 (Kapasitas Max: 3.5 Ton)
          </p>
        </div>

        <div className="flex items-center gap-3 bg-forest-950 p-3 rounded-2xl border border-forest-800">
          <div>
            <span className="text-[10px] text-forest-400 uppercase tracking-wider block">Kapasitas Muatan Truk</span>
            <span className="text-sm font-bold text-white font-mono">{simTruckLoad.toLocaleString()} kg / 3,500 kg ({loadPercentage}%)</span>
            <div className="w-40 bg-forest-800 h-2 rounded-full mt-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  loadPercentage > 85 ? 'bg-red-500' : loadPercentage > 60 ? 'bg-amber-400' : 'bg-emerald-400'
                }`} 
                style={{ width: `${loadPercentage}%` }}
              ></div>
            </div>
          </div>
          <button 
            onClick={loadTasks}
            className="p-2 rounded-xl bg-forest-800 hover:bg-forest-700 text-forest-200 transition"
            title="Refresh Rute"
          >
            <IconRefresh className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Driver In-Cab HUD & Simulation Panel */}
      <div className="bg-carbon-900 text-white rounded-3xl p-6 border border-carbon-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-carbon-800">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${simRunning ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-carbon-800 text-carbon-400'}`}>
              <IconTruck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-400">TELEMETRY HUD LIVE</span>
                {simRunning && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700 text-[10px] font-mono animate-pulse">
                    EN ROUTE
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">Simulasi Pelacakan Armada & Optimasi CVRP</h3>
            </div>
          </div>

          <button
            onClick={toggleSimulation}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition shadow-lg flex items-center justify-center gap-2 ${
              simRunning 
                ? 'bg-amber-500 hover:bg-amber-600 text-carbon-950 font-black' 
                : 'bg-emerald-500 hover:bg-emerald-600 text-carbon-950 font-black'
            }`}
          >
            <span>{simRunning ? '⏸ Jeda Simulasi Perjalanan' : '🚀 Jalankan Simulasi Perjalanan Truk'}</span>
          </button>
        </div>

        {/* Dashboard Gauges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-carbon-950/80 p-3.5 rounded-2xl border border-carbon-800">
            <span className="text-[10px] text-carbon-400 block uppercase font-mono">Kecepatan GPS</span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
              {simSpeed} <span className="text-xs font-normal text-carbon-400">km/h</span>
            </div>
            <span className="text-[10px] text-carbon-400 mt-0.5 block">Batas jalan kota: 40 km/h</span>
          </div>

          <div className="bg-carbon-950/80 p-3.5 rounded-2xl border border-carbon-800">
            <span className="text-[10px] text-carbon-400 block uppercase font-mono">Titik Target Singgah</span>
            <div className="text-sm font-bold text-white mt-1 truncate">
              {currentWp.name}
            </div>
            <span className="text-[10px] text-emerald-400 mt-0.5 block font-mono">Stop #{currentWaypointIndex + 1} dari {selectedTask?.waypoints?.length || 4}</span>
          </div>

          <div className="bg-carbon-950/80 p-3.5 rounded-2xl border border-carbon-800">
            <span className="text-[10px] text-carbon-400 block uppercase font-mono">Jarak ke Tujuan</span>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {simDistanceKm.toFixed(1)} <span className="text-xs font-normal text-carbon-400">km</span>
            </div>
            <span className="text-[10px] text-carbon-400 mt-0.5 block">ETA: ~{Math.round(simDistanceKm * 2.2)} menit</span>
          </div>

          <div className="bg-carbon-950/80 p-3.5 rounded-2xl border border-carbon-800">
            <span className="text-[10px] text-carbon-400 block uppercase font-mono">Bahan Bakar & Sensor</span>
            <div className="text-2xl font-black font-mono text-cyan-400 mt-1">
              84% <span className="text-xs font-normal text-carbon-400">Solar</span>
            </div>
            <span className="text-[10px] text-carbon-400 mt-0.5 block">Kompaktor Hidrolik: OK</span>
          </div>

          <div className="bg-carbon-950/80 p-3.5 rounded-2xl border border-carbon-800 col-span-2 md:col-span-1">
            <span className="text-[10px] text-carbon-400 block uppercase font-mono">Emisi CO2 Ditekan</span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
              -18.4 <span className="text-xs font-normal text-carbon-400">kg</span>
            </div>
            <span className="text-[10px] text-carbon-400 mt-0.5 block">Efisiensi rute AI +24%</span>
          </div>
        </div>

        {/* Real-Time Telemetry Simulation Event Stream */}
        <div className="bg-carbon-950 p-3 rounded-2xl border border-carbon-800 font-mono text-xs space-y-1.5 max-h-32 overflow-y-auto">
          <div className="flex items-center justify-between text-[10px] text-carbon-400 border-b border-carbon-800/80 pb-1">
            <span>LIVE DISPATCH & RFID BIN EVENTS</span>
            <span className="text-emerald-400 font-semibold">STREAM ACTIVE</span>
          </div>
          {simLogs.map((log, i) => (
            <div key={i} className="flex items-start gap-2 text-carbon-300 text-[11px]">
              <span className="text-forest-400 shrink-0">[{log.time}]</span>
              <span>{log.msg}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Task List / Manifest */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-carbon-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-carbon-900">Daftar Rute Hari Ini (CVRP Optimized)</h3>
              <span className="text-[10px] font-mono text-forest-700 bg-forest-50 px-2 py-0.5 rounded font-bold">
                {tasks.length} Tugas Terjadwal
              </span>
            </div>
            
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    selectedTask?.id === task.id
                      ? 'border-forest-600 bg-forest-50/60 shadow-xs'
                      : 'border-carbon-200 hover:border-forest-400 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-forest-700">{task.task_code}</span>
                      <h4 className="font-bold text-sm text-carbon-900 mt-0.5">{task.truck_name}</h4>
                      <p className="text-xs text-carbon-500 mt-1">
                        {task.waypoints?.length || 0} Titik Penjemputan · Estimasi: {task.capacity_kg} kg
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                      task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                      task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-carbon-100 flex items-center justify-between text-xs text-carbon-600">
                    <span>Target: TPST Benowo</span>
                    <span className="font-mono text-[11px] text-forest-700 font-semibold">Tiba ~14:30</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Task Details & Step-by-Step Waypoint Execution */}
        <div className="lg:col-span-7 space-y-4">
          {selectedTask && (
            <div className="bg-white rounded-3xl p-6 border border-carbon-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-carbon-100">
                <div>
                  <span className="text-[10px] font-bold text-forest-700 uppercase tracking-wider font-mono">Manifest Rute Aktif</span>
                  <h3 className="text-lg font-bold text-carbon-900 mt-0.5">{selectedTask.task_code} — {selectedTask.truck_name}</h3>
                </div>
                {selectedTask.status !== 'COMPLETED' && (
                  <button
                    onClick={() => setModalOpen(true)}
                    className="px-4 py-2 bg-forest-700 hover:bg-forest-800 active:scale-95 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <IconCheck className="w-4 h-4" />
                    <span>Selesaikan Tugas Pengangkutan</span>
                  </button>
                )}
              </div>

              {/* Waypoints Sequence Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-carbon-700 uppercase tracking-wider">Urutan Titik Singgah (Stops):</h4>
                <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-forest-200">
                  {selectedTask.waypoints?.map((wp, i) => (
                    <div key={i} className="relative text-xs">
                      <div className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white transition-all ${
                        i === currentWaypointIndex && simRunning ? 'bg-amber-400 ring-4 ring-amber-300 animate-ping' :
                        wp.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-forest-700'
                      }`}></div>
                      <div className={`p-3 rounded-2xl border transition ${
                        i === currentWaypointIndex && simRunning 
                          ? 'bg-amber-50/70 border-amber-300 shadow-sm' 
                          : 'bg-forest-50/70 border-carbon-100'
                      } flex items-center justify-between`}>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-carbon-900">{wp.name}</p>
                            {i === currentWaypointIndex && simRunning && (
                              <span className="text-[9px] font-mono bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                                TRUK SEDANG MENUJU
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-carbon-500 mt-0.5">Est. Muatan: {wp.target_weight_kg} kg · GPS: -7.2891, 112.7321</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          wp.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-carbon-200 text-carbon-800'
                        }`}>
                          {wp.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedTask.proof_photo && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Bukti Pengangkutan & Timbangan Selesai</span>
                  <div className="flex gap-4 items-center">
                    <img src={selectedTask.proof_photo} alt="Bukti" className="w-24 h-24 object-cover rounded-xl border border-emerald-300" />
                    <div className="text-xs space-y-1">
                      <p className="font-semibold text-emerald-950">Status: Terverifikasi di TPST Benowo</p>
                      <p className="text-emerald-800 font-mono">Bobot Tercatat: {selectedTask.actual_collected_kg} Kg</p>
                      <p className="text-carbon-500 text-[10px]">Waktu Selesai: {selectedTask.completed_at}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Modal Selesaikan Pengangkutan (Proof of Collection) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-carbon-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-carbon-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-forest-700 uppercase tracking-wider font-mono">Verifikasi Lapangan</span>
                <h3 className="font-bold text-base text-carbon-900">Digital Proof of Collection</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-carbon-400 hover:text-carbon-800 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleComplete} className="space-y-4">
              {/* Photo Upload & Presets */}
              <div>
                <label className="text-xs font-semibold text-carbon-700 block mb-1">Foto Bukti Pengangkutan (Kamera/Truk)</label>
                <div className="relative aspect-video rounded-xl bg-carbon-100 overflow-hidden border border-carbon-300">
                  <img src={proofPhoto} alt="Proof" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                    GPS Geotag: -7.2654, 112.7482 · Verified RFID
                  </div>
                </div>

                {/* Preset sample photos */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] text-carbon-400">Pilih Preset:</span>
                  {samplePhotos.map((sp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setProofPhoto(sp.url)}
                      className="px-2 py-1 rounded bg-carbon-100 hover:bg-forest-100 text-[10px] text-carbon-700 font-medium transition"
                    >
                      {sp.name}
                    </button>
                  ))}
                </div>

                {/* Local photo upload */}
                <div className="mt-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-forest-50 hover:bg-forest-100 text-forest-800 rounded-xl text-xs font-semibold cursor-pointer border border-forest-200 transition">
                    <IconCamera className="w-3.5 h-3.5" />
                    <span>Unggah Foto dari HP / Komputer</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-carbon-700 block mb-1">Input Berat Bersih Timbangan (Kg)</label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  step="0.1"
                  required
                  className="w-full bg-forest-50 border border-carbon-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-carbon-900"
                />
              </div>

              <div className="p-3 bg-forest-50 rounded-xl border border-forest-200 text-[11px] text-forest-800 flex items-center gap-2">
                <IconQrCode className="w-5 h-5 text-forest-600 shrink-0" />
                <span>QR Code Smart Bin telah dipindai secara otomatis & cocok dengan RFID manifest rute.</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-forest-700 hover:bg-forest-800 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition shadow-sm"
              >
                {submitting ? 'Menyimpan ke Ledger...' : 'Konfirmasi Penyelesaian Tugas'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
