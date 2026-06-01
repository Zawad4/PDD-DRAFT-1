import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Plus, MapPin, IndianRupee, Clock, Users, Edit3, Trash2,
  X, CheckCircle, TrendingUp, Calendar, Shield, Star, ChevronDown,
  ToggleLeft, ToggleRight, Camera, Phone, Globe, Zap, AlertCircle
} from 'lucide-react';

/* ─── Static seed data ───────────────────────────────── */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00',
];

const INITIAL_VENUES = [
  {
    id: 1,
    name: 'Vanguard Sports Arena',
    location: 'Anna Nagar, Chennai',
    sports: ['Football', 'Basketball', 'Pickleball'],
    rating: 4.9,
    pricePerHour: 3750,
    image: 'https://images.unsplash.com/photo-1538388149142-f82611d4d6c4?q=80&w=600',
    totalSlots: 24,
    bookedToday: 14,
    revenue: { week: 403380, month: 1614000 },
    slots: {},   // day -> time -> status
    active: true,
    phone: '+91 98765 43210',
    description: 'Premium astroturf arena with floodlights, changing rooms, and cafeteria.',
  },
  {
    id: 2,
    name: 'Smash Club Badminton',
    location: 'Koramangala, Bangalore',
    sports: ['Badminton', 'Table Tennis'],
    rating: 4.8,
    pricePerHour: 2500,
    image: '/smash_club_badminton.jpg',
    totalSlots: 16,
    bookedToday: 10,
    revenue: { week: 175000, month: 700000 },
    slots: {},
    active: true,
    phone: '+91 98400 12345',
    description: 'Six professional badminton courts with wooden flooring and pro-level nets.',
  },
];

/* Generate random slot occupancy */
function generateSlots() {
  const slots = {};
  DAYS.forEach(day => {
    slots[day] = {};
    TIME_SLOTS.forEach(time => {
      const rand = Math.random();
      slots[day][time] = rand < 0.4 ? 'booked' : rand < 0.55 ? 'blocked' : 'available';
    });
  });
  return slots;
}

const SPORT_COLORS = {
  Football: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Basketball: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Pickleball: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  Badminton: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  'Table Tennis': 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  Cricket: 'text-lime-400 bg-lime-500/10 border-lime-500/20',
};

/* ─── Add Venue Modal ────────────────────────────────── */
function AddVenueModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    name: '', location: '', sports: [], pricePerHour: '',
    phone: '', description: '', image: ''
  });
  const [sportInput, setSportInput] = useState('');

  const toggleSport = (s) => setForm(f => ({
    ...f, sports: f.sports.includes(s) ? f.sports.filter(x => x !== s) : [...f.sports, s]
  }));

  const AVAILABLE_SPORTS = ['Football','Badminton','Table Tennis','Basketball','Cricket','Bowling','Pickleball'];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newVenue = {
      id: Date.now(),
      ...form,
      pricePerHour: parseInt(form.pricePerHour) || 0,
      rating: 0,
      totalSlots: 12,
      bookedToday: 0,
      revenue: { week: 0, month: 0 },
      slots: generateSlots(),
      active: true,
    };
    onAdd(newVenue);
    onClose();
  };

  const inputClass = "w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-violet-500/50 transition-colors";
  const labelClass = "text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1.5 block";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="relative glass-card w-full max-w-[560px] border border-white/10 shadow-2xl z-10 text-left mb-8">

        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="font-display font-black text-white text-lg uppercase tracking-tight">Add New Venue</h3>
            <p className="text-[10px] text-neutral-500 mt-0.5">List your sports facility on Turfington</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/5 border border-white/10 text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className={labelClass}>Venue Name</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
              placeholder="e.g. Vanguard Sports Arena" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Location / Area</label>
              <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} required
                placeholder="e.g. Anna Nagar, Chennai" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Price / Hour (₹)</label>
              <input type="number" value={form.pricePerHour} onChange={e => setForm({...form, pricePerHour: e.target.value})} required
                placeholder="e.g. 3750" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Sports Available</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {AVAILABLE_SPORTS.map(s => (
                <button type="button" key={s} onClick={() => toggleSport(s)}
                  className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-full border transition-all ${
                    form.sports.includes(s) ? 'bg-violet-600 border-violet-500 text-white' : 'bg-white/5 border-white/10 text-neutral-400 hover:border-white/20'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Contact Phone</label>
            <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
              placeholder="+91 98765 43210" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Image URL (optional)</label>
            <input value={form.image} onChange={e => setForm({...form, image: e.target.value})}
              placeholder="https://..." className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              rows={3} placeholder="Describe your facilities, amenities, parking, etc." className={`${inputClass} resize-none`} />
          </div>

          <button type="submit"
            className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-full transition-colors flex items-center justify-center space-x-2">
            <Building2 className="w-4 h-4" />
            <span>List My Venue</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}

/* ─── Slot Grid ──────────────────────────────────────── */
function SlotGrid({ venue, onUpdateSlot }) {
  const [selectedDay, setSelectedDay] = useState('Mon');

  const toggleSlot = (time) => {
    const current = venue.slots?.[selectedDay]?.[time] || 'available';
    const next = current === 'available' ? 'blocked' : current === 'blocked' ? 'available' : 'booked';
    onUpdateSlot(venue.id, selectedDay, time, next);
  };

  const slotColor = (status) => {
    if (status === 'booked') return 'bg-rose-500/20 border-rose-500/30 text-rose-400';
    if (status === 'blocked') return 'bg-amber-500/20 border-amber-500/30 text-amber-400';
    return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
  };

  const slotLabel = (status) => {
    if (status === 'booked') return 'Booked';
    if (status === 'blocked') return 'Blocked';
    return 'Open';
  };

  return (
    <div className="space-y-4">
      {/* Day selector */}
      <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
        {DAYS.map(d => (
          <button key={d} onClick={() => setSelectedDay(d)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
              selectedDay === d ? 'bg-white text-black border-transparent' : 'bg-white/5 border-white/10 text-neutral-400 hover:border-white/20'
            }`}>
            {d}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center space-x-4 text-[10px] font-bold">
        <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500/40" /> <span className="text-neutral-400">Open</span></span>
        <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-500/40" /> <span className="text-neutral-400">Booked</span></span>
        <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500/40" /> <span className="text-neutral-400">Blocked</span></span>
        <span className="text-neutral-600">(Click to toggle)</span>
      </div>

      {/* Time slots grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {TIME_SLOTS.map(time => {
          const status = venue.slots?.[selectedDay]?.[time] || 'available';
          return (
            <button key={time} onClick={() => toggleSlot(time)}
              className={`px-3 py-2.5 rounded-xl border text-[10px] font-bold text-center transition-all hover:scale-105 ${slotColor(status)}`}>
              <div className="font-mono text-xs mb-0.5">{time}</div>
              <div className="uppercase tracking-wider">{slotLabel(status)}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Manage Offers & Packages Modal ───────────────────── */
function ManageOffersModal({ venue, onClose, venueOffers, setVenueOffers }) {
  const [type, setType] = useState('booking'); // 'booking' | 'membership'
  const [title, setTitle] = useState('');
  const [discount, setDiscount] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [benefits, setBenefits] = useState('');

  const currentOffers = venueOffers.filter(o => o.venueId === venue.id);

  const handleAddOffer = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newOffer = {
      id: Date.now(),
      venueId: venue.id,
      type,
      title,
      description: type === 'booking' ? description : '',
      discount: type === 'booking' ? discount : '',
      price: type === 'membership' ? price : '',
      benefits: type === 'membership' ? benefits : ''
    };

    setVenueOffers(prev => [...prev, newOffer]);
    setTitle('');
    setDiscount('');
    setPrice('');
    setDescription('');
    setBenefits('');
  };

  const handleDeleteOffer = (offerId) => {
    setVenueOffers(prev => prev.filter(o => o.id !== offerId));
  };

  const inputClass = "w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-violet-500/50 transition-colors";
  const labelClass = "text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1.5 block";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="relative glass-card w-full max-w-[580px] border border-white/10 shadow-2xl z-10 text-left mb-8 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="font-display font-black text-white text-lg uppercase tracking-tight">Offers & Packages</h3>
            <p className="text-[10px] text-neutral-500 mt-0.5">Manage discounts and memberships for {venue.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/5 border border-white/10 text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
          
          {/* List of current offers */}
          <div className="space-y-3">
            <h4 className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Active Listings</h4>
            {currentOffers.length === 0 ? (
              <p className="text-xs text-neutral-500 font-light italic">No offers or packages configured for this venue.</p>
            ) : (
              <div className="space-y-2">
                {currentOffers.map(offer => (
                  <div key={offer.id} className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-xl">
                    <div className="min-w-0 pr-4">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                          offer.type === 'booking' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {offer.type === 'booking' ? 'Booking Offer' : 'Monthly Pass'}
                        </span>
                        <h5 className="text-xs font-bold text-white truncate">{offer.title}</h5>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-1 font-light leading-relaxed">
                        {offer.type === 'booking' 
                          ? `${offer.discount} off · ${offer.description}` 
                          : `${offer.price} · ${offer.benefits}`
                        }
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDeleteOffer(offer.id)}
                      className="p-2 rounded-full hover:bg-rose-500/10 text-neutral-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-white/5 pt-5">
            <h4 className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-4">Create New Package/Discount</h4>
            
            {/* Form */}
            <form onSubmit={handleAddOffer} className="space-y-4">
              <div className="flex bg-[#0d0d0d] border border-white/5 p-1 rounded-full text-xs font-bold w-full max-w-[280px]">
                <button type="button" onClick={() => setType('booking')}
                  className={`flex-1 py-2 rounded-full text-center transition-all ${type === 'booking' ? 'bg-white text-black font-extrabold' : 'text-neutral-500'}`}>
                  Booking Offer
                </button>
                <button type="button" onClick={() => setType('membership')}
                  className={`flex-1 py-2 rounded-full text-center transition-all ${type === 'membership' ? 'bg-white text-black font-extrabold' : 'text-neutral-500'}`}>
                  Membership Pass
                </button>
              </div>

              <div>
                <label className={labelClass}>{type === 'booking' ? 'Offer Title' : 'Membership Pass Name'}</label>
                <input value={title} onChange={e => setTitle(e.target.value)} required
                  placeholder={type === 'booking' ? "e.g. 15% Weekday discount" : "e.g. Silver Club Pass"} className={inputClass} />
              </div>

              {type === 'booking' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Discount Amount / %</label>
                    <input value={discount} onChange={e => setDiscount(e.target.value)} required
                      placeholder="e.g. 15% or Flat ₹300" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Short Description</label>
                    <input value={description} onChange={e => setDescription(e.target.value)} required
                      placeholder="e.g. Monday-Thursday 5pm to 8pm" className={inputClass} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Price (per Month)</label>
                    <input value={price} onChange={e => setPrice(e.target.value)} required
                      placeholder="e.g. ₹4,999/mo" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Benefits Summary</label>
                    <input value={benefits} onChange={e => setBenefits(e.target.value)} required
                      placeholder="e.g. Includes 4 peak slots per month" className={inputClass} />
                  </div>
                </div>
              )}

              <button type="submit"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-full transition-colors flex items-center justify-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add {type === 'booking' ? 'Booking Discount' : 'Membership Pass'}</span>
              </button>
            </form>
          </div>

        </div>

      </motion.div>
    </div>
  );
}

/* ─── Venue Card ─────────────────────────────────────── */
function VenueCard({ venue, onToggleActive, onUpdateSlot, onDelete, venueOffers, setVenueOffers }) {
  const [expanded, setExpanded] = useState(false);
  const [showOffersModal, setShowOffersModal] = useState(false);
  const occupancy = venue.totalSlots > 0 ? Math.round((venue.bookedToday / venue.totalSlots) * 100) : 0;

  return (
    <motion.div layout className="glass-card border border-white/5 overflow-hidden">
      {/* Card Header */}
      <div className="flex flex-col md:flex-row gap-5 p-5">
        <div className="w-full md:w-36 h-28 rounded-2xl overflow-hidden flex-shrink-0 relative">
          {venue.image
            ? <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-neutral-900 flex items-center justify-center"><Building2 className="w-8 h-8 text-neutral-700" /></div>
          }
          <div className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
            venue.active ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-neutral-800 border-white/10 text-neutral-500'
          }`}>
            {venue.active ? 'Active' : 'Inactive'}
          </div>
        </div>

        <div className="flex-grow">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display font-bold text-white text-lg">{venue.name}</h3>
              <p className="text-xs text-neutral-400 flex items-center mt-0.5">
                <MapPin className="w-3 h-3 mr-1 text-neutral-500" />{venue.location}
              </p>
            </div>
            <div className="flex items-center space-x-1.5 flex-shrink-0">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-sm font-bold text-white">{venue.rating || '—'}</span>
            </div>
          </div>

          {/* Sport tags */}
          <div className="flex flex-wrap gap-1.5 my-3">
            {venue.sports.map(s => (
              <span key={s} className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded border ${SPORT_COLORS[s] || 'text-neutral-400 bg-white/5 border-white/10'}`}>
                {s}
              </span>
            ))}
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-5 text-xs">
            <div>
              <p className="text-neutral-500 text-[10px] uppercase font-bold">Price/Hr</p>
              <p className="text-white font-bold mt-0.5 flex items-center">
                <IndianRupee className="w-3 h-3 mr-0.5" />{venue.pricePerHour.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-neutral-500 text-[10px] uppercase font-bold">Booked Today</p>
              <p className="text-white font-bold mt-0.5">{venue.bookedToday}/{venue.totalSlots}</p>
            </div>
            <div>
              <p className="text-neutral-500 text-[10px] uppercase font-bold">Weekly Revenue</p>
              <p className="text-emerald-400 font-bold mt-0.5 flex items-center">
                <IndianRupee className="w-3 h-3 mr-0.5" />{venue.revenue.week.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Occupancy bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[9px] text-neutral-500 mb-1">
              <span>Occupancy</span><span>{occupancy}%</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${occupancy}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-white/5 bg-white/[0.01]">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleActive(venue.id)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              venue.active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400' : 'bg-white/5 border-white/10 text-neutral-400 hover:bg-emerald-500/10 hover:text-emerald-400'
            }`}>
            {venue.active ? <><ToggleRight className="w-4 h-4" /><span>Active</span></> : <><ToggleLeft className="w-4 h-4" /><span>Inactive</span></>}
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowOffersModal(true)}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-indigo-600/20 border border-indigo-500/35 text-indigo-400 hover:bg-indigo-600/30 transition-all">
            <Zap className="w-3.5 h-3.5 animate-pulse" />
            <span>Offers & Passes</span>
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
            <Calendar className="w-3.5 h-3.5" />
            <span>{expanded ? 'Hide Slots' : 'Manage Slots'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
          <button onClick={() => onDelete(venue.id)}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-neutral-500 hover:text-rose-400 hover:border-rose-500/20 transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showOffersModal && (
          <ManageOffersModal 
            venue={venue} 
            onClose={() => setShowOffersModal(false)} 
            venueOffers={venueOffers}
            setVenueOffers={setVenueOffers}
          />
        )}
      </AnimatePresence>

      {/* Expanded: Slot Grid */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-white/5">
            <div className="p-5">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 mb-4">
                Weekly Slot Availability — {venue.name}
              </h4>
              <SlotGrid venue={venue} onUpdateSlot={onUpdateSlot} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Main Page ──────────────────────────────────────── */
export default function VenueManager({ venueOffers, setVenueOffers }) {
  const [venues, setVenues] = useState(() =>
    INITIAL_VENUES.map(v => ({ ...v, slots: generateSlots() }))
  );
  const [addOpen, setAddOpen] = useState(false);

  const totalRevenue = venues.reduce((sum, v) => sum + v.revenue.week, 0);
  const totalBooked = venues.reduce((sum, v) => sum + v.bookedToday, 0);
  const totalSlots = venues.reduce((sum, v) => sum + v.totalSlots, 0);

  const handleAdd = (newVenue) => setVenues(prev => [newVenue, ...prev]);

  const handleToggleActive = (id) => {
    setVenues(prev => prev.map(v => v.id === id ? { ...v, active: !v.active } : v));
  };

  const handleUpdateSlot = (venueId, day, time, newStatus) => {
    setVenues(prev => prev.map(v => {
      if (v.id !== venueId) return v;
      return {
        ...v,
        slots: { ...v.slots, [day]: { ...(v.slots[day] || {}), [time]: newStatus } }
      };
    }));
  };

  const handleDelete = (id) => setVenues(prev => prev.filter(v => v.id !== id));

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Building2 className="w-5 h-5 text-violet-400" />
            <span className="text-[10px] text-violet-400 uppercase font-extrabold tracking-widest">Owner Dashboard</span>
          </div>
          <h1 className="text-3xl font-black font-display tracking-tight uppercase text-white">Venue Manager</h1>
          <p className="text-xs text-neutral-500 mt-1">Manage your venues, slots, pricing, and availability</p>
        </div>

        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center space-x-2 px-6 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-[0_0_20px_rgba(139,92,246,0.25)]">
          <Plus className="w-4 h-4" />
          <span>Add Venue</span>
        </button>
      </div>

      {/* ── Summary Stats ──────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Venues', value: venues.length, sub: `${venues.filter(v=>v.active).length} active`, icon: <Building2 className="w-4 h-4" />, color: 'indigo' },
          { label: 'Slots Booked Today', value: `${totalBooked}/${totalSlots}`, sub: `${Math.round(totalBooked/totalSlots*100)||0}% occupancy`, icon: <Calendar className="w-4 h-4" />, color: 'violet' },
          { label: 'Weekly Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, sub: 'Across all venues', icon: <IndianRupee className="w-4 h-4" />, color: 'emerald' },
          { label: 'Avg Rating', value: (venues.reduce((s,v)=>s+(v.rating||0),0)/venues.length||0).toFixed(1), sub: 'Player reviews', icon: <Star className="w-4 h-4" />, color: 'amber' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="glass-card p-5 border border-white/5">
            <div className={`inline-flex p-2 rounded-xl mb-3 ${
              stat.color === 'indigo' ? 'bg-indigo-500/10 text-indigo-400' :
              stat.color === 'violet' ? 'bg-violet-500/10 text-violet-400' :
              stat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' :
              'bg-amber-500/10 text-amber-400'
            }`}>
              {stat.icon}
            </div>
            <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">{stat.label}</p>
            <p className="text-xl font-black text-white font-display mt-1">{stat.value}</p>
            <p className="text-[10px] text-neutral-600 mt-0.5">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Venues List ────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-neutral-400">
            Your Venues <span className="text-neutral-600 ml-1">({venues.length})</span>
          </h2>
        </div>

        {venues.length === 0 ? (
          <div className="glass-card p-12 text-center border border-dashed border-white/10">
            <Building2 className="w-10 h-10 text-neutral-700 mx-auto mb-4" />
            <h3 className="text-white font-bold text-base font-display mb-2">No Venues Yet</h3>
            <p className="text-neutral-500 text-sm mb-6">List your first venue to start accepting bookings.</p>
            <button onClick={() => setAddOpen(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-violet-600 text-white font-bold text-xs uppercase rounded-full transition-colors hover:bg-violet-500">
              <Plus className="w-4 h-4" />
              <span>Add My First Venue</span>
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {venues.map(venue => (
              <VenueCard
                key={venue.id}
                venue={venue}
                onToggleActive={handleToggleActive}
                onUpdateSlot={handleUpdateSlot}
                onDelete={handleDelete}
                venueOffers={venueOffers}
                setVenueOffers={setVenueOffers}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Add Venue Modal ─────────────────────────────── */}
      <AnimatePresence>
        {addOpen && <AddVenueModal onClose={() => setAddOpen(false)} onAdd={handleAdd} />}
      </AnimatePresence>
    </div>
  );
}
