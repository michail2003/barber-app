// instagramData.js

const shopInstagramProfile = {
    handle: "@barbershop_studio",
    shopName: "Studio Barber Club",
    avatar: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=200&q=80",
    instagramUrl: "https://instagram.com",
    followersCount: "4.2k",
    followingCount: "280",
    postsCount: 156,
};

const sampleInstagramPosts = [
    {
        id: "ig-1",
        imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80",
        likes: 142,
        comments: 12,
    },
    {
        id: "ig-2",
        imageUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80",
        likes: 98,
        comments: 6,
    },
    {
        id: "ig-3",
        imageUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80",
        likes: 210,
        comments: 18,
    },
    {
        id: "ig-4",
        imageUrl: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&q=80",
        likes: 175,
        comments: 14,
    },
    {
        id: "ig-5",
        imageUrl: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=600&q=80",
        likes: 320,
        comments: 29,
    },
    {
        id: "ig-6",
        imageUrl: "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=600&q=80",
        likes: 89,
        comments: 4,
    },
];

import React from "react";

export default function GallerySection() {
  const { handle, avatar, instagramUrl, followersCount, postsCount } = shopInstagramProfile;

  return (
    <div className="relative space-y-6">
      {/* 1. Sticky Header Profile Bar (Stays on Top during scroll) */}
      <div className="sticky top-0 z-20 -mx-4 -mt-4 p-4 md:-mx-8 md:-mt-8 md:p-6 bg-slate-50/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="flex items-center justify-between gap-4">
          
          {/* Avatar & Profile Info */}
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative shrink-0">
              <img
                src={avatar}
                alt={handle}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover p-0.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600"
              />
            </div>

            <div className="truncate">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 truncate">
                  {handle}
                </h3>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                <span>
                  <strong className="font-semibold text-slate-800">{postsCount}</strong> posts
                </span>
                <span>•</span>
                <span>
                  <strong className="font-semibold text-slate-800">{followersCount}</strong> followers
                </span>
              </div>
            </div>
          </div>

          {/* Visit Instagram Redirect Button */}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition active:scale-95 shrink-0"
          >
            <span>Visit</span>
            <svg
              className="w-3.5 h-3.5 stroke-current"
              fill="none"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </a>

        </div>
      </div>

      {/* 2. Instagram Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 pt-2">
        {sampleInstagramPosts.map((post) => (
          <div
            key={post.id}
            className="group relative aspect-square bg-slate-200 rounded-xl overflow-hidden cursor-pointer border border-slate-200/60"
          >
            {/* Image */}
            <img
              src={post.imageUrl}
              alt="Gallery post"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-6 text-white text-sm font-semibold">
              <div className="flex items-center gap-1.5">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span>{post.likes}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" />
                </svg>
                <span>{post.comments}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}