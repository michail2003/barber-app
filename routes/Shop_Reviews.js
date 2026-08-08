const express = require('express');
const axios = require('axios');
const router = express.Router();
const { Reviews } = require('../models/Reviews');
const Shop = require('../models/Shop');
const User = require('../models/User');
const { find_in_db } = require('../global_functions');

router.get('/google/:placeID', async (req, res) => {
    try {
        const { placeID } = req.params;

        // Basic validation
        if (!placeID || typeof placeID !== 'string') {
            return res.status(400).json({
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
                message:
                    error.response.data?.error?.message ||
                    'Google Places API request failed.'
            });
        }

        // Request timed out
        if (error.code === 'ECONNABORTED') {
            return res.status(504).json({
                message: 'Google Places API request timed out.'
            });
        }

        // Other network/server error
        return res.status(500).json({
            message: 'Unable to retrieve Google reviews.'
        });
    }
});

router.post('/post-review/:shopID', async (req, res) => {
    try {
        const { shopID } = req.params;
        const { UserID, rating, comment } = req.body;

        // shopID validation
        const shop = await find_in_db(Shop, shopID, res, 'Shop not found');
        if (!shop) return;

        // user validation
        const user = await find_in_db(User, UserID, res, 'User not found');
        if (!user) return;


        //create a new review
        const newReview = await Reviews.create({
            shopId: shopID,
            userId: UserID,
            rating,
            comment
        });

        if (!newReview) {
            return res.status(400).json({
                message: 'Failed to post the review.'
            });
        }

        return res.status(201).json({
            message: 'Review posted successfully.',
            review: newReview
        });

    } catch (error) {
        console.error('Error posting review:', error);
        return res.status(500).json({
            message: 'Unable to post review.'
        });
    }
});

router.get('/:shopID', async (req, res) => {
    try {
        const { shopID } = req.params;

        // shopID validation
        const shop = await find_in_db(Shop, shopID, res, 'Shop not found');
        if (!shop) return;

        // Fetch reviews for the shop, sorted by creation date (newest first)
        const reviews = await Reviews.find({ shopId: shopID })
            .sort({ createdAt: -1 })
            .populate('userId', 'name'); // Populate user details

        // Check if reviews exist
        if (!reviews || reviews.length === 0) {
            return res.status(404).json({
                message: 'No reviews found for this shop.'
            });
        }

        return res.status(200).json({
            reviews
        });

    } catch (error) {
        console.error('Error fetching shop reviews:', error);
        return res.status(500).json({
            message: 'Unable to fetch shop reviews.'
        });
    }
});

module.exports = router;