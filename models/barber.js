const mongoose = require('mongoose');

/* ---------------- SERVICES (embedded in Barber) ---------------- */
const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true } // minutes
});

/* ---------------- BARBER ---------------- */
const BarberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BarberShop",
    required: true
  },
  hours: { type: String, required: true }, // "09:00-21:00"
  services: [ServiceSchema],
  reservations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reservation"
  }],
}, { timestamps: true });

const Barber = mongoose.model("Barber", BarberSchema);

module.exports = { Barber };
