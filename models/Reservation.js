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
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BarberShop",
    required: true
  },
  services: [
    {
      id: {
        type: String,
        required: true
      },
      Service_name: {
        type: String,
        required: true,
        trim: true
      }
    }
  ],
  start: { type: String, required: true },
  end: { type: String, required: true },
  total_price: { type: Number, required: true },
  duration: { type: Number, required: true },
  status: {
    type: String,
    enum: ['confirmed', 'completed', 'modified', 'cancelled']
  }
}, { timestamps: true });

ReservationSchema.index({ shopId: 1, status: 1, start: 1, userid:1 });

const Reservation = mongoose.model("Reservation", ReservationSchema);

module.exports = { Reservation };
