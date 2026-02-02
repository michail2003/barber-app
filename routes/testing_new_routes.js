const express = require('express');
const router = express.Router();
const Service = require('../models/service');
const Barber_Shop = require('../models/Shop');
const Barber = require('../models/barber');
const barber = require('../models/barber');


router.post('/:barbershopID/available-barbers', async (req, res) => {
  try {
    const shopId = req.params.barbershopID;
    const { start, servicesID } = req.body; // start = requested time, servicesID = array of service IDs

    // 1️⃣ Fetch all barbers for the shop
    const barbers = await Barber.find({ shopId })
      .populate('userId', 'name');

    // 2️⃣ Filter eligible barbers (can perform all requested services)
    const eligibleBarbers = barbers.filter(barber => {
      const barberServiceIds = barber.services.map(s => s.service.toString());
      return servicesID.every(id => barberServiceIds.includes(id));
    });

    // 3️⃣ Not eligible barbers
    const notEligibleBarbers = barbers
      .filter(b => !eligibleBarbers.includes(b))
      .map(b => ({ barberName: b.userId.name, status: "Not eligible" }));

    // 4️⃣ Calculate total duration and availability for eligible barbers
    const barbersWithAvailability = eligibleBarbers.map(barber => {
      // Total duration of selected services
      const totalDuration = servicesID.reduce((acc, serviceId) => {
        const service = barber.services.find(s => s.service.toString() === serviceId);
        return acc + (service ? service.duration : 0);
      }, 0);

      const requestedStart = dayjs(start);
      const requestedEnd = requestedStart.add(totalDuration, 'minute');

      // Check if any existing reservation overlaps
      const isBusy = barber.reservations.some(res => {
        const resStart = dayjs(res.start);
        const resEnd = resStart.add(res.totalDuration, 'minute');
        return requestedStart.isBefore(resEnd) && requestedEnd.isAfter(resStart);
      });

      return {
        barberName: barber.userId.name,
        totalDuration,
        status: isBusy ? "Busy" : "Available",
        availableAt: isBusy ? null : requestedStart.format('HH:mm') // HH:MM format
      };
    });

    // 5️⃣ Combine eligible + not eligible barbers
    const response = [...barbersWithAvailability, ...notEligibleBarbers];

    res.status(200).json(response);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
module.exports = router;
