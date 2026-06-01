import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  Calendar, 
  Trophy, 
  Users, 
  Star, 
  Settings, 
  MessageSquare, 
  Compass, 
  ShieldAlert, 
  Sparkles,
  X,
  Moon,
  Sun,
  Lock,
  Volume2
} from 'lucide-react';

export default function Profile({ 
  user, 
  role, 
  onLogout, 
  onSwitchRole, 
  onUpdateUser,
  setRole 
}) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedDay, setSelectedDay] = useState(2);

  // Edit Profile States
  const [editName, setEditName] = useState(user?.name || '');
  const [editTitle, setEditTitle] = useState(user?.title || (role === 'owner' ? 'Venue Owner • Turfington Gold Club' : 'Elite Athlete • Turfington Gold Club'));
  const [editAvatar, setEditAvatar] = useState(user?.avatar || '');
  const [editAvatarScale, setEditAvatarScale] = useState(user?.avatarScale || 1);
  const [editAvatarX, setEditAvatarX] = useState(user?.avatarX || 0);
  const [editAvatarY, setEditAvatarY] = useState(user?.avatarY || 0);
  const [editCoverImage, setEditCoverImage] = useState(user?.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80');
  const [editCoverScale, setEditCoverScale] = useState(user?.coverScale || 1);
  const [editCoverX, setEditCoverX] = useState(user?.coverX || 0);
  const [editCoverY, setEditCoverY] = useState(user?.coverY || 0);

  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const avatarDragStart = useRef({ x: 0, y: 0, imageX: 0, imageY: 0, width: 1, height: 1 });
  const coverDragStart = useRef({ x: 0, y: 0, imageX: 0, imageY: 0, width: 1, height: 1 });

  const handleAvatarStart = (clientX, clientY, currentTarget) => {
    const rect = currentTarget.getBoundingClientRect();
    setIsDraggingAvatar(true);
    avatarDragStart.current = {
      x: clientX,
      y: clientY,
      imageX: editAvatarX,
      imageY: editAvatarY,
      width: rect.width || 144,
      height: rect.height || 144
    };
  };

  const handleAvatarMove = (clientX, clientY) => {
    if (!isDraggingAvatar) return;
    const dx = clientX - avatarDragStart.current.x;
    const dy = clientY - avatarDragStart.current.y;
    const pctX = avatarDragStart.current.imageX + (dx / (avatarDragStart.current.width * editAvatarScale)) * 100;
    const pctY = avatarDragStart.current.imageY + (dy / (avatarDragStart.current.height * editAvatarScale)) * 100;
    setEditAvatarX(Math.max(-100, Math.min(100, pctX)));
    setEditAvatarY(Math.max(-100, Math.min(100, pctY)));
  };

  const handleAvatarEnd = () => {
    setIsDraggingAvatar(false);
  };

  const onAvatarMouseDown = (e) => {
    e.preventDefault();
    handleAvatarStart(e.clientX, e.clientY, e.currentTarget);
  };

  const onAvatarMouseMove = (e) => {
    handleAvatarMove(e.clientX, e.clientY);
  };

  const onAvatarTouchStart = (e) => {
    if (e.touches.length > 0) {
      handleAvatarStart(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget);
    }
  };

  const onAvatarTouchMove = (e) => {
    if (e.touches.length > 0) {
      handleAvatarMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleCoverStart = (clientX, clientY, currentTarget) => {
    const rect = currentTarget.getBoundingClientRect();
    setIsDraggingCover(true);
    coverDragStart.current = {
      x: clientX,
      y: clientY,
      imageX: editCoverX,
      imageY: editCoverY,
      width: rect.width || 370,
      height: rect.height || 96
    };
  };

  const handleCoverMove = (clientX, clientY) => {
    if (!isDraggingCover) return;
    const dx = clientX - coverDragStart.current.x;
    const dy = clientY - coverDragStart.current.y;
    const pctX = coverDragStart.current.imageX + (dx / (coverDragStart.current.width * editCoverScale)) * 100;
    const pctY = coverDragStart.current.imageY + (dy / (coverDragStart.current.height * editCoverScale)) * 100;
    setEditCoverX(Math.max(-100, Math.min(100, pctX)));
    setEditCoverY(Math.max(-100, Math.min(100, pctY)));
  };

  const handleCoverEnd = () => {
    setIsDraggingCover(false);
  };

  const onCoverMouseDown = (e) => {
    e.preventDefault();
    handleCoverStart(e.clientX, e.clientY, e.currentTarget);
  };

  const onCoverMouseMove = (e) => {
    handleCoverMove(e.clientX, e.clientY);
  };

  const onCoverTouchStart = (e) => {
    if (e.touches.length > 0) {
      handleCoverStart(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget);
    }
  };

  const onCoverTouchMove = (e) => {
    if (e.touches.length > 0) {
      handleCoverMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditTitle(user.title || (role === 'owner' ? 'Venue Owner • Turfington Gold Club' : 'Elite Athlete • Turfington Gold Club'));
      setEditAvatar(user.avatar || '');
      setEditAvatarScale(user.avatarScale || 1);
      setEditAvatarX(user.avatarX || 0);
      setEditAvatarY(user.avatarY || 0);
      setEditCoverImage(user.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80');
      setEditCoverScale(user.coverScale || 1);
      setEditCoverX(user.coverX || 0);
      setEditCoverY(user.coverY || 0);
    }
  }, [user, role]);

  const PRESET_AVATARS = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Dusty',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Bubba',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Sassy',
    'https://api.dicebear.com/7.x/shapes/svg?seed=Spooky',
  ];

  const PRESET_COVERS = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    'https://images.unsplash.com/photo-1618005154255-6028756c82a1?w=800&q=80',
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80',
    'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=800&q=80',
    'https://images.unsplash.com/photo-1618005198143-d3667c134812?w=800&q=80',
  ];

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditCoverImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Profile data
  const profile = {
    name: user?.name || 'Pooja Reddy',
    title: user?.title || (role === 'owner' ? 'Venue Owner • Turfington Gold Club' : 'Elite Athlete • Turfington Gold Club'),
    avatar: user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
    coverImage: user?.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
    stats: role === 'owner' ? [
      { name: 'Hosted Events', value: '12' },
      { name: 'Followers', value: '1,240' },
      { name: 'Following', value: '84' },
      { name: 'Rating', value: '4.9' }
    ] : [
      { name: 'Matches', value: '48' },
      { name: 'Followers', value: '324' },
      { name: 'Following', value: '184' },
      { name: 'Win Rate', value: '68%' }
    ],
    interests: role === 'owner' ? [
      { sport: 'Football', level: 'Host', icon: '⚽' },
      { sport: 'Badminton', level: 'Host', icon: '🏸' },
      { sport: 'Table Tennis', level: 'Host', icon: '🏓' }
    ] : [
      { sport: 'Football', level: 'Advanced', icon: '⚽' },
      { sport: 'Badminton', level: 'Intermediate', icon: '🏸' },
      { sport: 'Table Tennis', level: 'Advanced', icon: '🏓' }
    ],
    achievements: role === 'owner' ? [
      { id: 1, title: 'Elite Arena Host', desc: 'Maintained 4.9/5 star venue reviews', icon: '🏟️', date: 'May 2026', unlocked: true },
      { id: 2, title: 'Grand Tourney Organiser', desc: 'Hosted 5 tournaments successfully', icon: '🏆', date: 'Mar 2026', unlocked: true },
      { id: 3, title: 'Super Host Pro', desc: 'Complete 100 total slot bookings at your arenas', icon: '⭐', unlocked: false, progress: { current: 76, total: 100 } },
      { id: 4, title: 'Weekend Wonder', desc: 'Exceed 95% peak slot occupancy on a Saturday', icon: '🎉', unlocked: false, progress: { current: 88, total: 95 } },
      { id: 5, title: 'Community Sponsor', desc: 'Sponsor a local tournament with a cash prize', icon: '🤝', unlocked: false }
    ] : [
      { id: 1, title: 'Century Scorer', desc: 'Played 100 total matches in a season', icon: '🏆', date: 'May 2026', unlocked: true },
      { id: 2, title: 'Clean Sheet Champion', desc: 'Conceded zero goals in 5 consecutive matches', icon: '🛡️', date: 'Apr 2026', unlocked: true },
      { id: 3, title: 'Early Bird', desc: 'Booked a court before 7:00 AM', icon: '🌅', date: 'Feb 2026', unlocked: true },
      { id: 4, title: 'Century Club', desc: 'Play 100 matches on Turfington', icon: '🎖️', unlocked: false, progress: { current: 48, total: 100 } },
      { id: 5, title: 'Community Pillar', desc: 'Join 5 different sports clubs', icon: '🤝', unlocked: false, progress: { current: 1, total: 5 } },
      { id: 6, title: 'MVP Legend', desc: 'Voted Player of the Match 10 times', icon: '⭐', unlocked: false, progress: { current: 3, total: 10 } },
      { id: 7, title: 'Perfect Streak', desc: 'Win 5 consecutive matches in any sport', icon: '🔥', unlocked: false, progress: { current: 2, total: 5 } },
      { id: 8, title: 'Night Owl', desc: 'Complete a match after 10:00 PM', icon: '🌙', unlocked: false }
    ],
    history: role === 'owner' ? [
      { id: 1, title: 'Hosted Summer Football Cup', venue: 'Vanguard Arena', date: 'May 24, 2026', result: 'Completed', xp: '+500 XP' },
      { id: 2, title: 'Slots Published', venue: 'Smash Club', date: 'May 21, 2026', result: '16 Slots Released', xp: '+100 XP' },
      { id: 3, title: 'Apex Bowling Scrimmage Host', venue: 'Apex Bowling & Games', date: 'May 18, 2026', result: '12 Players Joined', xp: '+200 XP' }
    ] : [
      { id: 1, title: 'Football Turf Scrimmage', venue: 'Vanguard Arena', date: 'May 24, 2026', result: 'Won (4-2)', xp: '+120 XP' },
      { id: 2, title: 'Badminton Doubles Ladder', venue: 'Smash Club', date: 'May 21, 2026', result: 'Lost (18-21)', xp: '+40 XP' },
      { id: 3, title: 'Table Tennis Professional', venue: 'Elite Courts', date: 'May 18, 2026', result: 'Won (3-0)', xp: '+150 XP' }
    ]
  };

  const juneActivity = [
    { day: 1, weight: 0, matches: [] },
    { day: 2, weight: 2, matches: [{ title: 'Football Turf Session', venue: 'VK Multi Sports Turf', time: '6:00 PM', type: 'Match' }, { title: 'Box Cricket T10 Match', venue: 'Clash on turf', time: '9:00 PM', type: 'Match' }] },
    { day: 3, weight: 0, matches: [] },
    { day: 4, weight: 1, matches: [{ title: 'Badminton Doubles Club', venue: 'Tlk turf for badminton', time: '7:30 PM', type: 'Practice' }] },
    { day: 5, weight: 0, matches: [] },
    { day: 6, weight: 3, matches: [{ title: 'Weekend Football Gold Cup', venue: 'Vanguard Sports Arena', time: '10:00 AM', type: 'Tournament' }, { title: 'TT Professional Practice', venue: 'A.s 360 Turf Academy', time: '4:00 PM', type: 'Practice' }, { title: 'Bowling Party Night', venue: 'Bowling in vr mall', time: '9:00 PM', type: 'Practice' }] },
    { day: 7, weight: 1, matches: [{ title: 'Box Cricket T10 Match', venue: 'Clash on turf', time: '7:00 AM', type: 'Match' }] },
    { day: 8, weight: 0, matches: [] },
    { day: 9, weight: 2, matches: [{ title: 'Football Turf Session', venue: 'VK Multi Sports Turf', time: '6:00 PM', type: 'Match' }, { title: 'TT Doubles Match', venue: 'A.s 360 Turf Academy', time: '8:00 PM', type: 'Match' }] },
    { day: 10, weight: 0, matches: [] },
    { day: 11, weight: 0, matches: [] },
    { day: 12, weight: 3, matches: [{ title: 'Badminton Doubles Club', venue: 'Tlk turf for badminton', time: '6:30 PM', type: 'Match' }, { title: 'Bowling Tournament Practice', venue: 'Bowling in vr mall', time: '8:00 PM', type: 'Practice' }, { title: 'Friendly Futsal Match', venue: 'VK Multi Sports Turf', time: '10:00 PM', type: 'Match' }] },
    { day: 13, weight: 1, matches: [{ title: 'Championship Table Tennis Open', venue: 'Elite Courts', time: '2:00 PM', type: 'Tournament' }] },
    { day: 14, weight: 0, matches: [] },
    { day: 15, weight: 2, matches: [{ title: 'Turfington Summer Football Cup', venue: 'Vanguard Sports Arena', time: '5:00 PM', type: 'Tournament' }, { title: 'Box Cricket Practice', venue: 'Clash on turf', time: '8:00 PM', type: 'Practice' }] },
    { day: 16, weight: 1, matches: [{ title: 'Football Turf Session', venue: 'VK Multi Sports Turf', time: '6:00 PM', type: 'Match' }] },
    { day: 17, weight: 0, matches: [] },
    { day: 18, weight: 0, matches: [] },
    { day: 19, weight: 3, matches: [{ title: 'Badminton Morning Doubles', venue: 'Tlk turf for badminton', time: '9:00 AM', type: 'Match' }, { title: 'Bowling League Night', venue: 'Bowling in vr mall', time: '7:00 PM', type: 'Tournament' }, { title: 'Friday Night Football', venue: 'VK Multi Sports Turf', time: '9:30 PM', type: 'Match' }] },
    { day: 20, weight: 0, matches: [] },
    { day: 21, weight: 1, matches: [{ title: 'TT Doubles Match', venue: 'A.s 360 Turf Academy', time: '4:00 PM', type: 'Match' }] },
    { day: 22, weight: 0, matches: [] },
    { day: 23, weight: 2, matches: [{ title: 'Football Turf Session', venue: 'VK Multi Sports Turf', time: '6:00 PM', type: 'Match' }, { title: 'Box Cricket League', venue: 'Clash on turf', time: '8:30 PM', type: 'Match' }] },
    { day: 24, weight: 0, matches: [] },
    { day: 25, weight: 1, matches: [{ title: 'Badminton Morning Doubles', venue: 'Tlk turf for badminton', time: '9:00 AM', type: 'Match' }] },
    { day: 26, weight: 2, matches: [{ title: 'Football Turf Session', venue: 'VK Multi Sports Turf', time: '6:00 PM', type: 'Match' }, { title: 'TT Singles Challenge', venue: 'A.s 360 Turf Academy', time: '7:30 PM', type: 'Match' }] },
    { day: 27, weight: 3, matches: [{ title: 'Weekend Football Gold Cup', venue: 'Vanguard Sports Arena', time: '10:00 AM', type: 'Tournament' }, { title: 'Box Cricket T10 Match', venue: 'Clash on turf', time: '3:00 PM', type: 'Match' }, { title: 'Bowling Party Night', venue: 'Bowling in vr mall', time: '9:00 PM', type: 'Practice' }] },
    { day: 28, weight: 0, matches: [] },
    { day: 29, weight: 1, matches: [{ title: 'Badminton Doubles Club', venue: 'Tlk turf for badminton', time: '7:00 PM', type: 'Match' }] },
    { day: 30, weight: 0, matches: [] }
  ];

  const totalMatches = juneActivity.reduce((acc, d) => acc + d.matches.length, 0);
  const activeDaysCount = juneActivity.filter(d => d.weight > 0).length;

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left transition-colors duration-500">
      
      {/* 1. COVER PHOTO & PROFILE MAIN SUMMARY */}
      <div className="glass-card overflow-hidden border border-white/5 relative mb-12">
        <div className="h-44 w-full relative overflow-hidden">
          <img 
            src={profile.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover brightness-70" 
            style={{ 
              transform: `scale(${user?.coverScale || 1}) translate(${user?.coverX || 0}%, ${user?.coverY || 0}%)`,
              transformOrigin: 'center'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c]/80 to-transparent" />
        </div>

        <div className="px-6 pb-6 relative z-10 flex flex-col md:flex-row md:items-end justify-between -mt-16 gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6">
            <div className="w-28 h-28 rounded-full border-4 border-luxury-bg overflow-hidden flex-shrink-0 bg-neutral-900 shadow-2xl relative">
              <img 
                src={profile.avatar} 
                alt={profile.name} 
                className="w-full h-full object-cover" 
                style={{ 
                  transform: `scale(${user?.avatarScale || 1}) translate(${user?.avatarX || 0}%, ${user?.avatarY || 0}%)`,
                  transformOrigin: 'center'
                }}
              />
            </div>
            
            <div className="text-center md:text-left space-y-1.5">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl font-black font-display tracking-tight text-white">{profile.name}</h1>
                <span className="p-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <span className={`inline-flex items-center text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                  role === 'owner'
                    ? 'bg-violet-500/15 text-violet-400 border-violet-500/25'
                    : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25'
                }`}>
                  {role === 'owner' ? '🏟️ Venue Owner' : '🏃 Player'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-light">{profile.title}</p>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-3 self-center md:self-end">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="px-5 py-2.5 bg-white text-black font-bold text-xs uppercase tracking-widest rounded-full hover:bg-neutral-200 transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-white/5 divide-x divide-white/5 bg-white/[0.01]">
          {profile.stats.map(stat => (
            <div key={stat.name} className="py-5 text-center">
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">{stat.name}</p>
              <p className="text-2xl font-black font-display text-white mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. GRID DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Overview, Achievements, Activity Calendar */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* ACTIVITY HEATMAP CALENDAR */}
          <div className="glass-card p-6 border border-white/5 space-y-6">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-white/5">
              <div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span className="text-[10px] text-indigo-400 uppercase font-extrabold tracking-widest">Interactive Tracker</span>
                </div>
                <h3 className="font-display font-extrabold text-lg text-white uppercase tracking-wider mt-1">June 2026 Activity</h3>
                <p className="text-[10px] text-neutral-500 mt-0.5">Click any day to view details of your sessions, matches, or tournaments.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full font-bold">
                  Streak: 4 Days
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold">
                  {activeDaysCount} / 30 Active Days
                </span>
              </div>
            </div>

            {/* Content: side-by-side calendar and day details */}
            <div className="flex flex-col md:flex-row gap-8">
              {/* Calendar Grid Section */}
              <div className="flex-shrink-0 space-y-4">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase text-neutral-500 select-none pb-1">
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                  <div>Sun</div>
                </div>

                {/* Heatmap Grid (June 2026 starts on Monday, so no offset) */}
                <div className="grid grid-cols-7 gap-2 max-w-[280px]">
                  {juneActivity.map((dayObj) => {
                    const isSelected = selectedDay === dayObj.day;
                    let opacityClass = 'bg-neutral-900 border border-white/5 hover:border-white/20';
                    if (dayObj.weight === 1) opacityClass = 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20';
                    if (dayObj.weight === 2) opacityClass = 'bg-indigo-500/30 border border-indigo-500/40 text-indigo-100 hover:bg-indigo-500/40';
                    if (dayObj.weight === 3) opacityClass = 'bg-indigo-500 border border-transparent text-white shadow-[0_0_10px_rgba(99,102,241,0.2)] hover:bg-indigo-400';
                    
                    return (
                      <button 
                        key={dayObj.day} 
                        type="button"
                        onClick={() => setSelectedDay(dayObj.day)}
                        className={`h-8 w-8 rounded-lg ${opacityClass} transition-all duration-200 flex items-center justify-center text-[10px] font-bold select-none cursor-pointer ${
                          isSelected ? 'ring-2 ring-white scale-110 shadow-lg shadow-indigo-500/20' : ''
                        } ${dayObj.weight === 0 ? 'text-neutral-500 hover:text-white' : ''}`}
                        title={`Day ${dayObj.day}: ${dayObj.matches.length} Matches`}
                      >
                        {dayObj.day}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-3 text-[9px] text-neutral-500 pt-2 select-none">
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded bg-neutral-900 border border-white/5" />
                    <span>0 Matches</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded bg-indigo-500/15 border border-indigo-500/30" />
                    <span>1 Match</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded bg-indigo-500/40 border border-indigo-500/50" />
                    <span>2 Matches</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
                    <span>3+ Matches</span>
                  </div>
                </div>
              </div>

              {/* Day Details Pane */}
              <div className="flex-grow bg-white/[0.01] border border-white/5 rounded-2xl p-5 text-left flex flex-col justify-between min-h-[220px]">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <span className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider font-display">
                      June {selectedDay}, 2026 Details
                    </span>
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      (juneActivity.find(d => d.day === selectedDay)?.matches.length || 0) > 0
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                        : 'bg-neutral-800 border-white/10 text-neutral-500'
                    }`}>
                      {(juneActivity.find(d => d.day === selectedDay)?.matches.length || 0)} {(juneActivity.find(d => d.day === selectedDay)?.matches.length || 0) === 1 ? 'Session' : 'Sessions'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {(() => {
                      const dayObj = juneActivity.find(d => d.day === selectedDay) || { matches: [] };
                      if (dayObj.matches.length === 0) {
                        return (
                          <div className="py-8 flex flex-col items-center justify-center text-center">
                            <span className="text-xl">🛌</span>
                            <p className="text-xs text-neutral-500 font-light mt-2">Rest Day. No matches played on this date.</p>
                          </div>
                        );
                      }
                      return dayObj.matches.map((match, i) => (
                        <div key={i} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between text-xs hover:bg-white/[0.04] transition-all">
                          <div className="space-y-0.5 min-w-0 pr-2">
                            <p className="font-bold text-white truncate">{match.title}</p>
                            <p className="text-[10px] text-neutral-400 truncate">🏟️ {match.venue}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 rounded-md">
                              {match.time}
                            </span>
                            <p className="text-[8px] text-neutral-500 uppercase font-black mt-1 tracking-wider">{match.type}</p>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-neutral-500">
                  <span>Month-to-Date Total: <b>{totalMatches} Matches</b></span>
                  <span>Active Days: <b>{activeDaysCount} Days</b></span>
                </div>
              </div>
            </div>
          </div>

          {/* MATCH HISTORY LOGS */}
          <div className="glass-card p-6 border border-white/5 space-y-6">
            <h3 className="font-display font-extrabold text-sm uppercase tracking-wider pb-3 border-b border-white/5">
              Recent Matches
            </h3>

            <div className="space-y-4">
              {profile.history.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3.5 bg-white/[0.01] border border-white/5 rounded-xl text-xs font-light">
                  <div className="text-left space-y-1">
                    <p className="font-bold text-white text-sm">{item.title}</p>
                    <p className="text-neutral-500">{item.venue} • {item.date}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                      item.result.includes('Won') ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {item.result}
                    </span>
                    <p className="text-[10px] text-indigo-400 font-bold">{item.xp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Sports Interests & Unlocked Badges */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Sports Interests */}
          <div className="glass-card p-5 border border-white/5 space-y-5">
            <h3 className="font-display font-extrabold text-sm uppercase tracking-wider pb-3 border-b border-white/5">
              Sports Interests
            </h3>
            
            <div className="space-y-4">
              {profile.interests.map(interest => {
                let badgeStyle = 'bg-rose-500/5 text-rose-400 border-rose-500/10';
                if (interest.sport === 'Football') badgeStyle = 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10';
                if (interest.sport === 'Badminton') badgeStyle = 'bg-indigo-500/5 text-indigo-400 border-indigo-500/10';
                return (
                  <div key={interest.sport} className="flex justify-between items-center text-xs font-light">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-2xl">{interest.icon}</span>
                      <span className="font-bold text-white text-sm">{interest.sport}</span>
                    </div>
                    <span className={`text-[10px] uppercase font-extrabold px-3 py-1 rounded-full border ${badgeStyle}`}>
                      {interest.level}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Achievements section */}
          <div className="glass-card p-5 border border-white/5 space-y-5">
            <h3 className="font-display font-extrabold text-sm uppercase tracking-wider pb-3 border-b border-white/5">
              Achievements
            </h3>
            
            <div className="space-y-4 text-xs font-light">
              {profile.achievements.map(item => {
                const isUnlocked = item.unlocked !== false;
                return (
                  <div key={item.id} className={`flex items-start space-x-3.5 p-3 rounded-2xl transition-all ${
                    isUnlocked 
                      ? 'bg-white/[0.02] border border-white/5' 
                      : 'bg-black/40 border border-white/[0.02] opacity-60'
                  }`}>
                    {/* Icon container */}
                    <div className="relative flex-shrink-0">
                      <span className={`text-3xl p-1.5 bg-neutral-900 border border-white/5 rounded-xl block ${
                        !isUnlocked ? 'filter grayscale opacity-40' : ''
                      }`}>
                        {item.icon}
                      </span>
                      {!isUnlocked && (
                        <div className="absolute -bottom-1 -right-1 bg-neutral-800 border border-white/10 p-0.5 rounded-full text-white">
                          <Lock className="w-2.5 h-2.5 text-neutral-400" />
                        </div>
                      )}
                    </div>

                    {/* Content container */}
                    <div className="flex-grow text-left min-w-0">
                      <div className="flex justify-between items-center gap-2">
                        <h4 className={`font-bold text-sm ${isUnlocked ? 'text-white' : 'text-neutral-400'}`}>
                          {item.title}
                        </h4>
                        {isUnlocked ? (
                          <span className="text-[8px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-emerald-500/15">
                            Unlocked
                          </span>
                        ) : (
                          <span className="text-[8px] text-neutral-500 font-bold uppercase tracking-wider">
                            Locked
                          </span>
                        )}
                      </div>
                      
                      <p className="text-neutral-400 text-[11px] font-light mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>

                      {/* Progress Bar (if locked and progress exists) */}
                      {!isUnlocked && item.progress && (
                        <div className="mt-2.5 space-y-1">
                          <div className="flex justify-between text-[9px] text-neutral-500 font-bold uppercase tracking-wider">
                            <span>Progress</span>
                            <span>{item.progress.current} / {item.progress.total}</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 rounded-full" 
                              style={{ width: `${(item.progress.current / item.progress.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {isUnlocked && item.date && (
                        <p className="text-[9px] text-neutral-500 mt-1 font-medium">
                          Unlocked: {item.date}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* 3. PREMIUM SETTINGS MODAL WITH LIGHT/DARK THEME SELECTOR */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative glass-card w-full max-w-[420px] p-6 border border-white/10 shadow-2xl text-left z-10 overflow-y-auto max-h-[90vh]"
            >
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="absolute top-4 right-4 p-2 bg-neutral-900 border border-white/5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              <div className="space-y-6">
                <div className="space-y-1 pb-3 border-b border-white/5">
                  <h3 className="font-display font-black text-base uppercase">Edit Profile</h3>
                  <p className="text-[10px] text-neutral-500">Configure your display details, profile photo and cover photo</p>
                </div>

                {/* Profile Edit Inputs */}
                <div className="space-y-4 pb-4 border-b border-white/5">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Profile Details</label>
                  
                  <div className="space-y-4 text-xs">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[9px] text-neutral-500 uppercase tracking-wider font-bold">Display Name</label>
                      <input 
                        type="text" 
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        placeholder="Your name"
                        className="w-full bg-[#0d0d0d] border border-white/5 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white/20"
                      />
                    </div>
                    
                    <div className="space-y-1.5 text-left">
                      <label className="text-[9px] text-neutral-500 uppercase tracking-wider font-bold">Title / Status</label>
                      <input 
                        type="text" 
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        placeholder="e.g. Elite Athlete"
                        className="w-full bg-[#0d0d0d] border border-white/5 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white/20"
                      />
                    </div>

                    {/* Spotify-style Avatar Editor */}
                    <div className="space-y-3">
                      <label className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Profile Photo (Drag to Align)</label>
                      
                      {/* Interactive Circular Viewport */}
                      <div 
                        onMouseDown={onAvatarMouseDown}
                        onMouseMove={onAvatarMouseMove}
                        onMouseUp={handleAvatarEnd}
                        onMouseLeave={handleAvatarEnd}
                        onTouchStart={onAvatarTouchStart}
                        onTouchMove={onAvatarTouchMove}
                        onTouchEnd={handleAvatarEnd}
                        className="w-36 h-36 rounded-full overflow-hidden border border-white/20 bg-neutral-900 flex-shrink-0 relative mx-auto cursor-move select-none shadow-[0_0_20px_rgba(0,0,0,0.6)] group"
                      >
                        {editAvatar ? (
                          <img 
                            src={editAvatar} 
                            alt="Avatar Preview" 
                            className="w-full h-full object-cover pointer-events-none" 
                            style={{ 
                              transform: `scale(${editAvatarScale}) translate(${editAvatarX}%, ${editAvatarY}%)`,
                              transformOrigin: 'center'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-xs text-neutral-500">No Image</div>
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-black/60 px-2.5 py-1 rounded-full">Drag to reposition</span>
                         </div>
                      </div>

                      {/* File uploader & Zoom slider */}
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <label className="w-full flex items-center justify-center border border-dashed border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] py-2 px-3 rounded-xl cursor-pointer transition-colors text-neutral-400 hover:text-white text-[11px] font-bold">
                            <span>Upload Custom Photo</span>
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleAvatarFileChange}
                              className="hidden" 
                            />
                          </label>
                          <button 
                            type="button" 
                            onClick={() => { setEditAvatarScale(1); setEditAvatarX(0); setEditAvatarY(0); }} 
                            className="px-3 border border-white/10 hover:border-white/25 rounded-xl text-[10px] text-neutral-400 hover:text-white font-bold transition-all"
                          >
                            Reset
                          </button>
                        </div>

                        <div className="space-y-1 bg-white/[0.01] border border-white/5 rounded-xl p-2.5">
                          <div className="flex justify-between text-[9px] text-neutral-500 uppercase tracking-wider font-bold">
                            <span>Zoom Size</span>
                            <span>{editAvatarScale.toFixed(2)}x</span>
                          </div>
                          <input 
                            type="range" min="1" max="4" step="0.01" value={editAvatarScale}
                            onChange={e => setEditAvatarScale(parseFloat(e.target.value))}
                            className="w-full accent-indigo-500 bg-neutral-800 rounded-lg cursor-pointer h-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Avatar Presets */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-[9px] text-neutral-500 uppercase tracking-wider font-bold">Choose Preset Avatar</label>
                      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {PRESET_AVATARS.map((url, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setEditAvatar(url)}
                            className={`w-9 h-9 rounded-full overflow-hidden border-2 flex-shrink-0 transition-all ${
                              editAvatar === url ? 'border-indigo-500 scale-105' : 'border-transparent hover:border-white/20'
                            }`}
                          >
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Spotify-style Cover Editor */}
                    <div className="space-y-3 mt-4">
                      <label className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Cover Photo (Drag to Align)</label>
                      
                      {/* Interactive Horizontal Rectangular Viewport */}
                      <div 
                        onMouseDown={onCoverMouseDown}
                        onMouseMove={onCoverMouseMove}
                        onMouseUp={handleCoverEnd}
                        onMouseLeave={handleCoverEnd}
                        onTouchStart={onCoverTouchStart}
                        onTouchMove={onCoverTouchMove}
                        onTouchEnd={handleCoverEnd}
                        className="w-full h-24 rounded-xl overflow-hidden border border-white/20 bg-neutral-900 relative cursor-move select-none shadow-[0_0_20px_rgba(0,0,0,0.6)] group"
                      >
                        {editCoverImage ? (
                          <img 
                            src={editCoverImage} 
                            alt="Cover Preview" 
                            className="w-full h-full object-cover pointer-events-none" 
                            style={{ 
                              transform: `scale(${editCoverScale}) translate(${editCoverX}%, ${editCoverY}%)`,
                              transformOrigin: 'center'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-xs text-neutral-500">No Image</div>
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-black/60 px-2.5 py-1 rounded-full">Drag to reposition</span>
                        </div>
                      </div>

                      {/* File uploader & Zoom slider */}
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <label className="w-full flex items-center justify-center border border-dashed border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] py-2 px-3 rounded-xl cursor-pointer transition-colors text-neutral-400 hover:text-white text-[11px] font-bold">
                            <span>Upload Custom Cover</span>
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleCoverFileChange}
                              className="hidden" 
                            />
                          </label>
                          <button 
                            type="button" 
                            onClick={() => { setEditCoverScale(1); setEditCoverX(0); setEditCoverY(0); }} 
                            className="px-3 border border-white/10 hover:border-white/25 rounded-xl text-[10px] text-neutral-400 hover:text-white font-bold transition-all"
                          >
                            Reset
                          </button>
                        </div>

                        <div className="space-y-1 bg-white/[0.01] border border-white/5 rounded-xl p-2.5">
                          <div className="flex justify-between text-[9px] text-neutral-500 uppercase tracking-wider font-bold">
                            <span>Zoom Size</span>
                            <span>{editCoverScale.toFixed(2)}x</span>
                          </div>
                          <input 
                            type="range" min="1" max="4" step="0.01" value={editCoverScale}
                            onChange={e => setEditCoverScale(parseFloat(e.target.value))}
                            className="w-full accent-indigo-500 bg-neutral-800 rounded-lg cursor-pointer h-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cover Presets */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-[9px] text-neutral-500 uppercase tracking-wider font-bold">Choose Preset Cover</label>
                      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {PRESET_COVERS.map((url, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setEditCoverImage(url)}
                            className={`w-14 h-9 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                              editCoverImage === url ? 'border-indigo-500 scale-105' : 'border-transparent hover:border-white/20'
                            }`}
                          >
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Settings */}
                <div className="space-y-4">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Preferences</label>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                      <div className="flex items-center space-x-2.5">
                        <Lock className="w-4 h-4 text-neutral-500" />
                        <span className="text-white font-medium">Privacy Lock</span>
                      </div>
                      <span className="text-[9px] uppercase font-bold text-neutral-500">Enabled</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                      <div className="flex items-center space-x-2.5">
                        <Volume2 className="w-4 h-4 text-neutral-500" />
                        <span className="text-white font-medium">Sound FX / Alerts</span>
                      </div>
                      <span className="text-[9px] uppercase font-bold text-neutral-500">Disabled</span>
                    </div>
                  </div>
                </div>

                {/* Confirmation Footer */}
                <button
                  onClick={() => {
                    if (onUpdateUser) {
                      onUpdateUser({
                        name: editName,
                        title: editTitle,
                        avatar: editAvatar,
                        avatarScale: editAvatarScale,
                        avatarX: editAvatarX,
                        avatarY: editAvatarY,
                        coverImage: editCoverImage,
                        coverScale: editCoverScale,
                        coverX: editCoverX,
                        coverY: editCoverY
                      });
                    }
                    setIsSettingsOpen(false);
                  }}
                  className="w-full py-3.5 bg-white text-black font-extrabold text-xs uppercase tracking-widest rounded-full hover:bg-neutral-200 transition-colors text-center"
                >
                  Save & Apply
                </button>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
