import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Shield, Zap, MapPin, Trophy, Users, TrendingUp, Star, CheckCircle } from 'lucide-react';

const playerPerks = [
  { icon: <MapPin className="w-4 h-4" />, text: 'Discover nearby turfs & venues' },
  { icon: <Users className="w-4 h-4" />, text: 'Join & create sports sessions' },
  { icon: <Trophy className="w-4 h-4" />, text: 'Register for tournaments' },
  { icon: <Star className="w-4 h-4" />, text: 'Build your athlete profile & XP' },
];

const ownerPerks = [
  { icon: <MapPin className="w-4 h-4" />, text: 'List & manage your venues' },
  { icon: <TrendingUp className="w-4 h-4" />, text: 'Track bookings & revenue in ₹' },
  { icon: <Trophy className="w-4 h-4" />, text: 'Host & organize tournaments' },
  { icon: <Shield className="w-4 h-4" />, text: 'Advanced slot management tools' },
];

export default function RoleSelect({ onRoleSelect }) {
  const [hovering, setHovering] = useState(null);
  const [selecting, setSelecting] = useState(null);

  const handleSelect = (role) => {
    setSelecting(role);
    setTimeout(() => onRoleSelect(role), 700);
  };

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center px-4 py-16 relative overflow-y-auto">
      {/* Ambient background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-teal-500/3 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-14 relative z-10"
      >
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-400 font-medium mb-6">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          <span>TELL US WHO YOU ARE</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">
          Welcome to<br />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            Turfington
          </span>
        </h1>
        <p className="text-neutral-400 text-base font-light mt-4 max-w-sm mx-auto leading-relaxed">
          Choose your role to unlock the experience built for you.
        </p>
      </motion.div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl relative z-10">

        {/* Player Card */}
        <motion.button
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          onHoverStart={() => setHovering('player')}
          onHoverEnd={() => setHovering(null)}
          onClick={() => handleSelect('player')}
          className={`relative group text-left rounded-3xl border p-8 transition-all duration-500 overflow-hidden cursor-pointer ${
            selecting === 'player'
              ? 'bg-indigo-600 border-indigo-500 scale-95'
              : hovering === 'player'
              ? 'bg-white/[0.06] border-white/20 scale-[1.02]'
              : 'bg-white/[0.03] border-white/8'
          }`}
        >
          {/* Card glow on hover */}
          <div className={`absolute inset-0 rounded-3xl transition-opacity duration-500 ${hovering === 'player' ? 'opacity-100' : 'opacity-0'}`}
            style={{ background: 'radial-gradient(ellipse at 30% 30%, rgba(99,102,241,0.12) 0%, transparent 70%)' }}
          />

          <div className="relative z-10">
            {/* Emoji + badge */}
            <div className="flex items-start justify-between mb-6">
              <span className="text-5xl">🏃</span>
              <span className={`text-[10px] uppercase font-extrabold tracking-wider px-3 py-1 rounded-full border transition-colors duration-300 ${
                hovering === 'player' ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300' : 'bg-white/5 border-white/10 text-neutral-400'
              }`}>
                Most Popular
              </span>
            </div>

            <h2 className="text-2xl font-black font-display text-white tracking-tight mb-2">
              I'm a Player
            </h2>
            <p className="text-neutral-400 text-sm font-light leading-relaxed mb-6">
              Find nearby sports, join tournaments, book venues, and connect with athletes around you.
            </p>

            <div className="space-y-3 mb-8">
              {playerPerks.map((perk, i) => (
                <div key={i} className="flex items-center space-x-3 text-sm text-neutral-300">
                  <span className={`flex-shrink-0 p-1.5 rounded-lg transition-colors duration-300 ${hovering === 'player' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-neutral-500'}`}>
                    {perk.icon}
                  </span>
                  <span className="font-light">{perk.text}</span>
                </div>
              ))}
            </div>

            <div className={`flex items-center space-x-2 font-bold text-sm transition-colors duration-300 ${
              selecting === 'player' ? 'text-white' : hovering === 'player' ? 'text-indigo-300' : 'text-neutral-400'
            }`}>
              {selecting === 'player' ? (
                <>
                  <CheckCircle className="w-4 h-4 animate-pulse" />
                  <span>Entering as Player...</span>
                </>
              ) : (
                <>
                  <span>Continue as Player</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </div>
          </div>
        </motion.button>

        {/* Owner Card */}
        <motion.button
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          onHoverStart={() => setHovering('owner')}
          onHoverEnd={() => setHovering(null)}
          onClick={() => handleSelect('owner')}
          className={`relative group text-left rounded-3xl border p-8 transition-all duration-500 overflow-hidden cursor-pointer ${
            selecting === 'owner'
              ? 'bg-violet-600 border-violet-500 scale-95'
              : hovering === 'owner'
              ? 'bg-white/[0.06] border-white/20 scale-[1.02]'
              : 'bg-white/[0.03] border-white/8'
          }`}
        >
          <div className={`absolute inset-0 rounded-3xl transition-opacity duration-500 ${hovering === 'owner' ? 'opacity-100' : 'opacity-0'}`}
            style={{ background: 'radial-gradient(ellipse at 70% 30%, rgba(139,92,246,0.12) 0%, transparent 70%)' }}
          />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <span className="text-5xl">🏟️</span>
              <span className={`text-[10px] uppercase font-extrabold tracking-wider px-3 py-1 rounded-full border transition-colors duration-300 ${
                hovering === 'owner' ? 'bg-violet-500/20 border-violet-500/30 text-violet-300' : 'bg-white/5 border-white/10 text-neutral-400'
              }`}>
                Venue Pro
              </span>
            </div>

            <h2 className="text-2xl font-black font-display text-white tracking-tight mb-2">
              I Own a Venue
            </h2>
            <p className="text-neutral-400 text-sm font-light leading-relaxed mb-6">
              Manage your sports venue, host tournaments, set pricing in ₹, and grow your community.
            </p>

            <div className="space-y-3 mb-8">
              {ownerPerks.map((perk, i) => (
                <div key={i} className="flex items-center space-x-3 text-sm text-neutral-300">
                  <span className={`flex-shrink-0 p-1.5 rounded-lg transition-colors duration-300 ${hovering === 'owner' ? 'bg-violet-500/20 text-violet-400' : 'bg-white/5 text-neutral-500'}`}>
                    {perk.icon}
                  </span>
                  <span className="font-light">{perk.text}</span>
                </div>
              ))}
            </div>

            <div className={`flex items-center space-x-2 font-bold text-sm transition-colors duration-300 ${
              selecting === 'owner' ? 'text-white' : hovering === 'owner' ? 'text-violet-300' : 'text-neutral-400'
            }`}>
              {selecting === 'owner' ? (
                <>
                  <CheckCircle className="w-4 h-4 animate-pulse" />
                  <span>Entering as Owner...</span>
                </>
              ) : (
                <>
                  <span>Continue as Owner</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </div>
          </div>
        </motion.button>
      </div>

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 text-xs text-neutral-600 font-light relative z-10"
      >
        Selected role is permanently associated with this account.
      </motion.p>
    </div>
  );
}
