import React, { useState } from 'react';
import { api } from '../lib/api';
import { IconBot, IconX, IconSparkles, IconChevronRight } from './Icons';

export default function AIAssistantDrawer({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Halo! Saya WasteWise AI Assistant. Terhubung langsung ke telemetri IoT, basis data harga material, dan optimasi logistik. Ada yang bisa saya bantu?',
      tool: null,
      time: 'Baru saja'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    'Bin mana yang kritis hari ini?',
    'Berapa harga pasar plastik PET dan kardus?',
    'Berapa total CO2 yang berhasil kita hemat?',
    'Bagaimana cara memilah sampah baterai?'
  ];

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = {
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.askAssistant(query);
      const assistantMsg = {
        sender: 'assistant',
        text: res.reply,
        tool: res.tool_called,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Maaf, sistem inference AI sedang sibuk. Silakan coba kembali dalam beberapa saat.',
          tool: 'error_fallback',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-carbon-900/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-carbon-200 animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-4 bg-forest-900 text-white flex items-center justify-between border-b border-forest-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-forest-700 flex items-center justify-center text-forest-200">
              <IconBot className="w-5 h-5 text-forest-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                WasteWise AI Assistant
                <span className="text-[10px] bg-forest-800 text-forest-300 px-1.5 py-0.5 rounded font-mono">RAG v2</span>
              </h3>
              <p className="text-[11px] text-forest-300">Operational Tools & Circular Knowledge</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-forest-300 hover:text-white hover:bg-forest-800 transition"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-forest-50 border-b border-forest-100 flex gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] bg-white text-forest-900 border border-forest-200 hover:border-forest-500 rounded-full px-3 py-1 whitespace-nowrap transition flex items-center gap-1 shadow-2xs hover:bg-forest-100/50"
            >
              <IconSparkles className="w-3 h-3 text-forest-600" />
              <span>{q}</span>
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-forest-50/40">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-forest-700 text-white rounded-tr-none'
                    : 'bg-white text-carbon-900 border border-carbon-200 rounded-tl-none'
                }`}
              >
                {m.tool && (
                  <div className="mb-1.5 pb-1 border-b border-carbon-100 flex items-center gap-1 text-[10px] font-mono text-forest-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-forest-600 animate-pulse"></span>
                    <span>Tool Called: {m.tool}()</span>
                  </div>
                )}
                <div className="whitespace-pre-line">{m.text}</div>
                <div className={`text-[9px] mt-1 text-right ${m.sender === 'user' ? 'text-forest-200' : 'text-carbon-400'}`}>
                  {m.time}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-carbon-500 text-xs py-2 bg-white px-3 rounded-xl border border-carbon-200 w-max">
              <span className="w-2 h-2 rounded-full bg-forest-600 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-forest-600 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-forest-600 animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-[11px] font-medium text-forest-800 ml-1">Menjalankan kueri operasional...</span>
            </div>
          )}
        </div>

        {/* Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white border-t border-carbon-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanyakan ke WasteWise AI Assistant..."
            className="flex-1 bg-forest-50 border border-carbon-300 rounded-xl px-3 py-2 text-xs text-carbon-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-3.5 py-2 bg-forest-700 hover:bg-forest-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition"
          >
            <span>Kirim</span>
            <IconChevronRight className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
}
