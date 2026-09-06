import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get_barber_list, barber_edit, barber_exit } from '../../Api/Barber';
import { getcatalog } from '../../Api/Shops';

const StaffDetails = () => {
    const [staff_data, setStaff_data] = useState([])
    const [modified_barbers, setModified_barbers] = useState([])
    const [selected_barber, setSelected_barber] = useState({})
    const [catalog, setCatalog] = useState([])
    const [services_modal, setServices_modal] = useState(false)
    const [edit_modal, setEdit_modal] = useState(false)
    const [delete_modal, setDelete_modal] = useState(false)

    const shopId = localStorage.getItem('shop');

    async function fetchStaffData() {
        try {
            const data = await get_barber_list(shopId);
            setStaff_data(data);
        } catch (err) {
            console.error("Load failed", err);
        }
    }

    async function fetchCatalog() {
        try {
            const services = await getcatalog(shopId);
            setCatalog(services);
        } catch (error) {
            console.error('Error fetching shop catalog:', error);
        }
    }

    async function submit_Data(id) {
        const modified_barber = modified_barbers?.find(
            (barber) => barber._id === id
        );

        if (modified_barber) {
            const { _id: barber_id, ...newBarber } = modified_barber;

            const barber_profile_edit = await barber_edit(
                barber_id,
                newBarber
            );
            barber_profile_edit ? alert('barber updted succesfully') : alert('something went wrong')
            setEdit_modal(false)
            fetchStaffData()

        }
    }

    function modify_barber(value, field) {

        const barber = modified_barbers.find(
            (barber) =>
                barber._id === selected_barber._id
        );

        if (barber) {

            barber[field] = value;

            setModified_barbers([
                ...modified_barbers
            ]);

        } else {

            setModified_barbers([
                ...modified_barbers,
                {
                    _id: selected_barber._id,
                    [field]: value
                }
            ]);

        }
    }


    useEffect(() => {
        if (shopId) {
            fetchStaffData()
            fetchCatalog()
        } else (
            console.error('no shop id provided')
        )
    }, [])


    console.log(modified_barbers)
    console.log('barber', selected_barber)

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
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Services</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 block md:table-row-group">
                                {staff_data?.map((barber) => (
                                    <tr key={barber._id} className="group hover:bg-indigo-50/30 transition-all block md:table-row p-4 md:p-0">
                                        {/* Barber Identity */}
                                        <td className="px-4 md:px-8 py-4 md:py-6 block md:table-cell">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100 shrink-0">
                                                    {barber.userId?.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <span className="block font-bold text-gray-800 text-lg md:text-base">{barber.userId?.name}</span>
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

                                        {/* Services Action */}
                                        <td className="px-4 md:px-8 py-4 md:py-6 block md:table-cell md:text-right">
                                            <div className="flex gap-3 md:justify-end">
                                                <button
                                                    onClick={() => { setServices_modal(true) }}
                                                    className="flex-1 md:flex-none bg-indigo-50 text-indigo-600 px-6 py-2.5 md:py-1.5 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all cursor-pointer"
                                                >
                                                    Edit services
                                                </button>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 md:px-8 py-4 md:py-6 block md:table-cell md:text-right">
                                            <div className="flex gap-3 md:justify-end">
                                                <button
                                                    onClick={() => { setEdit_modal(true), setSelected_barber(barber) }}
                                                    className="flex-1 md:flex-none bg-indigo-50 text-indigo-600 px-6 py-2.5 md:py-1.5 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all cursor-pointer"
                                                >
                                                    Edit Barber
                                                </button>
                                                <button
                                                    onClick={() => setDelete_modal(true)}
                                                    className="flex-1 md:flex-none bg-red-50 text-red-500 px-6 py-2.5 md:py-1.5 rounded-xl text-xs font-bold hover:bg-red-100 transition-all cursor-pointer"
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



            {/* EDIT MODAL */}
            {edit_modal && (() => {

                const modified_barber = modified_barbers?.find(
                    (barber) => barber._id === selected_barber._id
                );

                return (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md overflow-y-auto">

                        <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-6 md:p-10 shadow-2xl my-auto">

                            <h2 className="text-2xl font-black mb-8 text-gray-900">
                                Barber Settings
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                                {/* FULL NAME */}
                                <div>
                                    <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1">
                                        Full Name
                                    </label>

                                    <input
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                                        value={
                                            modified_barber?.name ??
                                            selected_barber.userId.name
                                        }
                                        onChange={(e) => modify_barber((e.target.value), 'name')}
                                    />
                                </div>


                                {/* PHONE */}
                                <div>
                                    <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1">
                                        Phone
                                    </label>

                                    <input
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                                        placeholder={
                                            modified_barber?.ph_number ??
                                            selected_barber.userId?.ph_number
                                        }
                                        type='number'
                                        onChange={(e) => modify_barber((e.target.value), 'ph_nu')}
                                    />
                                </div>


                                {/* WORKING SHIFT */}
                                <div className="md:col-span-2">

                                    <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1">
                                        Working Shift
                                    </label>

                                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl mt-1 border border-gray-100">

                                        {/* START */}
                                        <div className="flex-1">

                                            <span className="text-[9px] text-gray-400 block uppercase font-bold">
                                                Start
                                            </span>

                                            <input
                                                type="time"
                                                className="bg-transparent font-bold text-gray-800 outline-none w-full cursor-pointer"
                                                value={
                                                    modified_barber?.hours_start ??
                                                    selected_barber.hours_start ??
                                                    ""
                                                }
                                                onChange={(e) => modify_barber((e.target.value), 'hours_start')}
                                            />

                                        </div>


                                        <div className="w-px h-8 bg-gray-200"></div>


                                        {/* END */}
                                        <div className="flex-1">

                                            <span className="text-[9px] text-gray-400 block uppercase font-bold">
                                                End
                                            </span>

                                            <input
                                                type="time"
                                                className="bg-transparent font-bold text-gray-800 outline-none w-full cursor-pointer"
                                                value={
                                                    modified_barber?.hours_end ??
                                                    selected_barber.hours_end ??
                                                    ""
                                                }
                                                onChange={(e) => modify_barber((e.target.value), 'hours_end')}
                                            />

                                        </div>

                                    </div>
                                </div>

                                {/* Role */}


                                <div className="relative flex bg-indigo-100 p-1 rounded-2xl w-full">

                                    {/* Slider */}
                                    <div
                                        className={`absolute top-1 bottom-1 w-1/2 bg-white rounded-xl
        shadow-[0_3px_10px_rgba(79,70,229,0.3),0_0_18px_rgba(79,70,229,0.2)]
        transition-transform duration-300
        ${selected_barber.userId?.role === "barber"
                                                ? "translate-x-full"
                                                : "translate-x-0"
                                            }`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => {
                                            modify_barber("barber_admin", "role");
                                            setSelected_barber({
                                                ...selected_barber,
                                                userId: { ...selected_barber.userId, role: "barber_admin" }
                                            });
                                        }}
                                        className={`relative z-10 flex-1 py-3 font-bold text-sm transition-colors
                                            ${selected_barber.userId?.role === "barber_admin"
                                                ? "text-black"
                                                : "text-gray-500"
                                            }`}
                                    >
                                        Barber Admin
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            modify_barber("barber", "role");
                                            setSelected_barber({
                                                ...selected_barber,
                                                userId: { ...selected_barber.userId, role: "barber" }
                                            });
                                        }}
                                        className={`relative z-10 flex-1 py-3 font-bold text-sm transition-colors
            ${selected_barber.userId?.role === "barber"
                                                ? "text-black"
                                                : "text-gray-500"
                                            }`}
                                    >
                                        Barber
                                    </button>

                                </div>
                            </div>


                            {/* BUTTONS */}
                            <div className="flex flex-col md:flex-row gap-4 mt-10">

                                <button
                                    className={`flex-[2] py-4 rounded-2xl font-bold transition-all shadow-xl ${modified_barbers?.length > 0
                                        ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 cursor-pointer"
                                        : "bg-gray-400 text-white cursor-not-allowed shadow-none"
                                        }`}
                                    onClick={() => submit_Data(selected_barber._id)}
                                >
                                    Update Profile
                                </button>

                                <button
                                    onClick={() => setEdit_modal(false)}
                                    className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>

                            </div>

                        </div>
                    </div>
                );

            })()}

            {/* SERVICES EDIT MODAL */}
            {services_modal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md overflow-y-auto" onClick={() => setIsServiceEditOpen(false)}>
                    <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-6 flex items-center text-indigo-700">
                            <span className="bg-indigo-100 p-1.5 rounded-md mr-2">✂️</span>
                            Service Menu & Durations
                        </h3>

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            {catalog.map((item) => {
                                const isSelected = selectedBarber.services.some(s => s.service === item._id);
                                const currentService = selectedBarber.services.find(s => s.service === item._id);
                                return (
                                    <div
                                        key={item._id}
                                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all ${isSelected ? 'border-indigo-700 bg-indigo-50/30' : 'border-gray-100 bg-gray-50 opacity-60'}`}
                                    >
                                        <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const isCurrentlySelected = selectedBarber.services.some(s => s.service === item._id);
                                                    if (isCurrentlySelected) {
                                                        setSelectedBarber({
                                                            ...selectedBarber,
                                                            services: selectedBarber.services.filter(s => s.service !== item._id)
                                                        });
                                                    } else {
                                                        setSelectedBarber({
                                                            ...selectedBarber,
                                                            services: [{ service: item._id, duration: 15 }]
                                                        });
                                                    }
                                                }}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${isSelected ? 'bg-indigo-800' : 'bg-gray-300'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isSelected ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>

                                            <div>
                                                <p className={`font-bold ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>{item.service}</p>
                                                <p className="text-xs text-gray-400">{item.price} Leke</p>
                                            </div>
                                        </div>

                                        {isSelected && currentService && (
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center bg-white border border-indigo-200 rounded-lg overflow-hidden shadow-sm">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedBarber({
                                                            ...selectedBarber,
                                                            services: [{ service: item._id, duration: Math.max(0, currentService.duration - 5) }]
                                                        })}
                                                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold cursor-pointer"
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
                                                        onClick={() => setSelectedBarber({
                                                            ...selectedBarber,
                                                            services: [{ service: item._id, duration: currentService.duration + 5 }]
                                                        })}
                                                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold cursor-pointer"
                                                    >+</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={handleSave}
                                disabled={!hasChanges()}
                                className={`flex-1 py-4 rounded-2xl font-bold transition-all shadow-xl ${hasChanges() ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 cursor-pointer' : 'bg-gray-400 text-white cursor-not-allowed shadow-none'}`}
                            >
                                Update Profile
                            </button>
                            <button onClick={() => setIsServiceEditOpen(false)} className="bg-gray-100 text-gray-500 px-6 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all cursor-pointer">Cancel</button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};

export default StaffDetails;