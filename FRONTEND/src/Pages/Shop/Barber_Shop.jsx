import React, { use, useEffect, useState } from 'react';
import dayjs from 'dayjs'; // Import dayjs
import { getcatalog, getbarbers, getShop } from '../../Api/Shops';
import { sendRequest } from '../../Api/Requests';
import { barbers_available } from '../../Api/reservation';
import TimePicker from '../../components/TimePicker';
import Map from '../../components/Map';
import ReviewsSection from '../../components/Reviews';
import GallerySection from '../../components/InstagramGallery';
import { Phone, CalendarPlus, ShoppingBag, Star, Images, } from 'lucide-react';

const Barber_Shop = () => {
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [selectedTime, setSelectedTime] = useState();
    const [selectedBarber, setSelectedBarber] = useState(null); // Added state for barber selection
    const [weekOffset, setWeekOffset] = useState(0);
    const [catalog, setCatalog] = useState([]);
    const [availability, setAvailability] = useState(null);
    const [Barbers, setBarbers] = useState([]);
    const [Shop, setShop] = useState({});
    const [showSummary, setShowSummary] = useState(false);
    const [stepsCompleted, setStepsCompleted] = useState(false);
    const [totalPrice, setTotalPrice] = useState(0);
    const [currentSection, setCurrentSection] = useState(1)
    const finalOutput = dayjs(`${selectedDate}${selectedTime}`).format('YYYY-MM-DDTHH:mm:ss');

    const slug = window.location.pathname.substring(1);


    const sections = [
        { secID: 1, header: "Reservation", icon: <CalendarPlus className={`size-4`} />, selected: <CalendarPlus /> },
        { secID: 2, header: "Store", icon: <ShoppingBag className={`size-4`} />, selected: <ShoppingBag /> },
        { secID: 3, header: "Gallery", icon: <Images className={`size-4`} />, selected: <Images /> },
        { secID: 4, header: "Reviews", icon: <Star className={`size-4`} />, selected: <Star /> },
        { secID: 5, header: "Contact", icon: <Phone className={`size-4`} />, selected: <Phone /> },

    ]

    async function handleReservation() {
        const payload = {
            barberId: selectedBarber.id,
            services: selectedServices,
            start: finalOutput,
            userid: localStorage.getItem('id'),

        };
        sendRequest(payload)
            .then((response) => {
                alert(response.message);
            })
            .catch((error) => {
                alert(`is booked ${error}`)
            });
    }

    const barber_availability = async () => {
        try {
            const shop = Shop._id;
            const data = {
                start: finalOutput,
                servicesID: selectedServices
            };
            const availability = await barbers_available(shop, data);
            setAvailability(availability);
        } catch (error) {
            console.error('Failed to fetch barber availability:', error);
        }
    };

    function availability_timeFormat(datetime) {
        const today = dayjs();
        const target = dayjs(datetime);
        if (today.isSame(target, 'day')) {
            return target.format('HH:mm');
        } else {
            return target.format('D/MM, HH:mm');
        }
    }
    const getDates = () => {
        const days = [];
        const startPoint = dayjs().add(weekOffset * 7, 'day');
        for (let i = 0; i < 7; i++) {
            const d = startPoint.add(i, 'day');
            days.push({
                full: d.format('YYYY-MM-DD'),
                day: d.format('ddd'),
                num: d.format('D')
            });
        }
        return days;
    };

    function AddServices(id) {
        if (!selectedServices.includes(id)) {
            setSelectedServices([...selectedServices, id]);
        } else {
            setSelectedServices(selectedServices.filter(s => s !== id));
        }
    }

    function AddBarber(barber) {
        const isAvailable = availability?.available?.some(
            b => b.id === barber.id
        );

        if (isAvailable) {
            setSelectedBarber(barber);
        } else {
            setSelectedBarber(null);
            alert('This barber is not available ');
        }
    }
    // Calculate total price based on catalog data

    useEffect(() => {
        const load = async () => {
            try {
                const [shop, barbers] = await Promise.all([
                    getShop(slug),
                    getbarbers(slug)
                ]);

                setShop(shop);
                setBarbers(barbers);

                const catalog = await getcatalog(shop._id);
                setCatalog(catalog);

            } catch (err) {
                console.error(err);
            }
        };

        load();
    }, []);

    useEffect(() => {
        if (selectedServices.length > 0 && finalOutput) {
            barber_availability();
        }
        if (selectedServices.length === 0) {
            setSelectedBarber(null);
            setAvailability(null);
        }
        if (selectedBarber && finalOutput && selectedServices.length > 0) {
            const total = catalog
                .filter(s => selectedServices.includes(s._id))
                .reduce((sum, s) => sum + Number(s.price), 0);
            setTotalPrice(total);
            setStepsCompleted(true);
        }

    }, [finalOutput, selectedServices, selectedBarber]);

    useEffect(() => {
        if (selectedBarber) {
            const isAvailable = availability?.available?.some(
                b => b.id === selectedBarber.id
            );
            if (!isAvailable) {
                setSelectedBarber(null);
            }
        }
    }, [availability]);

    return (
        <div className="min-h-screen bg-[#F9FAFB] text-gray-900 pb-12">
            {/* Hero Section */}
            <div className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden shadow-2xl bg-gray-900 group">
                <img
                    src={Shop.cover_photo}
                    alt='Hero'
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 md:p-12">
                    <div className="max-w-4xl">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter uppercase leading-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                            {Shop.name}
                        </h1>
                        <div className="flex items-center gap-4 mt-4 text-white/80 font-bold text-xs uppercase tracking-[0.2em]">
                            <span className="flex items-center gap-1.5">
                                <span className="text-amber-400">★</span> 4.9 Rating
                            </span>
                            <span className="w-1 h-1 bg-white/30 rounded-full"></span>
                            <span>{Shop.address}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* bar sections */}
            <div className="max-w-xl mx-auto my-6 p-1.5 bg-slate-200/60 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-inner">
                <div className="grid grid-cols-5 gap-1.5">
                    {sections.map((s) => {
                        const selected = s.secID === currentSection;
                        return (
                            <button
                                key={s.secID}
                                onClick={() => setCurrentSection(s.secID)}
                                className={`relative flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ease-out select-none ${selected
                                    ? 'bg-white text-slate-900 shadow-md shadow-slate-200/50 scale-[1.02] border border-slate-100'
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                                    }`}
                            >
                                {/* Subtle active accent indicator dot */}
                                {selected && (
                                    <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-indigo-500" />
                                )}

                                {!selected ? (
                                    <>
                                        <div className="flex flex-col items-center">
                                            <span className="text-slate-400">{s.icon}</span>
                                            <span className="truncate">{s.header}</span>

                                        </div>
                                    </>
                                ) : (
                                    <span className="truncate">
                                        {s.selected}
                                    </span>
                                )}

                            </button>
                        );
                    })}
                </div>
            </div>
            {/* section 1 (reservation) */}
            {currentSection === 1 &&
                < div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-6">
                    <div className="lg:col-span-7 space-y-6">
                        {/* 1. Services Selection */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-black uppercase tracking-widest text-indigo-600">01. Services</h2>
                                {selectedServices.length > 0 && (
                                    <button onClick={() => { setSelectedServices([]); setSelectedBarber(null); setAvailability(null); setSelectedDate(dayjs().format('YYYY-MM-DD')); setSelectedTime(dayjs().format('HH:mm')) }} className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase">Deselect All</button>
                                )}
                            </div>
                            <div className="space-y-3">
                                {catalog.map(s => (
                                    <div
                                        key={s._id}
                                        onClick={() => AddServices(s._id)}
                                        className={`flex justify-between items-center p-5 rounded-3xl cursor-pointer transition-all border-2 ${selectedServices.includes(s._id) ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-50 bg-gray-50/30'}`}
                                    >
                                        <div>
                                            <p className="font-bold">{s.service}</p>
                                        </div>
                                        <p className="font-black">{s.price} lekë</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. Schedule */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-black uppercase tracking-widest text-indigo-600">02. Schedule</h2>
                                <div className="flex gap-2">
                                    <button onClick={() => setWeekOffset(o => Math.max(0, o - 1))} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs cursor-pointer">←</button>
                                    <button onClick={() => setWeekOffset(o => o + 1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs">→</button>
                                </div>
                            </div>

                            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-6">
                                {getDates().map((d, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setSelectedDate(d.full)}
                                        className={`flex-shrink-0 w-16 h-24 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all border-2 ${selectedDate === d.full ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'border-transparent bg-gray-50'}`}
                                    >
                                        <span className={`text-[10px] font-black uppercase ${selectedDate === d.full ? 'text-white/60' : 'text-gray-400'}`}>{d.day}</span>
                                        <span className="text-xl font-black mt-1">{d.num}</span>
                                    </div>
                                ))}
                            </div>
                            <TimePicker pickedTime={setSelectedTime} />
                        </div>
                    </div>

                    {/* Right Column: Barbers & Summary */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* 3. Barbers Section */}
                        {availability ? (
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-8">
                                    <h2 className="text-lg font-black uppercase tracking-widest text-indigo-600">
                                        Available Barbers
                                    </h2>
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                                </div>

                                <div className="space-y-4">
                                    {[...availability.available, ...availability.busy].map((barber) => {
                                        const isBusy = barber.status === 'busy';
                                        return (
                                            <div
                                                key={barber.id}
                                                onClick={() => {
                                                    AddBarber(barber);
                                                }}
                                                className={`group relative p-4 rounded-3xl border-2 transition-all flex items-center gap-4 ${!isBusy
                                                    ? selectedBarber?.id === barber.id
                                                        ? 'border-indigo-600 bg-indigo-50 shadow-md'
                                                        : 'border-transparent bg-gray-50 hover:border-indigo-400 cursor-pointer shadow-sm'
                                                    : 'border-gray-50 bg-white opacity-80'
                                                    }`}
                                            >
                                                <div className="relative">
                                                    <img
                                                        src="https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"
                                                        alt={barber.name}
                                                        className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-sm"
                                                    />
                                                    <div className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full ${isBusy ? 'bg-orange-400' : 'bg-green-500'}`}></div>
                                                </div>

                                                <div className="flex-1">
                                                    <p className="font-black text-gray-900">{barber.name}</p>
                                                    <div className="mt-1">
                                                        {isBusy ? (
                                                            <p className="text-[10px] font-black text-orange-500 uppercase italic">
                                                                Busy • Back at {availability_timeFormat(barber.next_available_start)}
                                                            </p>
                                                        ) : (
                                                            <p className="text-[10px] font-black text-green-600 uppercase">
                                                                Available Now
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : Barbers ? (
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-8">
                                    <h2 className="text-lg font-black uppercase tracking-widest text-indigo-600">
                                        Barbers
                                    </h2>
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                                </div>
                                <div className="space-y-4">
                                    {Barbers.map((barber) => (
                                        <div key={barber.id} className="group relative p-4 rounded-3xl border-2 transition-all flex items-center gap-4 border-transparent bg-gray-50 hover:border-indigo-400 cursor-pointer shadow-sm">
                                            <div className="relative">
                                                <img
                                                    src="https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"
                                                    alt={barber.name}
                                                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-sm"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-black text-gray-900">{barber.name}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic p-8">Loading barbers...</p>
                        )}

                        {stepsCompleted && (
                            <div className="align-middle text-center mt-6">
                                <button
                                    onClick={() => setShowSummary(true)}
                                    className="justify-center bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-indigo-900 hover:-translate-y-0.5 transition-all active:scale-95 border border-indigo-700"
                                >
                                    Reservo
                                </button>
                            </div>

                        )}
                        {/* 4. Booking Summary Box */}
                        {showSummary &&
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowSummary(false)}>
                                {/* Modal Container */}
                                <div className="relative w-full max-w-md bg-indigo-900 rounded-[2.5rem] p-8 shadow-2xl text-white">

                                    {/* Close Button (Optional but recommended) */}
                                    <button className="absolute top-6 right-6 text-indigo-300 hover:text-white transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>

                                    <h2 className="text-lg font-black uppercase tracking-widest text-indigo-300 mb-6">
                                        Summary
                                    </h2>

                                    <div className="space-y-4">
                                        {/* Services Section */}
                                        <div className="border-b border-indigo-800 pb-4">
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Services</p>
                                            {selectedServices.length > 0 ? (
                                                <p className="text-sm font-bold">
                                                    {catalog.filter(s => selectedServices.includes(s._id)).map(s => s.service).join(', ')}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-indigo-300/50 italic">None selected</p>
                                            )}
                                        </div>

                                        {/* Date, Time & Barber Grid */}
                                        <div className="grid grid-cols-2 gap-4 border-b border-indigo-800 pb-4">
                                            <div>
                                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Date & Time</p>
                                                <p className="text-sm font-bold">{dayjs(selectedDate).format('MMM D, YYYY')}</p>
                                                <p className="text-sm font-bold text-indigo-300">{selectedTime}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Barber</p>
                                                <p className="text-sm font-bold">{selectedBarber ? selectedBarber.name : "Not selected"}</p>
                                            </div>
                                        </div>

                                        {/* Total Price */}
                                        <div className="flex justify-between items-center pt-2">
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Total Price</p>
                                            <p className="text-2xl font-black">{totalPrice} lekë</p>
                                        </div>

                                        {/* Confirm Button */}
                                        <button
                                            disabled={!selectedBarber || selectedServices.length === 0}
                                            onClick={() => handleReservation()}
                                            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${selectedBarber && selectedServices.length > 0
                                                ? 'bg-white text-indigo-900 hover:bg-indigo-50 shadow-lg'
                                                : 'bg-indigo-800 text-indigo-400 cursor-not-allowed'
                                                }`}
                                        >
                                            Confirm Booking
                                        </button>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            }

            {/* section 2 (store) */}
            {currentSection === 2 &&
                <div className="md:mx-20 p-4 md:p-8 rounded-2xl shadow-lg border border-indigo-200">
                    
                </div>
            }

            {currentSection === 3 &&
                <div className="md:mx-20 p-4 md:p-8 rounded-2xl shadow-lg border border-indigo-200">
                    <GallerySection />
                </div>
            }

            {/* section 4 (reviews) */}
            {currentSection === 4 &&
                <div className="md:mx-120 p-4 md:p-8 rounded-2xl shadow-lg border border-indigo-200">
                    <ReviewsSection shopId={Shop?._id} />
                </div>
            }

            {/* section 5 (info) */}
            {currentSection === 5 && (
                <div className="w-full max-w-6xl mx-auto my-8 p-4 md:p-8 bg-slate-50 text-slate-800 rounded-2xl shadow-lg border border-slate-200/80">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch min-h-[500px] md:h-[700px]">

                        {/* Left Details Panel (Shop Info + Barbers) */}
                        <div className="flex-1 flex flex-col justify-between p-6 md:p-8 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-y-auto max-h-[700px]">

                            <div>
                                <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">
                                    Get in Touch
                                </span>
                                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1 mb-6">
                                    Visit & Contact Us
                                </h2>

                                {/* Shop Details */}
                                <div className="space-y-4 pb-6 border-b border-slate-100">
                                    {/* Address */}
                                    <div className="flex items-start gap-3.5">
                                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Location</p>
                                            <p className="text-sm md:text-base font-semibold text-slate-700 mt-0.5">
                                                {Shop.address}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="flex items-start gap-3.5">
                                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Shop Phone</p>
                                            <a
                                                href={`tel:${Shop.phone}`}
                                                className="text-sm md:text-base font-semibold text-slate-700 hover:text-indigo-600 transition-colors mt-0.5 block"
                                            >
                                                {Shop.phone}
                                            </a>
                                        </div>
                                    </div>

                                    {/* Hours */}
                                    <div className="flex items-start gap-3.5">
                                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Working Hours</p>
                                            <p className="text-sm md:text-base font-semibold text-slate-700 mt-0.5">
                                                {Shop.hours_start} - {Shop.hours_end}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Our Team / Barbers Section */}
                                <div className="mt-6">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                                        Our Barbers
                                    </h3>

                                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                                        {Barbers.map((b) => (
                                            <div
                                                key={b._id || b.name}
                                                className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all"
                                            >
                                                <img
                                                    src={b.avatar || "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"}
                                                    alt={b.name}
                                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/20 shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-slate-800 truncate">{b.name}</h4>
                                                    <p className="text-xs font-medium text-slate-500">
                                                        {b.working_hours[0]} - {b.working_hours[1]}
                                                    </p>
                                                </div>
                                                <div className='flex gap-4'>
                                                    <a
                                                        href={`tel:${b.phone}`}
                                                        className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                                                    >
                                                        <Phone />
                                                    </a>

                                                    <a
                                                        href={`https://wa.me/${b.phone.replace("+", "")}`}
                                                        target="_blank"
                                                        className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 32 32"
                                                            className="w-6 h-6"
                                                        >
                                                            <path
                                                                fill="#fff"
                                                                stroke="#4F46E5"
                                                                strokeWidth="2"
                                                                d="M16 2.9A13.1 13.1 0 0 0 4.9 23L3 29l6.2-1.8A13.1 13.1 0 1 0 16 2.9z"
                                                            />
                                                            <g transform="translate(2.5,2.5) scale(0.85)">
                                                                <path
                                                                    fill="#4F46E5"
                                                                    d="M22.7 18.6c-.4-.2-2.4-1.2-2.8-1.3-.4-.1-.6-.2-.9.2-.3.4-1 1.3-1.2 1.5-.2.3-.4.3-.8.1-.4-.2-1.7-.6-3.2-2-1.2-1.1-2-2.5-2.2-2.9-.2-.4 0-.6.2-.8.2-.2.4-.4.6-.6.2-.2.3-.4.4-.6.1-.2 0-.5 0-.7-.1-.2-.9-2.2-1.2-3-.3-.8-.6-.7-.9-.7h-.8c-.3 0-.7.1-1 .5-.3.4-1.3 1.3-1.3 3.2s1.3 3.7 1.5 4c.2.3 2.5 3.9 6 5.5.8.4 1.4.6 1.9.8.8.3 1.6.3 2.2.2.7-.1 2.4-1 2.8-1.9.3-.9.3-1.7.2-1.9-.1-.2-.4-.3-.8-.5z"
                                                                />
                                                            </g>
                                                        </svg>
                                                    </a>
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Status */}
                            <div className="pt-4 mt-6 border-t border-slate-100 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-xs font-semibold text-slate-500">Open for appointments</span>
                            </div>

                        </div>

                        {/* Map Section */}
                        <div className="w-full md:w-1/2 h-[350px] md:h-full rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                            <Map shop={Shop} />
                        </div>

                    </div>
                </div>
            )}
        </div >
    );
};

export default Barber_Shop;