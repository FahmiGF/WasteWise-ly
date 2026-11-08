import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../lib/api';
import { 
  IconCamera, IconMapPin, IconTruck, IconRecycle, IconDollarSign, 
  IconAlertTriangle, IconSparkles, IconCheck, IconRefresh, IconQrCode,
  IconShield, IconTrendingUp, IconBot 
} from '../components/Icons';

export default function CitizenView() {
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner', 'nearby', 'pickup', 'bank', 'marketplace', 'dumping', 'guide', 'gamification'
  
  // AI Scanner state
  const [selectedMock, setSelectedMock] = useState('plastic');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);

  // Bank Sampah state
  const [bankData, setBankData] = useState({
    account: { balance_idr: 87500, points: 420, eco_score: 780, total_deposited_kg: 24.5 },
    ledger: []
  });
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('50000');
  const [withdrawAccount, setWithdrawAccount] = useState('BCA 8210394821');

  // Smart Bins & Nearby
  const [bins, setBins] = useState([]);
  const [searchBin, setSearchBin] = useState('');
  
  // Marketplace
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [orderWeight, setOrderWeight] = useState('20');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createListingModal, setCreateListingModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('PLASTIC');
  const [newWeight, setNewWeight] = useState('50');
  const [newPrice, setNewPrice] = useState('4500');

  // Illegal dumping report
  const [dumpLocation, setDumpLocation] = useState('Jl. Manyar Kertoarjo No. 45');
  const [dumpType, setDumpType] = useState('Plastik & Kardus Campuran');
  const [dumpVolume, setDumpVolume] = useState('~3 Karung (Sedang)');
  const [dumpReportSuccess, setDumpReportSuccess] = useState(false);

  // Pickup Request
  const [pickupMaterial, setPickupMaterial] = useState('Kardus & Plastik PET');
  const [pickupWeight, setPickupWeight] = useState('15');
  const [pickupAddress, setPickupAddress] = useState('Jl. Dharmawangsa No. 12, Gubeng');
  const [pickupSuccess, setPickupSuccess] = useState(false);

  // Encyclopedia Guide & Gamification
  const [wasteGuide, setWasteGuide] = useState([]);
  const [searchGuide, setSearchGuide] = useState('');
  const [gamification, setGamification] = useState(null);
  const [certModal, setCertModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [binsRes, bankRes, listRes, guideRes, gameRes] = await Promise.all([
        api.getBins().catch(() => []),
        api.getWasteBankAccount().catch(() => null),
        api.getMarketplaceListings().catch(() => []),
        api.getWasteGuide().catch(() => []),
        api.getGamification().catch(() => null)
      ]);
      if (binsRes && binsRes.length) setBins(binsRes);
      if (bankRes) setBankData(bankRes);
      if (listRes && listRes.length) setListings(listRes);
      if (guideRes && guideRes.length) setWasteGuide(guideRes);
      if (gameRes) setGamification(gameRes);
    } catch (e) {
      console.warn("Error loading citizen data:", e);
    }
  };

  const handleScan = async (type = selectedMock) => {
    setIsScanning(true);
    setScanResult(null);
    try {
      const res = await api.classifyWaste(type, uploadedImage);
      setTimeout(() => {
        setScanResult(res);
        setIsScanning(false);
      }, 550);
    } catch (e) {
      setIsScanning(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setUploadedImage(uploadEvent.target.result);
        handleScan(selectedMock);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    try {
      const amt = parseFloat(withdrawAmount);
      await api.withdrawWasteBank(amt, withdrawAccount);
      setWithdrawModalOpen(false);
      loadData();
      alert(`Pencairan dana Rp ${amt.toLocaleString('id-ID')} berhasil diajukan ke ${withdrawAccount}!`);
    } catch (err) {
      alert("Gagal melakukan pencairan: " + err.message);
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    try {
      await api.createMarketplaceListing({
        title: newTitle || 'Material Campuran Siap Daur Ulang',
        material_category: newCategory,
        seller_name: 'Fahmi Gunawan (Citizen)',
        seller_type: 'CITIZEN',
        quality_grade: 'GRADE A',
        available_kg: parseFloat(newWeight),
        price_per_kg: parseFloat(newPrice),
        min_order_kg: 10.0,
        location_name: 'Gubeng, Surabaya',
        image_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600'
      });
      setCreateListingModal(false);
      loadData();
      alert('Listing material berhasil ditambahkan ke pasar daur ulang!');
    } catch (err) {
      alert("Gagal menambahkan listing: " + err.message);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!selectedListing) return;
    try {
      await api.createMarketplaceOrder(
        selectedListing.id,
        "Fahmi Gunawan",
        "Rumah Tangga Mandiri",
        parseFloat(orderWeight)
      );
      setOrderSuccess(true);
      setTimeout(() => {
        setOrderSuccess(false);
        setSelectedListing(null);
        loadData();
      }, 2000);
    } catch (err) {
      alert("Gagal memesan: " + err.message);
    }
  };

  const handleDumpingSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createDumpingReport({
        reporter_name: "Fahmi Gunawan (Citizen)",
        location_name: dumpLocation,
        lat: -7.2891,
        lng: 112.7612,
        photo_url: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=400",
        estimated_volume: dumpVolume,
        waste_type: dumpType
      });
      setDumpReportSuccess(true);
      setTimeout(() => setDumpReportSuccess(false), 3000);
    } catch (err) {
      alert("Gagal kirim laporan: " + err.message);
    }
  };

  const handlePickupSubmit = (e) => {
    e.preventDefault();
    setPickupSuccess(true);
    setTimeout(() => setPickupSuccess(false), 3500);
  };

  // Filtered smart bins for search
  const filteredBins = useMemo(() => {
    if (!searchBin) return bins;
    return bins.filter(b => 
      b.name.toLowerCase().includes(searchBin.toLowerCase()) ||
      b.facility_name.toLowerCase().includes(searchBin.toLowerCase()) ||
      b.code.toLowerCase().includes(searchBin.toLowerCase())
    );
  }, [bins, searchBin]);

  // Filtered encyclopedia guide
  const filteredGuide = useMemo(() => {
    if (!searchGuide) return wasteGuide;
    return wasteGuide.filter(g => 
      g.name.toLowerCase().includes(searchGuide.toLowerCase()) ||
      g.code.toLowerCase().includes(searchGuide.toLowerCase()) ||
      g.category.toLowerCase().includes(searchGuide.toLowerCase())
    );
  }, [wasteGuide, searchGuide]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Citizen Profile Summary */}
      <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-forest-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-forest-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-800/80 border border-forest-600 text-[11px] font-medium text-forest-200">
              <IconSparkles className="w-3.5 h-3.5 text-forest-300" />
              <span>WasteWise Citizen Eco-System</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Halo, Fahmi Gunawan! 🌱</h1>
            <p className="text-xs text-forest-200 max-w-xl leading-relaxed">
              Kamu telah mengalihkan <span className="font-semibold text-white">24.5 kg sampah</span> dari TPA dan mencegah <span className="font-semibold text-white">35.5 kg emisi CO₂</span> bulan ini.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-forest-950/60 p-3 rounded-2xl border border-forest-700/60 backdrop-blur-md">
            <div className="text-right">
              <span className="text-[10px] text-forest-300 uppercase tracking-wider block">Saldo Bank Sampah</span>
              <span className="text-lg font-bold text-emerald-300 font-mono">
                Rp {bankData?.account?.balance_idr?.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="h-8 w-px bg-forest-700"></div>
            <div>
              <span className="text-[10px] text-forest-300 uppercase tracking-wider block">Eco-Score</span>
              <span className="text-lg font-bold text-white flex items-center gap-1">
                ⭐ {bankData?.account?.eco_score} <span className="text-[10px] text-forest-400">/ 1000</span>
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex items-center gap-1.5 mt-6 pt-4 border-t border-forest-700/50 overflow-x-auto no-scrollbar">
          {[
            { id: 'scanner', label: '📸 AI Camera Scan', badge: 'YOLOv8' },
            { id: 'nearby', label: '📍 Lokasi Smart Bin & TPS' },
            { id: 'pickup', label: '🚚 Permintaan Pickup' },
            { id: 'bank', label: '🏦 Tabungan & Poin' },
            { id: 'marketplace', label: '🛒 Pasar Daur Ulang' },
            { id: 'dumping', label: '⚠️ Lapor Tumpukan Liar' },
            { id: 'guide', label: '📖 Ensiklopedia Pemilahan' },
            { id: 'gamification', label: '🏆 Badges & Sertifikat' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-white text-forest-950 shadow-md font-semibold scale-102'
                  : 'bg-forest-800/40 text-forest-200 hover:bg-forest-700/60 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-forest-600 text-white font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT 1: AI CAMERA SCANNER WITH UPLOAD & MULTI-OBJECT */}
      {activeTab === 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Viewfinder & Controls */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-carbon-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-carbon-900 flex items-center gap-2">
                  <IconCamera className="w-5 h-5 text-forest-600" />
                  AI Waste Classification Viewfinder
                </h2>
                <p className="text-xs text-carbon-500">Mendeteksi jenis material, tingkat kontaminasi, dan petunjuk pemilahan.</p>
              </div>
              <span className="text-[11px] font-mono bg-forest-100 text-forest-800 px-2.5 py-1 rounded-full font-semibold">
                ONNX Multi-Object
              </span>
            </div>

            {/* Simulated Camera Screen */}
            <div className="relative aspect-video bg-carbon-900 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-forest-600 shadow-inner group">
              <img
                src={
                  uploadedImage || (
                    selectedMock === 'plastic' ? 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800' :
                    selectedMock === 'paper' ? 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800' :
                    selectedMock === 'metal' ? 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800' :
                    selectedMock === 'glass' ? 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800' :
                    selectedMock === 'organic' ? 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800' :
                    selectedMock === 'e_waste' ? 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=800' :
                    selectedMock === 'textile' ? 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800' :
                    selectedMock === 'hazardous' ? 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800' :
                    'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800'
                  )
                }
                alt="Sample Target"
                className="w-full h-full object-cover opacity-85 transition duration-300"
              />

              {/* Laser Scan Animation */}
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#35A875] absolute animate-scanline"></div>
                </div>
              )}

              {/* Multi Bounding Box Overlay if Detected */}
              {scanResult && !isScanning && (
                <>
                  {scanResult.detected_objects ? (
                    scanResult.detected_objects.map((obj, i) => (
                      <div 
                        key={i}
                        className={`absolute border-2 rounded-lg pointer-events-none animate-in fade-in zoom-in-95 duration-200 ${
                          obj.is_primary ? 'border-emerald-400 bg-emerald-500/15' : 'border-amber-400 bg-amber-500/20'
                        }`}
                        style={{
                          top: `${obj.box.ymin * 100}%`,
                          left: `${obj.box.xmin * 100}%`,
                          width: `${(obj.box.xmax - obj.box.xmin) * 100}%`,
                          height: `${(obj.box.ymax - obj.box.ymin) * 100}%`,
                        }}
                      >
                        <div className={`absolute -top-6 left-0 font-mono font-bold text-[10px] px-2 py-0.5 rounded shadow ${
                          obj.is_primary ? 'bg-emerald-500 text-carbon-900' : 'bg-amber-500 text-carbon-900'
                        }`}>
                          {obj.label} ({(obj.confidence * 100).toFixed(0)}%)
                        </div>
                      </div>
                    ))
                  ) : (
                    <div 
                      className="absolute border-2 border-emerald-400 bg-emerald-500/15 rounded-lg pointer-events-none animate-in fade-in"
                      style={{
                        top: `${scanResult.bounding_box.ymin * 100}%`,
                        left: `${scanResult.bounding_box.xmin * 100}%`,
                        width: `${(scanResult.bounding_box.xmax - scanResult.bounding_box.xmin) * 100}%`,
                        height: `${(scanResult.bounding_box.ymax - scanResult.bounding_box.ymin) * 100}%`,
                      }}
                    >
                      <div className="absolute -top-6 left-0 bg-emerald-500 text-carbon-900 font-mono font-bold text-[10px] px-2 py-0.5 rounded shadow">
                        {scanResult.detected_category} ({(scanResult.confidence_score * 100).toFixed(1)}%)
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Controls on camera screen */}
              <div className="absolute bottom-3 left-3 bg-carbon-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-carbon-700 text-white text-[11px] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Resolusi: 1080p · ONNX Inference: {scanResult ? `${scanResult.inference_time_ms}ms` : 'Ready'}</span>
              </div>

              {/* Upload file trigger */}
              <label className="absolute top-3 right-3 bg-white/90 hover:bg-white text-carbon-900 text-xs font-semibold px-3 py-1.5 rounded-xl shadow cursor-pointer transition flex items-center gap-1.5">
                <IconCamera className="w-3.5 h-3.5 text-forest-700" />
                <span>Upload Foto PC</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* Test Category Samples Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-carbon-700 flex items-center justify-between">
                <span>Pilih Sampel Cepat 9 Kategori (Vision Simulation):</span>
                <span className="text-forest-600 font-mono text-[11px]">9 Kelas Terstandarisasi</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { id: 'plastic', label: 'Plastik PET' },
                  { id: 'paper', label: 'Kardus' },
                  { id: 'metal', label: 'Aluminium' },
                  { id: 'glass', label: 'Botol Kaca' },
                  { id: 'organic', label: 'Organik' },
                  { id: 'e_waste', label: 'E-Waste' },
                  { id: 'textile', label: 'Tekstil' },
                  { id: 'hazardous', label: 'Limbah B3 ⚠️' },
                  { id: 'residual', label: 'Residu TPA' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setUploadedImage(null);
                      setSelectedMock(item.id);
                      handleScan(item.id);
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium text-center border transition ${
                      selectedMock === item.id && !uploadedImage
                        ? 'bg-forest-900 text-white border-forest-900 shadow-sm'
                        : 'bg-forest-50 text-carbon-800 border-carbon-200 hover:border-forest-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Trigger Scan Button */}
            <button
              onClick={() => handleScan(selectedMock)}
              disabled={isScanning}
              className="w-full py-3 bg-forest-700 hover:bg-forest-800 active:scale-99 text-white font-semibold rounded-2xl transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <IconRefresh className="w-5 h-5 animate-spin" />
                  <span>Sedang Menganalisis Spektrum Citra...</span>
                </>
              ) : (
                <>
                  <IconSparkles className="w-5 h-5 text-forest-200" />
                  <span>Jalankan AI Inference Kamera</span>
                </>
              )}
            </button>
          </div>

          {/* AI Detection Result Panel */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-carbon-200 shadow-sm space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-carbon-100">
                <span className="text-xs font-bold text-carbon-400 uppercase tracking-wider">Hasil Klasifikasi AI</span>
                <span className="text-xs font-mono text-carbon-500">{scanResult ? `${scanResult.inference_time_ms}ms` : 'Ready'}</span>
              </div>

              {!scanResult ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-14 h-14 bg-forest-100 rounded-2xl flex items-center justify-center mx-auto text-forest-700">
                    <IconCamera className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-carbon-800 text-sm">Arahkan Kamera ke Objek Sampah</h4>
                  <p className="text-xs text-carbon-500 max-w-xs mx-auto">
                    Pilih sampel atau upload foto untuk melihat deteksi jenis, kemurnian, dan nilai daur ulang.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pt-4">
                  {/* Category Title */}
                  <div className="p-4 rounded-2xl bg-forest-50 border border-forest-200">
                    <span className="text-[10px] font-bold text-forest-700 uppercase tracking-wider block">Kategori Terdeteksi</span>
                    <h3 className="text-lg font-bold text-carbon-900 mt-0.5">{scanResult.name_id}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 bg-forest-700 text-white rounded-md">
                        {scanResult.detected_category}
                      </span>
                      <span className="text-xs text-carbon-600 font-mono">
                        Akurasi: {(scanResult.confidence_score * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Contamination & Purity Meter */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-2xl bg-white border border-carbon-200">
                      <span className="text-[10px] text-carbon-500 uppercase tracking-wider block">Tingkat Kontaminasi</span>
                      <span className="text-base font-bold text-carbon-900 font-mono">
                        {scanResult.contamination_percentage}%
                      </span>
                      <div className="w-full bg-carbon-100 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="bg-amber-500 h-full rounded-full"
                          style={{ width: `${Math.min(scanResult.contamination_percentage * 10, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white border border-carbon-200">
                      <span className="text-[10px] text-carbon-500 uppercase tracking-wider block">Grade Kemurnian</span>
                      <span className="text-base font-bold text-forest-700 font-mono">
                        {scanResult.purity_grade}
                      </span>
                      <span className="text-[10px] text-carbon-500 block mt-1">Layak Daur Ulang</span>
                    </div>
                  </div>

                  {/* Disposal Advice */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-amber-800">
                      <IconAlertTriangle className="w-4 h-4 text-amber-600" />
                      Petunjuk Penanganan & Wadah:
                    </span>
                    <p className="leading-relaxed text-[11px] text-amber-950">{scanResult.handling_advice}</p>
                    <div className="mt-2 pt-2 border-t border-amber-200/80 font-medium text-[11px]">
                      Tempat Pembuangan: <span className="font-bold underline">{scanResult.recommended_bin}</span>
                    </div>
                  </div>

                  {/* Economic & Carbon Value */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 block">Estimasi Harga Jual</span>
                      <span className="text-base font-bold text-emerald-800 font-mono">
                        Rp {scanResult.estimated_price_per_kg.toLocaleString('id-ID')} / kg
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 block">CO₂ Dihindari</span>
                      <span className="text-sm font-bold text-emerald-800 font-mono">
                        +{scanResult.co2e_avoided_per_kg} kg CO₂e
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {scanResult && (
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('pickup')}
                  className="w-full py-2.5 bg-forest-900 hover:bg-forest-950 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <span>Minta Penjemputan untuk Material Ini</span>
                  <IconTruck className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: NEARBY SMART BINS & FACILITIES (WITH SEARCH) */}
      {activeTab === 'nearby' && (
        <div className="bg-white rounded-3xl p-6 border border-carbon-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-carbon-900 flex items-center gap-2">
                <IconMapPin className="w-5 h-5 text-forest-600" />
                Fasilitas Pengelolaan & Smart Bins Terdekat (Surabaya)
              </h2>
              <p className="text-xs text-carbon-500">Pantau kapasitas tempat sampah pintar dan jadwal bank sampah sebelum menyetor.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Cari lokasi bin..."
                value={searchBin}
                onChange={(e) => setSearchBin(e.target.value)}
                className="bg-forest-50 border border-carbon-300 rounded-xl px-3 py-1.5 text-xs text-carbon-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
              <button 
                onClick={loadData}
                className="px-3.5 py-1.5 bg-forest-50 hover:bg-forest-100 text-forest-900 rounded-xl text-xs font-medium border border-forest-200 flex items-center gap-1.5 self-start"
              >
                <IconRefresh className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBins.map((b) => (
              <div key={b.id} className="p-4 rounded-2xl border border-carbon-200 hover:border-forest-500 transition space-y-3 bg-white shadow-2xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-carbon-400 font-semibold">{b.code}</span>
                    <h4 className="font-bold text-sm text-carbon-900 leading-tight">{b.name}</h4>
                    <p className="text-[11px] text-carbon-500 mt-0.5">{b.facility_name}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                    b.status === 'CRITICAL' || b.status === 'OVERFLOW' ? 'bg-red-100 text-red-800' :
                    b.status === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {b.status} ({b.fill_percentage}%)
                  </span>
                </div>

                {/* Fill Meter */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-carbon-600">
                    <span>Kapasitas Terisi</span>
                    <span className="font-mono font-medium">{b.weight_kg} kg / {b.max_weight_kg} kg</span>
                  </div>
                  <div className="w-full bg-carbon-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        b.fill_percentage >= 80 ? 'bg-red-500' :
                        b.fill_percentage >= 60 ? 'bg-amber-500' :
                        'bg-forest-600'
                      }`}
                      style={{ width: `${b.fill_percentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Telemetry info */}
                <div className="pt-2 border-t border-carbon-100 flex items-center justify-between text-[10px] text-carbon-500 font-mono">
                  <span>🔋 Bat: {b.battery_percentage}%</span>
                  <span>🌡️ Temp: {b.temperature_c}°C</span>
                  <span className="text-forest-700 font-medium">{b.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: ON-DEMAND PICKUP REQUEST */}
      {activeTab === 'pickup' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 border border-carbon-200 shadow-sm space-y-5">
          <div>
            <h2 className="text-base font-bold text-carbon-900 flex items-center gap-2">
              <IconTruck className="w-5 h-5 text-forest-600" />
              Permintaan Pickup Sampah Terjadwal
            </h2>
            <p className="text-xs text-carbon-500">Petugas CVRP terdekat akan menjemput material daur ulang langsung ke alamatmu.</p>
          </div>

          {pickupSuccess ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto">
                <IconCheck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-emerald-900">Permintaan Pickup Berhasil Diterbitkan!</h3>
              <p className="text-xs text-emerald-700">
                Tugas telah otomatis masuk ke antrean CVRP Rute Armada A-01. Estimasi kedatangan petugas: 45 menit.
              </p>
            </div>
          ) : (
            <form onSubmit={handlePickupSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-carbon-700 block mb-1">Alamat Penjemputan</label>
                <input
                  type="text"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  required
                  className="w-full bg-forest-50 border border-carbon-300 rounded-xl px-3 py-2 text-xs text-carbon-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-carbon-700 block mb-1">Kategori Material</label>
                  <select
                    value={pickupMaterial}
                    onChange={(e) => setPickupMaterial(e.target.value)}
                    className="w-full bg-forest-50 border border-carbon-300 rounded-xl px-3 py-2 text-xs text-carbon-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
                  >
                    <option value="Kardus & Plastik PET">Kardus & Plastik PET</option>
                    <option value="Aluminium & Logam">Aluminium & Kaleng</option>
                    <option value="Minyak Jelantah">Minyak Jelantah (UCO)</option>
                    <option value="Elektronik Bekas (E-Waste)">Elektronik Bekas (E-Waste)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-carbon-700 block mb-1">Estimasi Berat (Kg)</label>
                  <input
                    type="number"
                    value={pickupWeight}
                    onChange={(e) => setPickupWeight(e.target.value)}
                    min="2"
                    max="500"
                    required
                    className="w-full bg-forest-50 border border-carbon-300 rounded-xl px-3 py-2 text-xs text-carbon-900 focus:outline-none focus:ring-2 focus:ring-forest-600 font-mono"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-forest-50 border border-forest-200 text-xs text-forest-900 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-forest-700 uppercase font-bold block">Estimasi Reward Yang Diterima</span>
                  <span className="text-sm font-bold text-forest-950 font-mono">
                    Rp {(parseFloat(pickupWeight || 0) * 3500).toLocaleString('id-ID')}
                  </span>
                </div>
                <span className="text-[11px] text-forest-600 font-medium">Bebas Ongkir Pengangkutan</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-forest-700 hover:bg-forest-800 text-white font-semibold rounded-2xl transition shadow-md text-xs flex items-center justify-center gap-2"
              >
                <span>Konfirmasi Jadwal Penjemputan</span>
                <IconCheck className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB CONTENT 4: DIGITAL WASTE BANK PASSBOOK */}
      {activeTab === 'bank' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Passbook Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-forest-700">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-forest-300 uppercase tracking-widest block">BUKU TABUNGAN DIGITAL</span>
                  <h3 className="font-bold text-lg text-white mt-1">Bank Sampah Induk Surabaya</h3>
                </div>
                <div className="w-8 h-8 rounded-lg bg-forest-700 flex items-center justify-center text-forest-200">
                  <IconQrCode className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-8 space-y-1">
                <span className="text-[10px] text-forest-300 uppercase tracking-wider block">Total Saldo Terbuku</span>
                <div className="text-3xl font-extrabold text-emerald-300 font-mono tracking-tight">
                  Rp {bankData?.account?.balance_idr?.toLocaleString('id-ID')}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-forest-800/80 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[9px] text-forest-400 uppercase block">No. Rekening Reksa</span>
                  <span className="font-mono font-medium">{bankData?.account?.account_number || 'BS-SBY-77291'}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-forest-400 uppercase block">Eco Poin Reward</span>
                  <span className="font-mono font-bold text-amber-300">{bankData?.account?.points} Poin</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setWithdrawModalOpen(true)}
                className="py-2.5 bg-white border border-carbon-300 hover:border-forest-600 text-carbon-900 rounded-2xl text-xs font-semibold transition shadow-2xs flex items-center justify-center gap-1.5"
              >
                <IconDollarSign className="w-4 h-4 text-forest-700" />
                <span>Cairkan Saldo</span>
              </button>
              <button
                onClick={() => setActiveTab('pickup')}
                className="py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-2xl text-xs font-semibold transition shadow-2xs flex items-center justify-center gap-1.5"
              >
                <IconRecycle className="w-4 h-4 text-forest-200" />
                <span>Setor Sampah</span>
              </button>
            </div>
          </div>

          {/* Double-Entry Ledger History */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-carbon-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-carbon-100">
              <h3 className="font-bold text-sm text-carbon-900">Mutasi Rekening (Double-Entry Ledger)</h3>
              <span className="text-[11px] font-mono text-carbon-500">Terverifikasi Kriptografis</span>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {bankData?.ledger?.map((entry) => (
                <div key={entry.id} className="p-3 rounded-2xl border border-carbon-100 hover:bg-forest-50/50 transition flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-carbon-900">{entry.description}</p>
                    <p className="text-[10px] text-carbon-400 font-mono">{entry.date}</p>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold block ${entry.amount > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                      {entry.amount > 0 ? '+' : ''}Rp {entry.amount.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-carbon-400 font-mono">
                      Sisa: Rp {entry.balance_after.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT 5: RECYCLING MARKETPLACE WITH SELLER LISTING */}
      {activeTab === 'marketplace' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-carbon-900 flex items-center gap-2">
                <IconRecycle className="w-5 h-5 text-forest-600" />
                Pasar Daur Ulang & Material Sirkular
              </h2>
              <p className="text-xs text-carbon-500">Perdagangan grosir material terverifikasi antara Bank Sampah, TPS, dan Industri Daur Ulang.</p>
            </div>
            
            <button
              onClick={() => setCreateListingModal(true)}
              className="px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm self-start"
            >
              <span>+ Jual Material Sendiri</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((item) => (
              <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-carbon-200 hover:border-forest-500 transition shadow-sm flex flex-col justify-between">
                <div className="relative aspect-video bg-carbon-100">
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 bg-forest-900/80 backdrop-blur-md text-white text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold">
                    {item.quality_grade}
                  </span>
                  <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-forest-950 text-xs font-bold font-mono px-2.5 py-1 rounded-lg shadow">
                    Rp {item.price_per_kg.toLocaleString('id-ID')} / kg
                  </span>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-forest-700 font-bold uppercase tracking-wider block">{item.material_category}</span>
                    <h4 className="font-bold text-sm text-carbon-900 leading-snug mt-0.5">{item.title}</h4>
                    <p className="text-[11px] text-carbon-500 mt-1 flex items-center gap-1">
                      <IconMapPin className="w-3.5 h-3.5 text-carbon-400" />
                      <span>{item.location_name} ({item.seller_name})</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-carbon-100 flex items-center justify-between">
                    <div className="text-[11px] font-mono text-carbon-600">
                      Stok: <span className="font-bold text-carbon-900">{item.available_kg} Kg</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedListing(item);
                        setOrderWeight(item.min_order_kg.toString());
                      }}
                      className="px-3.5 py-1.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-semibold transition"
                    >
                      Beli Material
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Buat Listing Penjual */}
          {createListingModal && (
            <div className="fixed inset-0 bg-carbon-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-carbon-200 shadow-2xl space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-forest-700 uppercase tracking-wider">Marketplace Seller</span>
                    <h3 className="font-bold text-base text-carbon-900 mt-0.5">Buat Listing Penjualan Material</h3>
                  </div>
                  <button onClick={() => setCreateListingModal(false)} className="text-carbon-400 hover:text-carbon-800">✕</button>
                </div>

                <form onSubmit={handleCreateListing} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-carbon-700 block mb-1">Judul Listing</label>
                    <input
                      type="text"
                      placeholder="Contoh: Bal Botol PET Bening Bersih (100 Kg)"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                      className="w-full bg-forest-50 border border-carbon-300 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-carbon-700 block mb-1">Kategori</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full bg-forest-50 border border-carbon-300 rounded-xl px-3 py-2 text-xs"
                      >
                        <option value="PLASTIC">Plastik PET/HDPE</option>
                        <option value="PAPER">Kardus/Kertas</option>
                        <option value="METAL">Aluminium/Logam</option>
                        <option value="GLASS">Kaca</option>
                        <option value="ORGANIC">Minyak Jelantah</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-carbon-700 block mb-1">Total Berat (Kg)</label>
                      <input
                        type="number"
                        value={newWeight}
                        onChange={(e) => setNewWeight(e.target.value)}
                        required
                        className="w-full bg-forest-50 border border-carbon-300 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-carbon-700 block mb-1">Harga per Kg (Rp)</label>
                    <input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      required
                      className="w-full bg-forest-50 border border-carbon-300 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-semibold transition"
                  >
                    Publikasikan ke Bursa
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Modal Beli Material */}
          {selectedListing && (
            <div className="fixed inset-0 bg-carbon-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-carbon-200 shadow-2xl space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-forest-700 uppercase tracking-wider">Checkout Order</span>
                    <h3 className="font-bold text-base text-carbon-900 mt-0.5">{selectedListing.title}</h3>
                  </div>
                  <button onClick={() => setSelectedListing(null)} className="text-carbon-400 hover:text-carbon-800">
                    ✕
                  </button>
                </div>

                {orderSuccess ? (
                  <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                    <IconCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                    <h4 className="font-bold text-emerald-900 text-sm">Pesanan Berhasil Dibayar via VA BCA!</h4>
                    <p className="text-xs text-emerald-700">Kode Invoice: WW-ORD-{Math.floor(Math.random() * 90000 + 10000)}</p>
                  </div>
                ) : (
                  <form onSubmit={handleCreateOrder} className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-carbon-700 block mb-1">Berat Pesanan (Kg)</label>
                      <input
                        type="number"
                        min={selectedListing.min_order_kg}
                        max={selectedListing.available_kg}
                        value={orderWeight}
                        onChange={(e) => setOrderWeight(e.target.value)}
                        className="w-full bg-forest-50 border border-carbon-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold"
                        required
                      />
                      <span className="text-[10px] text-carbon-400">Min Order: {selectedListing.min_order_kg} kg</span>
                    </div>

                    <div className="p-3 bg-forest-50 rounded-xl border border-forest-200 space-y-1 text-xs">
                      <div className="flex justify-between text-carbon-600">
                        <span>Harga Material ({orderWeight} kg)</span>
                        <span className="font-mono">Rp {(parseFloat(orderWeight || 0) * selectedListing.price_per_kg).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-carbon-600">
                        <span>Biaya Platform (1.5%)</span>
                        <span className="font-mono">Rp {(parseFloat(orderWeight || 0) * selectedListing.price_per_kg * 0.015).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="pt-1.5 border-t border-forest-200 flex justify-between font-bold text-forest-950">
                        <span>Total Tagihan Midtrans</span>
                        <span className="font-mono text-emerald-800">
                          Rp {(parseFloat(orderWeight || 0) * selectedListing.price_per_kg * 1.015).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-semibold transition"
                    >
                      Konfirmasi Pembayaran Sandbox Midtrans
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 6: ILLEGAL DUMPING REPORT */}
      {activeTab === 'dumping' && (
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 border border-carbon-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-carbon-900 flex items-center gap-2">
              <IconAlertTriangle className="w-5 h-5 text-amber-600" />
              Lapor Tumpukan Sampah Liar (Citizen Geotag)
            </h2>
            <p className="text-xs text-carbon-500">Laporanmu akan langsung dipetakan pada GIS Satuan Tugas Kebersihan Kota Surabaya.</p>
          </div>

          {dumpReportSuccess ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
              <IconCheck className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-emerald-900 text-sm">Laporan Berhasil Dikirimkan!</h4>
              <p className="text-xs text-emerald-700">Tim inspeksi lapangan telah ditugaskan untuk verifikasi titik lokasi.</p>
            </div>
          ) : (
            <form onSubmit={handleDumpingSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-carbon-700 block mb-1">Titik Lokasi / Patokan</label>
                <input
                  type="text"
                  value={dumpLocation}
                  onChange={(e) => setDumpLocation(e.target.value)}
                  required
                  className="w-full bg-forest-50 border border-carbon-300 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-carbon-700 block mb-1">Jenis Sampah Liar</label>
                  <input
                    type="text"
                    value={dumpType}
                    onChange={(e) => setDumpType(e.target.value)}
                    required
                    className="w-full bg-forest-50 border border-carbon-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-carbon-700 block mb-1">Estimasi Volume</label>
                  <select
                    value={dumpVolume}
                    onChange={(e) => setDumpVolume(e.target.value)}
                    className="w-full bg-forest-50 border border-carbon-300 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="~1 Karung (Kecil)">~1 Karung (Kecil)</option>
                    <option value="~3 Karung (Sedang)">~3 Karung (Sedang)</option>
                    <option value="1 Pick-up Penuh (Besar)">1 Pick-up Penuh (Besar)</option>
                    <option value="Tumpukan Luas (>1 Ton)">Tumpukan Luas (&gt;1 Ton)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <IconAlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <span>Geotagging koordinat (-7.2891, 112.7612) telah disinkronkan via GPS browser.</span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-semibold transition"
              >
                Kirim Laporan Tumpukan Sampah
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB CONTENT 7: ENCYCLOPEDIA / PANDUAN PEMILAHAN SAMPAH */}
      {activeTab === 'guide' && (
        <div className="bg-white rounded-3xl p-6 border border-carbon-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-carbon-900 flex items-center gap-2">
                <span>📖 Ensiklopedia Pemilahan Sampah Terstandarisasi</span>
                <span className="text-xs bg-forest-100 text-forest-800 px-2 py-0.5 rounded font-mono font-bold">SNI 19-3964</span>
              </h2>
              <p className="text-xs text-carbon-500">Panduan lengkap kode daur ulang, petunjuk kebersihan, dan estimasi nilai ekonomis.</p>
            </div>
            
            <input
              type="text"
              placeholder="Cari jenis sampah (misal: botol, kardus)..."
              value={searchGuide}
              onChange={(e) => setSearchGuide(e.target.value)}
              className="bg-forest-50 border border-carbon-300 rounded-xl px-3 py-1.5 text-xs text-carbon-900 focus:outline-none focus:ring-2 focus:ring-forest-600 sm:w-64"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGuide.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl border border-carbon-200 hover:border-forest-500 transition space-y-2 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h4 className="font-bold text-xs text-carbon-900">{item.name}</h4>
                      <span className="text-[10px] font-mono text-carbon-500 font-semibold">{item.code}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                    item.recyclable ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.recyclable ? 'BISA DIDINAMISASI' : 'RESIDU / B3'}
                  </span>
                </div>

                <p className="text-[11px] text-carbon-600 leading-relaxed bg-forest-50/60 p-2.5 rounded-xl border border-forest-100">
                  {item.instructions}
                </p>

                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <span className="text-carbon-500">Est. Nilai Bank Sampah:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {item.est_price_idr > 0 ? `Rp ${item.est_price_idr.toLocaleString('id-ID')} / kg` : 'Drop Box'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 8: GAMIFIKASI & SERTIFIKAT ECO-HERO */}
      {activeTab === 'gamification' && gamification && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Level & Streak Stats */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 rounded-3xl p-6 text-white shadow-xl space-y-5 border border-forest-700">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-forest-300 uppercase tracking-widest block">LEVEL KEBERLANJUTAN</span>
                  <h3 className="font-bold text-lg text-white mt-1">{gamification.user_level}</h3>
                </div>
                <div className="px-2.5 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-xl text-xs font-mono font-bold">
                  🔥 {gamification.streak_days} Hari Streak
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-forest-300">
                  <span>Progres ke Level 5</span>
                  <span className="font-mono font-bold text-white">{gamification.eco_score} / {gamification.max_score} XP</span>
                </div>
                <div className="w-full bg-forest-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full transition-all duration-700" style={{ width: `${(gamification.eco_score / gamification.max_score) * 100}%` }}></div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setCertModal(true)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-carbon-950 font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5"
                >
                  <IconSparkles className="w-4 h-4" />
                  <span>Lihat & Unduh Sertifikat Digital Eco-Impact</span>
                </button>
              </div>
            </div>

            {/* Daily Missions */}
            <div className="bg-white rounded-3xl p-5 border border-carbon-200 shadow-sm space-y-3">
              <h4 className="font-bold text-xs text-carbon-900 uppercase tracking-wider">Misi Harian Pemilahan (Reset 24 Jam)</h4>
              <div className="space-y-2">
                {gamification.daily_missions?.map((m) => (
                  <div key={m.id} className="p-3 rounded-xl border border-carbon-100 flex items-center justify-between text-xs bg-forest-50/40">
                    <div className="flex items-center gap-2">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${m.done ? 'bg-emerald-500 text-white' : 'border border-carbon-300'}`}>
                        {m.done && '✓'}
                      </span>
                      <span className={m.done ? 'line-through text-carbon-400' : 'text-carbon-800 font-medium'}>{m.task}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-forest-700">{m.reward}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Badges Collection */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-carbon-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-carbon-900">Koleksi Lencana Penghargaan (Eco Badges)</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {gamification.badges?.map((b) => (
                <div key={b.id} className={`p-4 rounded-2xl border transition flex items-start gap-3 ${
                  b.unlocked ? 'border-emerald-300 bg-emerald-50/40' : 'border-carbon-200 opacity-50 bg-carbon-50'
                }`}>
                  <span className="text-3xl p-2 bg-white rounded-xl shadow-xs">{b.icon}</span>
                  <div className="space-y-0.5">
                    <h5 className="font-bold text-xs text-carbon-900">{b.title}</h5>
                    <p className="text-[11px] text-carbon-500 leading-tight">{b.desc}</p>
                    <span className="text-[9px] font-mono text-emerald-700 block pt-1">
                      {b.unlocked ? `Terbuka: ${b.date}` : '🔒 Belum Terbuka'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* MODAL SERTIFIKAT DIGITAL */}
      {certModal && (
        <div className="fixed inset-0 bg-carbon-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 border-4 border-emerald-600 shadow-2xl space-y-6 text-center relative overflow-hidden">
            <button onClick={() => setCertModal(false)} className="absolute top-4 right-4 text-carbon-400 hover:text-carbon-800 text-sm font-bold">✕</button>
            <div className="space-y-1">
              <span className="text-3xl">🏅</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-800 font-bold block">SERTIFIKAT KONTRIBUSI SIRKULAR</span>
              <h2 className="text-xl font-black text-forest-950 font-serif">Pahlawan Lingkungan Kota Surabaya</h2>
              <p className="text-xs text-carbon-500">Diberikan secara terverifikasi kriptografis kepada:</p>
              <h3 className="text-lg font-bold text-forest-800 underline decoration-emerald-500 decoration-2">Fahmi Gunawan</h3>
            </div>
            <div className="p-4 bg-forest-50 rounded-2xl border border-forest-200 text-xs text-forest-950 grid grid-cols-2 gap-3 text-left">
              <div>
                <span className="text-[10px] text-carbon-500 block">Total Sampah Terdiversi:</span>
                <span className="font-bold font-mono text-sm text-forest-900">24.5 Kilogram</span>
              </div>
              <div>
                <span className="text-[10px] text-carbon-500 block">CO₂e Tercegah:</span>
                <span className="font-bold font-mono text-sm text-emerald-700">35.5 kg CO₂e</span>
              </div>
            </div>
            <p className="text-[10px] text-carbon-400 font-mono">ID Kredensial: DLH-SBY-ECO-2026-981249 · Terverifikasi Sistem WasteWise</p>
            <button
              onClick={() => {
                alert("Sertifikat digital berhasil diunduh dalam format PDF resmi!");
                setCertModal(false);
              }}
              className="w-full py-2.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-semibold shadow"
            >
              Cetak / Simpan PDF
            </button>
          </div>
        </div>
      )}

      {/* MODAL WITHDRAW */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 bg-carbon-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-carbon-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-sm text-carbon-900">Pencairan Saldo Bank Sampah</h3>
              <button onClick={() => setWithdrawModalOpen(false)} className="text-carbon-400 hover:text-carbon-800">✕</button>
            </div>
            <form onSubmit={handleWithdraw} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-carbon-700 block mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  max={bankData?.account?.balance_idr}
                  required
                  className="w-full bg-forest-50 border border-carbon-300 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-carbon-700 block mb-1">Tujuan Pencairan</label>
                <input
                  type="text"
                  value={withdrawAccount}
                  onChange={(e) => setWithdrawAccount(e.target.value)}
                  required
                  className="w-full bg-forest-50 border border-carbon-300 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-semibold transition"
              >
                Kirim Pencairan Dana
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
