import React, { useState } from 'react';

const BarberShopBooking = () => {
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState("12:00");
    const [weekOffset, setWeekOffset] = useState(0);

    // Sample Data
    const services = [
        { id: 1, name: "Premium Haircut", price: 30, duration: "45 min" },
        { id: 2, name: "Beard Sculpture", price: 20, duration: "30 min" },
        { id: 3, name: "The Royal Shave", price: 25, duration: "40 min" }
    ];

    const barbers = [
        { id: 'b1', name: "Marco", img: "https://i.pravatar.cc/150?u=1", status: "Available", nextFree: null },
        { id: 'b2', name: "Enzo", img: "https://i.pravatar.cc/150?u=2", status: "Busy", nextFree: "14:30" },
        { id: 'b3', name: "Luca", img: "https://i.pravatar.cc/150?u=3", status: "Available", nextFree: null }
    ];

    // Generate dynamic dates for the scroller
    const getDates = () => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i + (weekOffset * 7));
            days.push({
                full: date.toDateString(),
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                num: date.getDate()
            });
        }
        return days;
    };

    const toggleService = (id) => {
        setSelectedServices(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const isStepComplete = selectedServices.length > 0 && selectedDate;

    return (
        <div className="min-h-screen bg-[#F9FAFB] text-gray-900 pb-12">
            {/* Header Area */}
            <div className="bg-white border-b border-gray-100 px-6 py-8">
                <h1 className="text-3xl font-black tracking-tighter">GENTLEMAN'S QUARTER</h1>
                <p className="text-gray-400 text-sm font-medium">Select your experience below</p>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-6">
                
                {/* LEFT: SELECTION STEPS */}
                <div className="lg:col-span-7 space-y-6">
                    
                    {/* 1. Services Selection */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-black uppercase tracking-widest text-indigo-600">01. Services</h2>
                            {selectedServices.length > 0 && (
                                <button onClick={() => setSelectedServices([])} className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase">Deselect All</button>
                            )}
                        </div>
                        <div className="space-y-3">
                            {services.map(s => (
                                <div 
                                    key={s.id}
                                    onClick={() => toggleService(s.id)}
                                    className={`flex justify-between items-center p-5 rounded-3xl cursor-pointer transition-all border-2 ${
                                        selectedServices.includes(s.id) ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-50 bg-gray-50/30'
                                    }`}
                                >
                                    <div>
                                        <p className="font-bold">{s.name}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.duration}</p>
                                    </div>
                                    <p className="font-black">€{s.price}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. Date & Time Scrollers */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-black uppercase tracking-widest text-indigo-600">02. Schedule</h2>
                            <div className="flex gap-2">
                                <button onClick={() => setWeekOffset(o => Math.max(0, o - 1))} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs">←</button>
                                <button onClick={() => setWeekOffset(o => o + 1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs">→</button>
                            </div>
                        </div>

                        {/* Date Rolling Tab */}
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-6">
                            {getDates().map((d, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => setSelectedDate(d.full)}
                                    className={`flex-shrink-0 w-16 h-24 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all border-2 ${
                                        selectedDate === d.full ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'border-transparent bg-gray-50'
                                    }`}
                                >
                                    <span className={`text-[10px] font-black uppercase ${selectedDate === d.full ? 'text-white/60' : 'text-gray-400'}`}>{d.day}</span>
                                    <span className="text-xl font-black mt-1">{d.num}</span>
                                </div>
                            ))}
                        </div>

                        {/* Android-Style Rolling Time Picker */}
                        <div className="relative flex justify-center py-4 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                            <input 
                                type="time" 
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                                className="text-5xl font-black bg-transparent cursor-pointer hover:text-indigo-600 transition-colors focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* RIGHT: SMART BARBER AVAILABILITY */}
                <div className="lg:col-span-5">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 sticky top-8">
                        <div className="flex items-center gap-3 mb-8">
                            <h2 className="text-lg font-black uppercase tracking-widest text-indigo-600">
                                {isStepComplete ? "Available Barbers" : "Our Barbers"}
                            </h2>
                            {isStepComplete && <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>}
                        </div>

                        <div className="space-y-4">
                            {barbers.map(barber => {
                                const isBusy = barber.status === "Busy";
                                return (
                                    <div 
                                        key={barber.id}
                                        className={`group relative p-4 rounded-3xl border-2 transition-all flex items-center gap-4 ${
                                            isStepComplete && !isBusy 
                                            ? 'border-transparent bg-gray-50 hover:border-indigo-500 cursor-pointer scale-100' 
                                            : 'border-gray-50 bg-white opacity-80'
                                        }`}
                                    >
                                        <div className="relative">
                                            <img src={barber.img} alt={barber.name} className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-sm" />
                                            <div className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full ${isBusy ? 'bg-orange-400' : 'bg-green-500'}`}></div>
                                        </div>

                                        <div className="flex-1">
                                            <p className="font-black text-gray-900">{barber.name}</p>
                                            {!isStepComplete ? (
                                                <p className="text-[10px] font-black text-gray-400 uppercase">Top Stylist</p>
                                            ) : (
                                                <div className="mt-1">
                                                    {isBusy ? (
                                                        <p className="text-[10px] font-black text-orange-500 uppercase italic">Busy at {selectedTime} • Free at {barber.nextFree}</p>
                                                    ) : (
                                                        <p className="text-[10px] font-black text-green-600 uppercase">Available at {selectedTime}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {isStepComplete && !isBusy && (
                                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                ✓
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Confirm Section */}
                        {isStepComplete && (
                            <div className="mt-8 pt-8 border-t border-gray-100">
                                <button className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all active:scale-95">
                                    Finalize Appointment
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BarberShopBooking;