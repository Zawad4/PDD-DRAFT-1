import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Clock, ArrowRight, Play, Award, ChevronRight } from 'lucide-react';

// Curated sports hero background images (15 user-uploaded sports visuals)
const backgrounds = [
  '/hero/hero_cricket_batsman.jpg',
  '/hero/hero_football_grass.jpg',
  '/hero/hero_basketball_sunset.jpg',
  '/hero/hero_basketball_aerial.jpg',
  '/hero/hero_football_stadium_goal.jpg',
  '/hero/hero_badminton_rackets.jpg',
  '/hero/hero_badminton_smash.jpg',
  '/hero/hero_billiards_rack.jpg',
  '/hero/hero_pool_billiards.jpg',
  '/hero/hero_table_tennis_paddle.jpg',
  '/hero/hero_table_tennis_court.jpg',
  '/hero/hero_bowling_green_ball.jpg',
  '/hero/hero_bowling_lane_pins.jpg',
  '/hero/hero_pickleball_net.jpg',
  '/hero/hero_pickleball_court.jpg'
];

// Fisher-Yates shuffle ensuring all items are shown once per epoch cycle
function shuffleArray(arr, avoidFirst = null) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  // Ensure the first image of a new cycle is not the same as the last image of previous cycle
  if (avoidFirst && shuffled.length > 1 && shuffled[0] === avoidFirst) {
    const swapIdx = Math.floor(Math.random() * (shuffled.length - 1)) + 1;
    [shuffled[0], shuffled[swapIdx]] = [shuffled[swapIdx], shuffled[0]];
  }
  return shuffled;
}

export default function Landing({ setTab, setPreSelectedSport }) {
  // Epoch playlist: holds a shuffled array of all 15 images
  const [epochPlaylist, setEpochPlaylist] = useState(() => shuffleArray(backgrounds));
  const [epochIndex, setEpochIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setEpochIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        // When one complete epoch cycle finishes, reshuffle all 15 images and start the next epoch
        if (nextIndex >= epochPlaylist.length) {
          const lastImage = epochPlaylist[epochPlaylist.length - 1];
          setEpochPlaylist(shuffleArray(backgrounds, lastImage));
          return 0;
        }
        return nextIndex;
      });
    }, 3000); // 3 seconds transition time

    return () => clearInterval(interval);
  }, [epochPlaylist]);

  const currentBg = epochPlaylist[epochIndex] || backgrounds[0];

  return (
    <div className="relative min-h-screen bg-[#080808] overflow-hidden">
      {/* 1. Background Slider - Shuffled epoch cycles, 3s interval, no zoom distortion */}
      <div className="absolute inset-0 z-0 w-full h-full overflow-hidden bg-[#080808]">
        <AnimatePresence>
          <motion.div
            key={currentBg}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.42 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat pointer-events-none"
            style={{ 
              backgroundImage: `url(${currentBg})`,
              backgroundPosition: 'center center'
            }}
          />
        </AnimatePresence>
        
        {/* Apple-style smooth gradient mask */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]/80 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/90 via-transparent to-[#080808]/90 z-10 pointer-events-none" />
      </div>

      {/* 2. Hero Section */}
      <div className="relative z-20 flex flex-col justify-center min-h-[90vh] px-6 md:px-16 lg:px-24 max-w-7xl mx-auto pt-24">
        <div className="flex flex-col items-start max-w-3xl space-y-8 text-left">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full glass-card border border-white/5 text-xs text-neutral-300 font-bold font-avantgarde tracking-wider uppercase"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>THE NEW SPORTING ERA</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold font-avantgarde tracking-tight text-white leading-[1.05] hero-heading"
            style={{ fontFamily: "'Avant Garde Gothic', 'ITC Avant Garde Gothic Std', 'ITC Avant Garde Gothic', 'Century Gothic', sans-serif" }}
          >
            Find Your Game.<br />
            <span className="chrome-text">Find Your People.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-neutral-400 text-lg md:text-xl font-light max-w-xl leading-relaxed"
          >
            Discover sports, connect with players, book venues, join games, and be part of the community.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap gap-4 w-full sm:w-auto"
          >
            <button 
              onClick={() => setTab('discovery')}
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-white text-black font-bold font-avantgarde rounded-full overflow-hidden hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.25)] tracking-wide"
            >
              Explore Nearby
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button 
              onClick={() => setTab('discovery')}
              className="group inline-flex items-center justify-center px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold font-avantgarde rounded-full border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-md tracking-wide"
            >
              Book Activity
            </button>
          </motion.div>
        </div>
      </div>




    </div>
  );
}
