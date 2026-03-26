import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get_barber_list, barber_edit, barber_exit } from '../../Api/Barber';
import { getcatalog } from '../../Api/Shops';

const StaffDetails = () => {
    const [staff, setStaff] = useState([]);
    const [selectedBarber, setSelectedBarber] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isServiceEditOpen, setIsServiceEditOpen] = useState(false);
    const [catalog, setCatalog] = useState([]);

    const navigate = useNavigate();
    const shopId = localStorage.getItem('shop');

    useEffect(() => {
        if (shopId) 
            loadData();
        fetchServices();
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

    async function fetchServices() {
        try {
            const services = await getcatalog(shopId);
            setCatalog(services);

            // Set default duration to 30 so the "-" button has something to subtract from
            // const defaultServices = services.map(item => ({
            //     service: item._id,
            //     duration: 0,
            // }));
            // setFormData(prev => ({ ...prev, services: defaultServices }));
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    }
    console.log(staff);
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
                <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                        <span className="bg-amber-100 text-amber-700 p-1.5 rounded-md mr-2">✂️</span>
                        Service Menu & Durations
                    </h3>

                    <div className="space-y-4">
                        {catalog.map((item) => {
                            const currentService = formData.services.find(s => s.service === item._id);
                            const isSelected = !!currentService;

                            return (
                                <div
                                    key={item._id}
                                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all ${isSelected ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100 bg-gray-50 opacity-60'}`}
                                >
                                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (isSelected) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        services: prev.services.filter(s => s.service !== item._id)
                                                    }));
                                                } else {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        services: [...prev.services, {
                                                            service: item._id,
                                                            duration: 0,
                                                        }]
                                                    }));
                                                }
                                            }}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isSelected ? 'bg-amber-600' : 'bg-gray-300'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isSelected ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>

                                        <div>
                                            <p className={`font-bold ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>{item.service}</p>
                                            <p className="text-xs text-gray-400">{item.price} Leke</p>
                                        </div>
                                    </div>

                                    {isSelected && (
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center bg-white border border-amber-200 rounded-lg overflow-hidden shadow-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => updateServiceDuration(item._id, Math.max(5, currentService.duration - 5))}
                                                    className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold"
                                                >–</button>
                                                <input
                                                    type="number"
                                                    readOnly
                                                    value={currentService.duration}
                                                    className="w-10 text-center text-sm font-bold text-gray-800 focus:outline-none bg-transparent"
                                                />
                                                <span className="pr-2 text-[10px] font-bold text-gray-400">MIN</span>
                                                <button
                                                    type="button"

                                                    onClick={() => updateServiceDuration(item._id, currentService.duration + 5)}
                                                    className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold"
                                                >+</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}
        </div>
    );
};

export default StaffDetails;