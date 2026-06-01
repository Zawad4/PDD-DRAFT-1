import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Shield, Plus, Calendar, Search, MessageSquare, ArrowRight,
  Activity, Flame, Trophy, Zap, Star, Hash, Lock, Send, ChevronLeft, ChevronRight,
  Circle, UserCheck, MoreHorizontal, Phone, Video, Bell, BellOff,
  MessageCircle, UserPlus, Check, CheckCheck, Image, Smile,
  Volume2, Settings, Crown, UserMinus, X, MapPin, FileText, Compass, Loader2
} from 'lucide-react';
import SportIcon from '../components/SportIcon';

/* ─── Colour palette per sport ─────────────────────────── */
const SPORT_STYLES = {
  Football:      { gradient: 'from-emerald-600 to-green-800',   badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', dot: 'bg-emerald-400', accent: 'indigo' },
  'Table Tennis':{ gradient: 'from-rose-600 to-pink-800',       badge: 'bg-rose-500/15 text-rose-400 border-rose-500/25',         dot: 'bg-rose-400',   accent: 'rose' },
  Bowling:       { gradient: 'from-cyan-600 to-sky-800',        badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',         dot: 'bg-cyan-400',   accent: 'cyan' },
  Badminton:     { gradient: 'from-indigo-600 to-violet-800',   badge: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25',   dot: 'bg-indigo-400', accent: 'indigo' },
  Cricket:       { gradient: 'from-amber-600 to-yellow-800',    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/25',      dot: 'bg-amber-400',  accent: 'amber' },
};
const DEFAULT_STYLE = { gradient: 'from-neutral-700 to-neutral-800', badge: 'bg-white/5 text-neutral-400 border-white/10', dot: 'bg-neutral-500', accent: 'indigo' };

/* ─── Add Story Modal ───────────────────────────────────── */
function AddStoryModal({ user, onClose, onCreated }) {
  const [mediaUrl, setMediaUrl] = useState('/turf_story_highlight.png');
  const [customUrl, setCustomUrl] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const presets = [
    { name: 'Turf Football', url: '/turf_story_highlight.png', type: 'Football' },
    { name: 'Badminton Court', url: '/badminton_morning_doubles.jpg', type: 'Badminton' },
    { name: 'Bowling Practice', url: '/bowling_arena_practice.jpg', type: 'Bowling' },
    { name: 'Cricket Box', url: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=600', type: 'Cricket' },
    { name: 'Football Pitch', url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600', type: 'Football' },
    { name: 'Table Tennis', url: 'https://images.unsplash.com/photo-1611251135345-18c56206b863?q=80&w=600', type: 'Table Tennis' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setUploading(true);
    
    const finalMedia = customUrl.trim() || mediaUrl;

    setTimeout(() => {
      setUploading(false);
      setSuccess(true);
      setTimeout(() => {
        onCreated({
          id: Date.now(),
          name: 'You',
          avatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
          media: finalMedia,
          isLive: isLive,
          seen: false,
          time: 'Just now'
        });
        onClose();
      }, 1000);
    }, 1500);
  };

  const inputClass = "w-full bg-white/[0.04] border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/50 transition-colors";
  const labelClass = "text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1.5 block";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.75 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-[500px] bg-[#111] border border-white/10 rounded-3xl shadow-2xl z-10 text-left mb-8 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/25 flex items-center justify-center">
              <Plus className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-display font-black text-white text-lg uppercase tracking-tight">Post a Story</h3>
              <p className="text-[10px] text-neutral-500 mt-0.5">Share your turf moments with the community</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/5 border border-white/10 text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center py-12 px-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <h4 className="font-display font-black text-white text-xl">Story Published!</h4>
            <p className="text-neutral-400 text-sm text-center">Your story is now live for all players to see.</p>
          </div>
        ) : uploading ? (
          <div className="flex flex-col items-center py-16 px-6 space-y-4">
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
            <h4 className="font-display font-bold text-white text-base">Uploading to Turfington...</h4>
            <p className="text-neutral-500 text-xs">Optimizing and encoding your media</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Presets Selection */}
            <div>
              <label className={labelClass}>Select Turf Action Media *</label>
              <div className="grid grid-cols-3 gap-2.5">
                {presets.map(p => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => { setMediaUrl(p.url); setCustomUrl(''); }}
                    className={`relative aspect-[9/10] rounded-xl overflow-hidden border transition-all ${
                      (customUrl === '' && mediaUrl === p.url) ? 'border-indigo-500 scale-95 shadow-[0_0_10px_rgba(99,102,241,0.25)]' : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                      <span className="text-[9px] text-white font-bold truncate w-full text-left">{p.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom URL or File Upload */}
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Upload Local Image</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-white/20 rounded-xl cursor-pointer bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                    <div className="flex flex-col items-center justify-center pt-3 pb-3">
                      <p className="text-xs text-neutral-400 font-bold"><span className="text-indigo-400">Click to upload</span> or drag and drop</p>
                      <p className="text-[10px] text-neutral-500 mt-1">PNG, JPG or JPEG</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setCustomUrl(reader.result); // Base64 data URL
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className={labelClass}>Or Paste Image URL</label>
                <input
                  type="text"
                  value={customUrl.startsWith('data:') ? '' : customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className={inputClass}
                />
              </div>

              {customUrl && (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-white/10 bg-black/20">
                  <img src={customUrl} alt="Story Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setCustomUrl('')}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 border border-white/10 hover:bg-black/85 text-white transition-all hover:scale-105 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Live Indicator Switch */}
            <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/8 rounded-xl">
              <div>
                <p className="text-sm font-bold text-white">Mark as Live Game</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">Show a "LIVE" indicator on your story bubble</p>
              </div>
              <button type="button" onClick={() => setIsLive(!isLive)}
                className={`relative w-11 h-6 rounded-full border transition-all ${
                  isLive ? 'bg-indigo-600 border-indigo-500' : 'bg-white/10 border-white/15'
                }`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  isLive ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <button type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-full transition-colors flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <span>Publish Story</span>
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

/* ─── Create Team Modal ─────────────────────────────────── */
const AVAILABLE_SPORTS = ['Football','Badminton','Table Tennis','Bowling','Cricket','Basketball','Pickleball','Gaming'];

function CreateTeamModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '', sport: 'Football', city: '', description: '',
    maxMembers: '15', skill: 'All Levels', contactPhone: '',
    contactEmail: '', isOpen: true, image: ''
  });
  const [success, setSuccess] = useState(false);

  const inputClass = "w-full bg-white/[0.04] border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/50 transition-colors";
  const labelClass = "text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1.5 block";

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTeam = {
      id: Date.now(),
      name: form.name,
      image: form.image || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600',
      description: form.description,
      members: 1, online: 1,
      upcomingEvent: 'No events yet — Schedule one!',
      category: form.sport,
      rank: form.skill,
      city: form.city,
    };
    setSuccess(true);
    setTimeout(() => { onCreated(newTeam); onClose(); }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.75 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-[540px] bg-[#111] border border-white/10 rounded-3xl shadow-2xl z-10 text-left mb-8 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/25 flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-display font-black text-white text-lg uppercase tracking-tight">Create a Team</h3>
              <p className="text-[10px] text-neutral-500 mt-0.5">Build your squad on Turfington</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/5 border border-white/10 text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center py-12 px-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <h4 className="font-display font-black text-white text-xl">Team Created!</h4>
            <p className="text-neutral-400 text-sm text-center">Your team is now live and players can request to join.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[65vh]">

            {/* Team name */}
            <div>
              <label className={labelClass}>Team Name *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
                placeholder="e.g. Chennai Warriors FC" className={inputClass} />
            </div>

            {/* Sport + City */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Sport *</label>
                <select value={form.sport} onChange={e => setForm({...form, sport: e.target.value})} className={inputClass}>
                  {AVAILABLE_SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>City / Area *</label>
                <input value={form.city} onChange={e => setForm({...form, city: e.target.value})} required
                  placeholder="e.g. Chennai" className={inputClass} />
              </div>
            </div>

            {/* Members + Skill */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Max Members</label>
                <select value={form.maxMembers} onChange={e => setForm({...form, maxMembers: e.target.value})} className={inputClass}>
                  {['5','7','10','11','15','20','25','30','50'].map(n => <option key={n} value={n}>{n} players</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Skill Level</label>
                <select value={form.skill} onChange={e => setForm({...form, skill: e.target.value})} className={inputClass}>
                  {['All Levels','Beginner','Intermediate','Advanced','Elite'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {/* Open/Closed toggle */}
            <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/8 rounded-xl">
              <div>
                <p className="text-sm font-bold text-white">Open Membership</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">Anyone can request to join this team</p>
              </div>
              <button type="button" onClick={() => setForm(f => ({...f, isOpen: !f.isOpen}))}
                className={`relative w-11 h-6 rounded-full border transition-all ${
                  form.isOpen ? 'bg-indigo-600 border-indigo-500' : 'bg-white/10 border-white/15'
                }`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  form.isOpen ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Contact Phone</label>
                <input value={form.contactPhone} onChange={e => setForm({...form, contactPhone: e.target.value})}
                  placeholder="+91 98765 43210" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Contact Email</label>
                <input type="email" value={form.contactEmail} onChange={e => setForm({...form, contactEmail: e.target.value})}
                  placeholder="team@email.com" className={inputClass} />
              </div>
            </div>

            {/* Team image */}
            <div>
              <label className={labelClass}>Team Logo / Image URL (optional)</label>
              <input value={form.image} onChange={e => setForm({...form, image: e.target.value})}
                placeholder="https://..." className={inputClass} />
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>About the Team</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                rows={3} placeholder="What kind of players are you looking for? Training schedule, match frequency..." className={`${inputClass} resize-none`} />
            </div>

            <button type="submit"
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              <span>Create Team</span>
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

/* ─── Seed data ────────────────────────────────────────── */
const CLUBS_DATA = [
  { id: 1, name: 'Weekend Football Chennai', image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600', description: 'Premium association for weekend football matches, astroturf scrimmages and local friendly leagues.', members: 340, online: 42, upcomingEvent: 'Vanguard Astro Scrimmage (Today, 8:00 PM)', category: 'Football', rank: '#1 Local Club' },
  { id: 2, name: 'TT Masters League',         image: 'https://images.unsplash.com/photo-1611251135345-18c56206b863?q=80&w=600', description: 'Advanced and elite table tennis matches. Practice, tournaments and rankings ladder.', members: 185, online: 18, upcomingEvent: 'TT Weekly Championship (June 13, 2026)', category: 'Table Tennis', rank: 'Level: Elite' },
  { id: 3, name: 'Bowling League Syndicate',   image: '/bowling_arena_practice.jpg', description: 'Regular social bowling nights, competitive leagues, and pin championships.', members: 110, online: 9,  upcomingEvent: 'HyperBowl League Night (Friday, 9:00 PM)', category: 'Bowling', rank: 'Social Club' },
  { id: 4, name: 'Badminton Elite Doubles',    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=600', description: 'Connect with elite doubles partners, reserve high-end courts and join ladder matches.', members: 220, online: 26, upcomingEvent: 'Court 4 Doubles Training (Tomorrow, 6:30 PM)', category: 'Badminton', rank: 'Inter-Club' },
  { id: 5, name: 'Chennai Cricket Premier',    image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=600', description: 'Competitive cricket league for box cricket, T10 & T20 formats. Open for all skill levels.', members: 280, online: 34, upcomingEvent: 'Box Cricket T10 Qualifier (Sun, 7:00 AM)', category: 'Cricket', rank: 'City League' },
];

const GROUP_CHATS = [
  {
    id: 'gc1', clubId: 1, name: 'Weekend Football Chennai',
    icon: '⚽', gradient: 'from-emerald-600 to-green-800',
    members: 340, online: 42,
    lastMsg: { user: 'Rahul Sharma', text: 'Awesome games today! Thanks everyone 🔥', time: '14:12', read: false },
    messages: [
      { id: 1, user: 'Rahul Sharma',    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Rahul',   text: 'Awesome games at Vanguard FC turf today! Thanks for organizing guys.', time: '14:12', self: false },
      { id: 2, user: 'Sonia Verma',    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sonia',  text: 'Great game! We should book the astroturf again next Saturday 🙌', time: '14:14', self: false },
      { id: 3, user: 'You',            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',   text: 'Count me in! I\'ll also bring Arjun.', time: '14:15', self: true },
      { id: 4, user: 'Amit Patel',     avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Amit',  text: 'Perfect. Slots are filling up fast, prepay to lock yours.', time: '14:18', self: false },
    ]
  },
  {
    id: 'gc2', clubId: 2, name: 'TT Masters League',
    icon: '🏓', gradient: 'from-rose-600 to-pink-800',
    members: 185, online: 18,
    lastMsg: { user: 'Deepak Kumar', text: 'Tournament registrations close Sunday. Register now!', time: '13:55', read: true },
    messages: [
      { id: 1, user: 'Deepak Kumar',   avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Deepak',  text: 'Tournament registrations close Sunday. Register now!', time: '13:55', self: false },
      { id: 2, user: 'Pooja R.',       avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pooja', text: 'Already done! Who else is playing doubles?', time: '13:58', self: false },
    ]
  },
  {
    id: 'gc3', clubId: 4, name: 'Badminton Elite Doubles',
    icon: '🏸', gradient: 'from-indigo-600 to-violet-800',
    members: 220, online: 26,
    lastMsg: { user: 'Priya Nair', text: 'Court 4 is open tomorrow 6:30 AM onwards', time: 'Yesterday', read: true },
    messages: [
      { id: 1, user: 'Priya Nair', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', text: 'Court 4 is open tomorrow 6:30 AM onwards. Anyone free?', time: 'Yesterday', self: false },
    ]
  },
];

const DMS_DATA = [
  {
    id: 'dm1', user: 'Amit Patel', handle: '@amitpatel',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Amit',
    online: true,
    lastMsg: { text: 'See you at the turf bro!', time: '14:20', self: true, read: true },
    messages: [
      { id: 1, text: 'Hey man, are you joining tonight\'s football session?', time: '13:50', self: false },
      { id: 2, text: 'Yeah for sure! 8 PM at Vanguard right?', time: '13:52', self: true },
      { id: 3, text: 'Yep. Arjun and Deepak are also coming.', time: '13:53', self: false },
      { id: 4, text: 'See you at the turf bro!', time: '14:20', self: true },
    ]
  },
  {
    id: 'dm2', user: 'Pooja Reddy', handle: '@poojareddy',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pooja',
    online: true,
    lastMsg: { text: 'Would you be up for doubles practice?', time: '12:30', self: false, read: false },
    messages: [
      { id: 1, text: 'Hi! Saw you\'re in the Badminton Elite Doubles club.', time: '12:25', self: false },
      { id: 2, text: 'Would you be up for doubles practice this weekend?', time: '12:30', self: false },
    ]
  },
  {
    id: 'dm3', user: 'Deepak Kumar', handle: '@deepaktt',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Deepak',
    online: false,
    lastMsg: { text: 'Good game yesterday 🏓', time: 'Yesterday', self: false, read: true },
    messages: [
      { id: 1, text: 'Good game yesterday 🏓', time: 'Yesterday', self: false },
    ]
  },
  {
    id: 'dm4', user: 'Priya Nair', handle: '@priyadoubles',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    online: false,
    lastMsg: { text: 'Thanks for the match invite!', time: 'Mon', self: false, read: true },
    messages: [
      { id: 1, text: 'Thanks for the match invite!', time: 'Mon', self: false },
    ]
  },
];

const TOP_COMMUNITIES = [
  { name: 'Chennai Strikers',      members: '1,240', sport: 'Football',     trend: '+12%' },
  { name: 'South India Badminton', members: '820',   sport: 'Badminton',    trend: '+8%' },
  { name: 'East Coast Bowlers',    members: '430',   sport: 'Bowling',      trend: '+5%' },
  { name: 'TT Masters Bangalore',  members: '310',   sport: 'Table Tennis', trend: '+18%' },
];

/* ─── Chat Window component ──────────────────────────────── */
function ChatWindow({ chat, isGroup, onBack }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(chat.messages);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now(), user: 'You',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60',
      text: input, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      self: true,
    }]);
    setInput('');
  };

  const headerGradient = isGroup ? chat.gradient : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      className="flex flex-col h-full"
    >
      {/* Chat Header */}
      <div className={`flex items-center justify-between p-4 border-b border-white/5 ${isGroup ? `bg-gradient-to-r ${headerGradient} bg-opacity-10` : ''}`}
        style={isGroup ? { background: `linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0.6))` } : {}}>
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 text-neutral-400 hover:text-white transition-all lg:hidden">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {isGroup ? (
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${chat.gradient} flex items-center justify-center text-lg flex-shrink-0`}>
              {chat.icon}
            </div>
          ) : (
            <div className="relative flex-shrink-0">
              <img src={chat.avatar} alt={chat.user} className="w-9 h-9 rounded-xl object-cover border border-white/10" />
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#080808] ${chat.online ? 'bg-emerald-400' : 'bg-neutral-600'}`} />
            </div>
          )}
          <div>
            <h3 className="font-display font-bold text-white text-sm">{isGroup ? chat.name : chat.user}</h3>
            <p className="text-[10px] text-neutral-500">
              {isGroup ? `${chat.online} online · ${chat.members} members` : (chat.online ? '🟢 Online' : 'Last seen recently')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {!isGroup && (
            <>
              <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/8 transition-all">
                <Phone className="w-3.5 h-3.5" />
              </button>
              <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/8 transition-all">
                <Video className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/8 transition-all">
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg, i) => {
          const isSelf = msg.self;
          const showAvatar = !isSelf && (i === 0 || messages[i - 1]?.self || messages[i - 1]?.user !== msg.user);
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar for group (non-self) */}
              {!isSelf && isGroup && (
                <div className="w-7 h-7 flex-shrink-0">
                  {showAvatar && (
                    <img src={msg.avatar} alt={msg.user} className="w-7 h-7 rounded-full object-cover border border-white/10" />
                  )}
                </div>
              )}
              <div className={`max-w-[75%] ${isSelf ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                {!isSelf && isGroup && showAvatar && (
                  <span className="text-[9px] text-neutral-500 font-bold ml-1">{msg.user}</span>
                )}
                <div className={`px-3.5 py-2.5 rounded-2xl text-sm font-light leading-relaxed break-words ${
                  isSelf
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-white/[0.06] border border-white/8 text-neutral-200 rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
                <div className={`flex items-center gap-1 text-[9px] text-neutral-600 px-1 ${isSelf ? 'flex-row-reverse' : ''}`}>
                  <span>{msg.time}</span>
                  {isSelf && <CheckCheck className="w-3 h-3 text-indigo-400" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/5 flex items-center gap-2">
        <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 text-neutral-500 hover:text-white transition-all flex-shrink-0">
          <Image className="w-4 h-4" />
        </button>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder={isGroup ? `Message #${chat.name.toLowerCase().replace(/ /g,'-')}...` : `Message ${chat.user}...`}
          className="flex-grow bg-white/[0.03] border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/40 transition-colors"
        />
        <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 text-neutral-500 hover:text-white transition-all flex-shrink-0">
          <Smile className="w-4 h-4" />
        </button>
        <button
          onClick={sendMessage}
          className="w-10 h-10 flex-shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center transition-colors shadow-[0_0_12px_rgba(99,102,241,0.3)]"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </motion.div>
  );
}

/* ── Marketplace Chat Window component ────────────────────────────── */
function MarketplaceChatWindow({ chat, onBack }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(chat.messages);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now(), user: 'You',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60',
      text: input, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      self: true,
    }]);
    setInput('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      className="flex flex-col h-full text-left"
    >
      {/* Seller Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/40">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 text-neutral-400 hover:text-white transition-all lg:hidden">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="relative flex-shrink-0">
            <img src={chat.avatar} alt={chat.user} className="w-9 h-9 rounded-xl object-cover border border-white/10" />
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#080808] ${chat.online ? 'bg-emerald-400' : 'bg-neutral-600'}`} />
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-sm">Chat with {chat.user}</h3>
            <p className="text-[10px] text-neutral-500">
              {chat.online ? '🟢 Seller is online' : 'Last seen recently'}
            </p>
          </div>
        </div>
        <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/8 transition-all">
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Product Banner Box */}
      <div className="p-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center space-x-3 min-w-0">
          <img src={chat.productImage} className="w-10 h-10 rounded-lg object-cover border border-white/10 flex-shrink-0" alt={chat.productName} />
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white truncate max-w-[180px] sm:max-w-[280px]">{chat.productName}</h4>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="text-xs font-display font-black text-indigo-400">{chat.productPrice}</span>
              <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/8 text-neutral-400">
                {chat.productCondition}
              </span>
            </div>
          </div>
        </div>
        <span className="text-[8px] font-black uppercase text-indigo-400 border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 rounded-lg">P2P Listing</span>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg, i) => {
          const isSelf = msg.self;
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`max-w-[75%] ${isSelf ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                <div className={`px-3.5 py-2.5 rounded-2xl text-sm font-light leading-relaxed break-words ${
                  isSelf
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-white/[0.06] border border-white/8 text-neutral-200 rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
                <div className={`flex items-center gap-1 text-[9px] text-neutral-600 px-1 ${isSelf ? 'flex-row-reverse' : ''}`}>
                  <span>{msg.time}</span>
                  {isSelf && <CheckCheck className="w-3 h-3 text-indigo-400" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/5 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder={`Ask ${chat.user} about the ${chat.productName.split(' ')[0]}...`}
          className="flex-grow bg-white/[0.03] border border-white/8 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/40 transition-colors"
        />
        <button
          onClick={sendMessage}
          className="w-10 h-10 flex-shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center transition-colors shadow-[0_0_12px_rgba(99,102,241,0.3)]"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Main Community Component ───────────────────────────── */
export default function Community({ 
  user, 
  initialSubTab, 
  setInitialSubTab,
  marketplaceChatProduct,
  setMarketplaceChatProduct
}) {
  // Clubs state
  const [joinedClubs, setJoinedClubs] = useState([1]);
  const [searchQuery, setSearchQuery] = useState('');
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [addStoryOpen, setAddStoryOpen] = useState(false);

  const [clubs, setClubs] = useState(CLUBS_DATA);
  const [groupChats, setGroupChats] = useState(GROUP_CHATS);
  const [dms, setDms] = useState(DMS_DATA);

  // Marketplace Chats state
  const [marketplaceChats, setMarketplaceChats] = useState([
    {
      id: 'mp1',
      user: 'Arjun Sharma',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun',
      productName: 'Turfington Match Jersey v2',
      productPrice: '₹149',
      productCondition: 'New (Sealed Pack)',
      productImage: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?q=80&w=400',
      online: true,
      lastMsg: { text: 'Hey, is the jersey price negotiable?', time: '12:45', self: true, read: true },
      messages: [
        { id: 1, text: 'Hi Arjun! I saw your listing for the Turfington Jersey. Is it still available?', time: '12:40', self: true },
        { id: 2, text: 'Yes, it is! Brand new sealed pack.', time: '12:42', self: false },
        { id: 3, text: 'Hey, is the jersey price negotiable?', time: '12:45', self: true },
      ]
    },
    {
      id: 'mp2',
      user: 'Priya Nair',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
      productName: 'AeroCarbon Pro Badminton Racket',
      productPrice: '₹499',
      productCondition: 'Pre-owned (Like New)',
      productImage: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=400',
      online: false,
      lastMsg: { text: 'I can pick it up tomorrow evening.', time: 'Yesterday', self: false, read: true },
      messages: [
        { id: 1, text: 'Hello Priya, interested in the Badminton racket. Can we coordinate a handover?', time: 'Yesterday', self: true },
        { id: 2, text: 'Sure! I live near Vanguard Arena. I can pick it up tomorrow evening.', time: 'Yesterday', self: false },
      ]
    }
  ]);

  // Player search and recommendations states
  const [playerSearchQuery, setPlayerSearchQuery] = useState('');
  const [followedPlayers, setFollowedPlayers] = useState([2]);

  // Geolocation states for player distance calculation
  const [userCoordinates, setUserCoordinates] = useState(null);
  const [locationStatus, setLocationStatus] = useState('prompt');



  useEffect(() => {
    if (navigator.geolocation) {
      setLocationStatus('detecting');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoordinates({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationStatus('granted');
        },
        () => {
          setLocationStatus('denied');
        }
      );
    }
  }, []);

  const haversine = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
  };

  const PLAYERS_BASE = [
    { id: 1, name: 'Amit Patel',    handle: '@amitpatel',      lat: 13.0952, lng: 80.2198, sports: ['Football', 'Cricket'],          level: 'Advanced',     matchesPlayed: 32, winRate: '71%', mutualFriends: 4, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Amit', coverColor: 'from-emerald-600 to-green-800',   badge: 'Top Scorer',       badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { id: 2, name: 'Pooja Reddy',   handle: '@poojareddy',     lat: 13.0250, lng: 80.2150, sports: ['Badminton', 'Table Tennis'],     level: 'Intermediate', matchesPlayed: 18, winRate: '58%', mutualFriends: 7, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pooja', coverColor: 'from-indigo-600 to-violet-800',   badge: 'Active Player',    badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    { id: 3, name: 'Deepak Kumar',  handle: '@deepaktt',       lat: 13.0800, lng: 80.2100, sports: ['Table Tennis'],                  level: 'Elite',        matchesPlayed: 44, winRate: '84%', mutualFriends: 2, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Deepak', coverColor: 'from-rose-600 to-pink-800',       badge: 'Elite Ranked',     badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    { id: 4, name: 'Divya Thomas',  handle: '@divyabowls',     lat: 13.0450, lng: 80.2500, sports: ['Bowling', 'Foosball'],           level: 'Beginner',     matchesPlayed: 10, winRate: '40%', mutualFriends: 1, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Divya', coverColor: 'from-cyan-600 to-sky-800',       badge: 'Rising Star',      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    { id: 5, name: 'Arjun Sharma',  handle: '@arjunfc',        lat: 13.0150, lng: 80.2100, sports: ['Football', 'Cricket'],          level: 'Intermediate', matchesPlayed: 26, winRate: '65%', mutualFriends: 5, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun', coverColor: 'from-amber-600 to-orange-800',   badge: 'Weekend Warrior',  badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { id: 6, name: 'Priya Nair',    handle: '@priyadoubles',   lat: 13.0600, lng: 80.2600, sports: ['Badminton'],                     level: 'Advanced',     matchesPlayed: 37, winRate: '79%', mutualFriends: 3, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', coverColor: 'from-violet-600 to-purple-800', badge: 'Tournament Player', badgeColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  ];

  const [players, setPlayers] = useState(
    PLAYERS_BASE.map(p => ({
      ...p,
      distance: '1.5 km' // Default fallback
    }))
  );

  useEffect(() => {
    if (userCoordinates) {
      setPlayers(
        PLAYERS_BASE
          .map(p => ({
            ...p,
            distance: `${haversine(userCoordinates.lat, userCoordinates.lng, p.lat, p.lng)} km`
          }))
          .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
      );
    }
  }, [userCoordinates]);

  const toggleFollow = (id) =>
    setFollowedPlayers(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  const handleOpenDM = (player) => {
    const existing = dms.find(d => d.user === player.name);
    if (existing) {
      setActiveChat({ type: 'dm', id: existing.id });
      setMainTab('dms');
    } else {
      const newDmId = `dm_dyn_${Date.now()}`;
      const newDm = {
        id: newDmId,
        user: player.name,
        handle: player.handle,
        avatar: player.avatar,
        online: true,
        lastMsg: { text: `Direct message channel created. Say hi to ${player.name}!`, time: 'Now', self: false, read: false },
        messages: [
          { id: 1, text: `Direct message channel created. Say hi to ${player.name}!`, time: 'Now', self: false }
        ]
      };
      setDms(prev => [newDm, ...prev]);
      setActiveChat({ type: 'dm', id: newDmId });
      setMainTab('dms');
    }
  };

  const [storiesState, setStoriesState] = useState([
    { id: 1, name: 'You', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Felix', media: '/turf_story_highlight.png', isLive: true, seen: false, time: 'Just now' },
    { id: 2, name: 'Rahul S.', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Rahul', media: '/turf_story_highlight.png', isLive: false, seen: false, time: '2h ago' },
    { id: 3, name: 'Sonia V.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sonia', media: '/badminton_morning_doubles.jpg', isLive: true, seen: false, time: '5h ago' },
    { id: 4, name: 'Vanguard FC', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Vanguard', media: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600', isLive: false, seen: true, time: '8h ago' },
    { id: 5, name: 'Amit P.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit', media: '/turf_story_highlight.png', isLive: false, seen: true, time: '12h ago' },
    { id: 6, name: 'Pooja R.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pooja', media: '/badminton_morning_doubles.jpg', isLive: false, seen: true, time: 'Yesterday' }
  ]);

  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [storyReply, setStoryReply] = useState('');
  const [showReplySent, setShowReplySent] = useState(false);

  useEffect(() => {
    let interval;
    if (activeStoryIndex !== null) {
      setStoryProgress(0);
      interval = setInterval(() => {
        setStoryProgress(prev => {
          if (prev >= 100) {
            if (activeStoryIndex < storiesState.length - 1) {
              setActiveStoryIndex(activeStoryIndex + 1);
            } else {
              setActiveStoryIndex(null);
            }
            return 0;
          }
          return prev + 2.5;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [activeStoryIndex, storiesState.length]);

  useEffect(() => {
    if (activeStoryIndex !== null) {
      setStoriesState(prev => prev.map((s, idx) => {
        if (idx === activeStoryIndex) {
          return { ...s, seen: true };
        }
        return s;
      }));
    }
  }, [activeStoryIndex]);

  const handleSendStoryReply = (e) => {
    e.preventDefault();
    if (!storyReply.trim()) return;
    setShowReplySent(true);
    setStoryReply('');
    setTimeout(() => {
      setShowReplySent(false);
    }, 2000);
  };

  const handleTeamCreated = (newTeam) => {
    setClubs(prev => [newTeam, ...prev]);
    setJoinedClubs(prev => [newTeam.id, ...prev]);
  };

  // Navigation
  const [mainTab, setMainTab] = useState(user?.role === 'owner' ? 'groups' : 'explore'); // 'explore' | 'groups' | 'dms' | 'marketplace'
  const [activeChat, setActiveChat] = useState(null); // { type: 'group'|'dm'|'marketplace', id }
  const [chatSearchQuery, setChatSearchQuery] = useState('');

  useEffect(() => {
    if (initialSubTab === 'marketplace') {
      setMainTab('marketplace');
      if (setInitialSubTab) setInitialSubTab(null);
    }
    if (marketplaceChatProduct) {
      const existing = marketplaceChats.find(
        c => c.user === marketplaceChatProduct.sellerName && c.productName === marketplaceChatProduct.name
      );
      if (existing) {
        setActiveChat({ type: 'marketplace', id: existing.id });
      } else {
        const newChatId = `mp_dyn_${Date.now()}`;
        const newChat = {
          id: newChatId,
          user: marketplaceChatProduct.sellerName,
          avatar: marketplaceChatProduct.sellerAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Seller',
          productName: marketplaceChatProduct.name,
          productPrice: `₹${marketplaceChatProduct.price.toLocaleString('en-IN')}`,
          productCondition: marketplaceChatProduct.tag,
          productImage: marketplaceChatProduct.image,
          online: true,
          lastMsg: { text: `Inquired about ${marketplaceChatProduct.name}.`, time: 'Now', self: true, read: true },
          messages: [
            { id: 1, text: `Hello ${marketplaceChatProduct.sellerName}! I am interested in buying your "${marketplaceChatProduct.name}" listed for ₹${marketplaceChatProduct.price.toLocaleString('en-IN')}. Is it still available?`, time: 'Now', self: true }
          ]
        };
        setMarketplaceChats(prev => [newChat, ...prev]);
        setActiveChat({ type: 'marketplace', id: newChatId });
      }
      setMainTab('marketplace');
      if (setMarketplaceChatProduct) setMarketplaceChatProduct(null);
    }
  }, [initialSubTab, marketplaceChatProduct, marketplaceChats, setInitialSubTab, setMarketplaceChatProduct]);

  const filtered = clubs.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleJoinClub = (id) =>
    setJoinedClubs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const unreadDMs = dms.filter(d => !d.lastMsg.read && !d.lastMsg.self).length;
  const unreadGroups = groupChats.filter(g => !g.lastMsg.read).length;

  const activeChatData = activeChat?.type === 'group'
    ? groupChats.find(g => g.id === activeChat.id)
    : activeChat?.type === 'dm'
    ? dms.find(d => d.id === activeChat.id)
    : marketplaceChats.find(m => m.id === activeChat?.id);

  /* ── Tab button helper ─────────────────────────────────── */
  const TabBtn = ({ id, label, badge }) => (
    <button
      onClick={() => { setMainTab(id); setActiveChat(null); }}
      className={`relative flex items-center space-x-1.5 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${
        mainTab === id
          ? 'bg-white text-black border-transparent shadow-md'
          : 'bg-white/[0.03] text-neutral-400 border-white/8 hover:border-white/20 hover:text-white'
      }`}
    >
      <span>{label}</span>
      {badge > 0 && (
        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[16px] text-center ${
          mainTab === id ? 'bg-black text-white' : 'bg-indigo-600 text-white'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left">

      {/* ── STORIES ROW ── */}
      {user?.role !== 'owner' && (
        <div className="mb-12">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-neutral-500 mb-4 font-display flex items-center">
            <Flame className="w-4 h-4 mr-1 text-white animate-pulse" /> Discover Players Stories
          </h2>
          <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-3">
            {storiesState.map((story, index) => (
              <div 
                key={story.id} 
                onClick={() => setActiveStoryIndex(index)}
                className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
              >
                <div className={`relative p-[3px] rounded-full ${
                  story.seen ? 'bg-neutral-800' : 'bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500'
                }`}>
                  <img 
                    src={story.avatar} 
                    alt={story.name} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#080808] transition-all duration-300 group-hover:scale-105"
                  />
                  {story.isLive && (
                    <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[8px] font-black text-white ring-2 ring-[#080808]">
                      LIVE
                    </span>
                  )}
                </div>
                <span className="text-xs text-neutral-400 mt-2 font-light group-hover:text-white transition-colors">
                  {story.name}
                </span>
              </div>
            ))}
            <div className="flex flex-col items-center flex-shrink-0 justify-center">
              <button 
                onClick={() => setAddStoryOpen(true)}
                className="w-16 h-16 rounded-full border border-dashed border-white/20 hover:border-indigo-500/40 flex items-center justify-center bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer"
              >
                <Plus className="w-6 h-6 text-neutral-400 hover:text-white" />
              </button>
              <span className="text-xs text-neutral-500 mt-2 font-light">Add Story</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Users className="w-5 h-5 text-indigo-400" />
            <span className="text-[10px] text-indigo-400 uppercase font-extrabold tracking-widest">Sports Communities</span>
          </div>
          <h1 className="text-3xl font-black font-display tracking-tight uppercase text-white">Community Hub</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Clubs, group chats, and direct messages in one place</p>
        </div>
        {user?.role !== 'owner' && (
          <button onClick={() => setCreateTeamOpen(true)}
            className="inline-flex items-center space-x-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all self-start shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <Plus className="w-4 h-4" />
            <span>Create Team</span>
          </button>
        )}
      </div>

      {/* ── Main Tab Bar ─────────────────────────────────────── */}
      <div className="flex space-x-2 mb-6 overflow-x-auto no-scrollbar pb-1">
        {user?.role !== 'owner' && <TabBtn id="explore"  label="Explore Network" badge={0} />}
        <TabBtn id="groups"   label="Group Chats" badge={unreadGroups} />
        <TabBtn id="dms"      label="Direct Messages" badge={unreadDMs} />
        <TabBtn id="marketplace" label="Marketplace" badge={0} />
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/*  TAB: EXPLORE NETWORK                                 */}
      {/* ══════════════════════════════════════════════════════ */}
      {mainTab === 'explore' && (
        <div className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Clubs & Teams */}
            <div className="lg:col-span-6 space-y-5 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1 flex-shrink-0">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-neutral-400">
                  Available Clubs <span className="text-neutral-600 ml-1">({filtered.length})</span>
                </h2>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-500" />
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search clubs or sport..."
                    className="w-full bg-white/[0.03] border border-white/8 rounded-full pl-9 pr-4 py-2 text-xs text-neutral-300 focus:outline-none focus:border-indigo-500/40 transition-colors" />
                </div>
              </div>

              {/* Scrollable list */}
              <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 no-scrollbar">
                {filtered.map((c, i) => {
                  const joined = joinedClubs.includes(c.id);
                  const style = SPORT_STYLES[c.category] || DEFAULT_STYLE;
                  return (
                    <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      className="glass-card overflow-hidden border border-white/5 hover:border-white/12 transition-all duration-300 group">
                      <div className="flex flex-col sm:flex-row sm:items-stretch gap-0">
                        <div className="w-full sm:w-32 h-32 sm:h-auto flex-shrink-0 relative overflow-hidden">
                          <img src={c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                          <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-30`} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute bottom-3 left-3">
                            <span className={`inline-flex items-center space-x-1 text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full border backdrop-blur-md ${style.badge}`}>
                              <span>{c.category}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex-grow flex flex-col sm:flex-row">
                          <div className="flex-grow p-4 space-y-2 text-left min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <h3 className="font-display font-bold text-white text-sm truncate">{c.name}</h3>
                              <span className="text-[8px] font-bold text-neutral-500 uppercase">{c.rank}</span>
                            </div>
                            <p className="text-neutral-400 text-[11px] font-light leading-relaxed line-clamp-2">{c.description}</p>
                            <div className="flex items-center space-x-3 text-[11px]">
                              <div className="flex items-center space-x-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`} />
                                <span className="text-neutral-400 font-medium">{c.online} online</span>
                              </div>
                              <span className="text-neutral-600">•</span>
                              <span className="text-neutral-500">{joined ? c.members + 1 : c.members} members</span>
                            </div>
                            <div className="flex items-center text-[10px] rounded-lg p-2 bg-white/[0.02] border border-white/5">
                              <Calendar className="w-3 h-3 mr-1.5 text-neutral-500 flex-shrink-0" />
                              <span className="text-neutral-300 truncate">📅 {c.upcomingEvent}</span>
                            </div>
                          </div>
                          <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-2 p-4 border-t sm:border-t-0 sm:border-l border-white/5 flex-shrink-0">
                            <button onClick={() => toggleJoinClub(c.id)}
                              className={`text-xs font-bold px-4 py-2 rounded-full border transition-all duration-300 w-full sm:w-24 ${
                                joined
                                  ? `border-transparent text-white bg-gradient-to-r ${style.gradient} shadow-lg opacity-80 hover:opacity-100`
                                  : 'bg-white text-black border-transparent hover:scale-105 shadow-md'
                              }`}>
                              {joined ? '✓ Joined' : 'Join Club'}
                            </button>
                            {joined && (
                              <button
                                onClick={() => { setMainTab('groups'); setActiveChat({ type: 'group', id: `gc${c.id}` }); }}
                                className="text-[9px] text-indigo-400 font-bold hover:text-indigo-300 flex items-center space-x-1 transition-colors">
                                <MessageSquare className="w-3 h-3" />
                                <span>Open Chat</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Find Players */}
            <div className="lg:col-span-6 space-y-5 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1 flex-shrink-0">
                <div>
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-neutral-400">
                    Recommended Players
                  </h2>
                  <p className="text-[9px] text-neutral-500 mt-0.5">Athletes in your area</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-500" />
                  <input 
                    type="text" 
                    value={playerSearchQuery} 
                    onChange={e => setPlayerSearchQuery(e.target.value)}
                    placeholder="Search athletes by name or sport..."
                    className="w-full bg-white/[0.03] border border-white/8 rounded-full pl-9 pr-4 py-2 text-xs text-neutral-300 focus:outline-none focus:border-indigo-500/40 transition-colors" 
                  />
                </div>
              </div>

              {/* Scrollable list */}
              <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 no-scrollbar">
                {players
                  .filter(p => 
                    p.name.toLowerCase().includes(playerSearchQuery.toLowerCase()) || 
                    p.sports.some(s => s.toLowerCase().includes(playerSearchQuery.toLowerCase()))
                  )
                  .map((p, i) => {
                    const followed = followedPlayers.includes(p.id);
                    return (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass-card border border-white/5 hover:border-white/12 transition-all duration-300 overflow-hidden group"
                      >
                        {/* Sport-colour top strip */}
                        <div className={`h-1 w-full bg-gradient-to-r ${p.coverColor}`} />

                        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          {/* Avatar + Info */}
                          <div className="flex items-center gap-3 text-left min-w-0">
                            <div className="relative flex-shrink-0">
                              <img
                                src={p.avatar}
                                alt={p.name}
                                className="w-12 h-12 rounded-xl object-cover border border-white/10"
                              />
                              <span className="absolute -bottom-1 -right-1 text-[7px] font-black bg-black/80 border border-white/10 text-white px-1 py-0.5 rounded-full whitespace-nowrap">
                                {p.distance}
                              </span>
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-display font-bold text-white text-xs truncate">{p.name}</h4>
                                <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full border ${p.badgeColor}`}>
                                  {p.badge}
                                </span>
                              </div>
                              <p className="text-[9px] text-neutral-500 mt-0.5">{p.handle}</p>

                              {/* Sports chips */}
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {p.sports.map(s => (
                                  <span key={s} className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-white/5 border border-white/8 text-neutral-400">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex sm:flex-col items-stretch sm:items-end justify-between sm:justify-center gap-2 flex-shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5">
                            <button
                              onClick={() => toggleFollow(p.id)}
                              className={`flex items-center justify-center space-x-1 text-xs font-bold px-4 py-2 rounded-full border transition-all duration-300 ${
                                followed
                                  ? 'bg-white/5 border-white/15 text-neutral-400 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400'
                                  : 'bg-indigo-600 border-transparent text-white hover:bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                              }`}
                            >
                              {followed
                                ? <><UserCheck className="w-3 h-3" /><span>Following</span></>
                                : <><UserPlus className="w-3 h-3" /><span>Follow</span></>}
                            </button>
                            <button 
                              onClick={() => handleOpenDM(p)}
                              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center justify-center gap-1 transition-colors px-2 py-1"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>Message</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </div>

          </div>

          {/* Bottom widgets section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 border-t border-white/5 pt-10">
            {/* Top Communities */}
            <div className="glass-card p-5 border border-white/5 space-y-4 text-left">
              <div className="flex items-center space-x-2 pb-3 border-b border-white/5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-white">Top Communities</h3>
              </div>
              <div className="space-y-3">
                {TOP_COMMUNITIES.map((item, index) => {
                  const style = SPORT_STYLES[item.sport] || DEFAULT_STYLE;
                  return (
                    <div key={item.name} className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white bg-gradient-to-br ${style.gradient}`}>{index + 1}</span>
                        <div>
                          <p className="text-xs font-bold text-white">{item.name}</p>
                          <p className="text-[10px] text-neutral-500">{item.members} members</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold text-emerald-400">{item.trend}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Now */}
            <div className="glass-card p-5 border border-white/5 bg-gradient-to-br from-indigo-600/5 to-violet-600/5 flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-extrabold text-white uppercase tracking-wide">Active Right Now</span>
                </div>
                <div className="flex -space-x-2 mb-4">
                  {['https://api.dicebear.com/7.x/bottts/svg?seed=Rahul','https://api.dicebear.com/7.x/avataaars/svg?seed=Sonia','https://api.dicebear.com/7.x/bottts/svg?seed=Amit','https://api.dicebear.com/7.x/avataaars/svg?seed=Pooja'].map((av, i) => (
                    <img key={i} src={av} alt="" className="w-8 h-8 rounded-full border-2 border-[#080808] object-cover" />
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-[#080808] bg-indigo-600 flex items-center justify-center text-[9px] font-black text-white">+84</div>
                </div>
              </div>
              <p className="text-[11px] text-neutral-400 font-light mt-2">88 athletes playing or planning sessions right now</p>
            </div>

            {/* Network Stats */}
            <div className="glass-card p-5 border border-white/5 space-y-4 text-left">
              <div className="flex items-center space-x-2 pb-3 border-b border-white/5">
                <Users className="w-4 h-4 text-indigo-400" />
                <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-white">Network Stats</h3>
              </div>
              <div className="space-y-2 text-xs font-light text-neutral-400">
                <div className="flex justify-between items-center p-2 bg-white/[0.01] border border-white/5 rounded-xl">
                  <span>Total Players in Chennai</span>
                  <span className="font-bold text-white font-display">1,420</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/[0.01] border border-white/5 rounded-xl">
                  <span>Your Connections</span>
                  <span className="font-bold text-white font-display">{followedPlayers.length}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/[0.01] border border-white/5 rounded-xl">
                  <span>Active Live Sessions</span>
                  <span className="font-bold text-white font-display">8</span>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="glass-card p-5 border border-white/5 space-y-4 text-left">
              <div className="flex items-center space-x-2 pb-3 border-b border-white/5">
                <Star className="w-4 h-4 text-amber-400" />
                <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-white">Leaderboard</h3>
              </div>
              <div className="space-y-3 text-xs">
                {[
                  { name: 'Deepak Kumar', points: '1,840 pts', win: '84% Win' },
                  { name: 'Pooja Reddy', points: '1,420 pts', win: '78% Win' },
                  { name: 'Amit Patel', points: '1,120 pts', win: '71% Win' }
                ].map((user, idx) => (
                  <div key={user.name} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-neutral-800 text-[10px] font-black flex items-center justify-center text-neutral-400">{idx + 1}</span>
                      <span className="font-bold text-white">{user.name}</span>
                    </div>
                    <span className="text-[10px] text-neutral-500">{user.points} · <strong className="text-emerald-400">{user.win}</strong></span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/*  TAB: GROUP CHATS                                      */}
      {/* ══════════════════════════════════════════════════════ */}
      {mainTab === 'groups' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 glass-card border border-white/5 overflow-hidden" style={{ height: '68vh', minHeight: 520 }}>

          {/* Sidebar: Group list */}
          <div className={`lg:col-span-4 border-r border-white/5 flex flex-col ${activeChat ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-4 border-b border-white/5">
              <h3 className="font-display font-bold text-white text-sm mb-3 uppercase tracking-wider">Group Chats</h3>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-500" />
                <input type="text" value={chatSearchQuery} onChange={e => setChatSearchQuery(e.target.value)}
                  placeholder="Search groups..." className="w-full bg-white/[0.03] border border-white/8 rounded-xl pl-9 pr-4 py-2 text-xs text-neutral-300 focus:outline-none focus:border-indigo-500/40" />
              </div>
            </div>
            <div className="overflow-y-auto flex-grow no-scrollbar">
              {groupChats.filter(g => g.name.toLowerCase().includes(chatSearchQuery.toLowerCase())).map(g => {
                const isActive = activeChat?.id === g.id;
                return (
                  <button key={g.id} onClick={() => setActiveChat({ type: 'group', id: g.id })}
                    className={`w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.03] transition-colors border-b border-white/5 ${isActive ? 'bg-white/[0.04]' : ''}`}>
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${g.gradient} flex items-center justify-center text-xl flex-shrink-0 shadow-lg`}>
                      {g.icon}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-white text-xs truncate">{g.name}</p>
                        <span className="text-[9px] text-neutral-500 flex-shrink-0">{g.lastMsg.time}</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                        <span className="font-semibold text-neutral-400">{g.lastMsg.user}:</span> {g.lastMsg.text}
                      </p>
                      <p className="text-[9px] text-neutral-600 mt-0.5">{g.online} online</p>
                    </div>
                    {!g.lastMsg.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                    )}
                  </button>
                );
              })}

              {/* Join more groups CTA */}
              <button onClick={() => setMainTab('explore')}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors border-b border-white/5 text-neutral-600 hover:text-neutral-400 group">
                <div className="w-11 h-11 rounded-2xl border border-dashed border-white/10 flex items-center justify-center group-hover:border-indigo-500/30 transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold">Join more clubs</p>
              </button>
            </div>
          </div>

          {/* Chat area */}
          <div className={`lg:col-span-8 flex flex-col ${activeChat ? 'flex' : 'hidden lg:flex'}`}>
            {activeChat && activeChatData ? (
              <ChatWindow chat={activeChatData} isGroup={true} onBack={() => setActiveChat(null)} />
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                  <Hash className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="font-display font-bold text-white text-base mb-2">Select a Group Chat</h3>
                <p className="text-xs text-neutral-500 font-light max-w-xs">Choose a group from the list to start chatting with your sports community</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/*  TAB: DIRECT MESSAGES                                  */}
      {/* ══════════════════════════════════════════════════════ */}
      {mainTab === 'dms' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 glass-card border border-white/5 overflow-hidden" style={{ height: '68vh', minHeight: 520 }}>

          {/* Sidebar: DM list */}
          <div className={`lg:col-span-4 border-r border-white/5 flex flex-col ${activeChat ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold text-white text-sm uppercase tracking-wider">Messages</h3>
                <button className="p-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/30 transition-colors">
                  <UserPlus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-500" />
                <input type="text" value={chatSearchQuery} onChange={e => setChatSearchQuery(e.target.value)}
                  placeholder="Search conversations..." className="w-full bg-white/[0.03] border border-white/8 rounded-xl pl-9 pr-4 py-2 text-xs text-neutral-300 focus:outline-none focus:border-indigo-500/40" />
              </div>
            </div>
            <div className="overflow-y-auto flex-grow no-scrollbar">
              {dms.filter(d => d.user.toLowerCase().includes(chatSearchQuery.toLowerCase())).map(d => {
                const isActive = activeChat?.id === d.id;
                const unread = !d.lastMsg.read && !d.lastMsg.self;
                return (
                  <button key={d.id} onClick={() => setActiveChat({ type: 'dm', id: d.id })}
                    className={`w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.03] transition-colors border-b border-white/5 ${isActive ? 'bg-white/[0.04]' : ''}`}>
                    <div className="relative flex-shrink-0">
                      <img src={d.avatar} alt={d.user} className="w-11 h-11 rounded-2xl object-cover border border-white/10" />
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#080808] ${d.online ? 'bg-emerald-400' : 'bg-neutral-600'}`} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs truncate ${unread ? 'font-extrabold text-white' : 'font-bold text-white'}`}>{d.user}</p>
                        <span className="text-[9px] text-neutral-500 flex-shrink-0">{d.lastMsg.time}</span>
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${unread ? 'text-white font-medium' : 'text-neutral-500'}`}>
                        {d.lastMsg.self && <span className="text-neutral-500">You: </span>}
                        {d.lastMsg.text}
                      </p>
                    </div>
                    {unread && <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DM chat area */}
          <div className={`lg:col-span-8 flex flex-col ${activeChat ? 'flex' : 'hidden lg:flex'}`}>
            {activeChat && activeChatData ? (
              <ChatWindow chat={activeChatData} isGroup={false} onBack={() => setActiveChat(null)} />
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="font-display font-bold text-white text-base mb-2">Your Messages</h3>
                <p className="text-xs text-neutral-500 font-light max-w-xs">Select a conversation or message an athlete from the Discovery tab</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/*  TAB: MARKETPLACE CHATS                                */}
      {/* ══════════════════════════════════════════════════════ */}
      {mainTab === 'marketplace' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 glass-card border border-white/5 overflow-hidden" style={{ height: '68vh', minHeight: 520 }}>

          {/* Sidebar: Marketplace Chat List */}
          <div className={`lg:col-span-4 border-r border-white/5 flex flex-col ${activeChat ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold text-white text-sm uppercase tracking-wider">Marketplace Deals</h3>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-500" />
                <input type="text" value={chatSearchQuery} onChange={e => setChatSearchQuery(e.target.value)}
                  placeholder="Search deals..." className="w-full bg-white/[0.03] border border-white/8 rounded-xl pl-9 pr-4 py-2 text-xs text-neutral-300 focus:outline-none focus:border-indigo-500/40" />
              </div>
            </div>
            <div className="overflow-y-auto flex-grow no-scrollbar">
              {marketplaceChats.filter(m => m.user.toLowerCase().includes(chatSearchQuery.toLowerCase()) || m.productName.toLowerCase().includes(chatSearchQuery.toLowerCase())).map(m => {
                const isActive = activeChat?.id === m.id;
                const unread = !m.lastMsg.read && !m.lastMsg.self;
                return (
                  <button key={m.id} onClick={() => setActiveChat({ type: 'marketplace', id: m.id })}
                    className={`w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.03] transition-colors border-b border-white/5 ${isActive ? 'bg-white/[0.04]' : ''}`}>
                    <div className="relative flex-shrink-0">
                      <img src={m.avatar} alt={m.user} className="w-11 h-11 rounded-2xl object-cover border border-white/10" />
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#080808] ${m.online ? 'bg-emerald-400' : 'bg-neutral-600'}`} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs truncate ${unread ? 'font-extrabold text-white' : 'font-bold text-white'}`}>{m.user}</p>
                        <span className="text-[9px] text-neutral-500 flex-shrink-0">{m.lastMsg.time}</span>
                      </div>
                      <p className="text-[10px] text-indigo-400 font-bold truncate mt-0.5">{m.productName} • {m.productPrice}</p>
                      <p className={`text-[11px] truncate mt-0.5 ${unread ? 'text-white font-medium' : 'text-neutral-500'}`}>
                        {m.lastMsg.self && <span className="text-neutral-500">You: </span>}
                        {m.lastMsg.text}
                      </p>
                    </div>
                    {unread && <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat area */}
          <div className={`lg:col-span-8 flex flex-col ${activeChat ? 'flex' : 'hidden lg:flex'}`}>
            {activeChat && activeChatData && activeChat.type === 'marketplace' ? (
              <MarketplaceChatWindow chat={activeChatData} onBack={() => setActiveChat(null)} />
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="font-display font-bold text-white text-base mb-2">Marketplace Inquiries</h3>
                <p className="text-xs text-neutral-500 font-light max-w-xs">Select a listing inquiry to discuss prices and collection directly with the seller</p>
              </div>
            )}
          </div>
        </div>
      )}
      <AnimatePresence>
        {createTeamOpen && (
          <CreateTeamModal
            onClose={() => setCreateTeamOpen(false)}
            onCreated={handleTeamCreated}
          />
        )}

        {addStoryOpen && (
          <AddStoryModal
            user={user}
            onClose={() => setAddStoryOpen(false)}
            onCreated={(newStory) => {
              setStoriesState(prev => [newStory, ...prev]);
            }}
          />
        )}

        {activeStoryIndex !== null && storiesState[activeStoryIndex] && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md select-none"
          >
            {/* Click backdrop to close */}
            <div className="absolute inset-0 animate-fade-in" onClick={() => setActiveStoryIndex(null)} />

            {/* Desktop Navigation Buttons */}
            <div className="hidden sm:flex absolute left-8 top-1/2 -translate-y-1/2 z-20">
              <button 
                onClick={() => setActiveStoryIndex(prev => Math.max(0, prev - 1))}
                disabled={activeStoryIndex === 0}
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>
            
            <div className="hidden sm:flex absolute right-8 top-1/2 -translate-y-1/2 z-20">
              <button 
                onClick={() => setActiveStoryIndex(prev => prev < storiesState.length - 1 ? prev + 1 : null)}
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Story Card Container */}
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-[420px] aspect-[9/16] bg-[#0d0d0d] rounded-3xl overflow-hidden border border-white/10 shadow-2xl z-10 flex flex-col justify-between"
            >
              {/* Media Background */}
              <div className="absolute inset-0 w-full h-full">
                <img 
                  src={storiesState[activeStoryIndex].media} 
                  alt="Story content" 
                  className="w-full h-full object-cover pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none" />
              </div>

              {/* Top Section: Progress indicators & header */}
              <div className="relative z-10 p-4 space-y-3 pointer-events-auto">
                {/* Segments progress bar */}
                <div className="flex gap-1.5 w-full">
                  {storiesState.map((story, idx) => {
                    const isCompleted = idx < activeStoryIndex;
                    const isActive = idx === activeStoryIndex;
                    return (
                      <div key={story.id} className="h-1 rounded-full flex-1 bg-white/20 overflow-hidden">
                        {isCompleted && <div className="h-full bg-white w-full" />}
                        {isActive && (
                          <div 
                            className="h-full bg-white transition-all ease-linear" 
                            style={{ width: `${storyProgress}%` }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* User Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img 
                      src={storiesState[activeStoryIndex].avatar} 
                      alt={storiesState[activeStoryIndex].name} 
                      className="w-9 h-9 rounded-full object-cover border border-white/20"
                    />
                    <div className="ml-2.5 text-left">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5 font-display">
                        {storiesState[activeStoryIndex].name}
                        {storiesState[activeStoryIndex].isLive && (
                          <span className="bg-indigo-500 text-[7px] font-black uppercase px-1.5 py-0.5 rounded text-white tracking-widest font-mono">LIVE</span>
                        )}
                      </span>
                      <p className="text-[10px] text-neutral-400 font-light mt-0.5">{storiesState[activeStoryIndex].time}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveStoryIndex(null)}
                    className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-white transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Center Navigation Click Zones for Mobile/Quick Tap */}
              <div className="absolute inset-0 flex z-0">
                <div 
                  className="w-1/3 h-full cursor-w-resize" 
                  onClick={() => setActiveStoryIndex(prev => Math.max(0, prev - 1))}
                />
                <div className="w-1/3 h-full" />
                <div 
                  className="w-1/3 h-full cursor-e-resize" 
                  onClick={() => setActiveStoryIndex(prev => prev < storiesState.length - 1 ? prev + 1 : null)}
                />
              </div>

              {/* Bottom Section: Reply sent animation overlay & Send Reply input */}
              <div className="relative z-10 p-4 w-full">
                <AnimatePresence>
                  {showReplySent && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute inset-x-4 bottom-20 bg-indigo-600/90 backdrop-blur-md text-white py-2.5 rounded-xl text-center text-xs font-bold uppercase tracking-wider border border-indigo-500/20"
                    >
                      ✉️ Reply Sent!
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSendStoryReply} className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={storyReply}
                    onChange={e => setStoryReply(e.target.value)}
                    placeholder={`Reply to ${storiesState[activeStoryIndex].name}...`}
                    className="flex-grow bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-4 py-3 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all font-sans"
                  />
                  <button 
                    type="submit"
                    className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-colors shadow-lg cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
