const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const Barber = require('../models/barber');
const { Reservation } = require('../models/Reservation');
const { allowRoles, authMiddleware } = require('../middleware/auth_middleware');
const User = require('../models/User');

function isOverlapping(start1, end1, start2, end2) {
  // Day.js handles the string-to-date conversion automatically here
  return dayjs(start1).valueOf() < dayjs(end2).valueOf() &&
    dayjs(start2).valueOf() < dayjs(end1).valueOf();
};

function next_rsv_time(req_start, req_duration, req_end, reservations) {
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

function getDateRange(DayRequested) {

  if (!DayRequested) {
    return { error: "Day is required" };
  }

  const day = dayjs(DayRequested);
  let start = null;
  let end = null;

  start = day.startOf('day');
  end = day.endOf('day');

  return {
    start: start.format('YYYY-MM-DDTHH:mm:ss'), // string, not Date
    end: end.format('YYYY-MM-DDTHH:mm:ss'),       // string, not Date
    displayStart: start.format('DD/MM/YYYY'),
    displayEnd: end.format('DD/MM/YYYY')
  };
}


router.post('/reserve', async (req, res) => {
  try {
    const {
      userid,
      barberId,
      services,
      start,
    } = req.body;

    const userVerification = await User.findById(userid);
    if (!userid || !userVerification) {
      return res.status(404).json({ message: 'User not found' });
    }

    const barber = await Barber.findById(barberId).populate('reservations');
    if (!barber) {
      return res.status(404).json({ message: 'Barber not found' });
    }
    const serviceDetails = barber.services
      .filter(item => services.includes(item.service.toString()))
      .map(item => ({
        serviceID: item.service.toString(),
        name: item.service_name,
        price: item.price,
        duration: item.duration
      }));
    if (serviceDetails.length === 0) {
      return res.status(400).json({ message: 'Requested services not offered by this barber' });
    }

    // 2. Calculate the total duration
    const servicesTotalDuration = serviceDetails.reduce((acc, s) => acc + s.duration, 0);
    const servicesTotalPrice = serviceDetails.reduce((total, s) => total + s.price, 0);
    const startTime = dayjs(start);
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
    const reservation = await Reservation.create({
      userid,
      barberId,
      shopId: barber.shopId,
      services: serviceDetails.map(s => ({ id: s.serviceID, Service_name: s.name })),
      start: startTime.format("YYYY-MM-DDTHH:mm:ss"),
      end: endTime.format("YYYY-MM-DDTHH:mm:ss"),
      status: 'confirmed',
      total_price: servicesTotalPrice,
      duration: servicesTotalDuration
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
    res.status(500).json({ message: 'Server error on reservation creation', err: err.message });
  }
});

router.get('/:barberID/reservations/:period', authMiddleware, async (req, res) => {
  try {
    const { barberID, period } = req.params;

    const dateRange = getDateRange(period);
    if (dateRange.error) {
      return res.status(400).json({ message: dateRange.error });
    }

    const reservations = await Reservation.aggregate([

      {
        $match: {
          barberId: new mongoose.Types.ObjectId(barberID),
          start: {
            $gte: dateRange.start,
            $lte: dateRange.end
          },
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "userid",
          foreignField: "_id",
          as: "Customer"
        }
      },
      { $unwind: "$Customer" },

      {
        $project: {
          _id: 1,
          customerName: "$Customer.name",
          CustomerNumber: "$Customer.ph_number",
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

    if (reservations.length === 0) {
      return res.status(404).json({ message: "No reservations found" });
    }

    return res.status(200).json({ reservations });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});




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
        name: b.Barber.userId.name,
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
