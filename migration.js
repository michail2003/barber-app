const mongoose = require("mongoose");
const Barber = require("./models/barber");
const Shop = require("./models/Shop");
require("dotenv").config();

const MONGO_URI = process.env.MONGODB_URI;
console.log(MONGO_URI)

async function migrateBarberServices() {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    const barbers = await Barber.find();

    for (const barber of barbers) {

        const shop = await Shop.findById(barber.shopId);

        if (!shop || !barber.services?.length) {
            continue;
        }

        for (const barberService of barber.services) {

            const shopService = shop.services.find(
                s => s._id.toString() === barberService.service.toString()
            );

            if (shopService) {
                barberService.service = shopService.service;
            }
        }

        await barber.save();

        console.log(`Updated barber: ${barber._id}`);
    }
    console.log("Migration completed");
}
migrateBarberServices()