const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    ph_number: { type: String, required: true },
    name: { type: String, required: true },
    role: {
        type: String,
        enum: ['admin', 'barber','user', 'barber_admin']
    }
});

module.exports = mongoose.model('User', UserSchema);