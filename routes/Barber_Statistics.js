const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');
const isoWeek = require('dayjs/plugin/isoWeek');
const mongoose = require('mongoose');

dayjs.extend(isoWeek);

const Barber_Shop = require('../models/Shop');
const { Reservation } = require('../models/Reservation');
const Barber = require('../models/barber');

function getDateRange(period) {
    const today = dayjs();
    let start, end;

    switch (period.toLowerCase()) {
        case 'weekly':
            start = today.startOf('isoWeek');
            end = today.endOf('isoWeek');
            break;
        case 'monthly':
            start = today.startOf('month');
            end = today.endOf('month');
            break;
        case 'yearly':
            start = today.startOf('year');
            end = today.endOf('year');
            break;
        case 'daily':
            start = today.startOf('day');
            end = today.endOf('day');
            break;
        default:
            return { error: "Invalid period. Choose 'daily', 'weekly', 'monthly', or 'yearly'." };
    }

    return {
        start: start.format('YYYY-MM-DDTHH:mm:ss'), // string, not Date
        end: end.format('YYYY-MM-DDTHH:mm:ss'),       // string, not Date
        displayStart: start.format('DD/MM/YYYY'),
        displayEnd: end.format('DD/MM/YYYY')
    };
}

/* =========================
   FIXED TOP BARBER (logic bug corrected, same idea)
========================= */
function getTopBarber(reservations) {

    if (!reservations || reservations.length === 0) {
        return null;
    }

    const barberCountMap = {};
    let topBarber = null;
    let maxReservations = 0;

    for (const rsv of reservations) {

        const barberId = rsv.barberId;
        const barberName = rsv.barberName;

        if (!barberCountMap[barberId]) {
            barberCountMap[barberId] = 1;
        } else {
            barberCountMap[barberId] += 1;
        }

        if (barberCountMap[barberId] > maxReservations) {
            maxReservations = barberCountMap[barberId];
            topBarber = {
                barberId,
                name: barberName,
                reservations: maxReservations
            };
        }
    }

    return topBarber;
}

/* =========================
   FIXED barberStats (safe + correct accumulation)
   (kept your object structure as requested)
========================= */
function barberStats(reservations) {

    const hashmap = {};

    for (const d of reservations) {

        const id = d.barberId;

        if (hashmap[id]) {

            hashmap[id].reservations += 1;
            hashmap[id].total_price += (d.total_price || 0);

        } else {

            hashmap[id] = {
                name: d.barberName,
                total_price: (d.total_price || 0),
                reservations: 1
            };
        }
    }

    return hashmap;
}

/* =========================
   KEPT YOUR LOGIC (already good)
========================= */
function getBusyHours(reservations) {
    const buckets = {}; // plain object, not Map — JSON-native from the start

    for (const res of reservations) {
        const hour = res.start.substring(11, 13);
        const label = `${hour}:00 - ${String(Number(hour) + 1).padStart(2, '0')}:00`;
        buckets[label] = (buckets[label] || 0) + 1;
    }

    return buckets; // already valid JSON shape, no conversion needed
}

function getPeakHour(busyHours) {
    const [peakHour, peakCount] = Object.entries(busyHours)
        .reduce((max, entry) => entry[1] > max[1] ? entry : max);
    return peakHour;
}

function getPeriodStats(reservations, period) {

    const result = {};

    for (const r of reservations) {

        const date = dayjs(r.start);
        const income = r.total_price || 0;

        let key;

        /* =========================
           YEARLY → MONTHS
        ========================= */
        if (period === 'yearly') {
            key = date.format('MMMM'); // January, February...
        }

        /* =========================
           WEEKLY → DAYS
        ========================= */
        else if (period === 'weekly') {
            key = date.format('dddd'); // Monday, Tuesday...
        }

        /* =========================
           MONTHLY → WEEK RANGES
        ========================= */
        else if (period === 'monthly') {

            const startOfWeek = date.startOf('isoWeek');
            const endOfWeek = date.endOf('isoWeek');

            key = `${startOfWeek.format('D/M')} - ${endOfWeek.format('D/M')}`;
        }

        else if (period === 'daily') {
            key = date.format('HH:00'); // 14:00, 15:00...\
        }

        /* fallback safety */
        else {
            key = date.format('YYYY-MM-DD');
        }

        if (!result[key]) {
            result[key] = {
                reservations: 0,
                income: 0
            };
        }

        result[key].reservations += 1;
        result[key].income += income;
    }
    if (period === 'daily') {
        return Object.entries(result).map(([key, value]) => ({
            period: `${key} - ${dayjs(key, 'HH:00').add(1, 'hour').format('HH:00')}`,
            ...value
        }));
    }
    /* convert object → array for frontend */
    return Object.entries(result).map(([key, value]) => ({
        period: key,
        ...value
    }));
}



/* =========================
   MAIN ROUTE
========================= */
router.get('/:shopId/overview/:period', async (req, res) => {

    const shopId = req.params.shopId;
    const period = req.params.period;

    try {
        const shop = await Barber_Shop.findById(shopId);
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        const dateRange = getDateRange(period);
        if (dateRange.error) {
            return res.status(400).json({ message: dateRange.error });
        }
        const reservations = await Reservation.aggregate([

            {
                $match: {
                    shopId: new mongoose.Types.ObjectId(shopId),
                    start: {
                        $gte: dateRange.start,
                        $lte: dateRange.end
                    },
                    status: { $eq: "confirmed" },
                }
            },

            {
                $lookup: {
                    from: "barbers",
                    localField: "barberId",
                    foreignField: "_id",
                    as: "barberId"
                }
            },
            { $unwind: "$barberId" },

            {
                $lookup: {
                    from: "users",
                    localField: "barberId.userId",
                    foreignField: "_id",
                    as: "barberUser"
                }
            },
            { $unwind: "$barberUser" },

            {
                $project: {
                    _id: 1,
                    barberId: "$barberId._id",
                    barberName: "$barberUser.name",
                    shopId: 1,
                    duration: 1,
                    services: {
                        $map: {
                            input: "$services",
                            as: "s",
                            in: "$$s.Service_name"
                        }
                    },
                    start: 1,
                    end: 1,
                    total_price: 1,
                    createdAt: 1
                }
            }
        ]);

        if (!reservations || reservations.length === 0) {
            return res.status(200).json({ message: `No reservations found for the selected period ${dateRange.displayStart} to ${dateRange.displayEnd}.` });
        }
        const totalIncome = reservations.reduce((total, r) => {
            return total + (r.total_price || 0);
        }, 0);

        const topBarber = getTopBarber(reservations);
        const barberStatsData = barberStats(reservations);
        const busyHours = getBusyHours(reservations);
        const peakHourData = getPeakHour(busyHours);
        const periodStats = getPeriodStats(reservations, period);

        return res.status(200).json({
            period,
            general_data: {
                totalReservations: reservations.length,
                totalIncome,
                topBarber,
                peakHourData
            },
            barberStats: barberStatsData,
            busyHours: busyHours,
            periodStats: periodStats,
            reservations: reservations
        });

    } catch (error) {
        console.error("The exact error is:", error);
        return res.status(500).json({
            message: 'Error fetching shop overview'
        });
    }
});

module.exports = router;