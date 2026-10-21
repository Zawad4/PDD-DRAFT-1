import React, { useState } from 'react';
import { Trophy } from 'lucide-react';

/**
 * Robust VenueImage component that safely renders venue/turf images
 * with error boundaries, fallback UI logging, responsive positioning,
 * and support for full image alignment (fitMode='cover' | 'contain').
 */
export default function VenueImage({
  src,
  alt = 'Venue image',
  className = '',
  aspectRatio = 'aspect-[16/9]',
  fitMode = 'cover', // 'cover' | 'contain'
  fallbackText = 'Sports Arena',
  ...props
}) {
  const [imageError, setImageError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleImageError = () => {
    console.warn(`[VenueImage Warning] Image failed to load for "${alt}": ${src}`);
    setImageError(true);
  };

  // If aspect ratio is specified by parent className or explicitly set to empty
  const hasParentAspectOrHeight = className.includes('aspect-') || className.includes('h-full') || className.includes('h-');
  const aspectClass = hasParentAspectOrHeight ? '' : aspectRatio;

  // Safe fallback if src is missing or image load fails
  if (!src || imageError) {
    return (
      <div 
        className={`w-full ${aspectClass} bg-gradient-to-br from-neutral-900 via-neutral-800 to-emerald-950/40 border border-white/10 flex flex-col items-center justify-center p-4 text-center select-none ${className}`}
      >
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-2 text-emerald-400">
          <Trophy className="w-6 h-6" />
        </div>
        <span className="text-xs font-bold text-neutral-200 tracking-wide line-clamp-1">{alt || fallbackText}</span>
        <span className="text-[10px] text-neutral-500 mt-0.5">Turfington Verified Venue</span>
      </div>
    );
  }

  const fitClass = fitMode === 'contain' ? 'object-contain object-center bg-black/80' : 'object-cover object-center';

  return (
    <div className={`relative overflow-hidden ${aspectClass} ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-neutral-900 animate-pulse border border-white/5" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={handleImageError}
        className={`w-full h-full ${fitClass} transition-all duration-300 ${
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
        }`}
        {...props}
      />
    </div>
  );
}
