const mongoose = require("mongoose");

const Barber = require("./models/barber")
const BarberShop = require("./models/Shop")
const Request = require("./models/Request")
const Reservation = require("./models/Reservation")
const Review = require("./models/Reviews")
const Service = require("./models/service")
const User = require("./models/User")

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


async function format_services(barberId, shopId, serviceIds) {
    const barber = await Barber.findOne({
        _id: barberId,
        shopId,
        "services.service": { $in: serviceIds }
    }).select("services").lean();

    const shop = await BarberShop.findOne({
        _id: shopId,
        "services.service": { $in: serviceIds }
    }).select("services").lean();

    const services = await Service.find({
        _id: { $in: serviceIds }
    }).select("name").lean();

    const barberMap = new Map(
        barber.services.map(s => [s.service.toString(), s])
    );

    const shopMap = new Map(
        shop.services.map(s => [s.service.toString(), s])
    );

    const serviceMap = new Map(
        services.map(s => [s._id.toString(), s])
    );

    return serviceIds.map(id => {
        const key = id.toString();

        const globalService = serviceMap.get(key);
        const shopService = shopMap.get(key);
        const barberService = barberMap.get(key);

        return {
            serviceID: key,
            name: globalService.name,
            price: shopService.price,
            duration: barberService.duration
        };
    });
}
module.exports = {
    find_in_db,
    isValidLatLng,
    format_services
};
