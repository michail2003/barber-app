const mongoose = require("mongoose");
const dayjs = require("dayjs");

async function adding_services_to_shop(services,ServicesDB) {

    /// format + basic field check
    const invalidService = services.find(s =>
        !s ||
        !mongoose.Types.ObjectId.isValid(s.service) ||
        typeof s.price !== 'number' ||
        s.price <= 0
    );

    if (invalidService) {
        return 'One or more services have invalid or missing data';
    }

    const serviceIds = services.map(s => s.service);

    // existence check against global services catalog
    const foundCount = await ServicesDB.countDocuments({ _id: { $in: serviceIds } });

    if (foundCount !== serviceIds.length) {
        return 'One or more services do not exist';
    }

    return null; // no errors
}


function validate_Shop_Hours(start, end, barbers) {
    const shopStart = dayjs(start, "HH:mm");
    const shopEnd = dayjs(end, "HH:mm");

    const conflicts = barbers
        .filter(barber => {
            const start = dayjs(barber.hours_start, "HH:mm");
            const end = dayjs(barber.hours_end, "HH:mm");

            return start.isBefore(shopStart) || end.isAfter(shopEnd);
        })
        .map(barber => ({
            name: barber.name,
            hours: `${barber.hours_start} - ${barber.hours_end}`
        }));

    if (conflicts.length) {
        return {
            message: "Some barbers have working hours outside the shop schedule.",
            conflicts
        };
    }

    return null; // no conflicts
}
module.exports = {
    adding_services_to_shop,
    validate_Shop_Hours
};