const mongoose = require('mongoose');
/* ---------------- RESERVATIONS (embedded in Barber) ---------------- */
const ReservationSchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  barberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Barber",
    required: true
  },
  services: [{type: String, required: true}],
  start: { type: String, required: true },
  end: { type: String, required: true },
  total_price: { type: Number, required: true },
  duration: { type: Number, required: true },
  status: {
    type: String,
    enum: ['confirmed', 'completed', 'modified', 'cancelled']
  }
}, { timestamps: true });

const Reservation = mongoose.model("Reservation", ReservationSchema);

module.exports = { Reservation };
