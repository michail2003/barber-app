const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const { Barber } = require('../models/Barber');
const { Reservation } = require('../models/Reservation');

function isOverlapping(start1, end1, start2, end2) {
  return dayjs(start1).utc().isBefore(dayjs(end2).utc()) &&
    dayjs(start2).utc().isBefore(dayjs(end1).utc());
};


router.post('/reserve', async (req, res) => {
  try {
    const {
      barberId,
      serviceId,
      start,
      customer_name,
      customer_phone,
      status
    } = req.body;

    // 1️⃣ Find barber with populated reservations
    const barber = await Barber.findById(barberId).populate('reservations');
    if (!barber) {
      return res.status(404).json({ message: 'Barber not found' });
    }

    // 2️⃣ Find service inside barber
    const service = barber.services.id(serviceId);
    if (!service) {
      return res.status(400).json({ message: 'Invalid service' });
    }

    // 3️⃣ Parse start & calculate end
    const startTime = dayjs(start);
    const endTime = startTime.add(service.duration, 'minute');

    // ❌ Prevent past bookings
    if (startTime.isBefore(dayjs())) {
      return res.status(400).json({ message: 'Cannot book in the past' });
    }

    // 5️⃣ Check availability
    for (const resv of barber.reservations) {
      if (
        isOverlapping(
          resv.start,
          resv.end,
          startTime.toDate(),
          endTime.toDate()
        )
      ) {
        return res.status(400).json({
          message: 'Reservation is not available this time. Try again later.'
        });
      }
    }


    // 6️⃣ Create reservation
      const reservation = await Reservation.create({
        barberId,
        serviceId,
        start: startTime.toDate(),
        end: endTime.toDate(),
        customer_name,
        customer_phone,
        status : 'confirmed'
      });

      // 7️⃣ Link reservation to barber
      barber.reservations.push(reservation._id);
      await barber.save();

      res.status(201).json({
        message: 'Reservation created successfully',
        reservation
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
