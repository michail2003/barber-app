const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
    {
        shopId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BarberShop",
            required: true,
            index: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

        comment: {
            type: String,
            trim: true,
            maxlength: 500
        }
    },
    { timestamps: true }
);

ReviewSchema.index({ shopId: 1, createdAt: -1 });

const Reviews = mongoose.model("Review", ReviewSchema);

module.exports = { Reviews };