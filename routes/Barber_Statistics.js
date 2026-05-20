const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');
const isoWeek = require('dayjs/plugin/isoWeek');
const mongoose = require('mongoose');
dayjs.extend(isoWeek);

const Barber_Shop = require('../models/Shop');
const { Reservation } = require('../models/Reservation');
const Barber = require('../models/barber');

// Modified to return native ISO strings for MongoDB queries
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
        // Keeping .toDate() allows Mongoose to query the dates perfectly
        start: start.toDate(),
        end: end.toDate(),
        // For your API response display
        displayStart: start.format('DD/MM/YYYY'),
        displayEnd: end.format('DD/MM/YYYY')
    };
}

function getTopBarber(reservations) {
    if (!reservations || reservations.length === 0) {
        return null;
    }

    const barberCountMap = {};
    let topBarberId = null;
    let maxReservations = 0;

    reservations.forEach(rsv => {
        // Fallback to 'Unknown' if barberId happens to be missing in a bad document
        const barber = { id: rsv.barberId, name: rsv.barberName };

        // Increment the count in our hash map
        // If the barber doesn't exist in our map yet, start their count at 1
        if (!barberCountMap[barber.id]) {
            barberCountMap[barber.id] = 1;
        } else {
            // If they are already in the map, just add 1 to their existing total
            barberCountMap[barber.id] += 1;
        }

        // Track the leader
        if (barberCountMap[barber.id] > maxReservations) {
            maxReservations = barberCountMap[barber.id];
            topBarberId = barber; 
        }
});
    return topBarberId.name;
}

function barberStats(reservations) {
    const hashmap = {};

    reservations.forEach(d => {

        // if id already exists
        if (hashmap[d.barberId]) {

            hashmap[d.barberId].reservations += 1;
            hashmap[d.barberId].total_price += d.total_price;

        } else {

            // create new entry
            hashmap[d.barberId] = {
                name: d.barberName, 
                total_price: d.total_price,
                reservations: 1
            };

        }

    });

    return hashmap;
}


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
                    createdAt: {
                        $gte: dateRange.start,
                        $lte: dateRange.end
                    }
                }
            },

            // join Barber
            {
                $lookup: {
                    from: "barbers",
                    localField: "barberId",
                    foreignField: "_id",
                    as: "barberId"
                }
            },
            {
                $unwind: "$barberId"
            },

            // join User (inside barber)
            {
                $lookup: {
                    from: "users",
                    localField: "barberId.userId",
                    foreignField: "_id",
                    as: "barberUser"
                }
            },
            {
                $unwind: "$barberUser"
            },

            // shape output cleanly
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
                    createdAt: 1,
                }
            }
        ]);
        const totalIncome = reservations.reduce((total, reservation) => total + reservation.total_price, 0);
        const topBarberName = getTopBarber(reservations);
         const barberStatsData = barberStats(reservations);

        res.status(200).json({
            period: period,
            general_data: {
                totalReservations: reservations.length,
                totalIncome: totalIncome,
                topBarber: topBarberName,
            },
            barberStats: barberStatsData,
            res: reservations
        });
    } catch (error) {
        console.error("The exact error is:", error); // <--- ADD THIS LINE
        res.status(500).json({ message: 'Error fetching shop overview' });
    }
});

module.exports = router;