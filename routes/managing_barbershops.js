const express = require('express');
const router = express.Router();
const Barber_Shop = require('../models/Shop');
const { Barber } = require('../models/Barber');
const  User  = require('../models/User'); 
const { allowRoles, authMiddleware } = require('../middleware/auth_middleware') 
const bcrypt = require('bcryptjs');

router.post('/addingshop', async (req, res) => {
    const { name, address, phone, opening_hours, logo_url, nipt } = req.body;
    try {
        const existingShop = await Barber_Shop.findOne({ nipt });
        if (existingShop) {
            return res.status(400).json({ message: 'Barber shop already exists' });
        }
        const newShop = new Barber_Shop({ nipt, name, address, phone, opening_hours, logo_url });
        await newShop.save();
        res.status(201).json({ message: 'Barber shop created', newShop });
    } catch (error) {
        res.status(400).json({ message: 'Error creating barber shop', error: error.message });
    }
});

router.post(
    '/add-barber',
    // authMiddleware,
    // allowRoles('admin', 'barber_admin'),
    async (req, res) => {
        try {
            const {
                shopId,
                name,
                ph_number,
                hours,
                email,
                password,
                role,
                services, // 'barber' or 'barber_admin'
            } = req.body;

            // 1️⃣ Validate role
            if (!['barber', 'barber_admin'].includes(role)) {
                return res.status(400).json({ message: 'Invalid barber role' });
            }

            // 2️⃣ Check if user exists
            const existingUser = await User.findOne({email});
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
                hours,
                services
            });

            res.status(201).json({
                message: 'Barber registered successfully',
                barber
            });

        } catch (err) {
            res.status(500).json({ message: 'Server error',error: err.message });
        }
    }
);

router.get('/barber-details', async (req, res) => {
    try {
        const barber = await Barber.find();
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
        const barbers = await Barber.find({ shopId: shop._id });
        res.json(barbers);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


module.exports = router;