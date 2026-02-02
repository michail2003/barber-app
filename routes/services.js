const express = require('express');
const router = express.Router();
const service = require('../models/service');
const Barber = require('../models/barber')
const Barber_Shop = require('../models/Shop')

router.post('/add-service', async (req, res) => {
    const { service_name } = req.body
    try {
        const existing_service = await service.findOne({ name: service_name })
        if (existing_service) {
            return res.status(400).json({ message: "service already exist" })
        }
        const newService = await service.create({
            name: service_name
        })
        return res.status(201).json({ message: 'service added succesfully', newService })
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message })
    }
})
router.post('/:shopID/catalog-adding', async (req, res) => {
    try {
        const { shopID } = req.params;
        const { services } = req.body;

        if (!Array.isArray(services) || services.length === 0) {
            return res.status(400).json({
                message: 'Services must be a non-empty array'
            });
        }

        const shop = await Barber_Shop.findById(shopID);
        if (!shop) {
            return res.status(404).json({
                message: 'Shop not found'
            });
        }

        let added = [];
        let skipped = [];

        for (const newService of services) {
            const catalogService = await service.findById(newService.service);

            if (!catalogService) {
                skipped.push({
                    serviceId: newService.service,
                    reason: 'Service not found in global catalog'
                });
                continue;
            }

            const exists = shop.services.some(
                s => s.service.toString() === catalogService._id.toString()
            );

            if (exists) {
                skipped.push({
                    serviceId: catalogService._id,
                    service_name: catalogService.name,
                    reason: 'Service already exists in shop catalog'
                });
                continue;
            }

            shop.services.push({
                service: catalogService._id,
                service_name: catalogService.name,
                price: newService.price
            });

            added.push({
                serviceId: catalogService._id,
                service_name: catalogService.name
            });
        }

        if (added.length === 0) {
            return res.status(400).json({
                message: 'No services were added to the shop',
                skipped
            });
        }

        await shop.save();

        return res.status(201).json({
            message: `${added.length} service(s) added to shop catalog`,
            added,
            skipped,
            services: shop.services
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});


router.get('/:shopID/services', async (req, res) => {
    const shopID = req.params.shopID;
    try {
        const Shop = await Barber_Shop.findById(shopID).populate('services.service', 'name _id')
        if (!Shop) {
            return res.status(404).json({ message: 'no shop found' })
        }
        const catalog = Shop.services.map(s => ({
            _id: s._id,
            serviceID: s.service._id,
            service: s.service.name,
            price: s.price
        }))
        return res.status(200).json(catalog)
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message })
    }
})

router.post('/:barberID/add-services', async (req, res) => {
    try {
        const { barberID } = req.params;
        const { services } = req.body;

        if (!Array.isArray(services) || services.length === 0) {
            return res.status(400).json({
                message: 'Services must be a non-empty array'
            });
        }

        const barber = await Barber.findById(barberID);
        if (!barber) {
            return res.status(404).json({ message: 'Barber not found' });
        }

        const barbershop = await Barber_Shop.findById(barber.shopId);
        if (!barbershop) {
            return res.status(404).json({ message: 'Barber shop not found' });
        }

        let added = [];
        let skipped = [];

        for (const newService of services) {
            const exists = barber.services.some(
                s => s.service.toString() === newService.service.toString()
            );

            const catalogService = barbershop.services.find(
                s => s._id.toString() === newService.service.toString()
            );

            if (!catalogService) {
                skipped.push({
                    serviceId: newService.service,
                    reason: 'Service not found in shop catalog'
                });
                continue;
            }

            if (exists) {
                skipped.push({
                    serviceId: catalogService._id,
                    service_name: catalogService.service_name,
                    reason: 'Service already assigned to barber'
                });
                continue;
            }

            barber.services.push({
                service: catalogService._id,
                service_name: catalogService.service_name,
                price: catalogService.price,
                duration: newService.duration || 30
            });

            added.push({
                serviceId: catalogService._id,
                service_name: catalogService.service_name
            });
        }

        if (added.length === 0) {
            return res.status(400).json({
                message: 'No services were added',
                skipped
            });
        }

        await barber.save();

        return res.status(201).json({
            message: `${added.length} service(s) added successfully`,
            added,
            skipped,
            services: barber.services
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});

router.get('/eligible-barbers/services/:barbershop', async (req, res) => {
    try {
        const servicesId = req.body.servicesId;
        const shop = req.params.barbershop;
        const barbers = await Barber.find({ shopId: shop });

        if (!barbers || barbers.length === 0) {
            return res.status(404).json({ message: "No barbers found for this shop" });
        }
        const eligbleBarbers = barbers.filter(barber => {
            const barberServiceIds = barber.services.map(s => s.service.toString());
            return servicesId.every(id => barberServiceIds.includes(id));
        });

        if (eligbleBarbers.length === 0) {
            return res.status(404).json({ message: "No barbers found with the specified services" });
        }
        let populatedBarbers = [];
        for (let barber of eligbleBarbers) {
            await barber.populate('userId', 'name');
            populatedBarbers.push(barber.userId.name);
        }
        return res.status(200).json({ eligbleBarbers: populatedBarbers });

    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message })
    }
});
module.exports = router;