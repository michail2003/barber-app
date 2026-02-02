const mongoose = require('mongoose');
require('dotenv').config();

const Barber = require('./models/barber');
const Shop = require('./models/Shop');

function getRandomDuration(min = 15, max = 60) {
  // Random duration in minutes between min and max
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function resetBarberServices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const barbers = await Barber.find({}).populate('shopId');

    for (const barber of barbers) {
      const shop = barber.shopId;
      if (!shop) {
        console.warn(`Barber ${barber._id} has no shop linked`);
        continue;
      }

      // Reset services
      barber.services = shop.services.map(catalogService => ({
        service: catalogService._id,          // catalog entry ID
        service_name: catalogService.service_name,
        price: catalogService.price,
        duration: getRandomDuration()         // random duration
      }));

      await barber.save();
      console.log(`Reset services for barber ${barber._id}`);
    }

    console.log('All barber services have been reset from shop catalog.');
    process.exit(0);

  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

resetBarberServices();
