import React, { useState } from 'react';
import { IconRecycle, IconBell, IconShield, IconTruck, IconBuilding, IconCheck } from './Icons';

export default function Navbar({ activeRole, onSelectRole, backendOnline }) {
  const [showNotifs, setShowNotifs] = useState(false);

  const notifications = [
    { id: 1, title: 'Smart Bin A-102 Kritis (92%)', time: '5m lalu', type: 'critical' },
    { id: 2, title: 'Setoran Bank Sampah Rp 22.500 diverifikasi', time: '18m lalu', type: 'success' },
    { id: 3, title: 'Armada CVRP Truck-01 memulai rute Gubeng', time: '35m lalu', type: 'info' }
  ];

  const roles = [
    { id: 'citizen', label: 'Citizen (Masyarakat)', icon: '🌱' },
    { id: 'collector', label: 'Collector (Petugas)', icon: '🚛' },
    { id: 'facility_manager', label: 'Facility (TPS/TPST)', icon: '🏭' },
    { id: 'super_admin', label: 'Command Center (Admin)', icon: '🌐' },
  ];

  return (
    <header className="bg-forest-900 border-b border-forest-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-forest-700 flex items-center justify-center text-forest-100 shadow-inner">
              <IconRecycle className="w-6 h-6 text-forest-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">WasteWise</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-forest-800 text-forest-200 border border-forest-700">
                  <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${backendOnline ? 'bg-forest-400 animate-pulse' : 'bg-amber-400'}`}></span>
                  {backendOnline ? 'LIVE CLOUD' : 'LOCAL CACHE'}
                </span>
              </div>
              <p className="text-[11px] text-forest-300 hidden sm:block">Circular Economy & Smart Waste Operating System</p>
            </div>
          </div>

          {/* Role Switcher Pills */}
          <div className="hidden md:flex items-center bg-forest-950 p-1 rounded-xl border border-forest-800 space-x-1">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => onSelectRole(r.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                  activeRole === r.id
                    ? 'bg-forest-700 text-white shadow-sm font-semibold'
                    : 'text-forest-200 hover:text-white hover:bg-forest-900/60'
                }`}
              >
                <span>{r.icon}</span>
                <span>{r.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Right Side: Notification & Profile */}
          <div className="flex items-center space-x-3">
            {/* Mobile Role Selector */}
            <div className="md:hidden">
              <select
                value={activeRole}
                onChange={(e) => onSelectRole(e.target.value)}
                className="bg-forest-800 border border-forest-700 text-xs rounded-lg px-2 py-1.5 text-white"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.icon} {r.label}</option>
                ))}
              </select>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="p-2 rounded-xl bg-forest-800/80 hover:bg-forest-700 text-forest-200 hover:text-white transition relative"
                title="Notifikasi Sistem"
              >
                <IconBell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full"></span>
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-carbon-200 text-carbon-900 py-3 z-50">
                  <div className="px-4 pb-2 border-b border-carbon-100 flex items-center justify-between">
                    <span className="font-semibold text-xs text-forest-900 uppercase tracking-wider">Notifikasi Operasional</span>
                    <span className="text-[10px] text-forest-700 font-medium">3 Baru</span>
                  </div>
                  <div className="divide-y divide-carbon-100 max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-3 hover:bg-forest-50 transition cursor-pointer text-xs">
                        <p className="font-medium text-carbon-900">{n.title}</p>
                        <p className="text-[10px] text-carbon-500 mt-0.5">{n.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 pt-2 border-t border-carbon-100 text-center">
                    <button 
                      onClick={() => setShowNotifs(false)}
                      className="text-xs text-forest-700 font-medium hover:underline"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-2 pl-2 border-l border-forest-800">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                alt="Profile"
                className="w-8 h-8 rounded-full border border-forest-500 object-cover"
              />
              <div className="hidden lg:block text-left text-xs">
                <p className="font-semibold text-white leading-tight">Fahmi Gunawan</p>
                <p className="text-[10px] text-forest-300 leading-tight">Kota Surabaya</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
