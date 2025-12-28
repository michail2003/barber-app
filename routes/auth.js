const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { Barber } = require('../models/barber');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.SECRET_KEY;

// Register route
router.post('/register', async (req, res) => {
    try {

        const {
            email,
            password,
            ph_number,
            name
        } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            email,
            password: hashedPassword,
            ph_number,
            name,
            role: "user"

        });
        return res.status(201).json({
            message: 'User registered successfully',
            user
        });
    } catch (err) {
        return res.status(400).json({
            error: 'User already exists'
        });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const {
        email,
        password
    } = req.body;
    const user = await User.findOne({
        email
    });
    if (!user) return res.status(401).json({
        error: 'Invalid email or password'
    });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({
        error: 'Invalid email or password'
    });

   if (user.role === 'barber' || user.role === 'barber_admin') {
    
    const barber = await Barber.findOne({ userId: user._id });
    if (!barber) {
        return res.status(404).json({ error: 'Barber profile not found' });
    }

    const token = jwt.sign({
        id: barber._id, 
        role: user.role,
        shop : barber.shopId,
        name: user.name
    }, JWT_SECRET);

    return res.json({ token });

} else {

    const token = jwt.sign({
        id: user._id, 
        role: user.role,
        name: user.name,
        phone: user.ph_number
    }, JWT_SECRET);

    return res.json({ token });
}

});
module.exports = router;