const exprees = require('express');
const router = exprees.Router();
const { Request } = require('../models/Request');
const User = require('../models/User');
const Barber = require('../models/barber');
const dayjs = require('dayjs');
const axios = require("axios");
const port = process.env.PORT || 3000;


function isOverlapping(start1, end1, start2, end2) {
    // Day.js handles the string-to-date conversion automatically here
    return dayjs(start1).valueOf() < dayjs(end2).valueOf() &&
        dayjs(start2).valueOf() < dayjs(end1).valueOf();
};


//ACCEPT FUNCTION
function Accepted(request) {
    try {
        const reservePayload = {
            userid: request.userid,
            barberId: request.barberId,
            services: request.services.map(s => s.serviceID), // Assuming services in Request are populated with _id
            start: request.start,
        };
        const reserveResponse = await axios.post(`http://localhost:${port}/reservations/reserve`, reservePayload);

        Request.findByIdAndDelete(id).catch(err => console.error('Failed to delete request after reservation:', err));
        return res.status(200).json({
            message: 'Request accepted and reserved successfully',
            reservationCreated: reserveResponse.data
        });

    } catch (reserveErr) {
        return res.status(500).json({
            message: 'Request accepted but failed to reserve',
            request,
            error: reserveErr.response?.data || reserveErr.message
        });
    }
}


// CANCEL FUNCTION
function Cancelled(requestID) {
    try {
        const request = await Request.findByIdAndDelete(requestID);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        const barber_update = await Barber.updateOne(
            { _id: request.barberId },
            { $pull: { requests: requestID } }
        );

        // Barber not found
        if (barber_update.matchedCount === 0) {
            return res.status(404).json({ message: 'Barber not found' });
        }

        // Barber found but request ID was not in barber.requests
        if (barber_update.modifiedCount === 0) {
            return res.status(200).json({
                message: 'Request deleted, but request ID was not in barber requests'
            });
        }

        // Barber found and request ID removed
        return res.status(200).json({ message: 'Request deleted and removed from barber' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', err: err.message });
    }
}


router.post('/', async (req, res) => {
    try {
        const {
            userid,
            barberId,
            services,
            start,
        } = req.body;

        const userVerification = await User.findById(userid);
        if (!userid || !userVerification) {
            return res.status(404).json({ message: 'log in with email or guest' });
        }

        const barber = await Barber.findById(barberId).populate('reservations');
        if (!barber) {
            return res.status(404).json({ message: 'Barber not found' });
        }
        const serviceDetails = barber.services
            .filter(item => services.includes(item.service.toString()))
            .map(item => ({
                serviceID: item.service,
                name: item.service_name,
                price: item.price,
                duration: item.duration
            }));
        if (!serviceDetails.length) {
            return res.status(400).json({ message: 'Requested services not offered by this barber' });
        }

        // 2. Calculate the total duration
        const servicesTotalDuration = serviceDetails.reduce((acc, s) => acc + s.duration, 0);
        const servicesTotalPrice = serviceDetails.reduce((total, s) => total + s.price, 0);

        const startTime = dayjs(start, "YYYY-MM-DDTHH:mm:ss");
        const endTime = startTime.add(servicesTotalDuration, 'minute');

        if (startTime.isBefore(dayjs())) {
            return res.status(400).json({ message: 'Cannot book in the past' });
        }

        // 5️⃣ Check availability
        for (const resv of barber.reservations) {
            if (
                isOverlapping(
                    resv.start,
                    resv.end,
                    startTime,
                    endTime
                )
            ) {
                return res.status(400).json({
                    message: 'Reservation is not available this time. Try again later.'
                });
            }
        }


        // 6️⃣ Create reservation
        const request = await Request.create({
            userid,
            barberId,
            shopId: barber.shopId,
            services: serviceDetails,
            start: startTime.format("YYYY-MM-DDTHH:mm:ss"),
            end: endTime.format("YYYY-MM-DDTHH:mm:ss"),
            status: 'pending',
            total_price: servicesTotalPrice,
            duration: servicesTotalDuration
        });

        barber.requests.push(request._id);
        await barber.save();

        res.status(201).json({
            message: 'Request sent successfully',
            request
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', err: err.message });
    }
});

router.put('/:id/', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const request = await Request.findById(id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (!['accepted', 'cancelled', 'modified', 'pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        // If accepted, call /reserve endpoint
        if (status === 'accepted') {

        }
        if (status === 'cancelled') {

        }
        // For other statuses
        return res.status(200).json({ message: 'Request status updated', request });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error on status update', err: err.message });
    }
});

// Get all requests for a specific barber
router.get('/barber-requests/:id/', async (req, res) => {
    try {
        const { id } = req.params;

        const requests = await Request.find({ barberId: id }).populate('userid', 'name ph_number');
        if (!requests) {
            return res.status(404).json({ message: 'No requests found for this barber' });
        }
        res.status(200).json({ requests });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', err: err.message });
    }
});

module.exports = router;