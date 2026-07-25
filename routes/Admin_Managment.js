const express = require('express');
const router = express.Router();
const Barber_Shop = require('../models/Shop');
const Barber = require('../models/barber');
const User = require('../models/User');
const { allowRoles, authMiddleware } = require('../middleware/auth_middleware')
const bcrypt = require('bcryptjs');
const service = require('../models/service');
const mongoose = require('mongoose')

router.post(
    "/addingshop",
    authMiddleware,
    allowRoles("admin"),
    async (req, res) => {
        try {
            const {
                name,
                address,
                phone,
                hours_start,
                hours_end,
                logo_url,
                services = [],
                Xloc,
                Yloc,
                shop_img,
            } = req.body;
        
            if (!Array.isArray(services) || services.length === 0) {
                return res.status(400).json({
                    message: "Services are required.",
                });
            }

            const serviceIds = services.map(({ id }) => id);

            // Prevent duplicate services
            if (new Set(serviceIds).size !== serviceIds.length) {
                return res.status(400).json({
                    message: "Duplicate services are not allowed.",
                });
            }

            // Fetch all requested services
            const dbServices = await service.find({
                _id: { $in: serviceIds },
            }).lean();

            if (dbServices.length !== serviceIds.length) {
                return res.status(400).json({
                    message: "One or more services are invalid.",
                });
            }

            // Fast lookup
            const serviceMap = new Map(
                dbServices.map(service => [
                    service._id.toString(),
                    service,
                ])
            );

            const full_service_list = services.map(({ id, price }) => ({
                service: id,
                service_name: serviceMap.get(id).name,
                price,
            }));

            const newShop = await Barber_Shop.create({
                name,
                address,
                phone,
                hours_start,
                hours_end,
                logo_url,
                location: {
                    type: 'Point',
                    coordinates: [Xloc, Yloc]
                },
                shop_img,
                services: full_service_list,
            });

            return res.status(201).json({
                message: "Barber shop created.",
                shop: newShop,
            });
        } catch (err) {
            return res.status(500).json({
                message: "Error creating barber shop.",
                error: err.message,
            });
        }
    }
);

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

router.get('/all-shops/overview', async (req, res) => {
    try {
        const shops = await Barber_Shop.find({}, 'name slug logo_url address');
        res.json(shops);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.delete('/permanent-delete/:barbershop', authMiddleware,
    allowRoles('admin'), async (req, res) => {
        const shopID = req.params.barbershop;
        try {
            const shop = await Barber_Shop.findByIdAndDelete(shopID)
            if (!shop) {
                return res.status(404).json({ message: "barber shop not found" });
            }
            return res.status(200).json({ message: `barber shop ${shop.name} was removed permanently from db` });
        } catch (error) {
            res.status(500).json({ message: "Error removing barbershop", error: error.message });
        }
    })
module.exports = router;