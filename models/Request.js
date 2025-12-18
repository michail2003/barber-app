const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  barberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Barber",
    required: true
  },
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  receiverId:{
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  role:{
    type: String,
    enum: ['barber','user'],
    required: true
  },
  serviceId: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }],
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  status: {
    type: String,
    enum: ['accepted','cancelled','modified','pending'],
    default: 'pending'
  }
}, { timestamps: true });

const Request = mongoose.model("Request", RequestSchema);

module.exports =  {Request} ;
