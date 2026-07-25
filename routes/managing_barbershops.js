const express = require('express');
const router = express.Router();
const Barber_Shop = require('../models/Shop');
const Barber = require('../models/barber');
const User = require('../models/User');
const { allowRoles, authMiddleware } = require('../middleware/auth_middleware')
const bcrypt = require('bcryptjs');
const service = require('../models/service');

router.post(
    '/add-barber',
    authMiddleware,
    allowRoles('admin', 'barber_admin'),
    async (req, res) => {
        try {
            const {
                shopId,
                name,
                ph_number,
                hours_start,
                hours_end,
                email,
                password,
                role,
                services
            } = req.body;

            const shop = await Barber_Shop.findById(shopId);
            if (!shop) {
                return res.status(404).json({ message: 'Shop not found' });
            }
            const shopServicesIds = shop.services.map(s => s._id.toString()
            );
            const allServicesValid = services.every(service =>
                shopServicesIds.includes(service.service.toString())
            );

            if (!allServicesValid) {
                return res.status(400).json({ message: 'you must add services from shop' });
            }

            const full_service_list = services.map(s => ({
                service: s.service,
                service_name: shop.services.find(ss => ss._id.toString() === s.service.toString()).service_name,
                price: shop.services.find(ss => ss._id.toString() === s.service.toString()).price,
                duration: s.duration
            }));
            // 1️⃣ Validate role
            if (!['barber', 'barber_admin'].includes(role)) {
                return res.status(400).json({ message: 'Invalid barber role' });
            }

            // 2️⃣ Check if user exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // 3️⃣ Create user
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await User.create({
                email,
                password: hashedPassword,
                role,
                name,
                ph_number
            });

            // 4️⃣ Create barber profile
            const barber = await Barber.create({
                userId: user._id,
                shopId,
                hours_start,
                hours_end,
                services: full_service_list
            });

            res.status(201).json({
                message: 'Barber registered successfully',
                barber
            });

        } catch (err) {
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    }
);

router.get('/barber-details/:id', async (req, res) => {
    try {
        const barberId = req.params.id;
        const barber = await Barber.findById(barberId)
            .populate('userId', 'name ph_number')
        if (!barber) {
            return res.status(404).json({ message: 'Barber Not Found' });
        }
        res.json(barber);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.get('/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const shop = await Barber_Shop.findOne({ slug: slug });
        if (!shop) {
            return res.status(404).json({ message: 'Barber shop not found' });
        }
        res.json(shop);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/:slug/barbers', async (req, res) => {
    try {
        const slug = req.params.slug;
        const shop = await Barber_Shop.findOne({ slug: slug });
        if (!shop) {
            return res.status(404).json({ message: 'Barber shop not found' });
        }
        const barbers = await Barber.find({ shopId: shop._id.toString() })
            .populate('userId', 'name ph_number');
        res.status(200).json(
            barbers.map(barber => ({
                id: barber._id,
                name: barber.userId.name,
            }))
        );
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


module.exports = router;