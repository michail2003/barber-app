const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const Barber = require('../models/barber');
const Barbershop = require('../models/Shop');
const { Reservation } = require('../models/Reservation');
const { allowRoles, authMiddleware } = require('../middleware/auth_middleware');
const Shop = require('../models/Shop');
const barber = require('../models/barber');
const service = require('../models/service');

function isOverlapping(start1, end1, start2, end2) {
  // Day.js handles the string-to-date conversion automatically here
  return dayjs(start1).valueOf() < dayjs(end2).valueOf() &&
    dayjs(start2).valueOf() < dayjs(end1).valueOf();
};

function next_rsv_time(req_start,req_duration,req_end,reservations){
  let next_start = dayjs(req_start);
  let next_end = dayjs(req_end);
  let found_slot = false;

  while (!found_slot) {
    let overlap_found = false;
    for (const resv of reservations) {
      if (isOverlapping(resv.start, resv.end, next_start, next_end)) {
        overlap_found = true;
        next_start = dayjs(resv.end);
        next_end = next_start.add(req_duration, 'minute');
        break;
      }
    }
    if (!overlap_found) {
      found_slot = true;
    }
  }
  return { next_start: next_start.format("YYYY-MM-DDTHH:mm:ss"), next_end: next_end.format("YYYY-MM-DDTHH:mm:ss") };
}

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
    const reservation = await Reservation.create({
      barberId,
      serviceId,
      start: startTime.format("YYYY-MM-DDTHH:mm:ss"),
      end: endTime.format("YYYY-MM-DDTHH:mm:ss"),
      customer_name,
      customer_phone,
      status: 'confirmed'
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
    res.status(500).json({ message: 'Server error', err: err.message });
  }
});

router.get('/:barberID/reservations', authMiddleware, allowRoles('barber', 'barber_admin'), async (req, res) => {
  try {
    const barberID = req.params.barberID
    const reservations = await Barber.findById(barberID).populate('reservations', 'start end status customer_phone customer_name');

    if (!reservations) {
      return res.status(404).json({ message: "reservation not found" })
    }
    return res.status(200).json(reservations['reservations'])

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }

})

router.post('/:barbershopID/available-barbers', async (req, res) => {
  try {
    const shopID = req.params.barbershopID;
    const { start, servicesID } = req.body;

    const barbers = await Barber.find({ shopId: shopID }).populate('reservations').populate('userId', 'name');

    const eligbleBarbers = barbers
      .filter(barber => {
        // Only keep barbers who have EVERY serviceID requested
        const barberServiceIds = barber.services.map(s => s.service.toString());
        return servicesID.every(id => barberServiceIds.includes(id));
      })
      .map(barber => {
        // Now format only the barbers that passed the filter
        const services_requested = barber.services.filter(s =>
          servicesID.includes(s.service.toString())
        );
        const totalDuration = services_requested.reduce((total, s) => total + s.duration, 0)
        return {
          Barber: barber,
          services: services_requested.map(s => ({
            service: s.service_name,
            duration: s.duration,
          })),
          totalDuration,
          startTime: start,
          endTime: dayjs(start).add(totalDuration, 'minute').format("YYYY-MM-DDTHH:mm:ss"),
        };
      });
    const busy = [];
    const availableBarbers = eligbleBarbers.filter(barber => {
      // Check each barber's reservations for overlaps
      for (const resv of barber.Barber.reservations) {
        if (
          isOverlapping(
            resv.start,
            resv.end,
            barber.startTime,
            barber.endTime
          )
        ) {
          busy.push(barber);
          return false; // Overlap found, barber is not available
        }
      }
      return true; // No overlaps, barber is available
    });

      const busy_barbers_with_next_slot = busy.map(barber => {
        const { next_start, next_end } = next_rsv_time(
          barber.startTime,
          barber.totalDuration,
          barber.endTime,
          barber.Barber.reservations
        );
        return {
          ...barber,
          next_available_start: next_start,
          next_available_end: next_end,
        };
      }
      );
    return res.status(200).json({
      "available": availableBarbers.map(b => ({
        id: b.Barber._id,
        status: "available",
        name:b.Barber.userId.name,
        })),
      "busy": busy_barbers_with_next_slot.map(b => ({
        id: b.Barber._id,
        status: "busy",
        name: b.Barber.userId.name,
        next_available_start: b.next_available_start,
        next_available_end: b.next_available_end,
        }))
    });
  } catch (error) {
    // Added 'return' here to prevent the "Headers already sent" error if something goes wrong
    return res.status(500).json({ message: 'Server error', error: error.message });
  }

});

module.exports = router;
