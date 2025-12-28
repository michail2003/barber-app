const express = require('express');
const router = express.Router();
const service = require('../models/service');
const shop = require('../models/Shop')
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
        const shopID = req.params.shopID;
        const { service_id, service_price } = req.body;

        const existing_shop = await shop.findById(shopID)
        if (!existing_shop) {
            return res.status(400).json({ message: "shop not found" })
        }

        const existing_name = await service.findById(service_id)
        if (!existing_name) {
            return res.status(400).json({ message: "you cannot add unexisted service" })
        }

        if (existing_shop.services.some(s => s.service.toString() === service_id)) {
            return res.status(400).json({ message: "Service already added to shop" });
        }

        existing_shop.services.push({
            service: service_id,
            price: service_price
        });
        await existing_shop.save();

        return res.status(201).json({ message: 'service added succesfully to shop' })
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message })
    }

})

router.get('/:shopID/services', async (req, res) => {
    const shopID = req.params.shopID;
    try {
        const Shop = await shop.findById(shopID).populate('services.service', 'name _id')
        if (!shop) {
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

        if (services.length === 0) {
            return res.status(400).json({ message: 'services must be a non-empty array' });
        }

        const barber = await Barber.findById(barberID)
        const barbershop = await Barber_Shop.findById(barber.shopId).populate('services.service','name')

        if (!barber) return res.status(404).json({ message: 'Barber not found' });

        const added = [];
        const skipped = [];

        for (const item of services) {
            const service_name = await barbershop.services.find({service: item.service})
            console.log(service_name)
            const exists = barber.services.some(s => s.service.equals(item.service));
            if (exists) {
                skipped.push(item.service);
            } else {
                barber.services.push({ service: item.service, duration: item.duration });
                added.push(item.service);
            }
        }

        // Save only if at least one service was added
        if (added.length > 0) {
            await barber.save();
        }

        // If nothing added and some were duplicates → return error
        if (added.length === 0 && skipped.length > 0) {
            return res.status(400).json({
                message: 'No services were added; all services already exist',
                skippedServices: skipped,
                services: barber.services
            });
        }

        return res.status(201).json({
            message: 'Services processed successfully',
            addedServices: added,
            skippedServices: skipped,
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;