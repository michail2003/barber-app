import React, { useState, useMemo } from 'react';

const TimePicker = ({ value, onChange }) => {
    const [modalOpen, setModalOpen] = useState(false);

    // useMemo prevents re-calculating this array on every re-render
    const times = useMemo(() => {
        const t = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let min = 0; min < 60; min += 15) { // 15 min increments look cleaner
                const h = hour.toString().padStart(2, '0');
                const m = min.toString().padStart(2, '0');
                t.push(`${h}:${m}`);
            }
        }
        return t;
    }, []);

    return (
        <div className="w-full">
            {/* 1. TRIGGER BUTTON (Visible on Page) */}
            <div 
                onClick={() => setModalOpen(true)}
                className="relative group cursor-pointer active:scale-95 transition-all"
            >
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                    <span className="text-indigo-500 font-black text-[10px] uppercase tracking-[0.2em]">Time</span>
                </div>
                
                <div className="w-full bg-gray-50 border-2 border-transparent group-hover:border-gray-200 px-16 py-5 rounded-[2rem] font-black text-2xl flex items-center justify-between">
                    <span>{value || "Select Time"}</span>
                    <span className="text-indigo-600 text-sm">▼</span>
                </div>
            </div>

            {/* 2. MODERN MODAL OVERLAY */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity"
                        onClick={() => setModalOpen(false)}
                    />

                    {/* Modal Card */}
                    <div className="relative w-full max-w-sm bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8 pb-4 border-b border-gray-50 text-center">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Pick a time</h3>
                            <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
                        </div>

                        {/* Scrollable List */}
                        <div className="h-[40vh] overflow-y-auto px-4 py-2 custom-scrollbar">
                            <div className="grid grid-cols-1 gap-2">
                                {times.map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => onChange(t)}
                                        className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${
                                            value === t 
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                            : 'hover:bg-gray-50 text-gray-600'
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-6 bg-gray-50/50 flex gap-3">
                            <button 
                                onClick={() => setModalOpen(false)}
                                className="flex-1 bg-gray-900 text-white py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-colors"
                            >
                                Confirm Selection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimePicker;