import React, { useState, useEffect } from 'react';
import { barber_reservations } from '../../Api/reservation'; // Adjust import

const Reservations = () => {
    const [reservimet, setReservimet] = useState([]);
    const id = localStorage.getItem('id');

    const fetchreservations = async () => {
        try {
            const data = await barber_reservations(id);
            setReservimet(data);
        } catch (e) {
            console.error('Failed to fetch data:', e);
        }
    };

    useEffect(() => {
        if (id) fetchreservations();
    }, [id]);

    // Helper to format: "Dec 27, 5:15 PM"
    const formatDate = (dateString) => {
        const options = { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const grouped = reservimet.reduce((acc, res) => {
        const day = new Date(res.start).toLocaleDateString('en-GB', { 
            weekday: 'long', day: 'numeric', month: 'long' 
        });
        if (!acc[day]) acc[day] = [];
        acc[day].push(res);
        return acc;
    }, {});

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-8">My Reservations</h1>

                {Object.keys(grouped).length === 0 ? (
                    <div className="bg-white p-8 rounded-xl shadow-sm text-center text-gray-500">
                        No reservations found.
                    </div>
                ) : (
                    Object.keys(grouped).map((day) => (
                        <div key={day} className="mb-10">
                            {/* Day Header */}
                            <h2 className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-3 ml-1">
                                {day}
                            </h2>
                            
                            {/* Table */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Start Time</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">End Time</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {grouped[day].map((res, idx) => (
                                            <tr key={idx} className="hover:bg-blue-50/30 transition-colors border-b border-gray-50 last:border-0">
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-gray-900">
                                                        {new Date(res.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-600">
                                                        {new Date(res.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Active
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