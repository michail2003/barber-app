const mongoose = require("mongoose");
const Barber = require("./models/Barber"); // adjust path

mongoose.connect("mongodb://michail:FIFA19ea@ac-abruomg-shard-00-00.e4mecnf.mongodb.net:27017,ac-abruomg-shard-00-01.e4mecnf.mongodb.net:27017,ac-abruomg-shard-00-02.e4mecnf.mongodb.net:27017/?ssl=true&replicaSet=atlas-f8guf2-shard-0&authSource=admin&appName=Michail-Production")
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