import React, { useState, useEffect } from 'react';

/**
 * UserAvatar component:
 * 1. Custom uploaded PFP or Google photo URL (starts with http/data:) is rendered if present.
 * 2. If no photo or image fails to load, renders an initial letter avatar badge (first letter of user's name or email).
 * 3. Never renders static preset stock photos or robot avatars.
 */
export default function UserAvatar({ user, className = "w-10 h-10 text-sm", alt = "" }) {
  const [imgError, setImgError] = useState(false);
  
  const rawAvatar = user?.avatar_url || user?.avatar || user?.photoURL || '';

  // Reset image error state whenever avatar URL changes so new PFP renders instantly
  useEffect(() => {
    setImgError(false);
  }, [rawAvatar]);
  const isPhoto = rawAvatar 
    && !imgError 
    && (rawAvatar.startsWith('data:') || rawAvatar.startsWith('http')) 
    && !rawAvatar.includes('ui-avatars.com');

  const initial = (user?.full_name || user?.name || user?.email || user?.username || 'U').trim().charAt(0).toUpperCase() || 'U';

  // Dynamic gradient based on initial letter
  const gradients = [
    'from-indigo-600 via-indigo-700 to-violet-900',
    'from-emerald-600 via-teal-700 to-green-900',
    'from-amber-600 via-orange-700 to-yellow-900',
    'from-rose-600 via-pink-700 to-red-900',
    'from-cyan-600 via-blue-700 to-indigo-900',
    'from-fuchsia-600 via-purple-700 to-violet-900'
  ];
  const charCode = initial.charCodeAt(0) || 0;
  const gradient = gradients[charCode % gradients.length];

  if (isPhoto) {
    return (
      <img
        src={rawAvatar}
        alt={alt || user?.full_name || 'User Avatar'}
        onError={() => setImgError(true)}
        className={`rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-gradient-to-br ${gradient} text-white font-black flex items-center justify-center select-none shrink-0 shadow-md ${className}`}
    >
      <span>{initial}</span>
    </div>
  );
}
