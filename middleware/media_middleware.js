const rateLimit = require('express-rate-limit');
const multer = require('multer');


const allowedFormats = [
    'image/jpeg',
    'image/png',
    'image/webp'
];

function checkImageFormat(req, res, next) {
    if (!req.files) return next(); // no files uploaded at all, that's fine

    const files = Object.values(req.files).flat(); // flatten { cover_photo: [...], profile_pic: [...] }

    for (const file of files) {
        if (!allowedFormats.includes(file.mimetype)) {
            return res.status(400).json({
                message: 'Only JPEG, PNG and WEBP images are allowed'
            });
        }
    }

    next();
}

const uploadSize = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

const uploadRateLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: {
        message: 'Too many upload requests. Please try again later.'
    }
});

module.exports = { checkImageFormat, uploadSize, uploadRateLimit };