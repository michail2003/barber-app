const mongoose = require('mongoose');
/* ---------------- RESERVATIONS (embedded in Barber) ---------------- */
const ReservationSchema = new mongoose.Schema({
  // userid : {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User",
  //   required: true
  // },
  barberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Barber",
    required: true
  },
  serviceId: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }],
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  customer_name: { type: String, required: true },
  customer_phone: { type: String, required: true },
  status: {
    type: String,
    enum: ['confirmed','completed','modified','cancelled'],
    default: 'confirmed'
  }
}, { timestamps: true });

const Reservation = mongoose.model("Reservation", ReservationSchema);

module.exports =  {Reservation} ;
