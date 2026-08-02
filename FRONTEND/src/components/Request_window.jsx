import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import "dayjs/locale/sq";
import { io } from 'socket.io-client';
import { barberRequests, sendRequest, RequestAnswer } from '../Api/Requests';

const Request_window = () => {
    const [barberID, setBarberID] = useState(localStorage.getItem('id'));
    const [requests, setRequests] = useState([]);
    const [reqIndex, setReqIndex] = useState(0);

    // UI state for modal toggle
    const [isOpen, setIsOpen] = useState(false);

    function handleNext() {
        if (reqIndex < requests.length - 1) {
            setReqIndex(reqIndex + 1);
        }
    }

    function handleBack() {
        if (reqIndex > 0) {
            setReqIndex(reqIndex - 1);
        }
    }

    function barber_answer(answer) {
        RequestAnswer(requests[reqIndex]?._id, answer);
    }

    useEffect(() => {
        if (barberID) {
            // initial load
            barberRequests(barberID)
                .then(data => setRequests(data.requests.reverse()))
                .catch(error => console.error('Error fetching barber requests:', error));

            // socket connection
            const socket = io('http://localhost:5000', {
                query: { barberId: barberID }
            });

            // listen for new requests
            socket.on('new-request', (request) => {
                setRequests(prev => [request, ...prev]);
            });

            // cleanup on unmount
            return () => {
                socket.off('new-request');
                socket.disconnect();
            };
        }
    }, [barberID]);

    return (
        <>
            {/* Full Screen Overlay Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md transition-all duration-300">
                    {/* Backdrop Click to Close */}
                    <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

                    {/* Main Container */}
                    <div className="relative w-full max-w-xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden flex flex-col z-10 transition-transform duration-300">

                        {/* Header Bar */}
                        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 text-white px-5 py-4 flex items-center justify-between shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-indigo-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="font-bold text-base leading-tight tracking-wide">Booking Requests</h2>
                                    <p className="text-xs text-indigo-200 font-medium">
                                        {requests.length > 0
                                            ? `Request ${reqIndex + 1} of ${requests.length}`
                                            : "No active requests"}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/10"
                                aria-label="Close modal"
                            >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content with Integrated Side Navigation */}
                        <div className="relative p-4 sm:p-5 flex items-center justify-between gap-2 sm:gap-4">

                            {/* High-Visibility PREVIOUS Button */}
                            {requests.length > 0 && (
                                <button
                                    onClick={() => handleBack()}
                                    disabled={reqIndex === 0}
                                    className={`shrink-0 h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-md ${reqIndex === 0
                                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105 active:scale-95 shadow-indigo-600/30'
                                        }`}
                                    aria-label="Previous Request"
                                >
                                    <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                            )}

                            {/* Main Card Content */}
                            <div className="flex-1 space-y-3">
                                {requests.length > 0 && requests[reqIndex] ? (
                                    <>
                                        {/* User Info Header Card */}
                                        <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                                            <div>
                                                <span className="text-sm font-bold text-indigo-600 uppercase tracking-wider block mb-0.5">{requests[reqIndex].userid.name}</span>
                                            </div>
                                            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full uppercase tracking-wide border border-indigo-200">
                                                {requests[reqIndex].status}
                                            </span>
                                        </div>

                                        {/* Date & Time Highlights */}
                                        <div className="grid grid-cols-2 gap-2.5">
                                            <div className="bg-indigo-50/60 p-3 rounded-2xl border border-indigo-100/80">
                                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Date</span>
                                                <p className="text-xs sm:text-sm font-bold text-indigo-950 capitalize mt-0.5">
                                                    {dayjs(requests[reqIndex].start.split("T")[0]).locale("sq").format("dddd D MMMM")}
                                                </p>
                                            </div>
                                            <div className="bg-indigo-50/60 p-3 rounded-2xl border border-indigo-100/80">
                                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Time & Duration</span>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <svg className="w-3.5 h-3.5 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <p className="text-xs sm:text-sm font-bold text-indigo-950">
                                                        {requests[reqIndex]?.start.split("T")[1].slice(0, 5)} - {requests[reqIndex]?.end.split("T")[1].slice(0, 5)}
                                                    </p>
                                                </div>
                                                <span className="text-[11px] text-indigo-600 font-medium block mt-0.5">
                                                    {requests[reqIndex].duration} minutes
                                                </span>
                                            </div>
                                        </div>

                                        {/* Services Breakdown */}
                                        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm space-y-2">
                                            <div className="flex justify-between items-baseline border-b border-slate-100 pb-1.5">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Services Requested</span>
                                                <span className="text-[11px] font-semibold text-slate-400">
                                                    {requests[reqIndex].services.length} item(s)
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                {requests[reqIndex].services.map((service, idx) => (
                                                    <div key={idx} className="flex items-center text-xs">
                                                        <span className="text-slate-700 font-semibold flex items-center gap-2">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                                                            {service.name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Amount</span>
                                                <span className="text-lg font-extrabold text-indigo-600">
                                                    {requests[reqIndex].total_price} Lek
                                                </span>
                                            </div>
                                        </div>

                                        {/* Color-Coded Actions: Reject (Red), Call (Samsung Light Blue), Accept (Green) */}
                                        <div className="grid grid-cols-3 gap-2 pt-1">
                                            {/* Reject Button (Red) */}
                                            <button
                                                className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-2 rounded-xl text-xs sm:text-sm transition-all duration-200 shadow-md shadow-rose-600/20 active:scale-95 flex items-center justify-center gap-1"
                                                onClick={() => barber_answer("cancelled")}
                                            >
                                                Reject
                                            </button>

                                            {/* Call Button (Samsung Light Blue) */}
                                            <a
                                                href={`tel:${requests[reqIndex].userid.ph_number}`}
                                                className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-2 rounded-xl text-xs sm:text-sm transition-all duration-200 shadow-md shadow-sky-500/20 active:scale-95 flex items-center justify-center gap-1.5"
                                            >
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                Call
                                            </a>

                                            {/* Accept Button (Green) */}
                                            <button
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-2 rounded-xl text-xs sm:text-sm transition-all duration-200 shadow-md shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-1"
                                                onClick={() => barber_answer("accepted")}
                                            >
                                                Accept
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    /* Empty State */
                                    <div className="py-10 text-center space-y-3">
                                        <div className="h-14 w-14 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto">
                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                        </div>
                                        <h4 className="text-base font-bold text-slate-800">No Pending Requests</h4>
                                        <p className="text-xs text-slate-500 max-w-xs mx-auto">
                                            You are all caught up! New customer requests will pop up here in real-time.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* High-Visibility NEXT Button */}
                            {requests.length > 0 && (
                                <button
                                    onClick={() => handleNext()}
                                    disabled={reqIndex + 1 === requests.length}
                                    className={`shrink-0 h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-md ${reqIndex + 1 === requests.length
                                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105 active:scale-95 shadow-indigo-600/30'
                                        }`}
                                    aria-label="Next Request"
                                >
                                    <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Permanent Floating Sphere Button */}
            <div className="fixed bottom-6 right-6 z-40">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="group relative bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-300 transform hover:scale-110 flex items-center justify-center border border-indigo-400/30"
                    aria-label="Open requests window"
                >
                    {/* Chat/Notification Sphere Icon */}
                    <svg className="w-7 h-7 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>

                    {/* Notification Badge */}
                    {requests.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-black rounded-full h-6 w-6 flex items-center justify-center border-2 border-white shadow-md animate-bounce">
                            {requests.length}
                        </span>
                    )}
                </button>
            </div>
        </>
    );
};

export default Request_window;