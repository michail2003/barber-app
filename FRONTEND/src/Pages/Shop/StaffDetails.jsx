import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Importing the specific API functions
import { get_barber_list, barber_edit, barber_exit } from '../../Api/Barber';

const StaffDetails = () => {
    const [staff, setStaff] = useState([]);
    const [selectedBarber, setSelectedBarber] = useState();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    
    const navigate = useNavigate();
    const shopId = localStorage.getItem('shop'); 

    useEffect(() => { 
        if (shopId) loadData(); 
    }, [shopId]);

    const loadData = async () => {
        try {
            const data = await get_barber_list(shopId);
            setStaff(data);
            console.log(data[0])
        } catch (err) { 
            console.error("Load failed", err); 
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    // Helper functions for services array
    const handleServiceChange = (index, field, value) => {
        const updatedServices = [...selectedBarber.services];
        updatedServices[index] = { ...updatedServices[index], [field]: value };
        setSelectedBarber({ ...selectedBarber, services: updatedServices });
    };

    const addService = () => {
        setSelectedBarber({
            ...selectedBarber,
            services: [...selectedBarber.services, { name: '', price: '', duration: '' }]
        });
    };

    const removeService = (index) => {
        const updatedServices = selectedBarber.services.filter((_, i) => i !== index);
        setSelectedBarber({ ...selectedBarber, services: updatedServices });
    };

    const handleSave = async () => {
        try {
            const updatePayload = {
                name: selectedBarber.userId.name,
                ph_number: selectedBarber.userId.ph_number,
                hours: selectedBarber.hours,
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
        <div className="min-h-screen bg-[#F8F9FB] p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Staff Management</h1>
                        <p className="text-gray-500 font-medium">Manage team schedules, roles, and services.</p>
                    </div>
                </header>

                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Barber</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Hours</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Services</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {staff.map((barber) => (
                                <tr key={barber._id} className="group hover:bg-indigo-50/30 transition-all">
                                    <td className="px-8 py-6">
                                        <div className="relative group/tool flex items-center gap-3">
                                            <div className="h-10 w-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">
                                                {barber.userId?.name.charAt(0)}
                                            </div>
                                            <span className="font-bold text-gray-800">{barber.userId?.name}</span>
                                            
                                            {/* Role Tooltip on Name/Icon Hover */}
                                            <div className="absolute -top-8 left-0 px-2 py-1 bg-gray-900 text-white text-[8px] font-black uppercase tracking-widest rounded opacity-0 group-hover/tool:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                                {barber.userId?.role?.replace('_', ' ')}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-semibold text-gray-600">{barber.userId?.ph_number}</td>
                                    <td className="px-8 py-6">
                                        <span className="bg-white border border-gray-200 px-3 py-1 rounded-lg text-xs font-bold text-gray-500 shadow-sm">
                                            {barber.hours}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <button 
                                            onClick={() => { setSelectedBarber({...barber}); setIsEditOpen(true); }}
                                            className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                                        >
                                            Edit Menu ({barber.services?.length || 0})
                                        </button>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button onClick={() => { setSelectedBarber({...barber}); setIsEditOpen(true); }} className="text-xs font-bold text-gray-400 hover:text-indigo-600">Edit</button>
                                            <button onClick={() => { setSelectedBarber(barber); setIsDeleteOpen(true); }} className="text-xs font-bold text-gray-400 hover:text-red-600">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* DELETE CONFIRMATION MODAL */}
            {isDeleteOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center">
                        <h3 className="text-xl font-black text-gray-900 mb-2">Remove Staff?</h3>
                        <p className="text-gray-500 text-sm mb-8">This action will remove the barber from your shop list.</p>
                        <div className="flex gap-3">
                            <button onClick={handleDelete} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold text-sm">Delete</button>
                            <button onClick={() => setIsDeleteOpen(false)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold text-sm">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {isEditOpen && selectedBarber && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md overflow-y-auto">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-10 shadow-2xl my-auto">
                        <h2 className="text-2xl font-black mb-6 text-gray-900">Edit Barber Profile</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                            <div>
                                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1">Full Name</label>
                                <input className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 text-sm font-bold" value={selectedBarber.userId.name} onChange={(e) => setSelectedBarber({...selectedBarber, userId: {...selectedBarber.userId, name: e.target.value}})} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1">Phone</label>
                                <input className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 text-sm font-bold" value={selectedBarber.userId.ph_number} onChange={(e) => setSelectedBarber({...selectedBarber, userId: {...selectedBarber.userId, ph_number: e.target.value}})} />
                            </div>
                            
                            {/* ROLE SELECTION DROPDOWN */}
                            <div>
                                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1">Account Role</label>
                                <select 
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 text-sm font-bold focus:ring-2 focus:ring-indigo-500 appearance-none"
                                    value={selectedBarber.userId.role}
                                    onChange={(e) => setSelectedBarber({...selectedBarber, userId: {...selectedBarber.userId, role: e.target.value}})}
                                >
                                    <option value="barber">Barber</option>
                                    <option value="barber_admin">Barber Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1">Shift Hours</label>
                                <input className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 text-sm font-bold" value={selectedBarber.hours} onChange={(e) => setSelectedBarber({...selectedBarber, hours: e.target.value})} />
                            </div>
                        </div>

                        {/* SERVICES SECTION */}
                        <div className="border-t border-gray-100 pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Services Menu</h3>
                                <button onClick={addService} className="text-[10px] font-black text-indigo-600 uppercase border border-indigo-200 px-3 py-1 rounded-lg hover:bg-indigo-50 transition-all">+ Add Service</button>
                            </div>
                            
                            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                                {selectedBarber.services.map((service, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row gap-2 bg-gray-50 p-4 rounded-2xl items-center">
                                        <input 
                                            placeholder="Service Name"
                                            className="flex-1 bg-white border-none rounded-xl p-2 text-sm font-bold"
                                            value={service.name}
                                            onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                                        />
                                        <input 
                                            placeholder="€"
                                            type="number"
                                            className="w-20 bg-white border-none rounded-xl p-2 text-sm font-bold text-center"
                                            value={service.price}
                                            onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                                        />
                                        <input 
                                            placeholder="Min"
                                            type="number"
                                            className="w-20 bg-white border-none rounded-xl p-2 text-sm font-bold text-center"
                                            value={service.duration}
                                            onChange={(e) => handleServiceChange(index, 'duration', e.target.value)}
                                        />
                                        <button onClick={() => removeService(index)} className="p-2 text-red-400 hover:text-red-600">✕</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4 mt-10">
                            <button onClick={handleSave} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Save Changes</button>
                            <button onClick={() => setIsEditOpen(false)} className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffDetails;