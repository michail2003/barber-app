import React, { useState, useEffect } from 'react';
import { ChevronsUp, ContactRound, Clock, Phone } from 'lucide-react';
import { barber_reservations } from '../../Api/reservation';
import dayjs from 'dayjs';
import isoWeek from "dayjs/plugin/isoWeek";
import weekday from "dayjs/plugin/weekday";

dayjs.extend(isoWeek);
dayjs.extend(weekday);
const Reservations = () => {
    const [reservimet, setReservimet] = useState([]);
    const [actionModalOpen, setActionModalOpen] = useState(false);
    const id = localStorage.getItem('id');
    const [Now_reservation, setNow_reservation] = useState(null);
    const [Day, setDay] = useState(dayjs().format('YYYY-MM-DD'));
    const [weekDays, setWeekDays] = useState([]);

    useEffect(() => {
        if (id && Day) {
            fetchreservations();
            weekDisplay();
        }
    }, [id, Day]);

    const fetchreservations = async () => {
        try {
            const data = await barber_reservations(id, Day);
            // Handle both direct array and object with reservations property
            const reservations = Array.isArray(data) ? data : data.reservations || [];
            setReservimet(reservations);
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

    // Helper: Format Time (24h format)
    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    // Group reservations by day (sorted by date, newest first)
    const sortedReservations = [...reservimet].sort(
        (a, b) => dayjs(b.start).valueOf() - dayjs(a.start).valueOf()
    );

    const grouped = sortedReservations.reduce((acc, res) => {
        const d = dayjs(res.start);

        const dayLabel = d.isSame(dayjs(), "day")
            ? "Today"
            : d.format("dddd, D MMMM");

        if (!acc[dayLabel]) acc[dayLabel] = [];
        acc[dayLabel].push(res);

        return acc;
    }, {});

    function weekDisplay() {
        let start = dayjs(Day).startOf('isoWeek').format('YYYY-MM-DD');
        const weekDays = [];
        for (let i = 0; i < 7; i++) {
            weekDays.push(dayjs(start).add(i, 'day').format('YYYY-MM-DD'));
        }
        setWeekDays(weekDays);
    }
    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans relative">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Reservations</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage and track your upcoming bookings.</p>
                    </div>
                </header>
                {/* calendar navigation */}
                <div className="flex items-center justify-between md:gap-4 gap-2 mb-6 w-full">

                    <button className="md:px-6 md:py-4 md:shadow-lg md:border md:border-blue-100 text-gray-700 md:rounded-3xl group transition-colors cursor-pointer"
                        onClick={() => {
                            const prevDay = dayjs(Day).startOf('isoWeek').subtract(1, 'week').format('YYYY-MM-DD');
                            setReservimet([])
                            setDay(prevDay);
                        }}
                    >
                        <span className='flex items-center gap-2 md:text-base'><ChevronsUp className="transform rotate-270 text-blue-600 group-hover:-translate-x-3 transition-transform duration-200" /><p className="hidden md:block">Back</p></span>
                    </button>

                    <div className="flex items-center justify-between md:gap-8 gap-4 md:py-4 py-2 overflow-x-auto px-4 bg-white rounded-3xl shadow-sm border border-gray-100">
                        {weekDays.map((day) => (
                            dayjs().isSame(day, 'day') ? (
                                <span className={`md:text-base text-xs ${dayjs().isSame(Day, 'day') ? 'text-blue-600 border-l-0 border-r-0 border-t-0 border-b-2 py-2 transition-[padding,color] duration-200' : 'text-black'} cursor-pointer font-black`}
                                    key={day}
                                    onClick={() => { setReservimet([]); setDay(day) }}
                                >
                                    Today
                                </span>
                            ) :
                                dayjs(day).isSame(Day, 'day') ? (

                                    <span className="md:text-sm font-black text-blue-600 text-xs ease-in duration-200"
                                        key={day}
                                    >
                                        {dayjs(day).format('ddd, D MMM')}
                                    </span>

                                ) : (
                                    <div>
                                        <span className="hidden md:block text-sm font-medium text-gray-700 cursor-pointer"
                                            key={day}
                                            onClick={() => { setReservimet([]); setDay(day) }}
                                        >
                                            {dayjs(day).format('ddd, D MMM')}
                                        </span>

                                        <span className="md:hidden block text-sm font-medium text-gray-700 cursor-pointer"
                                            onClick={() => { setReservimet([]); setDay(day) }}
                                        >
                                            {dayjs(day).format('ddd')}
                                        </span>
                                    </div>
                                )))}
                    </div>

                    <button className="md:px-6 md:py-4 md:shadow-lg md:border md:border-blue-100 text-gray-700 md:rounded-3xl group transition-colors cursor-pointer"
                        onClick={() => {
                            const nextWeek = dayjs(Day).startOf('isoWeek').add(1, 'week').format('YYYY-MM-DD');
                            setDay(nextWeek);
                            setReservimet([])

                        }}
                    >
                        <span className='flex items-center gap-2 md:text-base'><p className="hidden md:block">Next</p><ChevronsUp className="transform rotate-90 text-blue-600 group-hover:translate-x-3 transition-transform duration-200" /></span>
                    </button>
                </div>
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

                            <div className=""> {/* Removed background/border here to allow rows to 'float' */}
                                {/* Mobile View (Card List) */}
                                <div className="md:hidden flex flex-col gap-5">
                                    {grouped[day].map((res, idx) => {

                                        const current = sortedReservations.find(res =>
                                            dayjs().isAfter(dayjs(res.start)) && dayjs().isBefore(dayjs(res.end))
                                        );

                                        const isCurrent = res._id === current?._id;

                                        return (
                                            <div
                                                key={idx}
                                                className={`p-6 space-y-5 rounded-3xl shadow-sm border border-gray-100 ${isCurrent ? "bg-black text-white" : "bg-white"
                                                    }`}
                                            >

                                                {/* Time + Status */}
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                            Schedule
                                                        </p>

                                                        <p className={`flex gap-2 items-center text-sm font-black ${isCurrent ? "text-white" : "text-gray-900"
                                                            }`}>
                                                            <Clock />{formatTime(res.start)} — {formatTime(res.end)}
                                                        </p>
                                                    </div>

                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusStyle(res.status)}`}>
                                                        {res.status || "Scheduled"}
                                                    </span>
                                                </div>


                                                {/* Customer + Phone */}
                                                <div className="grid grid-cols-2 gap-4">

                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                            Customer
                                                        </p>

                                                        <p className={`text-sm font-bold flex gap-2 items-center ${isCurrent ? "text-white" : "text-gray-700"
                                                            }`}>
                                                            <ContactRound /> {res.customerName || "N/A"}
                                                        </p>
                                                    </div>


                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                            Phone
                                                        </p>

                                                        <p className={`flex  gap-2 text-sm font-mono text-[13px] ${isCurrent ? "text-gray-300" : "text-gray-500"
                                                            }`}>
                                                            <Phone /> {res.CustomerNumber || "N/A"}
                                                        </p>
                                                    </div>

                                                </div>


                                                {/* Services */}
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                        Services Included
                                                    </p>

                                                    <ul className={`text-xs font-bold list-disc list-inside space-y-1 ${isCurrent ? "text-gray-200" : "text-gray-600"
                                                        }`}>
                                                        {res.services?.map((service, sIdx) => (
                                                            <li key={sIdx}>
                                                                {service}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>


                                                {/* Price + Remaining */}
                                                <div className="pt-4 border-t border-gray-100 flex justify-between items-end">

                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                            Total Price
                                                        </p>

                                                        <p className={`text-2xl font-black leading-none ${isCurrent ? "text-white" : "text-gray-900"
                                                            }`}>
                                                            {res.total_price || "0.00"} Lek
                                                        </p>
                                                    </div>


                                                    {isCurrent && (
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                                Remaining
                                                            </p>

                                                            <p className="font-BlackOps text-2xl leading-none text-red-700">
                                                                {dayjs(res.end).diff(dayjs(), "minute")} min left
                                                            </p>
                                                        </div>
                                                    )}

                                                </div>

                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Desktop View (Floating Rows) */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left border-separate border-spacing-y-4">
                                        <thead>
                                            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
                                                <th className="pl-8 pr-4 pb-2">Schedule</th>
                                                <th className="px-6 pb-2">Customer</th>
                                                <th className="px-6 pb-2">Phone</th>
                                                <th className="px-6 pb-2">Status</th>
                                                <th className="px-6 pb-2">Services</th>
                                                <th className="pr-8 pb-2 text-right">Total Price</th>

                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {grouped[day].map((res, idx) => {
                                                const current = sortedReservations.find(res =>
                                                    dayjs().isAfter(dayjs(res.start)) && dayjs().isBefore(dayjs(res.end))
                                                );
                                                const isCurrent = res._id === current?._id;
                                                const cellBg = isCurrent ? 'bg-black text-white border-color-white' : 'bg-white';

                                                const remaining_time = () => {

                                                    let end = dayjs(current.end).add(1,'minutes')
                                                    let bymin = end.diff(dayjs(), "minute")

                                                    if(bymin == 1){
                                                        return `${dayjs(current.end).diff(dayjs(), "second")} seconds left`
                                                    } else {
                                                        return `${bymin} minutes left`
                                                    }
                                                }
                                                return (
                                                    <tr key={idx} className="group hover:translate-y-[-2px] transition-all duration-200 cursor-pointer">
                                                        {/* First Cell: Left Rounding */}
                                                        <td className={`${cellBg} border-y border-l border-gray-100 rounded-l-[2rem] shadow-sm pl-8 pr-4 py-6`}>
                                                            <div className="flex flex-col">
                                                                <span className={`font-black leading-none mb-1 transition-colors ${isCurrent ? 'text-white' : 'text-gray-800 group-hover:text-blue-600'}`}>
                                                                    {formatTime(res.start)}
                                                                </span>
                                                                <span className={`text-[11px] font-bold uppercase ${isCurrent ? 'text-gray-300' : 'text-gray-400'}`}>
                                                                    to {formatTime(res.end)}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* Middle Cells: Standard Background */}
                                                        <td className={`${cellBg} border-y border-gray-100 shadow-sm px-6 py-6 font-bold ${isCurrent ? '' : 'text-gray-700'}`}>
                                                            {res.customerName || 'N/A'}
                                                        </td>
                                                        <td className={`${cellBg} border-y border-gray-100 shadow-sm px-6 py-6 font-mono text-[13px] tracking-tighter ${isCurrent ? 'text-gray-300' : 'text-gray-400'}`}>
                                                            {res.CustomerNumber || 'N/A'}
                                                        </td>
                                                        <td className={`${cellBg} border-y border-gray-100 shadow-sm px-6 py-6`}>
                                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${getStatusStyle(res.status)}`}>
                                                                {res.status || 'Scheduled'}
                                                            </span>
                                                        </td>

                                                        <td className={`${cellBg} border-y border-gray-100 shadow-sm px-6 py-6`}>
                                                            <ul className={`text-[11px] font-bold list-disc list-inside space-y-0.5 ${isCurrent ? 'text-gray-200' : 'text-gray-600'}`}>
                                                                {res.services && res.services.map((service, sIdx) => (
                                                                    <li key={sIdx}>{service}</li>
                                                                ))}
                                                            </ul>
                                                        </td>

                                                        {/* Last Cell: Right Rounding */}
                                                        <td className={`${cellBg} ${!isCurrent ? 'border-y border-r border-gray-100 rounded-r-[2rem] ' : ' border-y border-gray-100'}shadow-sm pr-8 py-6 text-right`}>
                                                            <span className={`text-lg font-black ${isCurrent ? 'text-white' : 'text-gray-900'}`}>
                                                                {res.total_price || '0.00'} Lek
                                                            </span>
                                                        </td>

                                                        <td className={`${cellBg} ${!isCurrent ? 'hidden' : ''} border-y border-r border-gray-100 rounded-r-[2rem] shadow-sm pr-8 py-6 text-right`}>
                                                            <span className={`font-BlackOps text-2xl leading-none mb-1 ${isCurrent ? 'text-red-700' : 'text-gray-800'}`}>
                                                                {current? remaining_time():''}
                                                            </span>
                                                        </td>

                                                    </tr>
                                                )

                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div >

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

        </div >
    );
};

export default Reservations;