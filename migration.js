const mongoose = require("mongoose");
const Barber = require("./models/barber");
const BarberShop = require("./models/Shop");
require("dotenv").config();

const MONGO_URI = process.env.MONGODB_URI;


const migrateBarberShops = async () => {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
    const result = await BarberShop.updateMany(
        { shop_img: { $exists: true } },
        [
            {
                $set: {
                    cover_photo: {
                        $cond: [
                            { $eq: [{ $type: "$cover_photo" }, "missing"] },
                            "$shop_img",
                            "$cover_photo"
                        ]
                    }
                }
            },
            {
                $unset: "shop_img"
            }
        ],
        { updatePipeline: true }

    );

    console.log(`Modified ${result.modifiedCount} barber shops`);
};
migrateBarberShops()