require('dotenv').config();
const mongoose = require('mongoose');
const Barber = require('./models/barber');
const Shop = require('./models/Shop');   // adjust path
const Service = require('./models/service'); // global catalog

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected');

    const barbers = await Barber.find({});
    console.log('Barbers found:', barbers.length);

    for (const barber of barbers) {
      // 1️⃣ Find the barber's shop
      const shop = await Shop.findById("694fc3829dee317c7c722725");
      if (!shop) continue;

      // 2️⃣ Loop through all shop services
      for (const shopService of shop.services) {
        const alreadyHas = barber.services.some(
          s => s.service.toString() === shopService.service.toString()
        );

        if (!alreadyHas) {
          barber.services.push({
            service: shopService.service, // ID from shop catalog
            duration: 30 // default, can adjust per your rules
          });
        }
      }

      await barber.save();
      console.log(`Updated barber ${barber._id}`);
    }

    console.log('All barbers updated with shop services.');
    mongoose.disconnect();
  })
  .catch(err => console.error('MongoDB connection error:', err));
