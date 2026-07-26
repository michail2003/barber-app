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
  },
  service_name: {
    type:String
  },
  price:{
    type:Number
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
  },
    hours_end: {
    type:String,
  },
  ph_number:{
    type:String,
  },
  services: [BarberServiceSchema],

  reservations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reservation"
  }],

    requests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Request"
  }],
  
}, { timestamps: true });

module.exports = mongoose.model("Barber", BarberSchema);
