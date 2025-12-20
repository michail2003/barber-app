import React, { useState, useEffect } from 'react';
import { staffApi } from '../../Api/barber_admin_features';

const StaffDetails = () => {
    const [staff, setStaff] = useState([]);
    const [selectedBarber, setSelectedBarber] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    
    // Replace with your actual shopId source (context or localStorage)
    const shopId = localStorage.getItem('shopId'); 

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const data = await staffApi.fetchStaff('6941d418687f5d25fff48723');
            setStaff(data);
        } catch (err) { console.error("Load failed", err); }
    };

    const handleSave = async () => {
        try {
            await staffApi.updateStaff(selectedBarber._id, {
                name: selectedBarber.userId.name,
                ph_number: selectedBarber.userId.ph_number,
                hours: selectedBarber.hours,
                services: selectedBarber.services
            });
            setIsEditOpen(false);
            loadData();
        } catch (err) { alert("Update failed"); }
    };

    const handleDelete = async () => {
        try {
            await staffApi.deleteStaff(selectedBarber._id);
            setIsDeleteOpen(false);
            loadData();
        } catch (err) { alert("Delete failed"); }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Staff Management</h1>
                    <p className="text-gray-500 font-medium">Manage team schedules and services.</p>
                </header>

                <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Name</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Contact</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Hours</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Manage</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {staff.map((barber) => (
                                <tr key={barber._id} className="group hover:bg-indigo-50/20 transition-all">
                                    <td className="px-8 py-6 font-bold text-gray-800">{barber.userId?.name}</td>
                                    <td className="px-8 py-6 text-sm text-gray-600">
                                        <div className="font-semibold">{barber.userId?.ph_number}</div>
                                        <div className="text-gray-400 text-xs">{barber.userId?.email}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="bg-white border border-gray-200 px-3 py-1 rounded-full text-xs font-bold text-gray-500 shadow-sm">
                                            {barber.hours}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button 
                                            onClick={() => { setSelectedBarber({...barber}); setIsEditOpen(true); }}
                                            className="text-indigo-600 font-bold text-sm hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => { setSelectedBarber(barber); setIsDeleteOpen(true); }}
                                            className="ml-4 text-red-400 font-bold text-sm hover:text-red-600 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* EDIT MODAL */}
            {isEditOpen && selectedBarber && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl">
                        <h2 className="text-2xl font-black mb-6 text-gray-900">Edit Barber</h2>
                        <div className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">Full Name</label>
                                <input className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1" value={selectedBarber.userId.name} onChange={(e) => setSelectedBarber({...selectedBarber, userId: {...selectedBarber.userId, name: e.target.value}})} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">Phone</label>
                                <input className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1" value={selectedBarber.userId.ph_number} onChange={(e) => setSelectedBarber({...selectedBarber, userId: {...selectedBarber.userId, ph_number: e.target.value}})} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">Shift Hours</label>
                                <input className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1" value={selectedBarber.hours} onChange={(e) => setSelectedBarber({...selectedBarber, hours: e.target.value})} />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-10">
                            <button onClick={handleSave} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all">Save</button>
                            <button onClick={() => setIsEditOpen(false)} className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffDetails;