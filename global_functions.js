const mongoose = require("mongoose");


async function find_in_db(Model, id, res, notFoundMessage = 'Resource not found') {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: 'Invalid id' });
        return null;
    }

    const doc = await Model.findById(id);
    if (!doc) {
        res.status(404).json({ message: notFoundMessage });
        return null;
    }

    return doc;
}


function isValidLatLng(location) {
    if (!Array.isArray(location) || location.length !== 2) {
        return false;
    }

    const [lat, lng] = location;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
        return false;
    }

    if (lat < -90 || lat > 90) {
        return false;
    }

    if (lng < -180 || lng > 180) {
        return false;
    }

    return true;
}
module.exports = {
    find_in_db,
    isValidLatLng
};
