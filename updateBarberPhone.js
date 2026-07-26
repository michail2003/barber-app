const mongoose = require("mongoose");
const Barber = require("./models/Barber"); // adjust path

mongoose.connect("")
    .then(async () => {
        const result = await Barber.updateMany(
            { ph_number: { $exists: true } },
            {
                $unset: {
                     ph_number: ""
                }
            }
        );

        console.log(`Updated ${result.modifiedCount} barbers`);

        mongoose.disconnect();
    })
    .catch(err => {
        console.error(err);
        mongoose.disconnect();
    });