const mongoose = require("mongoose");
const slugify = require("slugify");


const BarberShopSchema = new mongoose.Schema(
  {
    nipt: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
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
    opening_hours: {
      type: String,
      trim: true
    },
    logo_url: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

BarberShopSchema.pre("save", function () {

  const suffix = this._id.toString().slice(-3);
  this.slug = `${this.name}-${suffix}`;
  
});

module.exports = mongoose.model("BarberShop", BarberShopSchema);
