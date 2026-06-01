import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, SlidersHorizontal, Calendar,
  Clock, Trophy, Users, Star, Lock, Loader2,
  UserPlus, UserCheck, MessageCircle, Medal, ChevronRight,
  Navigation, Wifi, WifiOff, RefreshCw, CreditCard, Check, Compass,
  Heart, Share2, MessageSquare, X
} from 'lucide-react';
import SportIcon from '../components/SportIcon';

/* ── Haversine distance (km) ─────────────────────────────── */
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
}

export default function Discovery({
  joinedMatches,
  toggleJoinMatch,
  bookings,
  setBookings,
  user,
  initialSport = 'All',
  setInitialSport,
  venueOffers = []
}) {
  const [selectedDealsVenue, setSelectedDealsVenue] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Activities');
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Map refs
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);



  // Map markers mapping coordinates to base activities
  const mapMarkers = [
    { id: 1, x: 30, y: 40, sport: 'Football',     title: 'Football Turf Session',       venue: 'VK Multi Sports Turf', price: '₹600/hr' },
    { id: 2, x: 55, y: 65, sport: 'Table Tennis', title: 'TT Doubles Match',            venue: 'A.s 360 Turf Academy',  price: '₹100/hr' },
    { id: 3, x: 75, y: 35, sport: 'Bowling',      title: 'Bowling Tournament Practice', venue: 'Bowling in vr mall',   price: '₹375/hr' },
    { id: 4, x: 45, y: 25, sport: 'Badminton',    title: 'Badminton Morning Doubles',   venue: 'Tlk turf for badminton',          price: '₹175/hr' },
    { id: 5, x: 20, y: 70, sport: 'Cricket',      title: 'Box Cricket T10',             venue: 'Clash on turf',     price: '₹300/hr' },
  ];

  // Filters State
  const [selectedSport, setSelectedSport] = useState(initialSport);
  const [selectedDistance, setSelectedDistance] = useState('10');
  const [selectedSkill, setSelectedSkill] = useState('All');

  // Set initial sport filter if coming via a link
  useEffect(() => {
    if (initialSport && initialSport !== 'All') {
      setSelectedSport(initialSport);
      if (setInitialSport) {
        setInitialSport('All');
      }
    }
  }, [initialSport, setInitialSport]);

  // Location Access State
  const [locationStatus, setLocationStatus] = useState('prompt'); // 'prompt', 'detecting', 'granted'
  const [userCoordinates, setUserCoordinates] = useState(null);

  // Prepaid Payment Dialog State
  const [activePrepaidVenue, setActivePrepaidVenue] = useState(null); // Venue details for payment
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // ── Static venue/activity data with real GPS coords (Chennai area)
  const ACTIVITIES_BASE = [
    { id: 1, title: 'Football Turf Session',       sport: 'Football',     venue: 'VK Multi Sports Turf', lat: 13.0892, lng: 80.2196, time: 'Today, 6:00 PM',    slots: '5 slots left', joined: 7,  total: 12, skill: 'Intermediate', price: '₹600/hr', rating: 4.9, image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800' },
    { id: 2, title: 'TT Doubles Match',            sport: 'Table Tennis', venue: 'A.s 360 Turf Academy', lat: 13.0067, lng: 80.2206, time: 'Tomorrow, 7:30 PM', slots: '1 slot left',  joined: 3,  total: 4,  skill: 'Advanced',     price: '₹100/hr', rating: 4.8, image: 'https://images.unsplash.com/photo-1611251135345-18c56206b863?q=80&w=800' },
    { id: 3, title: 'Bowling Tournament Practice', sport: 'Bowling',      venue: 'Bowling in vr mall', lat: 12.9766, lng: 80.2209, time: 'Fri, 9:00 PM',     slots: '6 slots left', joined: 6, total: 12, skill: 'Beginner', price: '₹375/hr', rating: 4.7, image: '/bowling.jpg' },
    { id: 4, title: 'Badminton Morning Doubles',   sport: 'Badminton',    venue: 'Tlk turf for badminton', lat: 13.0569, lng: 80.2425, time: 'Sat, 9:00 AM',     slots: '2 slots left', joined: 2,  total: 4,  skill: 'Intermediate', price: '₹175/hr', rating: 4.6, image: '/badminton_morning_doubles.jpg' },
    { id: 5, title: 'Box Cricket T10',             sport: 'Cricket',      venue: 'Clash on turf',    lat: 13.0350, lng: 80.2680, time: 'Sun, 7:00 AM',     slots: '8 slots left', joined: 14, total: 22, skill: 'Intermediate', price: '₹300/hr', rating: 4.5, image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=800' },
  ];

  // ── Player data with real GPS coords near Chennai
  const PLAYERS_BASE = [
    { id: 1, name: 'Amit Patel',    handle: '@amitpatel',      lat: 13.0952, lng: 80.2198, sports: ['Football', 'Cricket'],          level: 'Advanced',     matchesPlayed: 32, winRate: '71%', mutualFriends: 4, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', coverColor: 'from-emerald-600 to-green-800',   badge: 'Top Scorer',       badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { id: 2, name: 'Pooja Reddy',   handle: '@poojareddy',     lat: 13.0250, lng: 80.2150, sports: ['Badminton', 'Table Tennis'],     level: 'Intermediate', matchesPlayed: 18, winRate: '58%', mutualFriends: 7, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200', coverColor: 'from-indigo-600 to-violet-800',   badge: 'Active Player',    badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    { id: 3, name: 'Deepak Kumar',  handle: '@deepaktt',       lat: 13.0800, lng: 80.2100, sports: ['Table Tennis'],                  level: 'Elite',        matchesPlayed: 44, winRate: '84%', mutualFriends: 2, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', coverColor: 'from-rose-600 to-pink-800',       badge: 'Elite Ranked',     badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    { id: 4, name: 'Divya Thomas',  handle: '@divyabowls',     lat: 13.0450, lng: 80.2500, sports: ['Bowling', 'Foosball'],           level: 'Beginner',     matchesPlayed: 10, winRate: '40%', mutualFriends: 1, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', coverColor: 'from-cyan-600 to-sky-800',       badge: 'Rising Star',      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    { id: 5, name: 'Arjun Sharma',  handle: '@arjunfc',        lat: 13.0150, lng: 80.2100, sports: ['Football', 'Cricket'],          level: 'Intermediate', matchesPlayed: 26, winRate: '65%', mutualFriends: 5, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200', coverColor: 'from-amber-600 to-orange-800',   badge: 'Weekend Warrior',  badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { id: 6, name: 'Priya Nair',    handle: '@priyadoubles',   lat: 13.0600, lng: 80.2600, sports: ['Badminton'],                     level: 'Advanced',     matchesPlayed: 37, winRate: '79%', mutualFriends: 3, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200', coverColor: 'from-violet-600 to-purple-800', badge: 'Tournament Player', badgeColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  ];


  // ── Derived state: activities and players with real distances ──
  const [activities, setActivities] = useState(ACTIVITIES_BASE.map(a => ({ ...a, distance: `${a.distanceFallback || '?'} km` })));
  const [players, setPlayers] = useState(PLAYERS_BASE.map(p => ({ ...p, distance: p.distanceFallback || '?' })));
  const [followedPlayers, setFollowedPlayers] = useState([2]);

  const toggleFollow = (id) =>
    setFollowedPlayers(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  // Update distances when GPS is obtained
  const applyRealDistances = useCallback((lat, lng) => {
    setActivities(
      ACTIVITIES_BASE
        .map(a => ({ ...a, distance: `${haversine(lat, lng, a.lat, a.lng)} km` }))
        .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
    );
    setPlayers(
      PLAYERS_BASE
        .map(p => ({ ...p, distance: `${haversine(lat, lng, p.lat, p.lng)} km` }))
        .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
    );
  }, []);


  // Communities Data
  const communities = [
    { id: 1, name: 'VK Multi Sports Turf Club', members: '240 members', online: 32, image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300', category: 'Football' },
    { id: 2, name: 'Tlk Badminton Club', members: '180 members', online: 15, image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=300', category: 'Badminton' },
    { id: 3, name: 'VR Mall Bowlers Club', members: '120 members', online: 8, image: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=300', category: 'Bowling' }
  ];

  // Filtered Activities
  const filteredActivities = activities.filter(act => {
    if (selectedSport !== 'All' && act.sport !== selectedSport) return false;
    if (selectedSkill !== 'All' && act.skill !== selectedSkill) return false;
    if (searchQuery && !act.title.toLowerCase().includes(searchQuery.toLowerCase()) && !act.venue.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const [locationCity, setLocationCity] = useState('');
  const [locationError, setLocationError] = useState('');

  // Real GPS with Nominatim reverse geocoding
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocationStatus('detecting');
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoordinates({ lat: latitude, lng: longitude });
        applyRealDistances(latitude, longitude);
        // Reverse geocode with OpenStreetMap Nominatim (free, no key)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`,
            { headers: { Accept: 'application/json' } }
          );
          if (res.ok) {
            const data = await res.json();
            const city = data.address?.city
              || data.address?.town
              || data.address?.county
              || data.address?.state_district
              || 'Your Location';
            setLocationCity(city);
          }
        } catch {
          setLocationCity('Your Location'); // fail gracefully
        }
        setLocationStatus('granted');
      },
      (err) => {
        setLocationStatus('prompt');
        setLocationError(
          err.code === 1 ? 'Location permission denied. Please allow access in browser settings.'
          : err.code === 2 ? 'Unable to determine location. Check your GPS signal.'
          : 'Location request timed out. Try again.'
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  };

  // Auto-request on mount
  useEffect(() => { handleDetectLocation(); }, []);



  // Open secure payment drawer
  const triggerPrepaidPayment = (venue) => {
    setActivePrepaidVenue(venue);
    setPaymentSuccess(false);
  };

  // Execute payment
  const handleExecutePayment = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setPaymentSuccess(true);
      
      // Complete booking registration after 1s
      setTimeout(() => {
        const newBooking = {
          id: Date.now(),
          title: activePrepaidVenue.venue || activePrepaidVenue.name,
          sport: activePrepaidVenue.sport || 'Sports Activity',
          time: activePrepaidVenue.time || 'Tomorrow, 5:00 PM',
          price: activePrepaidVenue.price,
          image: activePrepaidVenue.image || 'https://images.unsplash.com/photo-1538388149142-f82611d4d6c4?q=80&w=400'
        };
        setBookings([newBooking, ...bookings]);
        setActivePrepaidVenue(null);
      }, 1000);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col h-full">
      
      {/* Location Access Indicator Banner */}
      <div className="mb-6 w-full flex items-center justify-between px-5 py-3 glass-card border border-white/5 text-xs">
        <div className="flex items-center space-x-2 flex-grow min-w-0">
          {locationStatus === 'detecting' && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin flex-shrink-0" />}
          {locationStatus === 'granted'   && <Navigation className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
          {locationStatus === 'prompt'    && <MapPin className="w-4 h-4 text-neutral-500 flex-shrink-0" />}
          <span className="truncate">
            {locationStatus === 'prompt' && !locationError && 'Enable location to discover nearby turfs, people and activities.'}
            {locationStatus === 'detecting' && 'Detecting your location...'}
            {locationStatus === 'granted' && (
              <span className="text-emerald-400">
                {locationCity && <strong>{locationCity}</strong>}
                {userCoordinates && ` (${userCoordinates.lat.toFixed(4)}, ${userCoordinates.lng.toFixed(4)})`}
                {' · '}{activities.length} venues sorted by distance
              </span>
            )}
            {locationError && <span className="text-rose-400">{locationError}</span>}
          </span>
        </div>
        {locationStatus !== 'granted' && (
          <button
            onClick={handleDetectLocation}
            disabled={locationStatus === 'detecting'}
            className="flex items-center gap-1.5 flex-shrink-0 ml-3 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-3.5 py-1.5 rounded-full transition-all cursor-pointer">
            <Navigation className="w-3 h-3" />
            {locationStatus === 'detecting' ? 'Locating...' : 'Allow Location'}
          </button>
        )}
        {locationStatus === 'granted' && (
          <button onClick={handleDetectLocation} title="Refresh location"
            className="ml-3 flex-shrink-0 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors">
            <RefreshCw className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* 1. TOP LARGE SEARCH BAR & FILTER TOGGLE */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 w-full font-sans">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-neutral-400">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder="Search activities nearby (e.g. Football near me, Bowling tonight, Badminton partners)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-[#121212]/90 border border-white/5 rounded-full text-base font-light text-white placeholder-neutral-500 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
          />
          <div className="absolute inset-y-0 right-3 flex items-center pr-2">
            <span className="hidden md:inline-block text-[10px] text-neutral-500 bg-neutral-800 border border-white/5 px-2.5 py-1.5 rounded-full font-mono">
              ⌘ K
            </span>
          </div>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-6 py-4 md:py-0 rounded-full border transition-all flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider ${
            showFilters
              ? 'bg-white text-black border-transparent shadow-[0_0_15px_rgba(255,255,255,0.25)]'
              : 'bg-[#121212] border-white/5 text-neutral-300 hover:text-white hover:border-white/15'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
        </button>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex space-x-1.5 p-1 bg-[#121212] border border-white/5 rounded-full self-start mb-8 overflow-x-auto no-scrollbar max-w-full font-sans">
        {['Activities', 'Venues', 'Events'].map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSelectedMarker(null);
            }}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
              activeTab === tab 
                ? 'bg-white text-black font-extrabold shadow-md' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow font-sans">
        
        {/* 2. FILTER PANEL (COLLAPSIBLE LEFT COLUMN) */}
        {showFilters && (
          <div className="lg:col-span-3 space-y-6 text-left">
            <div className="glass-card p-6 border border-white/5 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <span className="font-display font-extrabold text-sm uppercase tracking-wider">Filters</span>
                <SlidersHorizontal className="w-4 h-4 text-neutral-400" />
              </div>

              {/* Sport Filter */}
              <div className="space-y-2">
                <label className="text-xs text-neutral-400 uppercase tracking-widest font-bold">Sport</label>
                <select 
                  value={selectedSport} 
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="w-full bg-[#0d0d0d] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-white/25"
                >
                  <option value="All">All Sports</option>
                  <option value="Football">Football</option>
                  <option value="Table Tennis">Table Tennis</option>
                  <option value="Bowling">Bowling</option>
                  <option value="Badminton">Badminton</option>
                  <option value="Cricket">Cricket</option>
                </select>
              </div>

              {/* Distance Filter */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-medium">
                  <label className="text-neutral-400 uppercase tracking-widest font-bold">Max Distance</label>
                  <span className="text-white">{selectedDistance} km</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="25" 
                  value={selectedDistance}
                  onChange={(e) => setSelectedDistance(e.target.value)}
                  className="w-full accent-white bg-neutral-800 rounded-lg cursor-pointer h-1.5"
                />
              </div>

              {/* Skill Filter */}
              <div className="space-y-2">
                <label className="text-xs text-neutral-400 uppercase tracking-widest font-bold">Skill Level</label>
                <select 
                  value={selectedSkill} 
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full bg-[#0d0d0d] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-white/25"
                >
                  <option value="All">Any Level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Availability Date */}
              <div className="space-y-2">
                <label className="text-xs text-neutral-400 uppercase tracking-widest font-bold">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
                  <input 
                    type="date" 
                    className="w-full bg-[#0d0d0d] border border-white/5 rounded-xl pl-10 pr-3 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-white/25"
                  />
                </div>
              </div>

              {/* Price Filter */}
              <div className="space-y-2">
                <label className="text-xs text-neutral-400 uppercase tracking-widest font-bold">Price range</label>
                <select className="w-full bg-[#0d0d0d] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-white/25">
                  <option value="Any">Any Price</option>
                  <option value="Free">Free / Shared</option>
                  <option value="Low">Under $20/hr</option>
                  <option value="Med">$20 - $50/hr</option>
                  <option value="High">Above $50/hr</option>
                </select>
              </div>
              
              <button 
                onClick={() => {
                  setSelectedSport('All');
                  setSelectedDistance('10');
                  setSelectedSkill('All');
                  setSearchQuery('');
                }}
                className="w-full py-2.5 text-xs text-center border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all rounded-full font-bold"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        <div className={`${showFilters ? 'lg:col-span-9' : 'lg:col-span-12'} grid grid-cols-1 lg:grid-cols-12 gap-8 h-fit lg:h-[720px]`}>
          {/* RESULTS COLUMN */}
          <div className="lg:col-span-8 space-y-5 overflow-y-auto pr-2 no-scrollbar text-left h-full">
            
            {/* TABS CONTENT: Activities */}
            {activeTab === 'Activities' && (
              <>
                <p className="text-xs text-neutral-400 font-bold uppercase mb-2">
                  Activities ({filteredActivities.length})
                </p>
                {filteredActivities.length === 0 ? (
                  <div className="glass-card p-8 text-center border border-dashed border-white/10">
                    <p className="text-neutral-500 text-sm">No matching sessions found. Try clearing filters.</p>
                  </div>
                ) : (
                  filteredActivities.map(act => {
                    const joined = joinedMatches.includes(act.id);
                    return (
                      <div 
                        key={act.id} 
                        onClick={() => setSelectedMarker({ id: act.id, title: act.title, venue: act.venue, sport: act.sport, price: act.price })}
                        className={`glass-card overflow-hidden border cursor-pointer hover:border-white/20 transition-all duration-300 flex flex-col ${
                          selectedMarker && selectedMarker.id === act.id ? 'border-white/35 bg-white/[0.03]' : 'border-white/5'
                        }`}
                      >
                        {/* Large Venue Image Banner */}
                        {act.image && (
                          <div className="w-full h-44 overflow-hidden relative bg-neutral-900 border-b border-white/5 flex-shrink-0">
                            <img src={act.image} alt={act.venue} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                            <div className="absolute top-3 left-3">
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg">
                                <SportIcon sport={act.sport} size={12} className="text-white" />
                                {act.sport}
                              </span>
                            </div>
                            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-black text-white border border-white/10">
                              {act.price}
                            </div>
                          </div>
                        )}

                        <div className="p-5.5 space-y-4">
                          <div className="text-left">
                            <h3 className="font-display font-black text-white text-lg leading-snug">{act.title}</h3>
                            <p className="text-xs text-neutral-400 font-light mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-neutral-500" />
                              {act.venue}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5 text-neutral-300 text-xs font-light">
                            <div className="flex items-center">
                              <MapPin className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                              <span>{act.distance} away</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                              <span>{act.time}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                              <span>{joined ? act.joined + 1 : act.joined}/{act.total} Joined</span>
                            </div>
                            <div className="flex items-center">
                              <Trophy className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                              <span>Skill: {act.skill}</span>
                            </div>
                          </div>

                          {user?.role === 'owner' ? (
                            <div className="text-[10px] text-center text-neutral-500 font-semibold border border-white/5 rounded-xl py-2.5 bg-white/[0.01]">
                              View Only Mode (Owners cannot join sessions)
                            </div>
                          ) : (
                            <div className="flex space-x-3 pt-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleJoinMatch(act.id);
                                }}
                                className={`flex-grow text-xs font-bold py-2.5 rounded-full border transition-all ${
                                  joined 
                                    ? 'bg-transparent text-white border-white/20 hover:bg-white/5'
                                    : 'bg-white text-black border-transparent hover:bg-neutral-200'
                                }`}
                              >
                                {joined ? 'Leave Match' : 'Join Match'}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  triggerPrepaidPayment(act);
                                }}
                                className="flex-shrink-0 text-xs font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2.5 rounded-full flex items-center space-x-1.5"
                              >
                                <Lock className="w-3 h-3 text-neutral-400" />
                                <span>Prepay</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}

            {/* TABS CONTENT: Venues */}
            {activeTab === 'Venues' && (
              <div className="space-y-5">
                {activities.map(v => {
                  const matches = venueOffers.filter(o => o.venueId === v.id);
                  const bookingOffers = matches.filter(o => o.type === 'booking');
                  const membershipPackages = matches.filter(o => o.type === 'membership');

                  return (
                    <div key={v.id} className="glass-card overflow-hidden border border-white/5 flex flex-col">
                      {v.image && (
                        <div className="w-full h-44 overflow-hidden relative bg-neutral-900 border-b border-white/5 flex-shrink-0">
                          <img src={v.image} alt={v.venue} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-extrabold text-white border border-white/10 flex items-center gap-1">
                            <SportIcon sport={v.sport} size={12} className="text-white" />
                            {v.sport}
                          </div>
                          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-black text-white border border-white/10">
                            {v.price}
                          </div>
                        </div>
                      )}
                      
                      <div className="p-5.5 space-y-4">
                         <div className="text-left">
                           <h4 className="font-bold text-white font-display text-lg">{v.venue}</h4>
                           <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5">
                             <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                             <span>{v.distance} away</span>
                           </p>

                           {/* Offers and Memberships Badges */}
                           {(bookingOffers.length > 0 || membershipPackages.length > 0) && (
                             <div className="flex flex-wrap gap-1.5 mt-3">
                               {bookingOffers.map(o => (
                                 <span key={o.id} className="text-[9px] text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20 font-black uppercase tracking-wider flex items-center gap-1">
                                   🎟️ Offer: {o.discount}
                                 </span>
                               ))}
                               {membershipPackages.map(o => (
                                 <span key={o.id} className="text-[9px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 font-black uppercase tracking-wider flex items-center gap-1">
                                   💎 Pass: {o.title}
                                 </span>
                               ))}
                             </div>
                           )}

                           <div className="flex items-center space-x-2 mt-3">
                             <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/15 font-bold uppercase tracking-wider">Active slots available</span>
                           </div>
                         </div>
                         
                         {user?.role === 'owner' ? (
                           <div className="text-[10px] text-center text-neutral-500 font-semibold border border-white/5 rounded-xl py-2.5 bg-white/[0.01]">
                             View Only Mode
                           </div>
                         ) : (
                           <div className="flex space-x-3">
                             <button 
                               onClick={() => triggerPrepaidPayment(v)}
                               className="flex-grow text-xs font-bold bg-white text-black py-2.5 rounded-full hover:bg-neutral-200 transition-all flex items-center justify-center space-x-1.5"
                             >
                               <Lock className="w-3.5 h-3.5 text-black" />
                               <span>Prepay Booking</span>
                             </button>

                             {(bookingOffers.length > 0 || membershipPackages.length > 0) && (
                               <button 
                                 onClick={() => setSelectedDealsVenue(v)}
                                 className="px-4.5 py-2.5 text-xs font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full flex items-center justify-center space-x-1.5 transition-all"
                               >
                                 <span>Deals</span>
                               </button>
                             )}
                           </div>
                         )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TABS CONTENT: Events */}
            {activeTab === 'Events' && (
              <div className="space-y-5">
                {[
                  { id: 901, title: 'Turfington Summer Football Cup', venue: 'Vanguard Sports Arena', date: 'June 15, 2026', sport: 'Football', price: '₹400/team', image: '/trophy.png', slots: '2 slots left', status: 'Registration Open' },
                  { id: 902, title: 'Smash Masters Badminton Doubles', venue: 'Smash Club Badminton', date: 'June 22, 2026', sport: 'Badminton', price: '₹200/team', image: '/smash_club_badminton.jpg', slots: '5 slots left', status: 'Registration Open' }
                ].map(ev => (
                  <div key={ev.id} className="glass-card overflow-hidden border border-white/5 flex flex-col">
                    <div className="w-full h-44 overflow-hidden relative bg-neutral-900 border-b border-white/5 flex-shrink-0">
                      <img src={ev.image} alt={ev.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-extrabold text-white border border-white/10 flex items-center gap-1">
                        <SportIcon sport={ev.sport} size={12} className="text-white" />
                        {ev.sport}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-black text-white border border-white/10">
                        {ev.price}
                      </div>
                    </div>
                    
                    <div className="p-5.5 space-y-4">
                       <div className="text-left">
                         <h4 className="font-bold text-white font-display text-lg">{ev.title}</h4>
                         <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5">
                           <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                           <span>{ev.venue}</span>
                         </p>
                         <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5">
                           <Clock className="w-3.5 h-3.5 text-neutral-500" />
                           <span>{ev.date}</span>
                         </p>
                         <div className="flex items-center space-x-2 mt-3">
                           <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/15 font-bold uppercase tracking-wider">{ev.slots}</span>
                         </div>
                       </div>
                       
                       <button 
                         onClick={() => alert(`Registration details for ${ev.title} sent to your email!`)}
                         className="w-full text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-full transition-all flex items-center justify-center space-x-1.5"
                       >
                         <span>Register Team</span>
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* MAP & SPORTS FEED COLUMN */}
          <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto pr-2 no-scrollbar">

            {/* Map Legend & Athlete Search Tips Card */}
            <div className="flex-grow space-y-4">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center border-b border-white/5 pb-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2 animate-pulse" />
                Live Map Guidelines & Info
              </h3>
              
              <div className="glass-card p-5 border border-white/5 text-left bg-white/[0.01] space-y-4.5">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/10 border border-indigo-500/25 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider">Geolocated Matching</h4>
                    <p className="text-[11px] text-neutral-400 font-light mt-1 leading-relaxed">
                      All distances and locations are calculated in real time. Grant browser GPS permissions to automatically sort match sessions, local tournaments, and venue locations starting from the ones closest to you.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-3 border-t border-white/5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600/10 border border-emerald-500/25 flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider">Interactive Markers</h4>
                    <p className="text-[11px] text-neutral-400 font-light mt-1 leading-relaxed">
                      Click map pins to inspect events and venues. Athlete markers are plotted with their custom profile avatars inside active search radii; tap any athlete marker to view their handle, mutual connections, and skill levels.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-3 border-t border-white/5">
                  <div className="w-8 h-8 rounded-xl bg-violet-600/10 border border-violet-500/25 flex items-center justify-center flex-shrink-0">
                    <Compass className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider">Fast Map Controls</h4>
                    <p className="text-[11px] text-neutral-400 font-light mt-1 leading-relaxed">
                      Tap the compass icon in the upper-right corner of the map to center the map on your detected live GPS location, or use filters to dynamically show matches within custom search boundaries (up to 25 km).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. PREPAID PAYMENT MODAL */}
      <AnimatePresence>
        {activePrepaidVenue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePrepaidVenue(null)}
              className="absolute inset-0 bg-black"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative glass-card w-full max-w-[400px] p-6 border border-white/10 shadow-2xl text-left z-10"
            >
              <div className="space-y-5">
                <div className="flex items-center space-x-2 pb-3 border-b border-white/5">
                  <div className="p-2 bg-white/5 border border-white/10 rounded-full">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm uppercase">Secure Prepaid Checkout</h3>
                    <p className="text-[9px] text-neutral-500">Prepaid Guarantee Lock active to prevent last-minute cancellations</p>
                  </div>
                </div>

                {/* Booking description summary */}
                <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-xl p-4 text-xs font-light">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Venue / Session</span>
                    <span className="font-bold text-white">{activePrepaidVenue.venue || activePrepaidVenue.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Sport Category</span>
                    <span className="text-neutral-300 font-medium">{activePrepaidVenue.sport}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Time Window</span>
                    <span className="text-neutral-300 font-medium">{activePrepaidVenue.time}</span>
                  </div>
                  <div className="flex justify-between pt-2.5 border-t border-white/5 font-bold text-sm">
                    <span>Total Cost Due</span>
                    <span className="font-display text-white">{activePrepaidVenue.price}</span>
                  </div>
                </div>

                {/* Simulated payment detail */}
                <div className="space-y-2">
                  <label className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">Payment Method</label>
                  <div className="flex items-center justify-between p-3.5 bg-neutral-900 border border-white/5 rounded-xl text-xs">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4.5 h-4.5 text-neutral-400" />
                      <span className="text-white font-medium">Turfington Pay •••• 8840</span>
                    </div>
                    <span className="text-[9px] text-neutral-400 uppercase font-bold tracking-wider">Secured</span>
                  </div>
                </div>

                {/* CTA actions */}
                <div className="flex items-center space-x-3 pt-3">
                  <button 
                    onClick={() => setActivePrepaidVenue(null)}
                    className="flex-1 py-3 text-xs border border-white/10 hover:bg-white/5 rounded-full font-bold text-neutral-400 hover:text-white transition-all text-center"
                  >
                    Cancel
                  </button>

                  <button 
                    onClick={handleExecutePayment}
                    disabled={isPaying || paymentSuccess}
                    className="flex-1 py-3 bg-white text-black text-xs font-bold rounded-full hover:bg-neutral-200 transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
                  >
                    {isPaying ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : paymentSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Success!</span>
                      </>
                    ) : (
                      <span>Pay & Book</span>
                    )}
                  </button>
                </div>

                <p className="text-[9px] text-center text-neutral-600 font-light leading-relaxed">
                  Prepayments guarantee slot reservation and are subject to venue rules. 100% refund is available if cancelled up to 12 hours prior to the slot.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DEALS AND MEMBERSHIPS PASSES MODAL */}
      <AnimatePresence>
        {selectedDealsVenue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDealsVenue(null)}
              className="absolute inset-0 bg-black"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative glass-card w-full max-w-[460px] p-6 border border-white/10 shadow-2xl text-left z-10"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-indigo-500/10 border border-indigo-500/25 rounded-full text-indigo-400">
                      <Trophy className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-sm uppercase">Deals & Memberships</h3>
                      <p className="text-[9px] text-neutral-500">Exclusives for {selectedDealsVenue.venue}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedDealsVenue(null)} className="p-1.5 hover:bg-white/5 border border-white/10 rounded-full text-neutral-400 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Booking discounts section */}
                <div className="space-y-3">
                  <h4 className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Claim Booking Discount</h4>
                  {venueOffers.filter(o => o.venueId === selectedDealsVenue.id && o.type === 'booking').length === 0 ? (
                    <p className="text-[11px] text-neutral-500 italic font-light">No active booking offers for this venue.</p>
                  ) : (
                    <div className="space-y-2">
                      {venueOffers.filter(o => o.venueId === selectedDealsVenue.id && o.type === 'booking').map(offer => (
                        <div key={offer.id} className="p-3 bg-indigo-600/5 border border-indigo-500/15 rounded-xl flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white">{offer.title}</p>
                            <p className="text-[10px] text-neutral-400 mt-0.5">{offer.description}</p>
                          </div>
                          <button 
                            onClick={() => {
                              const discountPct = parseFloat(offer.discount.replace(/[^\d]/g, '')) || 15;
                              const currentVal = parseFloat(selectedDealsVenue.price.replace(/[^\d]/g, ''));
                              const calculated = Math.round(currentVal * (1 - discountPct / 100));
                              
                              setSelectedDealsVenue(null);
                              triggerPrepaidPayment({
                                ...selectedDealsVenue,
                                price: `₹${calculated.toLocaleString('en-IN')}/hr (Discount Applied)`
                              });
                            }}
                            className="flex-shrink-0 text-[10px] font-black uppercase bg-indigo-600 text-white px-3.5 py-1.5 rounded-full hover:bg-indigo-500 transition-all"
                          >
                            Apply {offer.discount}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Membership packages section */}
                <div className="space-y-3 pt-3 border-t border-white/5">
                  <h4 className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Monthly Membership Passes</h4>
                  {venueOffers.filter(o => o.venueId === selectedDealsVenue.id && o.type === 'membership').length === 0 ? (
                    <p className="text-[11px] text-neutral-500 italic font-light">No membership packages currently offered.</p>
                  ) : (
                    <div className="space-y-2">
                      {venueOffers.filter(o => o.venueId === selectedDealsVenue.id && o.type === 'membership').map(pass => (
                        <div key={pass.id} className="p-3 bg-emerald-600/5 border border-emerald-500/15 rounded-xl flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white">{pass.title}</p>
                            <p className="text-[10px] text-neutral-400 mt-0.5">{pass.benefits}</p>
                          </div>
                          <button 
                            onClick={() => {
                              alert(`Congratulations! You have subscribed to the "${pass.title}" package at ${pass.price}. Subscriptions receipt has been sent to your email!`);
                              setSelectedDealsVenue(null);
                            }}
                            className="flex-shrink-0 text-[10px] font-black uppercase bg-emerald-600 text-white px-3.5 py-1.5 rounded-full hover:bg-emerald-500 transition-all"
                          >
                            Buy {pass.price}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
