import React, { use, useEffect, useState } from 'react';
import { ChevronDown, SquareChevronRight } from 'lucide-react';
import dayjs from 'dayjs';


const BarberShopBooking = () => {

    const [timeNow, setTimeNow] = useState(dayjs());
    const [openTime, setOpenTime] = useState("09:00")
    const [closeTime, setCloseTime] = useState("21:00")
    const [init, setInit] = useState()
    const [hour, setHour] = useState();
    const [minute, setMinute] = useState();

    const adjustHour = (amount) => {
        setHour((prev) => {
            let next = prev + amount;
            if (next > 23) return 0;
            if (next < 0) return 23;
            return next;
        });
    };

    const adjustMinute = (amount) => {
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
        } else if (initialStart.hour === 24) {
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
        <>
            <div
                className="relative group cursor-pointer active:scale-95 transition-all"
            >
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                    <span className="text-indigo-500 font-black text-[10px] uppercase tracking-[0.2em]">Time</span>
                </div>

                <div className="w-full bg-gray-50 border-2 border-transparent group-hover:border-gray-200 px-16 py-5 rounded-[2rem] font-black text-2xl flex items-center justify-between">
                    <span>{formatNumber(init?.hour)} : {formatNumber(init?.min)}</span>
                    <span className="text-indigo-600 text-sm">▼</span>
                </div>
            </div>

            <div className='absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity flex justify-center items-center flex-col'>
            <h1 className='text-2xl font-black'>Pick The Time:</h1>
                <div className="flex flex-col items-center justify-center p-6 gap-4">
                    <div className="flex items-center bg-white px-8 py-10 rounded-2xl shadow-md border border-neutral-100 shadow-gray-300">

                        {/* Hours Scroller */}
                        <div className="flex flex-col items-center w-16">
                            <button
                                onClick={() => adjustHour(1)}
                            >
                                <ChevronDown strokeWidth={1} size={30} className='rotate-180 mb-2' />
                            </button>
                            <div className="flex flex-col items-center select-none pointer-events-none">
                                <span className="text-neutral-900 text-sm opacity-50 mt-1">{formatNumber(getHourNeighbors()[2])}</span>
                                <span className="text-indigo-500 text-4xl font-bold tracking-tight my-1">{formatNumber(getHourNeighbors()[1])}</span>
                                <span className="text-neutral-300 text-sm opacity-50 mb-1">{formatNumber(getHourNeighbors()[0])}</span>

                            </div>
                            <button
                                onClick={() => adjustHour(-1)}
                            >
                                <ChevronDown strokeWidth={1} size={30} className='mt-2 ' />
                            </button>
                        </div>

                        {/* Minimalist Divider */}
                        <div className="font-black text-3xl pb-2 self-center">:</div>

                        {/* Minutes Scroller */}
                        <div className="flex flex-col items-center w-16">
                            <button
                                onClick={() => adjustMinute(5)}

                            >
                                <ChevronDown strokeWidth={1} size={30} className='rotate-180 mb-2' />
                            </button>
                            <div className="flex flex-col items-center select-none pointer-events-none">
                                <span className="text-neutral-900 text-sm opacity-50 mb-1">{formatNumber(getMinuteNeighbors()[2])}</span>
                                <span className="text-indigo-500 text-4xl font-bold tracking-tight my-1">{formatNumber(getMinuteNeighbors()[1])}</span>
                                <span className="text-neutral-300 text-sm opacity-50 mt-1">{formatNumber(getMinuteNeighbors()[0])}</span>
                            </div>
                            <button
                                onClick={() => adjustMinute(-5)}
                            >
                                <ChevronDown strokeWidth={1} size={30} className=' mt-2' />
                            </button>
                        </div>

                    </div>


                    <button
                        className="w-fit flex gap-3 bg-gray-900 text-white px-6 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-colors cursor-pointer"
                    >
                        Confirm Selection
                    </button>

                </div>
            </div>
        </>
    );
};

export default BarberShopBooking;