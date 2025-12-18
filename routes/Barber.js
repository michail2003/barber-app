const express = require('express');
const router = express.Router();
const { Barber } = require('../models/Barber');
const { User } = require('../models/User');
const { allowRoles, authMiddleware } = require('../middleware/auth_middleware')
const bcrypt = require('bcryptjs');

router.post(
  '/add-barber',
  // authMiddleware,
  // allowRoles('admin', 'barber_admin'),
  async (req, res) => {
     console.log("Route hit!");
    try {
      const {
        shopId,
        name,
        ph_number,
        hours,
        email,
        password,
        role,
        services, // 'barber' or 'barber_admin'
      } = req.body;

      // 1️⃣ Validate role
      if (!['barber', 'barber_admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid barber role' });
      }

      // 2️⃣ Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log("Checking if user exists for email:", email);
        console.log("Existing user found:", existingUser);
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
        hours,
        services
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

router.get('/barber-details', async (req, res) => {
  try {
    const barber = await Barber.find();
    if (!barber) {
      return res.status(404).json({ message: 'Barber Not Found' });
    }
    res.json(shops);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;