const mongoose = require('mongoose');

/* ---------------- SERVICES  ---------------- */

const BarberServiceSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  duration: {
    type: Number, // minutes
    required: true
  }
});
/* ---------------- BARBER ---------------- */
const BarberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BarberShop",
    required: true
  },
  hours_start: {
    type:String,
    required: true
  },
    hours_end: {
    type:String,
    required: true
  },
  services: [BarberServiceSchema],
  reservations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reservation"
  }],
}, { timestamps: true });

module.exports = mongoose.model("Barber", BarberSchema);
