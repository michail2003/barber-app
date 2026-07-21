import dayjs from 'dayjs';
import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, SquareChevronRight } from 'lucide-react';

const TimePicker = ({ pickedTime }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [timeNow, setTimeNow] = useState(dayjs());
    const [openTime, setOpenTime] = useState("09:00")
    const [closeTime, setCloseTime] = useState("21:00")
    const [init, setInit] = useState()
    const [hour, setHour] = useState();
    const [minute, setMinute] = useState();
    const [rollerDirectionH, setRollerDirectionH] = useState();
    const [rollerDirectionM, setRollerDirectionM] = useState();

    const adjustHour = (amount) => {
        setRollerDirectionH(amount > 0 ? 'up' : 'down');
        setHour((prev) => {
            let next = prev + amount;
            if (next > 23) return 0;
            if (next < 0) return 23;
            return next;
        });
    };

    const adjustMinute = (amount) => {
        setRollerDirectionM(amount > 0 ? 'up' : 'down');
        setMinute((prev) => {
            let next = prev + amount;
            if (next >= 60) return 0;
            if (next < 0) return 55;
            return next;
        });
    };

    const formatNumber = (num) => String(num).padStart(2, '0');

    // Helper arrays to generate the "scroller" context look (previous and next values)
    const getHourNeighbors = () => [
        (hour - 1 + 24) % 24,
        hour,
        (hour + 1) % 24
    ];

    const getMinuteNeighbors = () => [
        (minute - 5 + 60) % 60,
        minute,
        (minute + 5) % 60
    ];

    function initialTime() {

        let currentHour = parseInt(dayjs(timeNow).format('HH'));
        let currentMinute = parseInt(dayjs(timeNow).format('mm'));

        let initialStart = { hour: currentHour, min: currentMinute };

        if (currentMinute % 10 === 0 || currentMinute % 5 === 0) {

            initialStart.min = currentMinute + 5;

        } else if (currentMinute % 10 < 5) {

            let mbetja = currentMinute % 10;
            initialStart.min = currentMinute - mbetja + 10;

        } else if (currentMinute % 5 < 5) {

            let mbetja = currentMinute % 5;
            initialStart.min = currentMinute - mbetja + 10;
        }

        if (initialStart.min >= 60) {
            initialStart.min = 5;
            initialStart.hour += 1;
        }
        if (initialStart.hour === 24) {
            initialStart.hour = 0;
        }
        return initialStart
    }
    useEffect(() => {
        const initial = initialTime();

        setInit(initial);
        setHour(initial.hour);
        setMinute(initial.min);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setInit(initialTime());
        }, 1000);

        return () => clearInterval(interval);
    }, []);
    return (
        <div className="w-full">
            {/* 1. TRIGGER BUTTON (Visible on Page) */}
            <div
                onClick={() => setModalOpen(true)}
                className="relative group cursor-pointer active:scale-95 transition-all"
            >
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                    <span className="text-indigo-500 font-black text-[10px] uppercase tracking-[0.2em]">Time</span>
                </div>

                <div className="w-full bg-gray-50 border-2 border-transparent group-hover:border-gray-200 px-16 py-5 rounded-[2rem] font-black text-2xl flex items-center justify-between">
                    <span>{`${formatNumber(hour)}:${formatNumber(minute)}` || "Select Time"}</span>
                    <span className="text-indigo-600 text-sm">▼</span>
                </div>
            </div>

            {/* 2. MODERN MODAL OVERLAY */}
            {modalOpen && (
                <div className='fixed z-20 inset-0 bg-gray-900/70 backdrop-blur-lg transition-opacity flex justify-center items-center flex-col gap-6'
                    onClick={() => setModalOpen(false)}>
                    <h1 className='md:text-2xl text-lg font-black bg-indigo-700 text-white px-4 py-2 rounded-2xl w-1/2 md:w-1/3 text-center shadow-2xl'>Pick The Time:</h1>
                    <div className="flex flex-col items-center justify-center p-6 gap-4 bg-neutral-300 shadow-2xl w-fit rounded-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center bg-white px-8 py-10 rounded-2xl shadow-md border border-neutral-100 shadow-gray-300">

                            {/* Hours Scroller */}
                            <div className="flex flex-col items-center w-16">
                                <button
                                    onClick={() => adjustHour(1)}
                                >
                                    <ChevronDown strokeWidth={1} size={30} className='rotate-180 mb-2 cursor-pointer hover:scale-150 hover:text-indigo-500 transition-all' />
                                </button>
                                <div className="flex flex-col items-center select-none pointer-events-none">
                                    <span className="text-neutral-900 text-sm opacity-50 mt-1">{formatNumber(getHourNeighbors()[2])}</span>
                                    <span key={hour} className={`text-indigo-500 text-4xl font-bold tracking-tight my-2 ${rollerDirectionH === 'up' ? 'animate-TimeChangeUp' : 'animate-TimeChangeDown'}`}>{formatNumber(getHourNeighbors()[1])}</span>
                                    <span className="text-neutral-300 text-sm opacity-50 mb-1">{formatNumber(getHourNeighbors()[0])}</span>

                                </div>
                                <button
                                    onClick={() => adjustHour(-1)}
                                >
                                    <ChevronDown strokeWidth={1} size={30} className='mt-2 cursor-pointer hover:scale-150 hover:text-indigo-500 transition-all' />
                                </button>
                            </div>

                            {/* Minimalist Divider */}
                            <div className="font-black text-3xl pb-2 self-center">:</div>

                            {/* Minutes Scroller */}
                            <div className="flex flex-col items-center w-16">
                                <button
                                    onClick={() => adjustMinute(5)}

                                >
                                    <ChevronDown strokeWidth={1} size={30} className='rotate-180 mb-2 cursor-pointer hover:scale-150 hover:text-indigo-500 transition-all' />
                                </button>
                                <div className="flex flex-col items-center select-none pointer-events-none">
                                    <span className="text-neutral-900 text-sm opacity-50 mb-1">{formatNumber(getMinuteNeighbors()[2])}</span>
                                    <span key={minute} className={`text-indigo-500 text-4xl font-bold tracking-tight my-2 ${rollerDirectionM === 'up' ? 'animate-TimeChangeUp' : 'animate-TimeChangeDown'}`}>{formatNumber(getMinuteNeighbors()[1])}</span>
                                    <span className="text-neutral-300 text-sm opacity-50 mt-1">{formatNumber(getMinuteNeighbors()[0])}</span>
                                </div>
                                <button
                                    onClick={() => adjustMinute(-5)}
                                >
                                    <ChevronDown strokeWidth={1} size={30} className=' mt-2 cursor-pointer hover:scale-150 hover:text-indigo-500 transition-all' />
                                </button>
                            </div>

                        </div>


                        <button
                            className="w-fit flex gap-3 bg-gray-900 text-white px-6 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-colors duration-150  cursor-pointer"
                            onClick={() => {
                                const selected = `${formatNumber(hour)}:${formatNumber(minute)}`;

                                pickedTime = selected;
                                setModalOpen(false);     // Close modal
                            }}
                        >
                            Confirm Selection
                        </button>

                    </div>
                </div>
            )}
        </div>
    );
};

export default TimePicker;