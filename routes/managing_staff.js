const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Barber = require('../models/barber');
const Shop = require('../models/Shop');
const { authMiddleware, allowRoles } = require('../middleware/auth_middleware');
const dayjs = require('dayjs');
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

router.get('/shop-staff/:shopId', authMiddleware, allowRoles('barber_admin'), async (req, res) => {
    try {
        const staff = await Barber.find({ shopId: req.params.shopId })
            .populate('userId', 'name ph_number email role');
        res.json(staff);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   PUT /api/staff/update-staff/:barberId
// @desc    Update Name, Phone, Hours, and Services
router.put('/update-staff/:barberId', async (req, res) => {
    try {
        const { name, ph_number, hours_start, hours_end, role, services } = req.body;

        const barber = await Barber.findById(req.params.barberId);
        if (!barber) return res.status(404).json({ message: "Barber profile not found" });
        
        if (hours_start || hours_end) {

            if (!hours_start || !hours_end) {
                return res.status(400).json({ message: "Both hours_start and hours_end are required" });
            }
            const shop = await Shop.findById(barber.shopId);

            const shopHoursStart = dayjs(shop.hours_start, 'HH:mm', true);
            const shopHoursEnd = dayjs(shop.hours_end, 'HH:mm', true);
            const barberHoursStart = dayjs(hours_start, 'HH:mm', true);
            const barberHoursEnd = dayjs(hours_end, 'HH:mm', true);

            if (
                !shopHoursStart.isValid() ||
                !shopHoursEnd.isValid() ||
                !barberHoursStart.isValid() ||
                !barberHoursEnd.isValid()
            ) {
                return res.status(400).json({ message: "Invalid hour format" });
            }

            if (barberHoursStart.isAfter(barberHoursEnd)) {
                return res.status(400).json({ message: "Start must be before end" });
            }

            if (
                barberHoursStart.isBefore(shopHoursStart) ||
                barberHoursEnd.isAfter(shopHoursEnd)
            ) {
                return res.status(400).json({
                    message: `Barber hours must be within shop hours: ${shop.hours_start} - ${shop.hours_end}`
                });
            }

            barber.hours_start = hours_start;
            barber.hours_end = hours_end;

            await barber.save();
        }
        await User.findByIdAndUpdate(barber.userId, { name, ph_number, role });

        res.json({ message: "Staff updated successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   DELETE /api/staff/remove-barber/:barberId
router.delete('/remove-staff/:barberId', authMiddleware, allowRoles('barber_admin'), async (req, res) => {
    try {
        const barber = await Barber.findByIdAndDelete(req.params.barberId);
        if (barber) {
            await User.findByIdAndUpdate(barber.userId, { role: 'user' });
        }
        res.json({ message: "Barber removed and account downgraded." });
    } catch (err) {
        res.status(500).json({ message: "Delete operation failed" });
    }
});

module.exports = router;