const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');

router.get('/', async (req, res) => {
    console.log("SERVER SECRET IS:", process.env.SECRET_KEY);
        try {
            const shops = await Shop.find();
            if (shops.length === 0) {
                return res.status(404).json({ message: 'No barber shops found' });
            }
            res.json(shops);
        } catch (err) {
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    });

module.exports = router;