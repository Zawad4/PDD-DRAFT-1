import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Clock, Award, Star, Calendar, MessageSquare, Heart, Share2, Compass, Plus, Flame } from 'lucide-react';

export default function Home({ 
  setTab, 
  joinedMatches, 
  toggleJoinMatch, 
  bookings, 
  setBookings,
  user,
  role
}) {
  // Static lists representing items that can be joined
  const [sessions, setSessions] = useState([
    {
      id: 101,
      title: 'Football Tonight',
      sport: 'Football',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600',
      distance: '1.2 km away',
      time: 'Today, 8:00 PM',
      playersJoined: 9,
      playersTotal: 14,
      skillLevel: 'Intermediate',
      isLive: true
    },
    {
      id: 102,
      title: 'Badminton Doubles Club',
      sport: 'Badminton',
      image: '/badminton_morning_doubles.jpg',
      distance: '2.5 km away',
      time: 'Tomorrow, 6:30 PM',
      playersJoined: 3,
      playersTotal: 4,
      skillLevel: 'Advanced',
      isLive: false
    },
    {
      id: 103,
      title: 'Bowling Party Night',
      sport: 'Bowling',
      image: '/bowling.jpg',
      distance: '3.1 km away',
      time: 'Fri, 9:00 PM',
      playersJoined: 6,
      playersTotal: 12,
      skillLevel: 'Beginner Friendly',
      isLive: true
    },
    {
      id: 104,
      title: 'TT Professional Practice',
      sport: 'Table Tennis',
      image: 'https://images.unsplash.com/photo-1611251135345-18c56206b863?q=80&w=600',
      distance: '0.8 km away',
      time: 'Today, 7:00 PM',
      playersJoined: 1,
      playersTotal: 2,
      skillLevel: 'Advanced',
      isLive: false
    },
    {
      id: 105,
      title: 'Box Cricket T10 Match',
      sport: 'Cricket',
      image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=600',
      distance: '4.2 km away',
      time: 'Sun, 7:00 AM',
      playersJoined: 14,
      playersTotal: 22,
      skillLevel: 'Intermediate',
      isLive: false
    }
  ]);

  const [venues, setVenues] = useState([
    {
      id: 201,
      name: 'VK Multi Sports Turf',
      image: 'https://images.unsplash.com/photo-1565992441121-4367fe2034cf?q=80&w=800',
      rating: 4.9,
      distance: '1.4 km',
      sports: ['Football', 'Basketball', 'Pickleball'],
      slots: '4 slots left',
      price: '₹600/hr'
    },
    {
      id: 202,
      name: 'Tlk turf for badminton',
      image: '/badminton_morning_doubles.jpg',
      rating: 4.8,
      distance: '2.1 km',
      sports: ['Badminton', 'Table Tennis'],
      slots: '2 slots left',
      price: '₹175/hr'
    },
    {
      id: 203,
      name: 'Bowling in vr mall',
      image: '/bowling.jpg',
      rating: 4.7,
      distance: '3.5 km',
      sports: ['Bowling', 'Pool', 'Foosball'],
      slots: '8 slots left',
      price: '₹375/lane/hr'
    }
  ]);

  const [tournaments, setTournaments] = useState([
    {
      id: 301,
      title: 'Weekend Football Gold Cup',
      image: '/trophy.png',
      prizePool: '₹2,00,000',
      date: 'June 6-7, 2026',
      initialHours: 24,
      initialMinutes: 45,
      initialSeconds: 12
    },
    {
      id: 302,
      title: 'Championship Table Tennis Open',
      image: 'https://images.unsplash.com/photo-1611251135345-18c56206b863?q=80&w=800',
      prizePool: '₹83,000',
      date: 'June 13, 2026',
      initialHours: 96,
      initialMinutes: 18,
      initialSeconds: 40
    }
  ]);

  // Live tournament countdown timers
  const [timers, setTimers] = useState({});

  useEffect(() => {
    // Initialize timers
    const initialTimers = {};
    tournaments.forEach(t => {
      initialTimers[t.id] = t.initialHours * 3600 + t.initialMinutes * 60 + t.initialSeconds;
    });
    setTimers(initialTimers);

    const interval = setInterval(() => {
      setTimers(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          if (next[id] > 0) next[id] -= 1;
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTimer = (secondsLeft) => {
    if (!secondsLeft && secondsLeft !== 0) return '00:00:00';
    const hrs = Math.floor(secondsLeft / 3600);
    const mins = Math.floor((secondsLeft % 3600) / 60);
    const secs = secondsLeft % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBookVenue = (venue) => {
    const newBooking = {
      id: Date.now(),
      title: venue.name,
      sport: venue.sports[0],
      time: 'Tomorrow, 5:00 PM',
      price: venue.price,
      image: venue.image
    };
    setBookings([newBooking, ...bookings]);
    alert(`Successfully booked slots at ${venue.name}!`);
  };

  // Helper to color-code sports accents
  const getSportColors = (sport) => {
    switch (sport) {
      case 'Football':
        return {
          text: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20 text-emerald-400',
          dot: 'bg-emerald-400'
        };
      case 'Badminton':
        return {
          text: 'text-indigo-400',
          bg: 'bg-indigo-500/10',
          border: 'border-indigo-500/20 text-indigo-400',
          dot: 'bg-indigo-400'
        };
      case 'Bowling':
        return {
          text: 'text-cyan-400',
          bg: 'bg-cyan-500/10',
          border: 'border-cyan-500/20 text-cyan-400',
          dot: 'bg-cyan-400'
        };
      case 'Cricket':
        return {
          text: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20 text-amber-400',
          dot: 'bg-amber-400'
        };
      case 'Table Tennis':
      default:
        return {
          text: 'text-rose-400',
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/20 text-rose-400',
          dot: 'bg-rose-400'
        };
    }
  };

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Activity Sessions, Bookings, Venues, Tournaments */}
        <div className="lg:col-span-8 space-y-12">
          
          {role === 'owner' ? (
            /* OWNER SLOTS & MANAGEMENT HUB */
            <div className="space-y-12">
              {/* Slot Management & Organizer Shortcuts */}
              <div>
                <h2 className="text-2xl font-black font-display tracking-tight uppercase">Venue Manager Hub</h2>
                <p className="text-xs text-neutral-500 mt-1">Control your arena bookings, schedule slots, host tournaments and list marketplace products.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {/* Action 1: Create & Manage Slots */}
                  <div 
                    onClick={() => setTab('venue-manager')}
                    className="glass-card p-5 border border-white/5 hover:border-violet-500/20 hover:bg-white/[0.02] transition-all cursor-pointer text-left group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/25 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-all">📅</div>
                    <h3 className="font-display font-bold text-white text-base">Manage Slots & Bookings</h3>
                    <p className="text-xs text-neutral-400 mt-1">Create time windows, view weekly/monthly reservations, and monitor active player slots.</p>
                  </div>

                  {/* Action 2: Organize Tournament */}
                  <div 
                    onClick={() => setTab('tournaments')}
                    className="glass-card p-5 border border-white/5 hover:border-indigo-500/20 hover:bg-white/[0.02] transition-all cursor-pointer text-left group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-all">🏆</div>
                    <h3 className="font-display font-bold text-white text-base">Host Tournaments</h3>
                    <p className="text-xs text-neutral-400 mt-1">Publish competitive brackets, declare prize pools, collect entries and verify registrations.</p>
                  </div>

                  {/* Action 3: Sell Gear & Products */}
                  <div 
                    onClick={() => setTab('marketplace')}
                    className="glass-card p-5 border border-white/5 hover:border-amber-500/20 hover:bg-white/[0.02] transition-all cursor-pointer text-left group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/25 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-all">💰</div>
                    <h3 className="font-display font-bold text-white text-base">Sell Products</h3>
                    <p className="text-xs text-neutral-400 mt-1">List gear, racket strings, turf shoes, or sports accessories on the live store page.</p>
                  </div>

                  {/* Action 4: Group & Direct Messages */}
                  <div 
                    onClick={() => setTab('community')}
                    className="glass-card p-5 border border-white/5 hover:border-pink-500/20 hover:bg-white/[0.02] transition-all cursor-pointer text-left group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/25 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-all">💬</div>
                    <h3 className="font-display font-bold text-white text-base">Chat & DMs</h3>
                    <p className="text-xs text-neutral-400 mt-1">Engage with players in local group channels and respond directly to user questions.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* PLAYER BOOKINGS & ACTIVITIES SESSIONS */
            <>
              {/* 2. NEARBY ACTIVITY SESSIONS */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black font-display tracking-tight uppercase">Nearby Activity Sessions</h2>
                    <p className="text-xs text-neutral-500 mt-1">Jump into active games happening in your area right now</p>
                  </div>
                  <button 
                    onClick={() => setTab('discovery')}
                    className="text-xs hover:text-neutral-400 font-semibold border-b border-white/20 pb-0.5"
                  >
                    View Map
                  </button>
                </div>

                <div className="overflow-x-auto no-scrollbar flex space-x-6 pb-4">
                  {sessions.map(s => {
                    const joined = joinedMatches.includes(s.id);
                    const colors = getSportColors(s.sport);
                    return (
                      <div 
                        key={s.id}
                        className="flex-shrink-0 w-[290px] glass-card p-5 relative overflow-hidden group hover:scale-[1.01] hover:border-white/10 transition-all duration-300"
                      >
                        <div className="absolute top-4 left-4 z-10">
                          {s.isLive && (
                            <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-black/85 text-indigo-400 border border-indigo-500/20 font-black text-[9px] uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                              <span>LIVE</span>
                            </div>
                          )}
                        </div>

                        <div className="h-36 rounded-2xl overflow-hidden mb-4 relative">
                          <img 
                            src={s.image} 
                            alt={s.title} 
                            className="w-full h-full object-cover brightness-95 group-hover:scale-105 transition-all duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          <span className={`absolute bottom-3 right-3 text-[10px] bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md font-extrabold border ${colors.border}`}>
                            {s.sport}
                          </span>
                        </div>

                        <h3 className="font-display font-bold text-white text-base truncate">{s.title}</h3>
                        
                        <div className="space-y-1.5 mt-3">
                          <div className="flex items-center text-xs text-neutral-400">
                            <MapPin className="w-3.5 h-3.5 mr-1.5 text-neutral-500" />
                            <span>{s.distance}</span>
                          </div>
                          <div className="flex items-center text-xs text-neutral-400">
                            <Clock className="w-3.5 h-3.5 mr-1.5 text-neutral-500" />
                            <span>{s.time}</span>
                          </div>
                          <div className="flex items-center text-xs text-neutral-400">
                            <Users className="w-3.5 h-3.5 mr-1.5 text-neutral-500" />
                            <span>{joined ? s.playersJoined + 1 : s.playersJoined}/{s.playersTotal} Joined</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-5 pt-3 border-t border-white/5">
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded border ${colors.bg} ${colors.text} ${colors.border}`}>
                            {s.skillLevel}
                          </span>
                          
                          <button
                            onClick={() => toggleJoinMatch(s.id)}
                            className={`text-xs font-bold px-4 py-1.5 rounded-full border transition-all duration-300 ${
                              joined 
                                ? 'bg-transparent text-white border-white/20 hover:bg-white/5' 
                                : 'bg-white text-black border-transparent hover:bg-neutral-200 shadow-md'
                            }`}
                          >
                            {joined ? 'Leave' : 'Join'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. CONTINUE PLAYING */}
              <div>
                <h2 className="text-2xl font-black font-display tracking-tight uppercase mb-6">Continue Playing</h2>
                {bookings.length === 0 ? (
                  <div className="glass-card p-8 text-center border border-dashed border-white/10">
                    <p className="text-neutral-500 text-sm">No upcoming matches or venue bookings scheduled.</p>
                    <button 
                      onClick={() => setTab('discovery')}
                      className="mt-4 text-xs font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full px-5 py-2.5 transition-all"
                    >
                      Book Your First Slot
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bookings.map(booking => (
                      <div key={booking.id} className="glass-card p-5 flex items-center justify-between border border-white/5">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                            <img src={booking.image} alt={booking.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="text-left">
                            <h4 className="font-bold text-white text-sm font-display truncate max-w-[180px]">{booking.title}</h4>
                            <p className="text-xs text-neutral-400 mt-0.5">{booking.sport}</p>
                            <p className="text-[10px] text-neutral-500 mt-1 flex items-center">
                              <Clock className="w-3 h-3 mr-1" /> {booking.time}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold px-3.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400">
                          Confirmed
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. NEARBY VENUES */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black font-display tracking-tight uppercase">Nearby Venues</h2>
                    <p className="text-xs text-neutral-500 mt-1">Reserve luxury arenas and pitches instantly</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {venues.map(v => (
                    <div key={v.id} className="glass-card overflow-hidden group border border-white/5 hover:border-white/10 transition-all duration-300">
                      <div className="h-44 overflow-hidden relative">
                        <img 
                          src={v.image} 
                          alt={v.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute top-4 right-4 flex items-center bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-xs border border-white/5 text-amber-400">
                          <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-400" />
                          <span className="font-bold">{v.rating}</span>
                        </div>
                      </div>

                      <div className="p-5 text-left">
                        <h3 className="font-bold font-display text-white text-base truncate">{v.name}</h3>
                        <p className="text-xs text-neutral-400 mt-1 flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-neutral-500" /> {v.distance}
                        </p>
                        
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {v.sports.map(s => {
                            const style = getSportColors(s);
                            return (
                              <span key={s} className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${style.bg} ${style.text} ${style.border}`}>
                                {s}
                              </span>
                            );
                          })}
                        </div>

                        <div className="flex justify-between items-center mt-5 pt-3 border-t border-white/5">
                          <div>
                            <p className="text-xs text-neutral-500 font-light">Price</p>
                            <p className="text-sm font-bold text-white mt-0.5">{v.price}</p>
                          </div>
                          <button 
                            onClick={() => handleBookVenue(v)}
                            className="text-xs font-bold bg-white text-black px-4 py-2 rounded-full hover:bg-neutral-200 transition-colors shadow-sm"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>

        {/* RIGHT COLUMN: Sports Feed, Tournament Countdown */}
        <div className="lg:col-span-4 space-y-12">
          


          {/* 6. EVENTS NEAR YOU */}
          <div>
            <h2 className="text-2xl font-black font-display tracking-tight uppercase mb-6">Events Near You</h2>
            <div className="space-y-6">
              {tournaments.map(t => (
                <div 
                  key={t.id}
                  className="glass-card overflow-hidden border border-white/5 hover:border-white/10 transition-all text-left relative"
                >
                  <div className="h-32 overflow-hidden relative">
                    <img src={t.image} alt={t.title} className="w-full h-full object-cover brightness-85" />
                    <div className="absolute inset-0 bg-black/20" />
                    
                    <div className="absolute top-4 left-4 bg-indigo-600/90 backdrop-blur-md border border-indigo-500/20 rounded px-2.5 py-1">
                      <p className="text-[8px] text-neutral-200 uppercase tracking-widest font-bold">Prize Pool</p>
                      <p className="text-sm font-black text-white">{t.prizePool}</p>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-white font-display text-base leading-snug">{t.title}</h3>
                    <p className="text-xs text-neutral-400 mt-1">{t.date}</p>

                    {/* Countdown Timer */}
                    <div className="mt-5 p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="text-[8px] text-neutral-500 uppercase tracking-widest font-bold">Starts In</p>
                        <p className="text-base font-black text-indigo-400 font-display mt-0.5 tracking-wider">
                          {formatTimer(timers[t.id])}
                        </p>
                      </div>
                      <button className="text-xs font-bold bg-white text-black px-4 py-2 rounded-full hover:bg-neutral-200 transition-colors shadow-md">
                        Register
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* APP DOWNLOAD BANNER */}
      <div className="mt-16 w-full relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 px-8 py-10 shadow-2xl text-left">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(99,102,241,0.15),transparent_50%)]" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
              Mobile App Available
            </span>
            <h3 className="font-display font-black text-2xl tracking-tight text-white uppercase mt-2">
              Take Turfington Everywhere
            </h3>
            <p className="text-neutral-400 text-xs font-light leading-relaxed">
              Book turf slots instantly, organize friendly matchups, chat in real-time with local athletes, and track achievements on the go. Available for iOS and Android.
            </p>
          </div>
          
          <div className="flex items-center gap-3.5 flex-wrap">
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
  );
}
