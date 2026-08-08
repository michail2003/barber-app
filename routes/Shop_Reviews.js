const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/google/:placeID', async (req, res) => {
    try {
        const { placeID } = req.params;

        // Basic validation
        if (!placeID || typeof placeID !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'A valid Google Place ID is required.'
            });
        }

        const response = await axios.get(
            `https://places.googleapis.com/v1/places/${placeID}`,
            {
                headers: {
                    'X-Goog-Api-Key':
                        process.env.GOOGLE_MAPS_API_KEY_REVIEWS,

                    'X-Goog-FieldMask': [
                        'rating',
                        'userRatingCount',
                        'reviews.rating',
                        'reviews.relativePublishTimeDescription',
                        'reviews.text',
                        'reviews.authorAttribution.displayName',
                        'reviews.authorAttribution.photoUri',
                        'reviews.publishTime'
                    ].join(',')
                },

                timeout: 5000
            }
        );

        return res.status(200).json({
            success: true,
            data: response.data
        });

    } catch (error) {

        console.error(
            'Google Places Reviews Error:',
            error.response?.data || error.message
        );

        // Google returned an HTTP error
        if (error.response) {
            return res.status(error.response.status).json({
                success: false,
                message:
                    error.response.data?.error?.message ||
                    'Google Places API request failed.'
            });
        }

        // Request timed out
        if (error.code === 'ECONNABORTED') {
            return res.status(504).json({
                success: false,
                message: 'Google Places API request timed out.'
            });
        }

        // Other network/server error
        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve Google reviews.'
        });
    }
});

module.exports = router;