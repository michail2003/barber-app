const mongoose = require("mongoose");
const slugify = require("slugify");
const service = require("./service");

const ServiceCatalog = new mongoose.Schema(
  {
    service:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
    price:{
      type: Number
    }
  }
)
const BarberShopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      index: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    hours_start: {
      type: String,
      required: true
    },
    hours_end: {
      type: String,
      require: true
    },
    logo_url: {
      type: String,
      trim: true
    },
    services: [ServiceCatalog],
  },
  { timestamps: true }
);

BarberShopSchema.pre("save", function () {

  const suffix = this._id.toString().slice(-3);
  this.slug = `${this.name}-${suffix}`;

});

module.exports = mongoose.model("BarberShop", BarberShopSchema);
