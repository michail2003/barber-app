const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
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
      serviceID:{ type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      duration: { type: Number, required: true } // in minutes
    }
  ],

  start: { type: String, required: true },

  end: { type: String, required: true },

  total_price: { type: Number, required: true },

  duration: { type: Number, required: true },

  status: {
    type: String,
    enum: ['accepted', 'cancelled', 'modified', 'pending'],
    default: 'pending'
  }
}, { timestamps: true });


const Request = mongoose.model("Request", RequestSchema);

module.exports = { Request };
