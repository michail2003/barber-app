const express = require('express');
const axios = require('axios');
const router = express.Router();
const { Reviews } = require('../models/Reviews');
const Shop = require('../models/Shop');
const User = require('../models/User');
const { find_in_db } = require('../global_functions');
const dayjs = require('dayjs');

async function getGooglePlaceReviews(placeID) {

    try {
        const response = await axios.get(
            `https://places.googleapis.com/v1/places/${encodeURIComponent(placeID)}`,
            {
                headers: {
                    'X-Goog-Api-Key':
                        process.env.GOOGLE_MAPS_API_KEY_REVIEWS,

                    'X-Goog-FieldMask': [
                        'rating',
                        'userRatingCount',
                        'reviews.rating',
                        'reviews.text',
                        'reviews.authorAttribution.displayName',
                        'reviews.authorAttribution.photoUri',
                        'reviews.publishTime'
                    ].join(',')
                },
                timeout: 5000
            }
        );


        return response.data;

    } catch (error) {


        console.error(
            'Google Places error:',
            error.response?.data || error.message
        );

        return null;
    }
}

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
        const { placeID } = req.query;

        const shop = await find_in_db(
            Shop,
            shopID,
            res,
            'Shop not found'
        );

        if (!shop) return;


        const [dbReviews, googleData] = await Promise.all([
            Reviews.find({ shopId: shopID })
                .sort({ createdAt: -1 })
                .populate('userId', 'name')
                .lean(),

            placeID
                ? getGooglePlaceReviews(placeID)
                : Promise.resolve(null)
        ]);

        const localReviews = dbReviews.map(review => ({
            source: 'fringo',
            rating: review.rating,
            comment: review.comment,
            user: review.userId?.name || 'Unknown',
            date: dayjs(review.createdAt).toISOString()
        }));

        const googleReviews = (googleData?.reviews || []).map(review => ({
            source: 'google',
            rating: review.rating,
            comment: review.text?.text || '',
            user: review.authorAttribution?.displayName || 'Google User',
            userImage: review.authorAttribution?.photoUri || null,
            date: dayjs(review.publishTime).toISOString()
        }));

        const allReviews = [
            ...localReviews,
            ...googleReviews
        ].sort(
            (a, b) =>
                dayjs(b.date).valueOf() -
                dayjs(a.date).valueOf()
        );


        const avgRating = dbReviews.length
            ? dbReviews.reduce(
                (total, review) => total + review.rating,
                0
            ) / dbReviews.length
            : 0;


        return res.status(200).json({
            avgRating,
            reviews: allReviews
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Unable to fetch shop reviews.'
        });
    }
});

module.exports = router;