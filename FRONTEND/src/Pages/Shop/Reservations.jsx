import React, { useState, useEffect } from 'react';
import { barber_reservations } from '../../Api/reservation';

const Reservations = () => {
    const [reservimet, setReservimet] = useState([]);
    const [actionModalOpen, setActionModalOpen] = useState(false);
    const id = localStorage.getItem('id');

    useEffect(() => {
        if (id) fetchreservations();
    }, [id]);

    const fetchreservations = async () => {
        try {
            const data = await barber_reservations(id);
            // Ensure data is an array before setting state
            setReservimet(data);
        } catch (e) {
            console.error('Failed to fetch data:', e);
        }
    };
    // Helper: Dynamic Status Badge Colors
    const getStatusStyle = (status) => {
        const s = status?.toLowerCase();
        if (s === 'confirmed' || s === 'completed') return 'bg-green-100 text-green-700';
        if (s === 'pending') return 'bg-yellow-100 text-yellow-700';
        if (s === 'cancelled' || s === 'canceled') return 'bg-red-100 text-red-700';
        return 'bg-blue-100 text-blue-700'; // Default
    };

    // Grouping Logic: Organized by Day
    const grouped = reservimet.reduce((acc, res) => {
        const day = new Date(res.start).toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long'
        });
        if (!acc[day]) acc[day] = [];
        acc[day].push(res);
        return acc;
    }, {});

    // Helper: Format Time (HH:MM)
    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    console.log(reservimet);    
    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans relative">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Reservations</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage and track your upcoming bookings.</p>
                    </div>
                </header>

                {Object.keys(grouped).length === 0 ? (
                    <div className="bg-white p-16 rounded-3xl shadow-sm border border-gray-100 text-center">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">📅</span>
                        </div>
                        <h3 className="text-gray-900 font-bold text-lg">No reservations found</h3>
                    </div>
                ) : (
                    Object.keys(grouped).map((day) => (
                        <div key={day} className="mb-12">
                            {/* Day Header */}
                            <div className="flex items-center gap-4 mb-6 sticky top-0 bg-gray-50 py-2 z-10">
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 whitespace-nowrap">
                                    {day}
                                </h2>
                                <div className="h-[1px] w-full bg-gray-200"></div>
                            </div>

                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                {/* Mobile View (Card List) */}
                                <div className="block md:hidden divide-y divide-gray-100">
                                    {grouped[day].map((res, idx) => (
                                        <div key={idx} className="p-6 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</p>
                                                    <p className="text-sm font-black text-gray-900">
                                                        {formatTime(res.start)} — {formatTime(res.end)}
                                                    </p>
                                                </div>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusStyle(res.status)}`}>
                                                    {res.status || 'Scheduled'}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</p>
                                                    <p className="text-sm font-bold text-gray-700">{res.customer_name || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone</p>
                                                    <p className="text-sm font-medium text-gray-500 font-mono text-[13px]">{res.customer_phone || 'N/A'}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <button className="flex-1 py-3 px-4 bg-gray-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-black transition-colors active:scale-95" onClick={() => setActionModalOpen(true)}>
                                                    Action
                                                </button>
                                                <button className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-900 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-colors active:scale-95">
                                                    Modify
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop View (Table) */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
                                                <th className="pl-8 pr-4 py-5">Schedule</th>
                                                <th className="px-6 py-5">Customer</th>
                                                <th className="px-6 py-5 text-center">Status</th>
                                                <th className="pl-4 pr-8 py-5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {grouped[day].map((res, idx) => (
                                                <tr key={idx} className="hover:bg-blue-50/30 transition-all duration-200 group">
                                                    <td className="pl-8 pr-4 py-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-gray-800 leading-none mb-1 group-hover:text-blue-600 transition-colors">
                                                                {formatTime(res.start)}
                                                            </span>
                                                            <span className="text-[11px] font-bold text-gray-400">
                                                                to {formatTime(res.end)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-gray-700">{res.customer_name || 'N/A'}</span>
                                                            <span className="text-xs text-gray-400 font-mono tracking-tighter">{res.customer_phone || '—'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6 text-center">
                                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${getStatusStyle(res.status)}`}>
                                                            {res.status || 'Scheduled'}
                                                        </span>
                                                    </td>
                                                    <td className="pl-4 pr-8 py-6 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button className="py-2 px-4 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-600 transition-all active:scale-95" onClick={() => setActionModalOpen(true)}>
                                                                Action
                                                            </button>
                                                            <button className="py-2 px-4 bg-white border border-gray-200 text-gray-700 text-[10px] font-black uppercase tracking-widest rounded-lg hover:border-gray-900 hover:text-gray-900 transition-all active:scale-95">
                                                                Modify
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {actionModalOpen &&
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm" onClick={() => setActionModalOpen(false)}>
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin-slow"></div>
                            </div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">Manage Reservation</h3>
                            <p className="text-gray-500 text-sm mb-8 leading-relaxed">Select an action to perform on this booking.</p>

                            <div className="space-y-3">
                                <button className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-between group transition-all active:scale-[0.98]">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">⏳</span>
                                        <span className="text-xs font-black uppercase tracking-widest">Add 10 Minutes</span>
                                    </div>
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                </button>
                                <button className="w-full py-4 px-6 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl flex items-center justify-between group transition-all active:scale-[0.98]">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">🚫</span>
                                        <span className="text-xs font-black uppercase tracking-widest">Terminate</span>
                                    </div>
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                </button>
                                <button className="w-full mt-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-600 transition-colors" onClick={() => setActionModalOpen(false)}>
                                    Nevermind, go back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            }

        </div>
    );
};

export default Reservations;