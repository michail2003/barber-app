import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getShopReviews, postShopReview } from "../Api/Reviews";

dayjs.extend(relativeTime);

const defaultBreakdown = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
};

const formatReviewDate = (date) => {
    if (!date) return "Just now";
    const parsedDate = dayjs(date);
    return parsedDate.isValid() ? parsedDate.fromNow() : "Just now";
};

const normalizeReview = (review, index = 0) => ({
    id: review?._id || review?.id || `rev-${index}-${Date.now()}`,
    name: review?.user || review?.name || "Anonymous",
    date: formatReviewDate(review?.date),
    rating: Number(review?.rating) || 0,
    comment: review?.comment || "",
    source: review?.source || "fringo",
    avatar: review?.userImage || review?.avatar || null,
});

const buildBreakdown = (reviewList) => {
    const breakdown = { ...defaultBreakdown };

    reviewList.forEach((review) => {
        const rating = Number(review.rating);
        if (rating >= 1 && rating <= 5) {
            breakdown[Math.round(rating)] += 1;
        }
    });

    return breakdown;
};

const StarIcon = ({ filled, onClick, onMouseEnter, onMouseLeave, className = "w-5 h-5" }) => (
    <svg
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`${className} ${filled ? "text-indigo-500 fill-indigo-500" : "text-gray-300 fill-gray-200"} transition-colors cursor-pointer`}
        viewBox="0 0 24 24"
    >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
);

export default function ReviewsSection({ shopId }) {
    const [reviews, setReviews] = useState([]);
    const [storeStats, setStoreStats] = useState({
        averageRating: 0,
        totalReviews: 0,
        breakdown: { ...defaultBreakdown },
    });
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchReviews = async () => {
        if (!shopId) return;

        try {
            const response = await getShopReviews(shopId);
            const reviewList = (response?.reviews || []).map((review, index) => normalizeReview(review, index));

            setReviews(reviewList);
            setStoreStats({
                averageRating: Number(response?.avgRating || 0),
                totalReviews: reviewList.length,
                breakdown: buildBreakdown(reviewList),
            });
        } catch (error) {
            console.error("Error loading shop reviews:", error);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [shopId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        const userId = localStorage.getItem("id") || localStorage.getItem("userId");
        if (!userId || !shopId) {
            alert("Please log in to leave a review.");
            return;
        }

        setIsSubmitting(true);

        try {
            await postShopReview(shopId, {
                UserID: userId,
                ShopID: shopId,
                rating,
                comment: comment.trim(),
            });

            setComment("");
            setRating(5);
            setHoverRating(0);
            await fetchReviews();
        } catch (error) {
            console.error("Failed to submit review:", error);
            alert("Unable to post review right now.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* 1. Header & Overall Rating */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-gray-200">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                        Customer Reviews
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Real feedback from our valued clients
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-xl border border-gray-200 shadow-sm w-full sm:w-auto justify-center">
                    <div className="text-center sm:text-right">
                        <div className="text-3xl font-extrabold text-gray-900 leading-none">
                            {storeStats.averageRating}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 font-medium">
                            out of 5.0
                        </div>
                    </div>

                    <div className="h-8 w-px bg-gray-200" />

                    <div className="flex flex-col items-start">
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <StarIcon
                                    key={star}
                                    filled={star <= Math.round(storeStats.averageRating)}
                                    className="w-4 h-4"
                                />
                            ))}
                        </div>
                        <span className="text-xs text-gray-600 font-semibold mt-1">
                            {storeStats.totalReviews} total reviews
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. Modern Add Review Form */}
            <form
                onSubmit={handleSubmit}
                className="bg-white p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm space-y-4"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">Leave a review</h3>
                    </div>

                    {/* Interactive Star Picker */}
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                                key={star}
                                filled={star <= (hoverRating || rating)}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="w-6 h-6 hover:scale-110 transition-transform"
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <textarea
                        required
                        rows={3}
                        placeholder="Share details of your experience..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition resize-none"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition active:scale-[0.98] ${isSubmitting ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                        {isSubmitting ? "Posting..." : "Post Review"}
                    </button>
                </div>
            </form>

            {/* 3. Review Feed */}
            <div className="space-y-4 pt-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Reviews ({reviews.length})
                </h3>

                <div className="space-y-3">
                    {reviews.map((rev) => (
                        <div
                            key={rev.id}
                            className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm transition hover:border-gray-300"
                        >
                            <div className="flex items-start justify-between gap-4">
                                {/* User Info */}
                                <div className="flex items-center gap-3">
                                    {rev.avatar ? (
                                        <img
                                            src={rev.avatar}
                                            alt={rev.name}
                                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 font-bold text-sm flex items-center justify-center uppercase border border-indigo-100">
                                            {rev.name?.charAt(0) || "A"}
                                        </div>
                                    )}

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-semibold text-gray-900">
                                                {rev.name}
                                            </h4>

                                            {/* Google Badge */}
                                            {rev.source === "google" && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                    <svg
                                                        className="w-3 h-3 fill-indigo-600"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                                                    </svg>
                                                    Google
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-400">{rev.date}</span>
                                    </div>
                                </div>

                                {/* Star Rating Display */}
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <StarIcon
                                            key={star}
                                            filled={star <= rev.rating}
                                            className="w-4 h-4 cursor-default"
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Comment Content */}
                            <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                                {rev.comment}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}