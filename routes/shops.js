const express = require('express');
const router = express.Router();
const Barber = require('../models/barber');
const Shop = require('../models/Shop');
const User = require('../models/User')
const { authMiddleware, allowRoles } = require('../middleware/auth_middleware');
const { find_in_db } = require('../global_functions');

router.get('/', authMiddleware, async (req, res) => {

    try {
        const user_id = req.user.user_id || req.user.id;
        const user = await find_in_db(User, user_id, res, 'User not Found')

        const shops = await Shop.aggregate([
            {
                $lookup: {
                    from: "barbers",
                    localField: "_id",
                    foreignField: "shopId",
                    as: "barbers"
                }
            },
            {
                $project: {
                    _id: 0,
                    name: 1,
                    address: 1,
                    slug: 1,
                    phone: 1,
                    hours_start: 1,
                    hours_end: 1,
                    cover_photo: 1,
                    profile_pic: 1,
                    "location.coordinates": 1,
                    barber_count: { $size: "$barbers" },
                    favourite: {
                        $in: ["$_id", user.favourites]
                    }
                }
            }
        ]);

        if (shops.length === 0) {
            return res.status(404).json({
                message: 'No barber shops found'
            });
        }

        res.status(200).json(shops);

    } catch (err) {

        res.status(500).json({
            message: 'Server error',
            error: err.message
        });

    }
});

router.get('/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const shop = await Shop.findOne({ slug: slug });
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
        const shop = await Shop.findOne({ slug: slug });
        if (!shop) {
            return res.status(404).json({ message: 'Barber shop not found' });
        }
        const barbers = await Barber.find({ shopId: shop._id.toString() })
            .populate('userId', 'name ph_number');
        res.status(200).json(
            barbers.map(barber => ({
                id: barber._id,
                name: barber.userId.name,
                working_hours: [barber.hours_start, barber.hours_end],
                phone: barber.userId.ph_number
            }))
        );
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
module.exports = router;