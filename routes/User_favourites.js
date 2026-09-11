const express = require('express');
const router = express.Router();
const Barber = require('../models/barber');
const Shop = require('../models/Shop');
const User = require('../models/User')
const { authMiddleware, allowRoles } = require('../middleware/auth_middleware');
const { find_in_db } = require('../global_functions');

router.post('/toggle/:shopID/:userID', authMiddleware, async (req, res) => {

    const { shopID,userID } = req.params;

    if (!shopID || !userID) {
        return res.status(400).json({ message: 'Shop not selected or user not provided' })
    }
    const user = await User.findById(userID)
    const shop_exists = await Shop.findById(shopID)

    if (!user || !shop_exists) {
        return res.status(404).json({ message: `Shop ${shopID} or User ${userID} not exists` })
    }
    const shop_in_fav = user.favourites.some(fav =>
        fav.toString() === shopID
    )

    if (shop_in_fav) {

        user.favourites.pull(shopID)
        await user.save()

        return res.status(200).json({
            message: 'Shop was removed from favourites'
        })

    } else {

        user.favourites.push(shopID)
        await user.save()

        return res.status(201).json({
            message: 'Shop added to favourites'
        })
    }

});

router.get('/list/', authMiddleware, async (req, res) => {

    //getting user id from middlewawre
    const id = req.user.user_id || req.user.id;

    //finding user existence in db
    const user = await find_in_db(User, id, res, 'User not Found')

    //fetching in db each shop
    const fav_list = await Shop.find({
        _id: { $in: user.favourites }
    }).select(
        "name address cover_photo profile_pic location.coordinates -_id"
    );

    return res.status(200).json(fav_list)
})

module.exports = router;