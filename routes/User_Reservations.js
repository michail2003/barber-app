const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Reservation } = require('../models/Reservation');
const User = require('../models/User');

router.get('/:UserID', async (req, res) => {
    try {
        const userid = req.params.UserID

        if (!userid || !mongoose.Types.ObjectId.isValid(userid)) {
            return res.status(400).json({
                message: 'Invalid or missing user id',
            });
        }

        const user_reservations = await Reservation.find({
            userid: userid
            
        })

        if (!user_reservations) {
            res.status(404).json({ message: 'no reservations found' })
        }
        res.status(200).json({ reservations: user_reservations })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

module.exports = router;