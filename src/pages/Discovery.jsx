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
import VenueImage from '../components/VenueImage';
import { apiFetchTurfs, apiFetchNearbyTurfs, apiCreateBooking, apiFetchNearbyPlayers, apiSearchUsers, apiFollowUser, apiCreateDirectChat, apiSubscribeVenues } from '../services/db';
import { openRazorpayCheckout } from '../services/razorpay';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

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
  joinedMatches = [],
  matchRequests = [],
  onRequestJoinMatch,
  onRequestCancelMatch,
  onOpenHostManager,
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
  const [activeTab, setActiveTab] = useState('Near You');
  const [radiusKm, setRadiusKm] = useState(5); // Default 5 km radius
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Slot selection & Open Match player join state
  const [selectedSlotTurf, setSelectedSlotTurf] = useState(null);
  const [slotDateTab, setSlotDateTab] = useState(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayNames[new Date().getDay()];
  });
  const [chosenSlot, setChosenSlot] = useState(null);
  const [bookingType, setBookingType] = useState('private');
  const [myExistingCount, setMyExistingCount] = useState(5);

  // Auto-select Today's date whenever a player opens slot booking for a venue
  useEffect(() => {
    if (selectedSlotTurf) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const todayShort = dayNames[new Date().getDay()];
      setSlotDateTab(todayShort);
      setChosenSlot(null);
    }
  }, [selectedSlotTurf]);

  const getBookingDays = () => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayShort = dayNames[d.getDay()];
      days.push({
        index: i,
        dayShort,
        dateLabel: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullLabel: `${dayShort.toUpperCase()}`,
        isAdvanceRestricted: i >= 3 // Beyond 3 days limit
      });
    }
    return days;
  };

  const getSlotsForTurf = (turf, dayShort) => {
    const times = [
      '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
      '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
      '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
      '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
    ];

    const rawMap = turf?.slots?.[dayShort] || {};
    
    const slots = times.map((t, idx) => {
      let rawStatus = rawMap[t] || 'available';
      
      // Keep initial demo feel if no custom slot state saved yet
      if (!turf?.slots && (idx === 7 || idx === 11 || idx === 14)) {
        rawStatus = 'booked';
      }

      return {
        id: `slot_${turf?.id || 1}_${dayShort}_${t}`,
        time: t,
        status: rawStatus,
        capacity: 10,
        price: parseFloat(String(turf?.price || turf?.price_per_hr || 600).replace(/[^\d.]/g, '')) || 600,
        bookedBy: rawStatus === 'booked' ? 'Booked' : null
      };
    });

    // CRITICAL: Blocked slots are completely hidden from players!
    let filtered = slots.filter(s => s.status !== 'blocked');

    // Real-Time Past Slot Hiding for Today:
    // Hide any slots that have already passed based on current local time
    const bookingDays = getBookingDays();
    const todayDayShort = bookingDays[0]?.dayShort;

    if (dayShort === todayDayShort) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const nowTotalMinutes = currentHour * 60 + currentMinute;

      filtered = filtered.filter(s => {
        const [h, m] = s.time.split(':').map(Number);
        const slotStartMinutes = h * 60 + (m || 0);
        // Only show upcoming slots starting after the current time
        return slotStartMinutes > nowTotalMinutes;
      });
    }

    return filtered;
  };

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

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  // Location Access State
  const [locationStatus, setLocationStatus] = useState('prompt'); // 'prompt', 'detecting', 'granted'
  const [userCoordinates, setUserCoordinates] = useState(null);

  // Prepaid Payment Dialog State
  const [activePrepaidVenue, setActivePrepaidVenue] = useState(null); // Venue details for payment
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // ── Fetch dynamic venues from Firebase ──
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [rawActivities, setRawActivities] = useState([]);

  // Subscribe to real-time venue updates from Firebase and local events
  useEffect(() => {
    setActivitiesLoading(true);
    const unsubscribe = apiSubscribeVenues((turfs) => {
      // Map Firebase/API turfs to 'activities' shape expected by the UI
      const mapped = turfs.map(t => {
        const tLat = parseFloat(t.latitude ?? t.lat) || 13.0827;
        const tLng = parseFloat(t.longitude ?? t.lng) || 80.2707;
        const isCustom = String(t.id).startsWith('venue_') || t.owner_id != null;
        return {
          id: t.id,
          title: t.name,
          sport: t.category || (t.sports && t.sports[0]) || t.sport || 'Sports',
          venue: t.name,
          lat: tLat,
          lng: tLng,
          latitude: tLat,
          longitude: tLng,
          time: t.is_open_24_hours ? '24 Hours' : 'Flexible',
          slots: 'Multiple slots',
          joined: 0,
          total: 10,
          skill: 'Any',
          price: t.price || (t.price_per_hr ? `₹${t.price_per_hr}/hr` : 'Contact for price'),
          rating: t.rating || 5.0,
          image: t.image_url || t.image,
          image_url: t.image_url || t.image,
          phone: t.phone,
          address: t.address || t.location || 'Chennai, Tamil Nadu',
          description: t.description || 'Modern synthetic sports venue.',
          isNew: isCustom,
          owner_id: t.owner_id
        };
      });
      setRawActivities(mapped);
      setActivitiesLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [user?.id, user?.role]);

  // ── Player data with real GPS coords near Chennai
  const PLAYERS_BASE = [
    { id: 1, name: 'Amit Patel',    handle: '@amitpatel',      lat: 13.0952, lng: 80.2198, sports: ['Football', 'Cricket'],          level: 'Advanced',     matchesPlayed: 32, winRate: '71%', mutualFriends: 4, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', coverColor: 'from-emerald-600 to-green-800',   badge: 'Top Scorer',       badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { id: 2, name: 'Pooja Reddy',   handle: '@poojareddy',     lat: 13.0250, lng: 80.2150, sports: ['Badminton', 'Table Tennis'],     level: 'Intermediate', matchesPlayed: 18, winRate: '58%', mutualFriends: 7, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200', coverColor: 'from-indigo-600 to-violet-800',   badge: 'Active Player',    badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    { id: 3, name: 'Deepak Kumar',  handle: '@deepaktt',       lat: 13.0800, lng: 80.2100, sports: ['Table Tennis'],                  level: 'Elite',        matchesPlayed: 44, winRate: '84%', mutualFriends: 2, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', coverColor: 'from-rose-600 to-pink-800',       badge: 'Elite Ranked',     badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  ];

  // ── Derived state: activities and players with real distances ──
  const [activities, setActivities] = useState([]);
  const [dbPlayersList, setDbPlayersList] = useState([]);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [selectedPlayerModal, setSelectedPlayerModal] = useState(null);
  const [followedPlayers, setFollowedPlayers] = useState([]);

  const toggleFollow = async (id) => {
    setFollowedPlayers(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
    if (user?.id) {
      await apiFollowUser(user.id, id);
    }
  };

  // Fetch dynamic player profiles from Firebase Database on load or GPS/radius change
  useEffect(() => {
    async function loadDbPlayers() {
      setPlayersLoading(true);
      const lat = userCoordinates?.lat || 13.0827;
      const lng = userCoordinates?.lng || 80.2707;
      
      let fetched = [];
      if (searchQuery.trim()) {
        fetched = await apiSearchUsers(searchQuery, user?.id);
      } else {
        fetched = await apiFetchNearbyPlayers(lat, lng, radiusKm, user?.id);
      }

      setDbPlayersList(fetched);
      setPlayersLoading(false);
    }
    loadDbPlayers();
  }, [userCoordinates, radiusKm, searchQuery, user?.id]);

  // Update distances when GPS is obtained or when rawActivities load
  const applyRealDistances = useCallback((lat, lng, sourceActivities) => {
    const listToMap = sourceActivities || rawActivities;
    setActivities(
      listToMap
        .map(a => ({ ...a, distance: `${haversine(lat, lng, a.lat, a.lng)} km` }))
        .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
    );
  }, [rawActivities]);

  // Effect to recalculate distances if rawActivities changes and we have location
  useEffect(() => {
    if (userCoordinates && rawActivities.length > 0) {
      applyRealDistances(userCoordinates.lat, userCoordinates.lng, rawActivities);
    } else if (rawActivities.length > 0) {
      setActivities(rawActivities.map(a => ({ ...a, distance: '? km' })));
    }
  }, [rawActivities, userCoordinates, applyRealDistances]);


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

  // Slot status state updater
  const updateSlotState = (turfId, dayShort, slotTimeOrId, updater) => {
    setActivities(prev => prev.map(act => {
      if (act.id !== turfId) return act;
      const currentSlots = act.slots || {};
      const daySlots = currentSlots[dayShort] || {};
      const timeKey = String(slotTimeOrId).includes('_') ? String(slotTimeOrId).split('_').pop() : String(slotTimeOrId);
      const currentStatus = daySlots[timeKey] || 'available';
      const updatedRes = typeof updater === 'function' ? updater({ status: currentStatus }) : { status: 'booked' };
      const newStatus = updatedRes?.status || 'booked';
      return {
        ...act,
        slots: {
          ...currentSlots,
          [dayShort]: {
            ...daySlots,
            [timeKey]: newStatus
          }
        }
      };
    }));
  };

  // Confirm slot selection & proceed to checkout payment drawer
  const handleConfirmSlotBooking = (slot) => {
    if (!slot || !selectedSlotTurf) return;

    const slotTimeStr = slot.time || '06:00';
    const venueBookingPayload = {
      id: selectedSlotTurf.id,
      venue: selectedSlotTurf.venue || selectedSlotTurf.title || selectedSlotTurf.name,
      sport: selectedSlotTurf.sport || 'Sports',
      time: `${slotDateTab}, ${slotTimeStr}`,
      price: `₹${slot.price || 600}`,
      image: selectedSlotTurf.image || selectedSlotTurf.image_url,
      slotMeta: {
        turfId: selectedSlotTurf.id,
        dateKey: slotDateTab,
        slotId: slot.id || slotTimeStr,
        bookingType,
        myExistingCount,
        capacity: slot.capacity || 10,
        currentStatus: slot.status
      }
    };

    // Close slot picker modal
    setSelectedSlotTurf(null);
    setChosenSlot(null);

    // Trigger payment & booking creation drawer
    triggerPrepaidPayment(venueBookingPayload);
  };

  // Open booking confirmation drawer (Pay at Venue)
  const triggerPrepaidPayment = (venue) => {
    setActivePrepaidVenue(venue);
    setPaymentSuccess(false);
  };

  // Confirm booking with Pay at Venue (no prepaid online payment required)
  const handleConfirmVenueBooking = () => {
    if (!activePrepaidVenue) return;
    setIsPaying(true);

    if (activePrepaidVenue.slotMeta) {
      const { turfId, dateKey, slotId, bookingType, myExistingCount, capacity, currentStatus } = activePrepaidVenue.slotMeta;
      updateSlotState(turfId, dateKey, slotId, (s) => {
        if (currentStatus === 'open_match') {
          const newCount = (s.currentPlayers || 5) + 1;
          const isFull = newCount >= (s.capacity || 10);
          return {
            ...s,
            currentPlayers: newCount,
            neededPlayers: Math.max(0, (s.capacity || 10) - newCount),
            status: isFull ? 'booked' : 'open_match',
            bookedBy: isFull ? 'Full Squad' : s.bookedBy
          };
        } else if (bookingType === 'open_match') {
          return {
            ...s,
            status: 'open_match',
            currentPlayers: myExistingCount,
            neededPlayers: capacity - myExistingCount,
            hostName: user?.full_name || 'You'
          };
        } else {
          return {
            ...s,
            status: 'booked',
            bookedBy: user?.full_name || 'You'
          };
        }
      });
    }

    const newBooking = {
      id: 'bk_' + Date.now(),
      title: activePrepaidVenue.venue || activePrepaidVenue.name,
      sport: activePrepaidVenue.sport || 'Sports Activity',
      time: activePrepaidVenue.time || 'Today, Flexible Slot',
      price: activePrepaidVenue.price,
      image: activePrepaidVenue.image || 'https://images.unsplash.com/photo-1538388149142-f82611d4d6c4?q=80&w=400',
      paymentType: 'Pay at Venue',
      paymentStatus: 'Pay on Arrival'
    };

    apiCreateBooking({
      venue_id: activePrepaidVenue.id || 'v_default',
      venue_name: newBooking.title,
      sport: newBooking.sport,
      slot_time: newBooking.time,
      price: newBooking.price,
      user_id: user?.id || 'usr_guest',
      payment_type: 'pay_at_venue',
      payment_status: 'pending_at_venue'
    }).catch(() => {});

    setTimeout(() => {
      setIsPaying(false);
      setPaymentSuccess(true);
      setBookings(prev => [newBooking, ...prev]);
      setTimeout(() => {
        setActivePrepaidVenue(null);
        setPaymentSuccess(false);
      }, 1200);
    }, 600);
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
        {['Near You', 'Players', 'Activities', 'Venues', 'Events', 'Map'].map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSelectedMarker(null);
            }}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
              activeTab === tab 
                ? 'bg-white text-black font-extrabold shadow-md' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {tab === 'Near You' ? '🏟 Near You' : tab === 'Players' ? '🏃 Players' : tab}
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

        <div className={`${showFilters ? 'lg:col-span-9' : 'lg:col-span-12'} gap-8 h-fit min-h-[720px]`}>
          {/* RESULTS COLUMN */}
          <div className="space-y-5 text-left h-full">
            
            {/* TABS CONTENT: 🏟 Near You */}
            {activeTab === 'Near You' && (
              <div className="space-y-6">
                {/* Header & Radius Filter Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-5 border border-white/5 rounded-2xl">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">🏟️</span>
                      <h2 className="font-display font-black text-white text-lg uppercase tracking-tight">Turfs Near You</h2>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Showing venues {radiusKm === 'All' ? <span className="text-emerald-400 font-bold">across all distances</span> : <>within <span className="text-emerald-400 font-bold">{radiusKm} km</span> radius</>}
                      {userCoordinates ? ` of (${userCoordinates.lat.toFixed(4)}, ${userCoordinates.lng.toFixed(4)})` : ''}
                    </p>
                  </div>

                  {/* Radius Quick Selector */}
                  <div className="flex items-center space-x-2 bg-[#0a0a0a] p-1.5 rounded-full border border-white/10 self-start sm:self-auto overflow-x-auto no-scrollbar">
                    <span className="text-[10px] text-neutral-400 uppercase font-bold pl-3 pr-1">Radius:</span>
                    {[5, 10, 20, 30, 50, 'All'].map(r => (
                      <button
                        key={r}
                        onClick={() => setRadiusKm(r)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer flex-shrink-0 ${
                          radiusKm === r
                            ? 'bg-[#5842fe] text-white shadow-lg shadow-[#5842fe]/30'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        {r === 'All' ? 'All' : `${r} km`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location Permission Prompt Banner if denied / missing */}
                {locationStatus !== 'granted' && (
                  <div className="glass-card p-6 border border-indigo-500/30 bg-indigo-500/5 text-left flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400 border border-indigo-500/30">
                        <Navigation className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">Request Location Permission</h4>
                        <p className="text-xs text-neutral-400 mt-1">
                          Grant location access to detect your exact GPS coordinates and view turfs nearest to you.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleDetectLocation}
                      disabled={locationStatus === 'detecting'}
                      className="flex-shrink-0 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-full transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
                    >
                      {locationStatus === 'detecting' ? 'Detecting Location...' : 'Allow Location'}
                    </button>
                  </div>
                )}

                {/* Nearby Turfs Grid */}
                {(() => {
                  const userLat = userCoordinates?.lat || 13.0827; // Default Chennai center
                  const userLng = userCoordinates?.lng || 80.2707;

                  const nearbyList = activities
                    .map(turf => {
                      const distNum = haversine(userLat, userLng, turf.lat || 13.0827, turf.lng || 80.2707);
                      return { ...turf, distanceNum: distNum, distanceText: `${distNum} km away` };
                    })
                    .filter(turf => {
                      if (selectedSport !== 'All' && turf.sport !== selectedSport) return false;
                      if (searchQuery && !turf.title.toLowerCase().includes(searchQuery.toLowerCase()) && !turf.venue.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                      if (radiusKm === 'All') return true;
                      return turf.distanceNum <= Number(radiusKm);
                    })
                    .sort((a, b) => {
                      if (a.isNew && !b.isNew) return -1;
                      if (!a.isNew && b.isNew) return 1;
                      return a.distanceNum - b.distanceNum;
                    });

                  if (nearbyList.length === 0) {
                    return (
                      <div className="glass-card p-12 text-center border border-dashed border-white/10 space-y-3">
                        <MapPin className="w-10 h-10 text-neutral-600 mx-auto" />
                        <h3 className="text-white font-bold text-base">No Turfs Found Within {radiusKm} km</h3>
                        <p className="text-neutral-500 text-xs max-w-md mx-auto">
                          There are no registered turfs in this immediate radius. Expand your radius filter to view more venues.
                        </p>
                        <div className="flex justify-center space-x-2 pt-2">
                          <button
                            onClick={() => setRadiusKm(20)}
                            className="px-4 py-2 text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full transition-all cursor-pointer"
                          >
                            Expand to 20 km
                          </button>
                          <button
                            onClick={() => setRadiusKm('All')}
                            className="px-4 py-2 text-xs font-bold bg-[#5842fe] hover:bg-[#4a35ea] text-white rounded-full transition-all cursor-pointer shadow-lg shadow-[#5842fe]/30"
                          >
                            View All Venues ({activities.length})
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {nearbyList.map((turf) => (
                        <div
                          key={turf.id}
                          className="glass-card overflow-hidden border border-white/5 hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between group"
                        >
                          <div>
                            {/* Turf Image with Distance Badge */}
                            <div className="w-full h-48 overflow-hidden relative bg-neutral-900 border-b border-white/5">
                              <VenueImage
                                src={turf.image || turf.image_url}
                                alt={turf.venue || turf.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                                <span className="bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-extrabold text-white border border-white/10 flex items-center gap-1.5">
                                  <SportIcon sport={turf.sport} size={13} className="text-emerald-400" />
                                  <span>{turf.sport}</span>
                                </span>
                                {turf.isNew && (
                                  <span className="bg-emerald-500 text-black px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1 animate-pulse">
                                    ✨ NEW
                                  </span>
                                )}
                              </div>
                              <div className="absolute top-3 right-3 bg-[#5842fe]/90 text-white px-3 py-1 rounded-lg text-xs font-black shadow-lg flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{turf.distanceText}</span>
                              </div>
                              <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-black text-white border border-white/10">
                                {turf.price}
                              </div>
                            </div>

                            {/* Turf Details */}
                            <div className="p-5 space-y-3 text-left">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-display font-black text-white text-base leading-snug group-hover:text-emerald-400 transition-colors">
                                  {turf.venue || turf.title}
                                </h3>
                                <div className="flex items-center space-x-1 flex-shrink-0 bg-white/5 px-2 py-0.5 rounded border border-white/10 text-xs text-amber-400 font-bold">
                                  <Star className="w-3 h-3 fill-amber-400" />
                                  <span>{turf.rating || 4.8}</span>
                                </div>
                              </div>

                              <p className="text-xs text-neutral-400 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                                <span className="truncate">{turf.address || 'Chennai Central, Tamil Nadu'}</span>
                              </p>

                              {turf.description && (
                                <p className="text-[11px] text-neutral-500 line-clamp-2 font-light">
                                  {turf.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Footer Action */}
                          <div className="p-5 pt-0">
                            <button
                              onClick={() => setSelectedSlotTurf(turf)}
                              className="w-full text-xs font-extrabold uppercase tracking-widest bg-[#5842fe] hover:bg-[#4832ee] text-white py-3.5 rounded-full transition-all flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(88,66,254,0.35)] cursor-pointer hover:scale-[1.02]"
                            >
                              <span>Select Slot & Book</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TABS CONTENT: 🏃 Players Near You */}
            {activeTab === 'Players' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-5 border border-white/5 rounded-2xl">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">🏃</span>
                      <h2 className="font-display font-black text-white text-lg uppercase tracking-tight">
                        {searchQuery ? `Search Results for "${searchQuery}"` : 'Players Near You'}
                      </h2>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Showing players within <span className="text-indigo-400 font-bold">{radiusKm} km</span> radius from Firebase Database
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 bg-[#0a0a0a] p-1.5 rounded-full border border-white/10 self-start sm:self-auto overflow-x-auto no-scrollbar">
                    <span className="text-[10px] text-neutral-400 uppercase font-bold pl-3 pr-1">Max Distance:</span>
                    {[5, 10, 20, 30, 50].map(r => (
                      <button
                        key={r}
                        onClick={() => setRadiusKm(r)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          radiusKm === r
                            ? 'bg-indigo-600 text-white font-black shadow-md'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        {r} km
                      </button>
                    ))}
                  </div>
                </div>

                {playersLoading ? (
                  <div className="glass-card p-12 text-center border border-white/5 flex items-center justify-center space-x-3 text-indigo-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-sm font-bold">Searching Firebase for players near you...</span>
                  </div>
                ) : dbPlayersList.length === 0 ? (
                  <div className="glass-card p-12 text-center border border-dashed border-white/10 space-y-3">
                    <Users className="w-10 h-10 text-neutral-600 mx-auto" />
                    <h3 className="text-white font-bold text-base">No Players Found</h3>
                    <p className="text-neutral-500 text-xs max-w-md mx-auto">
                      No matching registered player profiles found in this area. Try increasing your distance radius filter or clearing search query.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dbPlayersList.map((player) => {
                      const isFollowing = followedPlayers.includes(player.id);
                      return (
                        <div
                          key={player.id}
                          onClick={() => setSelectedPlayerModal(player)}
                          className="glass-card p-5 border border-white/5 hover:border-indigo-500/30 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                        >
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3.5">
                              <img
                                src={player.avatar_url || player.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200'}
                                alt={player.full_name}
                                className="w-13 h-13 rounded-full object-cover border-2 border-indigo-500/30 group-hover:border-indigo-400 transition-colors"
                              />
                              <div className="text-left overflow-hidden">
                                <h3 className="font-bold text-white text-base truncate group-hover:text-indigo-400 transition-colors">
                                  {player.full_name || 'Sports Player'}
                                </h3>
                                <p className="text-xs text-indigo-300 font-mono">
                                  @{player.username || 'player'}
                                </p>
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border mt-1 inline-block ${
                                  player.role === 'owner' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                                }`}>
                                  {player.role === 'owner' ? '🏟️ Venue Owner' : '🏃 Player'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs pt-3 border-t border-white/5 text-neutral-400">
                              <span className="flex items-center gap-1 text-emerald-400 font-extrabold">
                                <MapPin className="w-3.5 h-3.5" />
                                {player.distanceText || '1.2 km away'}
                              </span>
                              <span>{player.city || 'Chennai'}</span>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFollow(player.id);
                              }}
                              className={`w-full py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                                isFollowing
                                  ? 'bg-white/10 text-white border-white/20'
                                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent'
                              }`}
                            >
                              {isFollowing ? <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> : <UserPlus className="w-3.5 h-3.5" />}
                              <span>{isFollowing ? 'Following' : 'Follow Player'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredActivities.map(act => {
                      const req = matchRequests.find(r => r.matchId === act.id && (r.userId === (user?.id || 'usr_curr') || r.userId === 'usr_amit_patel'));
                      const reqStatus = req ? req.status : (joinedMatches.includes(act.id) ? 'approved' : 'none');
                      const joined = reqStatus === 'approved';
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
                              <div className="absolute top-3 left-3 flex gap-1">
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg">
                                  <SportIcon sport={act.sport} size={12} className="text-white" />
                                  {act.sport}
                                </span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenHostManager && onOpenHostManager(act);
                                }}
                                className="absolute top-3 right-3 bg-indigo-600/90 hover:bg-indigo-500 text-white font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-lg border border-indigo-400/30 backdrop-blur-md shadow-md"
                                title="Host Manager: Review Player Scores"
                              >
                                Host Review
                              </button>
                              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-black text-white border border-white/10">
                                {act.price}
                              </div>
                            </div>
                          )}

                          <div className="p-5 space-y-4 flex-grow flex flex-col justify-between">
                            <div className="text-left space-y-2">
                              <h3 className="font-display font-black text-white text-base leading-snug">{act.title}</h3>
                              <p className="text-xs text-neutral-400 font-light flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-neutral-500" />
                                {act.venue}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-white/5 text-neutral-300 text-xs font-light">
                              <div className="flex items-center">
                                <MapPin className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                                <span>{act.distance} away</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                                <span>{act.time}</span>
                              </div>
                              <div className="flex items-center">
                                <Users className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                                <span>{joined ? act.joined + 1 : act.joined}/{act.total} Joined</span>
                              </div>
                              <div className="flex items-center">
                                <Trophy className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                                <span>Skill: {act.skill}</span>
                              </div>
                            </div>

                            {user?.role === 'owner' ? (
                              <div className="text-[10px] text-center text-neutral-500 font-semibold border border-white/5 rounded-xl py-2 bg-white/[0.01]">
                                View Only Mode
                              </div>
                            ) : (
                              <div className="flex space-x-2 pt-1">
                                {reqStatus === 'approved' ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRequestCancelMatch ? onRequestCancelMatch(act) : toggleJoinMatch(act.id);
                                    }}
                                    className="flex-grow text-xs font-bold py-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 hover:bg-rose-500/20 hover:text-rose-300 transition-all cursor-pointer shadow-sm"
                                    title="Click to request cancellation from host"
                                  >
                                    ✓ Joined (Leave)
                                  </button>
                                ) : reqStatus === 'pending_approval' ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRequestCancelMatch ? onRequestCancelMatch(act) : null;
                                    }}
                                    className="flex-grow text-xs font-bold py-2.5 rounded-full border border-amber-500/30 bg-amber-500/15 text-amber-300 transition-all cursor-pointer shadow-sm"
                                  >
                                    🕒 Pending Approval
                                  </button>
                                ) : reqStatus === 'cancellation_pending' ? (
                                  <button
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex-grow text-xs font-bold py-2.5 rounded-full border border-rose-500/30 bg-rose-500/15 text-rose-300 transition-all cursor-pointer shadow-sm"
                                  >
                                    ⏳ Leave Pending
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRequestJoinMatch ? onRequestJoinMatch(act) : toggleJoinMatch(act.id);
                                    }}
                                    className="flex-grow text-xs font-bold py-2.5 rounded-full bg-white text-black border-transparent hover:bg-neutral-200 transition-all cursor-pointer shadow-md"
                                  >
                                    Join Match
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    triggerPrepaidPayment(act);
                                  }}
                                  className="flex-shrink-0 text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 px-3.5 py-2.5 rounded-full flex items-center space-x-1.5 transition-colors"
                                >
                                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Pay at Venue</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* TABS CONTENT: Venues */}
            {activeTab === 'Venues' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activities.map(v => {
                  const matches = venueOffers.filter(o => o.venueId === v.id);
                  const bookingOffers = matches.filter(o => o.type === 'booking');
                  const membershipPackages = matches.filter(o => o.type === 'membership');

                  return (
                    <div key={v.id} className="glass-card overflow-hidden border border-white/5 flex flex-col justify-between">
                      <div>
                        {v.image && (
                          <div className="w-full h-44 overflow-hidden relative bg-neutral-900 border-b border-white/5 flex-shrink-0">
                            <img src={v.image} alt={v.venue} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                            <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                              <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-extrabold text-white border border-white/10 flex items-center gap-1">
                                <SportIcon sport={v.sport} size={12} className="text-white" />
                                {v.sport}
                              </span>
                              {v.isNew && (
                                <span className="bg-emerald-500 text-black px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1 animate-pulse">
                                  ✨ NEW
                                </span>
                              )}
                            </div>
                            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-black text-white border border-white/10">
                              {v.price}
                            </div>
                          </div>
                        )}
                        
                        <div className="p-5 space-y-3">
                           <div className="text-left">
                             <h4 className="font-bold text-white font-display text-base">{v.venue}</h4>
                             <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5">
                               <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                               <span>{v.distance} away</span>
                             </p>

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
                        </div>
                      </div>

                      <div className="p-5 pt-0">
                         {user?.role === 'owner' ? (
                           <div className="text-[10px] text-center text-neutral-500 font-semibold border border-white/5 rounded-xl py-2 bg-white/[0.01]">
                             View Only Mode
                           </div>
                         ) : (
                           <div className="flex space-x-2">
                             <button 
                               onClick={() => setSelectedSlotTurf(v)}
                               className="flex-grow text-xs font-bold bg-white text-black py-2.5 rounded-full hover:bg-neutral-200 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                             >
                               <Clock className="w-3.5 h-3.5 text-black" />
                               <span>Select Slot & Book</span>
                             </button>

                             {(bookingOffers.length > 0 || membershipPackages.length > 0) && (
                               <button 
                                 onClick={() => setSelectedDealsVenue(v)}
                                 className="px-3.5 py-2.5 text-xs font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full flex items-center justify-center space-x-1.5 transition-all"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { id: 901, title: 'Turfington Summer Football Cup', venue: 'Vanguard Sports Arena', date: 'June 15, 2026', sport: 'Football', price: '₹400/team', image: '/trophy.png', slots: '2 slots left', status: 'Registration Open' },
                  { id: 902, title: 'Smash Masters Badminton Doubles', venue: 'Smash Club Badminton', date: 'June 22, 2026', sport: 'Badminton', price: '₹200/team', image: '/smash_club_badminton.jpg', slots: '5 slots left', status: 'Registration Open' }
                ].map(ev => (
                  <div key={ev.id} className="glass-card overflow-hidden border border-white/5 flex flex-col justify-between">
                    <div>
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
                      
                      <div className="p-5 space-y-3 text-left">
                         <h4 className="font-bold text-white font-display text-base">{ev.title}</h4>
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
                    </div>

                    <div className="p-5 pt-0">
                       <button 
                         onClick={() => alert(`Registration details for ${ev.title} sent to your email!`)}
                         className="w-full text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-full transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                       >
                         <span>Register Team</span>
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TABS CONTENT: Map */}
            {activeTab === 'Map' && (
              <div className="w-full h-full min-h-[600px] rounded-2xl overflow-hidden border border-white/10 bg-neutral-900 relative">
                {loadError ? (
                  <div className="flex flex-col items-center justify-center h-[600px] w-full text-rose-400 p-6 text-center bg-black/40">
                    <p className="font-bold mb-2">Failed to load Google Maps</p>
                    <p className="text-sm font-light">Please check your VITE_GOOGLE_MAPS_API_KEY and network connection.</p>
                  </div>
                ) : !isLoaded ? (
                  <div className="flex items-center justify-center h-[600px] w-full">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                  </div>
                ) : (
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '600px' }}
                    center={{
                      lat: userCoordinates?.lat || 13.0827,
                      lng: userCoordinates?.lng || 80.2707
                    }}
                    zoom={13}
                    onLoad={() => {
                      console.log('Fetched nearby turfs:', activities);
                    }}
                  >
                    {userCoordinates && (
                      <Marker 
                        position={{ lat: userCoordinates.lat, lng: userCoordinates.lng }} 
                        icon={{ url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }}
                        title="You are here"
                      />
                    )}
                    {activities.map((turf) => (
                      <Marker
                        key={turf.id}
                        position={{
                          lat: turf.lat,
                          lng: turf.lng
                        }}
                        onClick={() => setSelectedMarker(turf)}
                        title={turf.title}
                      />
                    ))}
                    {selectedMarker && selectedMarker.lat && selectedMarker.lng && (
                      <InfoWindow
                        position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                        onCloseClick={() => setSelectedMarker(null)}
                      >
                        <div className="text-black p-2 min-w-[210px]">
                          <h3 className="font-bold text-sm mb-1">{selectedMarker.title}</h3>
                          <p className="text-xs text-neutral-600 mb-2">{selectedMarker.price} • {selectedMarker.rating} ⭐</p>
                          <p className="text-xs text-indigo-600 font-bold mb-3">{selectedMarker.distance} away</p>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button 
                              onClick={async () => {
                                const ownerId = selectedMarker.owner_id || selectedMarker.ownerId || 'usr_venue_owner';
                                const ownerName = selectedMarker.ownerName || selectedMarker.venue || selectedMarker.title || 'Venue Owner';
                                await apiCreateDirectChat(user?.id || 'usr_me', ownerId);
                                alert(`Opening message channel with ${ownerName} (${selectedMarker.title})...`);
                              }}
                              className="bg-neutral-800 hover:bg-neutral-900 text-white py-1.5 rounded text-xs font-bold cursor-pointer"
                            >
                              Contact
                            </button>
                            <button 
                              onClick={() => triggerPrepaidPayment(selectedMarker)}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 rounded text-xs font-bold cursor-pointer"
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      </InfoWindow>
                    )}
                  </GoogleMap>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* 3.5 SLOT SELECTION & OPEN MATCH PLAYER JOIN MODAL */}
      <AnimatePresence>
        {selectedSlotTurf && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedSlotTurf(null); setChosenSlot(null); }}
              className="absolute inset-0 bg-black backdrop-blur-sm"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative glass-card w-full max-w-[560px] p-6 border border-white/10 shadow-2xl text-left z-10 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🏟️</span>
                    <h3 className="font-display font-black text-lg text-white uppercase tracking-tight">
                      {selectedSlotTurf.venue || selectedSlotTurf.name || selectedSlotTurf.title}
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-neutral-500" />
                    <span>{selectedSlotTurf.address || 'Chennai'}</span>
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    type="button"
                    onClick={() => {
                      const ownerName = selectedSlotTurf.ownerName || selectedSlotTurf.venue || selectedSlotTurf.name || 'Venue Owner';
                      alert(`Contact ${ownerName} directly at ${selectedSlotTurf.phone || '+91 98765 43210'}.`);
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs cursor-pointer transition-all shadow-sm"
                    title="Message Venue Owner directly"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Contact Owner</span>
                  </button>
                  <button 
                    onClick={() => { setSelectedSlotTurf(null); setChosenSlot(null); }} 
                    className="p-2 rounded-full bg-white/5 border border-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Date Selector Tabs (Horizontal Pills matching uploaded UI design) */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold block">
                    Select Day (Max 3 Days Advance Online)
                  </label>
                  <span className="text-[10px] text-emerald-400 font-extrabold">Online Booking Active</span>
                </div>
                
                <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
                  {getBookingDays().map(day => {
                    const isSelected = slotDateTab === day.dayShort;
                    return (
                      <button
                        key={day.dayShort}
                        onClick={() => { setSlotDateTab(day.dayShort); setChosenSlot(null); }}
                        className={`flex-shrink-0 px-4 py-2.5 rounded-full text-xs font-mono font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1.5 border ${
                          isSelected
                            ? 'bg-white text-black border-transparent shadow-lg shadow-white/20'
                            : day.isAdvanceRestricted
                            ? 'bg-white/[0.02] border-white/8 text-neutral-500 hover:text-neutral-300'
                            : 'bg-white/5 border-white/10 text-neutral-300 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <span>{day.index === 0 ? `TODAY (${day.fullLabel})` : day.fullLabel}</span>
                        {day.isAdvanceRestricted && <span className="text-[10px]" title="Beyond 3 days advance limit">🔒</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Check if Selected Day is Beyond 3-Day Limit */}
              {(() => {
                const currentDayObj = getBookingDays().find(d => d.dayShort === slotDateTab) || getBookingDays()[0];
                if (currentDayObj.isAdvanceRestricted) {
                  return (
                    <div className="mt-5 p-6 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl text-center space-y-4 shadow-xl">
                      <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto">
                        <Lock className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-display font-extrabold text-white text-base">Advance Booking Notice (Beyond 3 Days)</h4>
                        <p className="text-xs text-neutral-300 mt-1.5 max-w-md mx-auto font-light leading-relaxed">
                          Online slot bookings can only be done up to 3 days in advance. To reserve slots for <strong>{currentDayObj.dateLabel} ({currentDayObj.dayShort})</strong>, please contact the venue owner directly.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          const ownerId = selectedSlotTurf.owner_id || selectedSlotTurf.ownerId || 'usr_venue_owner';
                          const ownerName = selectedSlotTurf.ownerName || selectedSlotTurf.venue || selectedSlotTurf.name || 'Venue Owner';
                          await apiCreateDirectChat(user?.id || 'usr_me', ownerId);
                          alert(`Direct message stream opened with ${ownerName}! You can now request advance slot reservations.`);
                        }}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-full transition-all flex items-center justify-center space-x-2 mx-auto shadow-lg shadow-indigo-600/30 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Contact Venue Owner Direct</span>
                      </button>
                    </div>
                  );
                }

                // Normal 3-Day Available Slots Grid matching exact uploaded file UI styling!
                const slotsList = getSlotsForTurf(selectedSlotTurf, slotDateTab);

                return (
                  <div className="mt-5 space-y-3">
                    {/* Legend */}
                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                      <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold block">
                        Available Sessions ({currentDayObj.dateLabel})
                      </label>
                      <div className="flex items-center space-x-4 text-[10px] font-bold">
                        <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-emerald-400">Open Slots (Green)</span></span>
                        <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /><span className="text-rose-400">Booked (Red)</span></span>
                      </div>
                    </div>

                    {slotsList.length === 0 ? (
                      <div className="p-8 text-center glass-card border border-dashed border-white/10 text-neutral-500 text-xs">
                        No open sessions available for {currentDayObj.dateLabel}.
                      </div>
                    ) : (
                      /* Slot Grid matching exact GREEN open slots and RED booked slots requirement */
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-1">
                        {slotsList.map(slot => {
                          const isBooked = slot.status === 'booked';
                          const isSelected = chosenSlot?.id === slot.id;

                          return (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => {
                                if (!isBooked) {
                                  setChosenSlot(slot);
                                  setBookingType('private');
                                }
                              }}
                              disabled={isBooked}
                              className={`px-3 py-3 rounded-xl border text-[10px] font-bold text-center transition-all cursor-pointer ${
                                isBooked
                                  ? 'bg-rose-950/70 border-rose-500/40 text-rose-300 opacity-80 cursor-not-allowed shadow-inner'
                                  : isSelected
                                  ? 'bg-emerald-600/40 border-emerald-400 text-white ring-2 ring-emerald-400/80 scale-105 shadow-lg shadow-emerald-600/40'
                                  : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/60 hover:border-emerald-400 hover:scale-105'
                              }`}
                            >
                              <div className="font-mono text-xs font-black mb-0.5">{slot.time}</div>
                              <div className="uppercase tracking-widest text-[9px] font-black">
                                {isBooked ? 'BOOKED' : 'OPEN'}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* When a valid slot is selected */}
              {chosenSlot && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 pt-4 border-t border-white/10 space-y-4"
                >
                  {/* Booking Options: Private vs Host Open Match */}
                  {chosenSlot.status === 'available' && (
                    <div className="space-y-3">
                      <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold block">
                        Select Booking Mode
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setBookingType('private')}
                          className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                            bookingType === 'private'
                              ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold'
                              : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <p className="font-bold text-white">🏆 Private Booking</p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">Book full turf for your team</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setBookingType('open_match')}
                          className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                            bookingType === 'open_match'
                              ? 'bg-amber-500/20 border-amber-400 text-white font-bold'
                              : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <p className="font-bold text-amber-300">👥 Host Open Match</p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">Need more players to join your game!</p>
                        </button>
                      </div>

                      {/* If Host Open Match selected, choose current vs needed players */}
                      {bookingType === 'open_match' && (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-xl space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-amber-300">How many players do you currently have?</span>
                            <span className="font-extrabold text-white">{myExistingCount} / {chosenSlot.capacity} Players</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input 
                              type="range"
                              min="1"
                              max={chosenSlot.capacity - 1}
                              value={myExistingCount}
                              onChange={(e) => setMyExistingCount(parseInt(e.target.value))}
                              className="w-full accent-amber-400 cursor-pointer"
                            />
                          </div>

                          <div className="p-2.5 bg-black/40 rounded-lg flex items-center justify-between text-xs">
                            <span className="text-neutral-400">Open Spots for Other Players:</span>
                            <span className="font-black text-amber-400">{chosenSlot.capacity - myExistingCount} Players Needed</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Joining an Open Match Session */}
                  {chosenSlot.status === 'open_match' && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between font-bold">
                        <span className="text-amber-300">Open Match Session Hosted by {chosenSlot.hostName}</span>
                        <span className="text-white">{chosenSlot.currentPlayers}/{chosenSlot.capacity} Joined</span>
                      </div>
                      <p className="text-neutral-300 font-light">
                        {chosenSlot.neededPlayers || (chosenSlot.capacity - chosenSlot.currentPlayers)} more players needed. Join this session to complete the team!
                      </p>
                    </div>
                  )}

                  {/* Proceed to Payment Action Button */}
                  <button
                    onClick={() => handleConfirmSlotBooking(chosenSlot)}
                    className={`w-full py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg flex items-center justify-center space-x-2 ${
                      chosenSlot.status === 'open_match'
                        ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-amber-500/20'
                        : bookingType === 'open_match'
                        ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-amber-500/20'
                        : 'bg-[#5842fe] hover:bg-[#4832ee] text-white shadow-[0_0_20px_rgba(88,66,254,0.35)]'
                    }`}
                  >
                    <span>
                      {chosenSlot.status === 'open_match'
                        ? `Join Match & Pay Split (₹${Math.round(chosenSlot.price / chosenSlot.capacity)})`
                        : bookingType === 'open_match'
                        ? `Host Match (${chosenSlot.capacity - myExistingCount} Spots Open) & Pay Deposit (₹${chosenSlot.price})`
                        : `Book ${chosenSlot.time} (₹${chosenSlot.price})`}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm uppercase">Confirm Venue Booking</h3>
                    <p className="text-[9px] text-emerald-400 font-medium">No Prepaid Online Payment Required • Pay at Venue</p>
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
                    <span>Payable at Turf Counter</span>
                    <span className="font-display text-white">{activePrepaidVenue.price}</span>
                  </div>
                </div>

                {/* Payment Option Notice */}
                <div className="space-y-2">
                  <label className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold">Payment Terms</label>
                  <div className="flex items-center justify-between p-3.5 bg-neutral-900 border border-emerald-500/20 rounded-xl text-xs">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <div>
                        <p className="text-white font-bold text-xs">Pay at Venue (Cash / UPI / Card)</p>
                        <p className="text-[10px] text-neutral-400">0% advance • Settle bill upon arrival</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">No Advance</span>
                  </div>
                </div>

                {/* CTA actions */}
                <div className="flex items-center space-x-3 pt-2">
                  <button 
                    onClick={() => setActivePrepaidVenue(null)}
                    className="flex-1 py-3 text-xs border border-white/10 hover:bg-white/5 rounded-full font-bold text-neutral-400 hover:text-white transition-all text-center"
                  >
                    Cancel
                  </button>

                  <button 
                    onClick={handleConfirmVenueBooking}
                    disabled={isPaying || paymentSuccess}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider rounded-full transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  >
                    {isPaying ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Reserving...</span>
                      </>
                    ) : paymentSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Booked!</span>
                      </>
                    ) : (
                      <span>Confirm Booking</span>
                    )}
                  </button>
                </div>

                <p className="text-[9px] text-center text-neutral-500 font-light leading-relaxed">
                  Your reservation is guaranteed. Please arrive 10 minutes prior to slot start time to check in at the reception counter.
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
                            className="flex-shrink-0 text-[10px] font-black uppercase bg-[#5842fe] hover:bg-[#4832ee] text-white px-3.5 py-1.5 rounded-full transition-all shadow-md"
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

      {/* 3.6 PUBLIC PLAYER PROFILE CARD MODAL */}
      <AnimatePresence>
        {selectedPlayerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlayerModal(null)}
              className="absolute inset-0 bg-black backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative glass-card w-full max-w-[480px] border border-white/10 shadow-2xl text-left z-10 overflow-hidden rounded-3xl"
            >
              {/* Cover Banner */}
              <div className="w-full h-32 bg-gradient-to-r from-indigo-600 to-purple-800 relative">
                <button
                  onClick={() => setSelectedPlayerModal(null)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/40 border border-white/10 text-white hover:bg-black/70 transition-all cursor-pointer z-10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Player Info Body */}
              <div className="p-6 pt-0 relative">
                <div className="flex items-end justify-between -mt-14 mb-4">
                  <img
                    src={selectedPlayerModal.avatar_url || selectedPlayerModal.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200'}
                    alt={selectedPlayerModal.full_name}
                    className="w-22 h-22 rounded-full object-cover border-4 border-[#080808] shadow-xl bg-neutral-900"
                  />

                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                    selectedPlayerModal.role === 'owner' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                  }`}>
                    {selectedPlayerModal.role === 'owner' ? '🏟️ Venue Owner' : '🏃 Player'}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-display font-black text-white">
                    {selectedPlayerModal.full_name || 'Sports Player'}
                  </h3>
                  <p className="text-xs text-indigo-400 font-mono">
                    @{selectedPlayerModal.username || 'player'}
                  </p>
                </div>

                <div className="flex items-center space-x-3 text-xs text-neutral-400 mt-3 pt-3 border-t border-white/5">
                  <span className="flex items-center gap-1 text-emerald-400 font-extrabold">
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedPlayerModal.distanceText || '1.2 km away'}
                  </span>
                  <span>•</span>
                  <span>{selectedPlayerModal.city || selectedPlayerModal.location || 'Chennai'}</span>
                </div>

                {selectedPlayerModal.bio && (
                  <p className="text-xs text-neutral-300 font-light mt-3 leading-relaxed">
                    {selectedPlayerModal.bio}
                  </p>
                )}

                <div className="mt-6 pt-4 border-t border-white/10 flex space-x-3">
                  <button
                    onClick={() => {
                      alert(`Message thread started with @${selectedPlayerModal.username || 'player'}!`);
                      setSelectedPlayerModal(null);
                    }}
                    className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-indigo-600/30"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat / Challenge</span>
                  </button>

                  <button
                    onClick={async () => {
                      await toggleFollow(selectedPlayerModal.id);
                    }}
                    className={`py-2.5 px-5 text-xs font-bold rounded-xl border transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                      followedPlayers.includes(selectedPlayerModal.id)
                        ? 'bg-white/10 text-white border-white/20'
                        : 'bg-white text-black border-transparent hover:bg-neutral-200'
                    }`}
                  >
                    {followedPlayers.includes(selectedPlayerModal.id) ? (
                      <>
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
