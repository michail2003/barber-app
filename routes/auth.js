const express = require('express');
const router = express.Router();
const User = require('../models/User');
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
            role:"user"

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

    const token = jwt.sign({
        id: user._id,
        role: user.role
    }, JWT_SECRET, {
    });
    res.json({
        token
    });
});
module.exports = router;