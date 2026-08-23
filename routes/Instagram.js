const express = require('express');
const router = express.Router();

// GET /api/auth/instagram/connect/:shopId
router.get('/instagram/connect/:shopId', (req, res) => {
    const { shopId } = req.params;

    const authUrl = new URL('https://www.instagram.com/oauth/authorize');
    authUrl.searchParams.set('client_id', process.env.IG_APP_ID);
    authUrl.searchParams.set('redirect_uri', process.env.IG_REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'instagram_business_basic');
    authUrl.searchParams.set('state', shopId); // pass shopId through so callback knows which shop to update

    res.redirect(authUrl.toString());
});


// GET /api/auth/instagram/callback
router.get('/instagram/callback', async (req, res) => {
    const { code, state: shopId } = req.query;

    if (!code || !shopId) {
        return res.status(400).json({ error: 'Missing code or state' });
    }

    try {
        // 1. exchange code for short-lived token
        const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.IG_APP_ID,
                client_secret: process.env.IG_APP_SECRET,
                grant_type: 'authorization_code',
                redirect_uri: process.env.IG_REDIRECT_URI,
                code,
            }),
        });
        const tokenData = await tokenRes.json();

        if (!tokenData.access_token) {
            console.error('IG token exchange failed:', tokenData);
            return res.status(400).json({ error: 'Instagram authorization failed' });
        }

        const { access_token: shortLivedToken, user_id } = tokenData;

        // 2. exchange short-lived token for long-lived (60-day) token
        const longLivedRes = await fetch(
            `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.IG_APP_SECRET}&access_token=${shortLivedToken}`
        );
        const longLivedData = await longLivedRes.json();

        if (!longLivedData.access_token) {
            console.error('IG long-lived exchange failed:', longLivedData);
            return res.status(400).json({ error: 'Failed to get long-lived token' });
        }

        const { access_token: longLivedToken, expires_in } = longLivedData;

        // 3. save to the shop
        const shop = await Shop.findByIdAndUpdate(
            shopId,
            {
                instagram: {
                    connected: true,
                    accessToken: longLivedToken,
                    instagramUserId: user_id,
                    tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
                },
            },
            { new: true }
        );

        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        // 4. redirect back to your frontend dashboard
        res.redirect(`${process.env.FRONTEND_URL}/dashboard?ig=connected`);
    } catch (err) {
        console.error('Instagram callback error:', err);
        res.status(500).json({ error: 'Something went wrong connecting Instagram' });
    }
});


// GET /api/shops/:shopId/instagram
router.get('/:shopId/instagram', async (req, res) => {
    const { shopId } = req.params;

    try {
        const shop = await Shop.findById(shopId).select('+instagram.accessToken');

        if (!shop || !shop.instagram?.connected) {
            return res.status(404).json({ error: 'Instagram not connected for this shop' });
        }

        const { accessToken, instagramUserId } = shop.instagram;

        // fetch profile info (followers, following, media count, username)
        const profileRes = await fetch(
            `https://graph.instagram.com/${instagramUserId}?fields=username,account_type,media_count,followers_count,follows_count&access_token=${accessToken}`
        );
        const profileData = await profileRes.json();

        if (profileData.error) {
            console.error('IG profile fetch error:', profileData.error);
            return res.status(400).json({ error: 'Failed to fetch Instagram profile' });
        }

        // fetch media (photos/videos)
        const mediaRes = await fetch(
            `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${accessToken}`
        );
        const mediaData = await mediaRes.json();

        if (mediaData.error) {
            console.error('IG media fetch error:', mediaData.error);
            return res.status(400).json({ error: 'Failed to fetch Instagram media' });
        }

        // update lastSyncedAt
        await Shop.findByIdAndUpdate(shopId, { 'instagram.lastSyncedAt': new Date() });

        res.json({
            profile: {
                username: profileData.username,
                accountType: profileData.account_type,
                mediaCount: profileData.media_count,
                followers: profileData.followers_count,
                following: profileData.follows_count,
            },
            media: mediaData.data,
        });
    } catch (err) {
        console.error('Instagram fetch route error:', err);
        res.status(500).json({ error: 'Something went wrong fetching Instagram data' });
    }
});
module.exports = router;