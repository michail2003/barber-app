import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get_barber_list, barber_edit, barber_exit } from '../../Api/Barber';

const StaffDetails = () => {
    const [staff, setStaff] = useState([]);
    const [selectedBarber, setSelectedBarber] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isServiceEditOpen, setIsServiceEditOpen] = useState(false);

    const navigate = useNavigate();
    const shopId = localStorage.getItem('shop');

    useEffect(() => {
        if (shopId) loadData();
    }, [shopId]);

    const loadData = async () => {
        try {
            const data = await get_barber_list(shopId);
            setStaff(data);
        } catch (err) {
            console.error("Load failed", err);
        }
    };

    // Helper to split "09:00 - 21:00" into start and end
    const getHourParts = (hourString) => {
        if (!hourString || !hourString.includes('-')) return { start: "09:00", end: "21:00" };
        const [start, end] = hourString.split(' - ');
        return { start: start.trim(), end: end.trim() };
    };

    const handleServiceDuration = (index, newDuration) => {
        const updatedServices = [...selectedBarber.services];
        updatedServices[index] = { ...updatedServices[index], duration: Math.max(0, newDuration) };
        setSelectedBarber({ ...selectedBarber, services: updatedServices });
    };

    const handleSave = async () => {
        try {
            const updatePayload = {
                name: selectedBarber.userId.name,
                ph_number: selectedBarber.userId.ph_number,
                hours: selectedBarber.hours, // Backend expects "09:00 - 21:00"
                services: selectedBarber.services,
                role: selectedBarber.userId.role
            };

            await barber_edit(selectedBarber._id, updatePayload);
            setIsEditOpen(false);
            loadData();
        } catch (err) {
            alert("Update failed: " + err.message);
        }
    };

    const handleDelete = async () => {
        try {
            await barber_exit(selectedBarber._id);
            setIsDeleteOpen(false);
            setSelectedBarber(null);
            loadData();
        } catch (err) {
            alert("Delete failed");
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FB] p-4 md:p-12">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Staff Management</h1>
                        <p className="text-gray-500 font-medium">Manage team schedules, roles, and services.</p>
                    </div>
                </header>

                {/* RESPONSIVE TABLE CONTAINER */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="hidden md:table-header-group bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Barber</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 block md:table-row-group">
                                {staff.map((barber) => (
                                    <tr key={barber._id} className="group hover:bg-indigo-50/30 transition-all block md:table-row p-4 md:p-0">
                                        {/* Barber Identity */}
                                        <td className="px-4 md:px-8 py-4 md:py-6 block md:table-cell">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100 shrink-0">
                                                    {barber.userId?.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <span className="block font-bold text-gray-800 text-lg md:text-base">{barber.userId?.name}</span>
                                                    <span className="md:hidden text-xs font-bold text-indigo-500 uppercase tracking-wider">{barber.userId?.role?.replace('_', ' ')}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Phone Number */}
                                        <td className="px-4 md:px-8 py-2 md:py-6 block md:table-cell">
                                            <div className="flex items-center gap-2 text-gray-600 font-semibold">
                                                <span className="md:hidden text-[10px] text-gray-400 uppercase font-black">Phone:</span>
                                                {barber.userId?.ph_number}
                                            </div>
                                        </td>

                                        <td className="px-4 md:px-8 py-4 md:py-6 block md:table-cell md:text-right">
                                            <div className="flex gap-3 md:justify-end">
                                                <button
                                                    onClick={() => { setSelectedBarber({ ...barber }); setIsServiceEditOpen(true); }}
                                                    className="flex-1 md:flex-none bg-indigo-50 text-indigo-600 px-6 py-2.5 md:py-1.5 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all"
                                                >
                                                    Edit services
                                                </button>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 md:px-8 py-4 md:py-6 block md:table-cell md:text-right">
                                            <div className="flex gap-3 md:justify-end">
                                                <button
                                                    onClick={() => { setSelectedBarber({ ...barber }); setIsEditOpen(true); }}
                                                    className="flex-1 md:flex-none bg-indigo-50 text-indigo-600 px-6 py-2.5 md:py-1.5 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all"
                                                >
                                                    Edit Barber
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedBarber(barber); setIsDeleteOpen(true); }}
                                                    className="flex-1 md:flex-none bg-red-50 text-red-500 px-6 py-2.5 md:py-1.5 rounded-xl text-xs font-bold hover:bg-red-100 transition-all"
                                                >
                                                    Delete
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

            {/* DELETE MODAL (Remains mostly same) */}
            {isDeleteOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⚠️</div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">Remove Staff?</h3>
                        <p className="text-gray-500 text-sm mb-8">This will permanently remove {selectedBarber?.userId?.name} from your shop.</p>
                        <div className="flex gap-3">
                            <button onClick={handleDelete} className="flex-1 bg-red-600 text-white py-3 rounded-2xl font-bold text-sm">Delete</button>
                            <button onClick={() => setIsDeleteOpen(false)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-2xl font-bold text-sm">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL - ADVANCED VIEW */}
            {isEditOpen && selectedBarber && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md overflow-y-auto">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-6 md:p-10 shadow-2xl my-auto">
                        <h2 className="text-2xl font-black mb-8 text-gray-900">Barber Settings</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1">Full Name</label>
                                <input className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 text-sm font-bold focus:ring-2 focus:ring-indigo-500" value={selectedBarber.userId.name} onChange={(e) => setSelectedBarber({ ...selectedBarber, userId: { ...selectedBarber.userId, name: e.target.value } })} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1">Phone</label>
                                <input className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 text-sm font-bold focus:ring-2 focus:ring-indigo-500" value={selectedBarber.userId.ph_number} onChange={(e) => setSelectedBarber({ ...selectedBarber, userId: { ...selectedBarber.userId, ph_number: e.target.value } })} />
                            </div>

                            {/* START/END HOUR LOGIC */}
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1">Working Shift</label>
                                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl mt-1 border border-gray-100">
                                    <div className="flex-1">
                                        <span className="text-[9px] text-gray-400 block uppercase font-bold">Start</span>
                                        <input
                                            type="time"
                                            className="bg-transparent font-bold text-gray-800 outline-none w-full"
                                            value={getHourParts(selectedBarber.hours).start}
                                            onChange={(e) => {
                                                const parts = getHourParts(selectedBarber.hours);
                                                setSelectedBarber({ ...selectedBarber, hours: `${e.target.value} - ${parts.end}` });
                                            }}
                                        />
                                    </div>
                                    <div className="w-px h-8 bg-gray-200"></div>
                                    <div className="flex-1">
                                        <span className="text-[9px] text-gray-400 block uppercase font-bold">End</span>
                                        <input
                                            type="time"
                                            className="bg-transparent font-bold text-gray-800 outline-none w-full"
                                            value={getHourParts(selectedBarber.hours).end}
                                            onChange={(e) => {
                                                const parts = getHourParts(selectedBarber.hours);
                                                setSelectedBarber({ ...selectedBarber, hours: `${parts.start} - ${e.target.value}` });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>



                        <div className="flex flex-col md:flex-row gap-4 mt-10">
                            <button onClick={handleSave} className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">Update Profile</button>
                            <button onClick={() => setIsEditOpen(false)} className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {isServiceEditOpen && selectedBarber && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md overflow-y-auto">
                    <div className="border-t border-gray-100 pt-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Services Menu
                            </h3>
                            <button

                                className="text-[10px] font-black text-indigo-600 uppercase border-2 border-indigo-100 px-4 py-1.5 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all flex items-center gap-2"
                            >
                                <span>+</span> Add Service
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {selectedBarber.services.map((service, index) => (
                                <div key={index} className="flex flex-col sm:flex-row items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 group">
                                    {/* Service Name Input */}
                                    <div className="flex-1 w-full">
                                        <input
                                            placeholder="Service Name"
                                            className="w-full bg-white border-none rounded-xl p-2.5 text-sm font-bold shadow-sm focus:ring-2 focus:ring-indigo-500"
                                            value={service.name || service.service?.service || ""}
                                            onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                                        />
                                    </div>

                                    {/* Price and Duration Controls */}
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <div className="relative flex-1 sm:w-24">
                                            <input
                                                type="number"
                                                placeholder="Price"
                                                className="w-full bg-white border-none rounded-xl p-2.5 text-sm font-black text-indigo-600 shadow-sm text-center"
                                                value={service.price || service.service?.price || ""}
                                                onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300">€</span>
                                        </div>

                                        {/* Duration Stepper */}
                                        <div className="flex items-center bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                            <button
                                                onClick={() => handleServiceDuration(index, (service.duration || 0) - 5)}
                                                className="px-3 py-2 hover:bg-gray-50 text-gray-400 font-bold transition-colors"
                                            >–</button>
                                            <div className="px-1 text-center min-w-[45px]">
                                                <span className="text-sm font-black text-gray-800">{service.duration || 0}</span>
                                                <span className="text-[7px] block font-black text-gray-300 -mt-1 uppercase">Min</span>
                                            </div>
                                            <button
                                                onClick={() => handleServiceDuration(index, (service.duration || 0) + 5)}
                                                className="px-3 py-2 hover:bg-gray-50 text-gray-400 font-bold transition-colors"
                                            >+</button>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => removeService(index)}
                                            className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                            title="Remove Service"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {selectedBarber.services.length === 0 && (
                                <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-[2rem]">
                                    <p className="text-gray-400 text-sm font-medium">No services assigned. Click "Add Service" to start.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffDetails;