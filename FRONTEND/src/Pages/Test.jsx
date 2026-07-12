import React, { use, useEffect, useState } from 'react';
import dayjs from 'dayjs';


const BarberShopBooking = () => {
    const initialTime1 = "13:00"
    const [initialHour, initialMinute] = initialTime1.split(':').map(Number);

    const [hour, setHour] = useState(initialHour);
    // Ensure the initial minute is rounded to the nearest 5 for consistency
    const [minute, setMinute] = useState(Math.round(initialMinute / 5) * 5 % 60);

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

        } else if (currentMinute % 5 > 5) {

            let mbetja = currentMinute % 5;
            initialStart.min = currentMinute - mbetja + 10;
        }

        if (initialStart.min === 60) {
            initialStart.min = 0;
            initialStart.hour += 1;
        } else if (initialStart.hour === 24) {
            initialStart.hour = 0;
        }
        return initialStart
    }
    return (
        <>
            <div className="flex items-center justify-center min-h-[300px] bg-neutral-50 p-6">
                <div className="flex items-center space-x-8 bg-white px-8 py-10 rounded-2xl shadow-sm border border-neutral-100">

                    {/* Hours Scroller */}
                    <div className="flex flex-col items-center w-16">
                        <button
                            onClick={() => adjustHour(-1)}
                            className="text-neutral-300 hover:text-neutral-600 transition-colors text-sm font-medium mb-2 p-1 focus:outline-none"
                        >
                            ✕
                        </button>
                        <div className="flex flex-col items-center select-none pointer-events-none">
                            <span className="text-neutral-300 text-sm opacity-50 mb-1">{formatNumber(getHourNeighbors()[0])}</span>
                            <span className="text-neutral-900 text-4xl font-light tracking-tight my-1">{formatNumber(getHourNeighbors()[1])}</span>
                            <span className="text-neutral-300 text-sm opacity-50 mt-1">{formatNumber(getHourNeighbors()[2])}</span>
                        </div>
                        <button
                            onClick={() => adjustHour(1)}
                            className="text-neutral-300 hover:text-neutral-600 transition-colors text-sm font-medium mt-2 p-1 focus:outline-none"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Minimalist Divider */}
                    <div className="text-neutral-300 text-3xl font-light pb-2 self-center">:</div>

                    {/* Minutes Scroller */}
                    <div className="flex flex-col items-center w-16">
                        <button
                            onClick={() => adjustMinute(-5)}
                            className="text-neutral-300 hover:text-neutral-600 transition-colors text-sm font-medium mb-2 p-1 focus:outline-none"
                        >
                            ✕
                        </button>
                        <div className="flex flex-col items-center select-none pointer-events-none">
                            <span className="text-neutral-300 text-sm opacity-50 mb-1">{formatNumber(getMinuteNeighbors()[0])}</span>
                            <span className="text-neutral-900 text-4xl font-light tracking-tight my-1">{formatNumber(getMinuteNeighbors()[1])}</span>
                            <span className="text-neutral-300 text-sm opacity-50 mt-1">{formatNumber(getMinuteNeighbors()[2])}</span>
                        </div>
                        <button
                            onClick={() => adjustMinute(5)}
                            className="text-neutral-300 hover:text-neutral-600 transition-colors text-sm font-medium mt-2 p-1 focus:outline-none"
                        >
                            ✕
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
};

export default BarberShopBooking;