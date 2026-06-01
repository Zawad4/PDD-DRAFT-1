import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Clock, ArrowRight, Play, Award, ChevronRight } from 'lucide-react';

// Cinematic background images for sports
const backgrounds = [
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1920&auto=format&fit=crop', // Football
  'https://images.unsplash.com/photo-1511067007398-7e4b90cfa4bc?q=80&w=1920&auto=format&fit=crop', // Table Tennis
  'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1920&auto=format&fit=crop', // Badminton
  'https://images.unsplash.com/photo-1538388149142-f82611d4d6c4?q=80&w=1920&auto=format&fit=crop', // Basketball/Arena
  'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?q=80&w=1920&auto=format&fit=crop'  // Bowling
];

const categories = [
  { name: 'Football', icon: '⚽', count: '14 Active' },
  { name: 'Cricket', icon: '🏏', count: '8 Active' },
  { name: 'Badminton', icon: '🏸', count: '22 Active' },
  { name: 'Table Tennis', icon: '🏓', count: '12 Active' },
  { name: 'Bowling', icon: '🎳', count: '6 Active' },
  { name: '8 Ball Pool', icon: '🎱', count: '9 Active' },
  { name: 'Pickleball', icon: '🏓', count: '15 Active' },
  { name: 'Gaming', icon: '🎮', count: '18 Active' },
  { name: 'Foosball', icon: '⚽', count: '4 Active' },
  { name: 'Basketball', icon: '🏀', count: '10 Active' }
];

export default function Landing({ setTab, setPreSelectedSport }) {
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#080808] overflow-hidden">
      {/* 1. Cinematic Background Slider */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={bgIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.35, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${backgrounds[bgIndex]})` }}
          />
        </AnimatePresence>
        
        {/* Apple-style smooth gradient mask */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]/80 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/90 via-transparent to-[#080808]/90 z-10" />
      </div>

      {/* 2. Hero Section */}
      <div className="relative z-20 flex flex-col justify-center min-h-[90vh] px-6 md:px-16 lg:px-24 max-w-7xl mx-auto pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-8 text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full glass-card border border-white/5 text-xs text-neutral-400 font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>THE NEW SPORTING ERA</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl md:text-6xl font-black font-display tracking-tight text-white leading-[1.05]"
            >
              Find Players.<br />
              Book Activities.<br />
              <span className="chrome-text">Build Your Game.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-neutral-400 text-lg md:text-xl font-light max-w-xl leading-relaxed"
            >
              Join nearby sessions, discover elite players, and reserve sports experiences instantly on the ultimate sports matchmaking network.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-wrap gap-4 w-full sm:w-auto"
            >
              <button 
                onClick={() => setTab('discovery')}
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-white text-black font-semibold rounded-full overflow-hidden hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.25)]"
              >
                Explore Nearby
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => setTab('discovery')}
                className="group inline-flex items-center justify-center px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-full border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-md"
              >
                Book Activity
              </button>
            </motion.div>
          </div>

          {/* Right Floating Cards Column */}
          <div className="lg:col-span-5 relative h-[420px] hidden md:flex items-center justify-center">
            
            {/* Card 1: Football Match */}
            <motion.div
              initial={{ opacity: 0, x: 50, y: -40 }}
              animate={{ opacity: 1, x: 0, y: -20 }}
              transition={{ duration: 1, delay: 0.4 }}
              animate-y={{ y: [-20, -10, -20] }}
              style={{ top: '10%' }}
              onClick={() => {
                if (typeof setPreSelectedSport === 'function') {
                  setPreSelectedSport('Football');
                }
                setTab('discovery');
              }}
              className="absolute right-4 w-[300px] glass-card p-6 shadow-2xl z-20 hover:-translate-y-4 hover:border-white/20 hover:shadow-white/5 transition-all duration-500 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-2xl">⚽</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/5">
                  Football
                </span>
              </div>
              <h3 className="font-display font-bold text-white text-lg">Football Match</h3>
              <p className="text-xs text-neutral-400 mt-1 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1" /> Astro Turf • 2 km away
              </p>
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5">
                <span className="text-xs text-neutral-400 flex items-center">
                  <Users className="w-3.5 h-3.5 mr-1" /> 8/12 joined
                </span>
                <span className="text-xs text-white font-semibold flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-neutral-400" /> 6:00 PM
                </span>
              </div>
            </motion.div>

            {/* Card 2: TT Session */}
            <motion.div
              initial={{ opacity: 0, x: -50, y: 40 }}
              animate={{ opacity: 1, x: -60, y: 80 }}
              transition={{ duration: 1, delay: 0.6 }}
              onClick={() => {
                if (typeof setPreSelectedSport === 'function') {
                  setPreSelectedSport('Table Tennis');
                }
                setTab('discovery');
              }}
              className="absolute left-6 w-[280px] glass-card p-6 shadow-2xl z-30 hover:-translate-y-2 hover:border-white/20 transition-all duration-500 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-2xl">🏓</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded-full border border-white/5">
                  Table Tennis
                </span>
              </div>
              <h3 className="font-display font-bold text-white text-lg">TT Session</h3>
              <p className="text-xs text-neutral-400 mt-1 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1" /> Smash Arena • 4 km away
              </p>
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5">
                <span className="text-xs text-amber-300 font-medium flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5 animate-pulse" />
                  5 waiting
                </span>
                <span className="text-xs text-white font-semibold">Join</span>
              </div>
            </motion.div>

            {/* Card 3: Bowling Night */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 190 }}
              transition={{ duration: 1, delay: 0.8 }}
              onClick={() => {
                if (typeof setPreSelectedSport === 'function') {
                  setPreSelectedSport('Bowling');
                }
                setTab('discovery');
              }}
              className="absolute right-0 w-[270px] glass-card p-6 shadow-2xl z-10 hover:-translate-y-2 hover:border-white/20 transition-all duration-500 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-2xl">🎳</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded-full border border-white/5">
                  Bowling
                </span>
              </div>
              <h3 className="font-display font-bold text-white text-base">Bowling Night</h3>
              <p className="text-xs text-neutral-400 mt-1 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1" /> HyperBowl • 1.2 km away
              </p>
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5">
                <span className="text-xs text-neutral-300">12 spots open</span>
                <span className="text-xs text-neutral-400">8:00 PM</span>
              </div>
            </motion.div>

            {/* Ambient decorative glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/2 rounded-full blur-[100px] pointer-events-none" />
          </div>

        </div>
      </div>

      {/* 3. Horizontal Categories Carousel */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-16 lg:px-24 pb-16 mt-12 md:mt-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-extrabold text-white text-xl tracking-tight uppercase">
            Browse Sports Categories
          </h2>
        </div>
        
        <div className="overflow-x-auto no-scrollbar flex space-x-4 pb-4 select-none">
          {categories.map((sport, i) => (
            <motion.div
              key={sport.name}
              whileHover={{ scale: 1.04, y: -2 }}
              onClick={() => {
                if (typeof setPreSelectedSport === 'function') {
                  setPreSelectedSport(sport.name);
                }
                setTab('discovery');
              }}
              className="flex-shrink-0 flex items-center space-x-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 rounded-2xl px-6 py-4 cursor-pointer transition-all duration-300 min-w-[180px]"
            >
              <span className="text-3xl">{sport.icon}</span>
              <div className="text-left">
                <p className="font-bold text-white text-sm">{sport.name}</p>
                <p className="text-[10px] text-neutral-400 font-light mt-0.5">{sport.count}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 4. App Store & Google Play Badges Promo */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-16 lg:px-24 pb-24">
        <div className="w-full relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-950/80 via-slate-900/80 to-indigo-950/80 backdrop-blur-md px-8 py-10 shadow-2xl text-left">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(99,102,241,0.15),transparent_50%)]" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                Download Now
              </span>
              <h3 className="font-display font-black text-2xl tracking-tight text-white uppercase mt-2">
                Get the Turfington App
              </h3>
              <p className="text-neutral-400 text-xs font-light leading-relaxed">
                Connect with local athletes, book pitches on the go, match with teams, and receive real-time notifications about discounts and tournaments directly on your phone.
              </p>
            </div>
            
            <div className="flex items-center gap-3.5 flex-wrap flex-shrink-0">
              <a 
                href="https://apps.apple.com/app/turfington" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-5 py-2.5 bg-black hover:bg-neutral-900 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                  <path d="M18.71,19.5C17.88,20.74,17,21.95,15.66,22a1.39,1.39,0,0,1-1.07-.33c-.7-.45-1.46-.45-2.19,0a1.44,1.44,0,0,1-1.09.33c-1.34-.05-2.29-1.29-3.11-2.48C6.54,17,5.29,12.48,6.59,10.22a3.75,3.75,0,0,1,3.15-1.92c.9,0,1.55.51,2.09.51s1.14-.5,2-.5A3.42,3.42,0,0,1,16.57,9.9,3.58,3.58,0,0,0,18.7,13a3.52,3.52,0,0,0,2.15,2.44,7.84,7.84,0,0,1-2.14,4.06M15.91,6.5a3.17,3.17,0,0,0,.75-2.27,3.12,3.12,0,0,0-2.07,1.06,3.19,3.19,0,0,0-.77,2.23A2.88,2.88,0,0,0,15.91,6.5Z"/>
                </svg>
                <div className="text-left leading-tight">
                  <p className="text-[9px] text-neutral-500 uppercase font-bold">Download on the</p>
                  <p className="text-xs font-black text-white font-display">App Store</p>
                </div>
              </a>
              
              <a 
                href="https://play.google.com/store/apps/details?id=com.turfington" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-5 py-2.5 bg-black hover:bg-neutral-900 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 text-indigo-400 fill-current" viewBox="0 0 24 24">
                  <path d="M5,3.29A2.77,2.77,0,0,0,4.22,5.1V18.9a2.77,2.77,0,0,0,.78,1.81L14.36,11.3,5,3.29M15.78,9.93,17.9,8.73,5.92,1.9a1.86,1.86,0,0,0-1.7,0l11.56,8M15.78,12.67l-10.78,9.2a1.86,1.86,0,0,0,1.7,0l12-6.83-2.92-2.37M20.19,10l-3,1.69,2.82,2.28a2,2,0,0,0,.68-1.5,2,2,0,0,0-.5-2.47Z"/>
                </svg>
                <div className="text-left leading-tight">
                  <p className="text-[9px] text-neutral-500 uppercase font-bold">Get it on</p>
                  <p className="text-xs font-black text-white font-display">Google Play</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
