const cloudinary = require('cloudinary').v2;
require('dotenv').config();

async function uploadImage(publicId, buffer, folder) {
    cloudinary.config({
        cloud_name: process.env.media_cloud_name,
        api_key: process.env.media_api_key,
        api_secret: process.env.media_api_secret,
    });

    try {
        const photoDeleteResult = await deleteImage(publicId);
        console.log("Delete Result:", photoDeleteResult);

        const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;

        const uploadResult = await cloudinary.uploader.upload(base64Image, {
            public_id: publicId,
            asset_folder: folder,
        });

        return {
            message: "Image uploaded successfully",
            url: uploadResult.secure_url,
        };

    } catch (error) {
        console.log(error);
    }
}


async function deleteImage(publicId) {
    try {
        const deleteResult = await cloudinary.uploader.destroy(publicId);
        console.log("Delete Result:", deleteResult);
    } catch (error) {
        console.log(error);
    }
}
module.exports = { uploadImage };