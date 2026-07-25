const express = require('express');
const router = express.Router();
const Barber_Shop = require('../models/Shop');
const { param } = require('./managing_barbershops');

router.get('/nearby-shops/:latitude/:longitude', async (req, res) => {
    try {
        const lat = parseFloat(req.params.latitude)
        const lng = parseFloat(req.params.longitude)

        if (!lat || !lng) {
            return res.status(400).json({
                message: "lat and lng query params are required."
            });
        }

        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return res.status(400).json({
                message: "lat/lng out of valid range."
            });
        }

        const shops = await Barber_Shop.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [lat, lng] // GeoJSON order: [lng, lat]
                    },
                    distanceField: "distance", // in meters, added by MongoDB automatically
                    spherical: true,
                }
            },
            {
                // shape the response to match exactly what the frontend expects
                $project: {
                    id: 1,
                    name: 1,
                    address: 1,
                    distance: { $round: ["$distance", 0] }, // whole meters, no decimals
                    location: {
                        $let: {
                            vars: { coords: "$location.coordinates" },
                            in: [
                                { $arrayElemAt: ["$$coords", 0] }, // lat
                                { $arrayElemAt: ["$$coords", 1] }  // lng
                            ]
                        }
                    }
                }
            }
        ]);

        return res.status(200).json(shops);
    } catch (err) {
        return res.status(500).json({
            message: "Error fetching nearby shops.",
            error: err.message
        });
    }


})
module.exports = router;