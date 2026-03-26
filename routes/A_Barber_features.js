const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const  Barber  = require('../models/barber');
const { authMiddleware, allowRoles } = require('../middleware/auth_middleware');

router.get('/shop-staff/:shopId',authMiddleware,allowRoles('barber_admin') ,async (req, res) => {
    try {
        const staff = await Barber.find({ shopId: req.params.shopId })
            .populate('userId', 'name ph_number email role'); 
        res.json(staff);
    } catch (err) {
        res.status(500).json({ message:err.message });
    }
});

// @route   PUT /api/staff/update-staff/:barberId
// @desc    Update Name, Phone, Hours, and Services
router.put('/update-staff/:barberId' ,async (req, res) => {
    try {
        const { name, ph_number, hours_start, hours_end, services, role } = req.body;

        const barber = await Barber.findById(req.params.barberId);
        if (!barber) return res.status(404).json({ message: "Barber profile not found" });


        // 2. Update User Collection (Security: Only name and phone)
        await User.findByIdAndUpdate(barber.userId, { name, ph_number, role,hours_start,hours_end, services });

        res.json({ message: "Staff updated successfully" });
    } catch (err) {
        res.status(500).json({ message:err.message });
    }
});

// @route   DELETE /api/staff/remove-barber/:barberId
router.delete('/remove-staff/:barberId',authMiddleware,allowRoles('barber_admin') ,async (req, res) => {
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