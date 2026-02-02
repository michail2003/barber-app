const mongoose = require('mongoose');
require('dotenv').config(); // make sure MONGODB_URI is in .env

const Shop = require('./models/Shop'); // adjust path
const Service = require('./models/service');  // adjust path

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const shops = await Shop.find({});

    for (const shop of shops) {
      let updated = false;

      for (const catalogService of shop.services) {
        if (!catalogService.service_name) {
          // fetch the global service
          const globalService = await Service.findById(catalogService.service);
          if (globalService) {
            catalogService.service_name = globalService.name;
            updated = true;
          } else {
            console.warn(`Service not found: ${catalogService.service}`);
          }
        }
      }

      if (updated) {
        await shop.save();
        console.log(`Updated shop ${shop._id}`);
      }
    }

    console.log('Migration completed');
    process.exit(0);

  } catch (err) {
    console.error('Migration failed', err);
    process.exit(1);
  }
}

migrate();
