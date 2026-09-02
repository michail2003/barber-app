const express = require('express');
const router = express.Router();
const Barber_Shop = require('../models/Shop');
const Barber = require('../models/barber');
const User = require('../models/User');
const { allowRoles, authMiddleware } = require('../middleware/auth_middleware')
const { checkImageFormat, uploadSize, uploadRateLimit } = require('../middleware/media_middleware');
const { uploadImage } = require('../media_upload');
const bcrypt = require('bcryptjs');
const Service = require('../models/service');
const { find_in_db, isValidLatLng } = require('../global_functions');
const { adding_services_to_shop, validate_Shop_Hours } = require('../Barber_Shops_Functions');
const Shop = require('../models/Shop');

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
                working_hours: [barber.hours_start, barber.hours_end],
                phone: barber.userId.ph_number
            }))
        );
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.put('/shop-editing/info/:shopID',

    uploadRateLimit,
    uploadSize.fields([
        { name: 'cover_photo', maxCount: 1 },
        { name: 'profile_pic', maxCount: 1 }
    ]),
    checkImageFormat,

    async (req, res) => {
        try {
            let {
                name,
                phone,
                hours_start,
                hours_end,
                address,
                location,
                services
            } = req.body;

            let cover_photo, profile_pic;

            //finding shop
            const shop = await find_in_db(Shop, req.params.shopID, res, 'shop not found')

            if (services) {

                services = JSON.parse(services);

                const error = await adding_services_to_shop(services, Service);
                if (error) {
                    return res.status(400).json({ message: error });
                }
            }
            
            if (location && !isValidLatLng(JSON.parse(location))) {
                return res.status(400).json({ message: 'Invalid location coordinates' });
            }

            const geoLocation = location
                ? { type: 'Point', coordinates: [JSON.parse(location)[1], JSON.parse(location)[0]] } // swap to [lng, lat]
                : undefined;

            if (hours_start && hours_end) {

                const barbers = await Barber.find({ shopId: shop._id }) //index search on barbers by shopID
                    .select("name hours_start hours_end");

                const error = validate_Shop_Hours(hours_start, hours_end, barbers);
                if (error) {
                    return res.status(400).json({ message: error.message, conflicts: error.conflicts });
                }
            }

            if (req.files?.cover_photo) {
                const uploadResult = await uploadImage(`fringo/${shop._id}/cover`, req.files.cover_photo[0].buffer, `fringo/shops/${shop._id}/cover`);

                if (!uploadResult) {
                    return res.status(400).json({ message: `Image upload failed,${uploadResult.message}` });
                }

                cover_photo = uploadResult.url;
            }

            if (req.files?.profile_pic) {
                const uploadResult = await uploadImage(`fringo/${shop._id}/profile`, req.files.profile_pic[0].buffer, `fringo/shops/${shop._id}/profile`);

                if (!uploadResult) {
                    return res.status(400).json({ message: `Image upload failed,${uploadResult.message}` });
                }

                profile_pic = uploadResult.url;
            }


            const shop_updated = await Barber_Shop.findByIdAndUpdate(shop._id, {
                name,
                phone,
                hours_start,
                hours_end,
                address,
                location: geoLocation,
                cover_photo,
                profile_pic,
                services
            }, { new: true })

            if (!shop_updated) {
                return res.status(400).json({ message: 'updating shop failed' });
            }

            res.status(200).json({ message: 'Shop updated successfully', shop: shop_updated });

        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    })

module.exports = router;