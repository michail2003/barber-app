import React, { useState, useEffect } from 'react';
import { barber_reservations } from '../../Api/reservation';

const Reservations = () => {
    const [reservimet, setReservimet] = useState([]);
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
console.log(reservimet)
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

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">My Reservations</h1>

                {Object.keys(grouped).length === 0 ? (
                    <div className="bg-white p-12 rounded-[2rem] shadow-sm border border-gray-100 text-center text-gray-400 font-medium">
                        No upcoming reservations found.
                    </div>
                ) : (
                    Object.keys(grouped).map((day) => (
                        <div key={day} className="mb-10">
                            {/* Day Header */}
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-4 ml-2">
                                {day}
                            </h2>
                            
                            {/* Reservations Table */}
                            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100">
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Start Time</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">End Time</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {grouped[day].map((res, idx) => (
                                            <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <span className="text-sm font-bold text-gray-800">
                                                        {formatTime(res.start)}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-sm font-semibold text-gray-500">
                                                        {formatTime(res.end)}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${getStatusStyle(res.status)}`}>
                                                        {res.status || 'Scheduled'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Reservations;