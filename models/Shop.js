const mongoose = require("mongoose");
const slugify = require("slugify");
const service = require("./service");

const ServiceCatalog = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
    price: {
      type: Number
    },
    service_name: {
      type: String
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
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true } // [lng, lat], used for queries/map
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
    shop_img: {
      type: String,
      trim: true
    },
    services: [ServiceCatalog],
    
    instagram: {
      connected: { type: Boolean, default: false },
      accessToken: { type: String, select: false }, // select:false so it's never returned by default queries
      instagramUserId: { type: String },
      username: { type: String },
      tokenExpiresAt: { type: Date },
      lastSyncedAt: { type: Date },
    },
  },
  { timestamps: true }
);

BarberShopSchema.pre("save", function () {

  const suffix = this._id.toString().slice(-3);
  this.slug = `${this.name}-${suffix}`;

});
BarberShopSchema.index({ location: '2dsphere' })

module.exports = mongoose.model("BarberShop", BarberShopSchema);
