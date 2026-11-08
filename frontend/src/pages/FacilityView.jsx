import React, { useState, useEffect, useRef } from 'react';
import { 
  IconBuilding, IconRefresh, IconCheck, IconAlertTriangle, 
  IconDollarSign, IconRecycle, IconTrendingUp, IconSparkles,
  IconShield
} from '../components/Icons';

export default function FacilityView() {
  // Weighbridge State
  const [grossWeight, setGrossWeight] = useState('7850');
  const [tareWeight, setTareWeight] = useState('3200');
  const [truckPlate, setTruckPlate] = useState('L 9821 AB');
  const [weighSlip, setWeighSlip] = useState(null);

  // Optical Conveyor Sorting State
  const [conveyorRunning, setConveyorRunning] = useState(true);
  const [opticalItems, setOpticalItems] = useState([
    { id: 1, name: 'Botol PET Aqua 600ml', cat: 'PLASTIC', purity: 99.1, status: 'RECOVERED', color: 'text-emerald-400' },
    { id: 2, name: 'Kardus Box Cokelat', cat: 'PAPER', purity: 97.5, status: 'RECOVERED', color: 'text-amber-300' },
    { id: 3, name: 'Kaleng Minuman Larutan', cat: 'METAL', purity: 98.8, status: 'RECOVERED', color: 'text-cyan-400' },
    { id: 4, name: 'Pipa PVC Beracun (Kontaminan)', cat: 'HAZARDOUS', purity: 99.4, status: 'EJECTED_AIRJET', color: 'text-red-400' },
  ]);
  const [ejectionCount, setEjectionCount] = useState(14);
  const [sortedTonTotal, setSortedTonTotal] = useState(48.2);
  const conveyorTimerRef = useRef(null);

  // Stockpile Inventory State
  const [stockpiles, setStockpiles] = useState([
    { id: 1, name: 'Bale Botol Plastik PET Bening', category: 'PLASTIC', currentTon: 14.8, maxTon: 25.0, grade: 'Grade A', estValue: 66600000 },
    { id: 2, name: 'Bale Kardus & Box Corrugated', category: 'PAPER', currentTon: 22.4, maxTon: 30.0, grade: 'Grade A', estValue: 49280000 },
    { id: 3, name: 'Ingot & Kaleng Aluminium Kempa', category: 'METAL', currentTon: 6.2, maxTon: 10.0, grade: 'Grade A+', estValue: 114700000 },
    { id: 4, name: 'Kompos Organik Curah (TPST)', category: 'ORGANIC', currentTon: 35.0, maxTon: 50.0, grade: 'Standar SNI', estValue: 42000000 }
  ]);

  // Outgoing Shipment State
  const [shipmentModalOpen, setShipmentModalOpen] = useState(false);
  const [selectedStockpile, setSelectedStockpile] = useState(null);
  const [shipmentTon, setShipmentTon] = useState('5.0');
  const [buyerName, setBuyerName] = useState('PT Indah Kiat Pulp & Paper Tbk');
  const [shipmentSuccess, setShipmentSuccess] = useState(false);

  // Preset Truck Profiles
  const presetTrucks = [
    { plate: 'L 9821 AB', type: 'Kompaktor Hidrolik A-01', gross: '7850', tare: '3200' },
    { plate: 'L 8412 UZ', type: 'Arm-Roll Truck B-04', gross: '6400', tare: '2900' },
    { plate: 'W 1920 QR', type: 'Truk Bak Terbuka C-02', gross: '4950', tare: '2150' },
  ];

  // Conveyor Stream simulation
  useEffect(() => {
    if (conveyorRunning) {
      conveyorTimerRef.current = setInterval(() => {
        const sampleCatalog = [
          { name: 'Botol HDPE Shampoo 350ml', cat: 'PLASTIC', purity: 98.4, isContaminant: false, color: 'text-emerald-400' },
          { name: 'Kertas Arsip Putih HVS', cat: 'PAPER', purity: 99.2, isContaminant: false, color: 'text-amber-300' },
          { name: 'Aerosol Can (Logam)', cat: 'METAL', purity: 96.7, isContaminant: false, color: 'text-cyan-400' },
          { name: 'Styrofoam Makanan (Residu)', cat: 'RESIDUAL', purity: 99.0, isContaminant: true, color: 'text-red-400' },
          { name: 'Baterai Bekas (B3 Hazard)', cat: 'HAZARDOUS', purity: 99.8, isContaminant: true, color: 'text-red-500' },
        ];
        const randomItem = sampleCatalog[Math.floor(Math.random() * sampleCatalog.length)];
        const newItem = {
          id: Date.now(),
          name: randomItem.name,
          cat: randomItem.cat,
          purity: randomItem.purity,
          status: randomItem.isContaminant ? 'EJECTED_AIRJET' : 'RECOVERED',
          color: randomItem.color
        };

        if (randomItem.isContaminant) {
          setEjectionCount(c => c + 1);
        } else {
          setSortedTonTotal(t => parseFloat((t + 0.05).toFixed(2)));
        }

        setOpticalItems(prev => [newItem, ...prev.slice(0, 3)]);
      }, 3000);
    }
    return () => {
      if (conveyorTimerRef.current) clearInterval(conveyorTimerRef.current);
    };
  }, [conveyorRunning]);

  const calculateNet = () => {
    const g = parseFloat(grossWeight) || 0;
    const t = parseFloat(tareWeight) || 0;
    return Math.max(0, g - t);
  };

  const handlePrintSlip = (e) => {
    e.preventDefault();
    const net = calculateNet();
    setWeighSlip({
      ticketNo: `JT-SBY-${Math.floor(100000 + Math.random() * 900000)}`,
      time: new Date().toLocaleString('id-ID'),
      gross: grossWeight,
      tare: tareWeight,
      net: net,
      truckPlate: truckPlate,
      material: 'Sampah Padat Anorganik Campuran'
    });
  };

  const handleShipmentSubmit = (e) => {
    e.preventDefault();
    const ton = parseFloat(shipmentTon);
    setStockpiles(prev => prev.map(s => {
      if (s.id === selectedStockpile.id) {
        return { ...s, currentTon: Math.max(0, s.currentTon - ton) };
      }
      return s;
    }));
    setShipmentSuccess(true);
    setTimeout(() => {
      setShipmentSuccess(false);
      setShipmentModalOpen(false);
      setSelectedStockpile(null);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-forest-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-forest-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-800 border border-forest-700 text-xs font-mono text-forest-200 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>FACILITY OPERATING SYSTEM · TPST WONOKROMO SURABAYA</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Pusat Pemilahan & Stasiun Transfer Sampah 🏭</h1>
          <p className="text-xs text-forest-300">
            Penanggung Jawab: <span className="font-semibold text-white">Budi Santoso, S.T.</span> · Kapasitas Desain: <span className="font-mono text-white">120 Ton / Hari</span> · Sertifikasi ISO 14001
          </p>
        </div>

        <div className="flex items-center gap-4 bg-forest-950 p-3.5 rounded-2xl border border-forest-800">
          <div>
            <span className="text-[10px] text-forest-400 uppercase tracking-wider block">Okupansi TPST Hari Ini</span>
            <span className="text-base font-bold text-emerald-300 font-mono">78.4 Ton / 120 Ton (65.3%)</span>
            <div className="w-44 bg-forest-800 h-2 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: '65.3%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Optical Conveyor Sorting Stream Simulation Panel */}
      <div className="bg-carbon-900 text-white rounded-3xl p-6 border border-carbon-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-carbon-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-forest-800 text-forest-200 border border-forest-700">
              <IconSparkles className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-400">NIR HYPERSPECTRAL + COMPUTER VISION SORTATION</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700 text-[10px] font-mono">
                  {conveyorRunning ? 'CONVEYOR ACTIVE (1.4 m/s)' : 'CONVEYOR PAUSED'}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">Pemilahan Otomatis & Penolakan Kontaminasi Pneumatik</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setConveyorRunning(!conveyorRunning)}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition ${
                conveyorRunning 
                  ? 'bg-amber-500 hover:bg-amber-600 text-carbon-950' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-carbon-950'
              }`}
            >
              {conveyorRunning ? '⏸ Jeda Sortasi' : '▶ Jalankan Ban Berjalan'}
            </button>
          </div>
        </div>

        {/* Optical Belt Visualizer */}
        <div className="relative bg-carbon-950 rounded-2xl p-4 border border-carbon-800 overflow-hidden space-y-3">
          {/* Animated Conveyor Track Pattern */}
          <div className="h-2 w-full bg-[repeating-linear-gradient(90deg,#187B58,#187B58_20px,#123C32_20px,#123C32_40px)] rounded animate-[pulse_2s_infinite]"></div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            {opticalItems.map((item, idx) => (
              <div 
                key={item.id} 
                className={`p-3 rounded-2xl border transition-all ${
                  item.status === 'EJECTED_AIRJET' 
                    ? 'bg-red-950/60 border-red-600/80 shadow-md ring-1 ring-red-500/50' 
                    : 'bg-carbon-900/90 border-carbon-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-carbon-400 uppercase">Posisi #{idx + 1}</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    item.status === 'EJECTED_AIRJET' ? 'bg-red-800 text-red-100' : 'bg-emerald-900 text-emerald-200'
                  }`}>
                    {item.status === 'EJECTED_AIRJET' ? '⚡ AIR-JET FIRED' : 'RECOVERED'}
                  </span>
                </div>
                <h4 className={`text-xs font-bold mt-1.5 ${item.color}`}>{item.name}</h4>
                <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-carbon-400">
                  <span>Kategori: {item.cat}</span>
                  <span className="text-white font-bold">{item.purity}% Purity</span>
                </div>
              </div>
            ))}
          </div>

          {/* Real-time stats footer */}
          <div className="pt-2 border-t border-carbon-800/80 flex flex-wrap items-center justify-between text-xs font-mono text-carbon-300">
            <span>Throughput Real-Time: <b className="text-emerald-400">12.8 Ton/Jam</b></span>
            <span>Kontaminan Ditolak (Pneumatik): <b className="text-red-400">{ejectionCount} Unit</b></span>
            <span>Total Material Terpulihkan: <b className="text-cyan-400">{sortedTonTotal} Ton</b></span>
            <span>Tingkat Kemurnian Fraksi: <b className="text-emerald-400">98.4%</b></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Digital Weighbridge (Jembatan Timbang) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-carbon-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-carbon-100">
            <div>
              <h3 className="font-bold text-sm text-carbon-900 flex items-center gap-1.5">
                <IconBuilding className="w-4 h-4 text-forest-600" />
                Jembatan Timbang Digital (Weighbridge)
              </h3>
              <p className="text-[11px] text-carbon-500">Pencatatan tonase muatan armada truk secara otomatis.</p>
            </div>
            <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
              LOAD CELL ON
            </span>
          </div>

          {/* Quick preset selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-carbon-600 block">Pilih Truk Masuk (RFID Auto-Detect):</label>
            <div className="grid grid-cols-3 gap-2">
              {presetTrucks.map((pt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setTruckPlate(pt.plate);
                    setGrossWeight(pt.gross);
                    setTareWeight(pt.tare);
                  }}
                  className={`p-2 rounded-xl border text-left text-xs transition ${
                    truckPlate === pt.plate 
                      ? 'border-forest-600 bg-forest-50/70 font-semibold text-forest-900' 
                      : 'border-carbon-200 hover:border-forest-300 text-carbon-700'
                  }`}
                >
                  <p className="font-mono font-bold text-[11px]">{pt.plate}</p>
                  <p className="text-[10px] text-carbon-500 truncate">{pt.type}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handlePrintSlip} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-carbon-700 block mb-1">Berat Kotor (Gross Kg)</label>
                <input
                  type="number"
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(e.target.value)}
                  required
                  className="w-full bg-forest-50 border border-carbon-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-carbon-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-carbon-700 block mb-1">Berat Kosong (Tare Kg)</label>
                <input
                  type="number"
                  value={tareWeight}
                  onChange={(e) => setTareWeight(e.target.value)}
                  required
                  className="w-full bg-forest-50 border border-carbon-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-carbon-900"
                />
              </div>
            </div>

            {/* Calculated Net Weight Live */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider">Berat Bersih Muatan (Netto)</span>
                <div className="text-2xl font-black text-emerald-950 font-mono">
                  {calculateNet().toLocaleString()} <span className="text-xs font-normal text-emerald-800">Kg ({(calculateNet() / 1000).toFixed(2)} Ton)</span>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-white px-3 py-1.5 rounded-xl border border-emerald-300 shadow-xs">
                Toleransi: ±0.1%
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-forest-700 hover:bg-forest-800 active:scale-95 text-white font-semibold rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2"
            >
              <IconCheck className="w-4 h-4" />
              <span>Cetak Tiket Timbangan & Validasi Masuk</span>
            </button>
          </form>

          {/* Ticket Preview */}
          {weighSlip && (
            <div className="p-4 bg-carbon-50 rounded-2xl border border-carbon-200 font-mono text-xs space-y-2">
              <div className="flex justify-between items-center border-b border-carbon-200 pb-2">
                <span className="font-bold text-carbon-900">TIKET TIMBANGAN RESMI</span>
                <span className="text-[10px] text-forest-700 font-bold">{weighSlip.ticketNo}</span>
              </div>
              <div className="grid grid-cols-2 gap-y-1 text-[11px] text-carbon-700">
                <span>Waktu Catat:</span> <span className="text-right font-medium">{weighSlip.time}</span>
                <span>No. Polisi Armada:</span> <span className="text-right font-bold">{weighSlip.truckPlate}</span>
                <span>Jenis Sampah:</span> <span className="text-right">{weighSlip.material}</span>
                <span>Gross Weight:</span> <span className="text-right">{weighSlip.gross} kg</span>
                <span>Tare Weight:</span> <span className="text-right">{weighSlip.tare} kg</span>
                <span className="font-bold text-emerald-700">Netto Sampah:</span> 
                <span className="text-right font-bold text-emerald-800">{weighSlip.net} kg</span>
              </div>
              <div className="pt-2 border-t border-carbon-200 flex justify-between items-center text-[10px] text-carbon-400">
                <span>Operator: Sistem Otomatis RFID</span>
                <button 
                  onClick={() => alert(`Tiket ${weighSlip.ticketNo} berhasil dikirim ke printer thermal dan tersimpan di database!`)}
                  className="px-2 py-0.5 rounded bg-forest-700 text-white font-sans text-[10px]"
                >
                  Cetak Thermal
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stockpile Inventory & Commercial Offtake */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-carbon-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-carbon-100">
              <div>
                <span className="text-[10px] font-bold text-forest-700 uppercase tracking-wider font-mono">CIRCULAR COMMODITY STOCK</span>
                <h3 className="font-bold text-sm text-carbon-900 mt-0.5">Inventaris Bale Siap Kirim ke Pabrik Daur Ulang</h3>
              </div>
              <span className="text-xs font-mono font-bold text-forest-700 bg-forest-50 px-2.5 py-1 rounded-xl">
                4 Komoditas Siap Offtake
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stockpiles.map((stock) => {
                const percent = Math.min(100, Math.round((stock.currentTon / stock.maxTon) * 100));
                return (
                  <div key={stock.id} className="p-4 rounded-2xl border border-carbon-200 hover:border-forest-300 transition space-y-3 bg-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-forest-50 text-forest-800 font-bold">
                          {stock.category} · {stock.grade}
                        </span>
                        <h4 className="font-bold text-sm text-carbon-900 mt-1">{stock.name}</h4>
                      </div>
                      <span className="text-xs font-mono font-black text-carbon-900">
                        {stock.currentTon} <span className="text-[10px] font-normal text-carbon-500">Ton</span>
                      </span>
                    </div>

                    {/* Capacity Bar */}
                    <div>
                      <div className="flex justify-between text-[10px] text-carbon-500 font-mono mb-1">
                        <span>Kapasitas Gudang: {percent}%</span>
                        <span>Maks: {stock.maxTon} Ton</span>
                      </div>
                      <div className="w-full bg-carbon-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            percent > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} 
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-carbon-100">
                      <div>
                        <span className="text-[10px] text-carbon-400 block">Estimasi Nilai Pasar</span>
                        <span className="text-xs font-bold font-mono text-emerald-800">
                          Rp {stock.estValue.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedStockpile(stock);
                          setShipmentTon('5.0');
                          setShipmentModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-forest-50 hover:bg-forest-100 text-forest-800 rounded-xl text-xs font-semibold border border-forest-200 transition"
                      >
                        Kirim ke Pabrik
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Shipment Modal */}
      {shipmentModalOpen && selectedStockpile && (
        <div className="fixed inset-0 bg-carbon-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-carbon-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-forest-700 uppercase tracking-wider font-mono">Surat Jalan Pabrik</span>
                <h3 className="font-bold text-sm text-carbon-900">Kirim Material Daur Ulang</h3>
              </div>
              <button onClick={() => setShipmentModalOpen(false)} className="text-carbon-400 hover:text-carbon-800 text-sm font-bold">✕</button>
            </div>

            {shipmentSuccess ? (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                  <IconCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-emerald-950">Surat Jalan Berhasil Diterbitkan!</h4>
                <p className="text-xs text-emerald-800 font-mono">
                  Pengiriman {shipmentTon} Ton material ke {buyerName} berhasil diproses.
                </p>
              </div>
            ) : (
              <form onSubmit={handleShipmentSubmit} className="space-y-4">
                <div className="p-3 bg-forest-50 rounded-xl border border-forest-200 text-xs">
                  <p className="font-bold text-forest-900">{selectedStockpile.name}</p>
                  <p className="text-carbon-600 font-mono text-[11px] mt-0.5">Stok Saat Ini: {selectedStockpile.currentTon} Ton</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-carbon-700 block mb-1">Jumlah Tonase Dikirim (Ton)</label>
                  <input
                    type="number"
                    max={selectedStockpile.currentTon}
                    min="0.5"
                    step="0.5"
                    value={shipmentTon}
                    onChange={(e) => setShipmentTon(e.target.value)}
                    required
                    className="w-full bg-forest-50 border border-carbon-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-carbon-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-carbon-700 block mb-1">Nama Industri / Pembeli Offtaker</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    required
                    className="w-full bg-forest-50 border border-carbon-300 rounded-xl px-3 py-2 text-xs font-medium text-carbon-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-forest-700 hover:bg-forest-800 text-white font-semibold rounded-xl text-xs transition shadow-sm"
                >
                  Konfirmasi Pengiriman & Kurangi Inventaris
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
