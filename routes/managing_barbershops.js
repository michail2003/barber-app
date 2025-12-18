const express = require('express');
const router = express.Router();
const Barber_Shop = require('../models/Shop');
const { Barber } = require('../models/Barber');

router.post('/addingshop', async (req, res) => {
    const { name, address, phone, opening_hours, logo_url,nipt } = req.body;
    try {
        const existingShop = await Barber_Shop.findOne({ nipt });
        if (existingShop) {
            return res.status(400).json({ message: 'Barber shop already exists' });
        }
        const newShop = new Barber_Shop({ nipt,name, address, phone, opening_hours, logo_url });
        await newShop.save();
        res.status(201).json({ message: 'Barber shop created', newShop });
    } catch (error) {
        res.status(400).json({ message: 'Error creating barber shop', error: error.message });
    }
});

router.post('/add-barber', async (req, res) => {
    try {
        const { shopId, admin, name, phone, hours,services} = req.body;
        const newBarber = new Barber({
            shopId,
            admin,
            name,
            phone,
            hours,
            services
        });
        await newBarber.save();
        res.status(201).json(newBarber);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

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
        const shop = await Barber_Shop.findOne({slug: slug});
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
        const shop = await Barber_Shop.findOne({slug: slug});
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