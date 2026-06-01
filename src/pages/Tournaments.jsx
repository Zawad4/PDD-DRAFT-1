import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Plus, Users, Calendar, IndianRupee, Clock, ChevronRight,
  Flame, Shield, Star, MapPin, Filter, CheckCircle, X, Edit3, Trash2,
  ArrowRight, Crown, Medal, Swords, AlertCircle, Phone, FileText, Target
} from 'lucide-react';
import SportIcon from '../components/SportIcon';

/* ─── Static Data ─────────────────────────────────────── */
const SPORTS_TABS = ['All', 'Football', 'Badminton', 'Table Tennis', 'Bowling', 'Cricket'];

const TOURNAMENTS = [
  {
    id: 1,
    title: 'Vanguard Weekend Football Gold Cup',
    sport: 'Football',
    image: '/trophy.png',
    prizePool: '₹2,00,000',
    prizeRaw: 200000,
    entryFee: '₹249',
    date: 'June 14–15, 2026',
    venue: 'Vanguard Sports Arena, Chennai',
    slots: 16,
    filled: 11,
    status: 'Open',
    format: 'Knockout',
    level: 'Intermediate',
    organizer: 'Vanguard FC',
    registered: false,
  },
  {
    id: 2,
    title: 'Championship Table Tennis Open',
    sport: 'Table Tennis',
    image: 'https://images.unsplash.com/photo-1511067007398-7e4b90cfa4bc?q=80&w=800',
    prizePool: '₹83,000',
    prizeRaw: 83000,
    entryFee: '₹149',
    date: 'June 21, 2026',
    venue: 'Elite Courts, Bangalore',
    slots: 32,
    filled: 28,
    status: 'Open',
    format: 'Round Robin + Knockout',
    level: 'Advanced',
    organizer: 'TT Masters League',
    registered: true,
  },
  {
    id: 3,
    title: 'Smash Club Badminton Pro Series',
    sport: 'Badminton',
    image: '/smash_club_badminton.jpg',
    prizePool: '₹1,25,000',
    prizeRaw: 125000,
    entryFee: '₹199',
    date: 'July 5–6, 2026',
    venue: 'Smash Club, Mumbai',
    slots: 24,
    filled: 10,
    status: 'Open',
    format: 'League + Knockout',
    level: 'All Levels',
    organizer: 'Badminton Elite Doubles',
    registered: false,
  },
  {
    id: 4,
    title: 'HyperBowl League Night Championship',
    sport: 'Bowling',
    image: '/bowling.jpg',
    prizePool: '₹50,000',
    prizeRaw: 50000,
    entryFee: '₹99',
    date: 'June 28, 2026',
    venue: 'Apex Bowling & Games, Delhi',
    slots: 20,
    filled: 20,
    status: 'Full',
    format: 'League',
    level: 'Beginner Friendly',
    organizer: 'Bowling League Syndicate',
    registered: false,
  },
];

/* Owner's managed tournaments */
const MY_TOURNAMENTS = [
  {
    id: 101,
    title: 'Vanguard Summer Football Cup',
    sport: 'Football',
    image: '/trophy.png',
    prizePool: '₹1,50,000',
    entryFee: '₹299',
    date: 'July 12–13, 2026',
    slots: 16,
    filled: 7,
    status: 'Draft',
    registrations: [
      { name: 'Rahul Sharma', team: 'Alpha FC', paid: true },
      { name: 'Sonia Verma', team: 'Star Strikers', paid: true },
      { name: 'Amit Patel', team: 'Thunder United', paid: false },
    ],
  },
];

const LEVEL_COLORS = {
  'Advanced': 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  'Intermediate': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  'All Levels': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'Beginner Friendly': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
};

const SPORT_COLORS = {
  Football:      { color: 'emerald' },
  Badminton:     { color: 'indigo' },
  'Table Tennis':{ color: 'rose' },
  Bowling:       { color: 'cyan' },
  Cricket:       { color: 'amber' },
};

/* ─── Payment Modal ──────────────────────────────────── */
function PaymentModal({ tournament, onClose, onSuccess }) {
  const [step, setStep] = useState('confirm'); // confirm | processing | success

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => setStep('success'), 2000);
    setTimeout(() => { onSuccess(tournament.id); onClose(); }, 3200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black" />
      <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="relative glass-card w-full max-w-[420px] p-7 border border-white/10 shadow-2xl z-10 text-left">

        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-400 hover:text-white transition-all">
          <X className="w-4 h-4" />
        </button>

        {step === 'confirm' && (
          <div className="space-y-5">
            <div>
              <p className="text-[10px] text-indigo-400 uppercase font-extrabold tracking-widest mb-1">Tournament Registration</p>
              <h3 className="font-display font-black text-white text-lg leading-tight">{tournament.title}</h3>
              <p className="text-xs text-neutral-400 mt-1">{tournament.date} • {tournament.venue}</p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-neutral-400">Entry Fee</span><span className="text-white font-bold">{tournament.entryFee}</span></div>
              <div className="flex justify-between"><span className="text-neutral-400">GST (18%)</span><span className="text-white font-bold">₹{Math.round(parseInt(tournament.entryFee.replace(/[^0-9]/g,'')) * 0.18)}</span></div>
              <div className="h-px bg-white/5" />
              <div className="flex justify-between"><span className="text-white font-bold">Total</span>
                <span className="text-indigo-400 font-black text-base">
                  ₹{Math.round(parseInt(tournament.entryFee.replace(/[^0-9]/g,'')) * 1.18)}
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 text-xs text-neutral-400 bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-3">
              <Shield className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <p>Prepaid registration guarantees your slot. Refundable up to 48 hours before event.</p>
            </div>

            <button onClick={handlePay}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-full transition-colors flex items-center justify-center space-x-2">
              <IndianRupee className="w-3.5 h-3.5" />
              <span>Pay & Register</span>
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center py-8 space-y-4">
            <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-white font-bold text-sm">Processing Payment...</p>
            <p className="text-neutral-500 text-xs">Securing your tournament slot</p>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center py-8 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-emerald-400" />
            </div>
            <p className="text-white font-black text-lg font-display">You're Registered!</p>
            <p className="text-neutral-400 text-xs text-center">Confirmation sent. See you at the tournament!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ─── Create Tournament Form (Owner) ─────────────────── */
function CreateTournamentForm({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '', sport: 'Football', startDate: '', endDate: '', venue: '', city: '',
    prizePool: '', entryFee: '', slots: '16', format: 'Knockout', level: 'All Levels',
    teamSize: '1', registrationDeadline: '', contactPhone: '', contactEmail: '',
    rules: '', description: '', image: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreated(form);
    onClose();
  };

  const inputClass = "w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/50 transition-colors";
  const labelClass = "text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1.5 block";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="relative glass-card w-full max-w-[560px] border border-white/10 shadow-2xl z-10 text-left mb-8">

        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="font-display font-black text-white text-lg uppercase tracking-tight">Create Tournament</h3>
            <p className="text-[10px] text-neutral-500 mt-0.5">Fill in details to publish your event</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/5 border border-white/10 text-neutral-400 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Tournament name */}
          <div>
            <label className={labelClass}>Tournament Name *</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required
              placeholder="e.g. Summer Football Gold Cup" className={inputClass} />
          </div>

          {/* Sport + Format */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Sport *</label>
              <select value={form.sport} onChange={e => setForm({...form, sport: e.target.value})} className={inputClass}>
                {['Football','Badminton','Table Tennis','Bowling','Cricket'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Format *</label>
              <select value={form.format} onChange={e => setForm({...form, format: e.target.value})} className={inputClass}>
                {['Knockout','Round Robin','League + Knockout','Round Robin + Knockout','Swiss System'].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          {/* Prize + Entry Fee */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Prize Pool (₹) *</label>
              <input value={form.prizePool} onChange={e => setForm({...form, prizePool: e.target.value})} required
                placeholder="e.g. 1,00,000" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Entry Fee (₹) *</label>
              <input value={form.entryFee} onChange={e => setForm({...form, entryFee: e.target.value})} required
                placeholder="e.g. 499" className={inputClass} />
            </div>
          </div>

          {/* Team size + slots */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Team / Player Size</label>
              <select value={form.teamSize} onChange={e => setForm({...form, teamSize: e.target.value})} className={inputClass}>
                {['1','2','3','4','5','6','7','8','11','15'].map(n => <option key={n} value={n}>{n === '1' ? 'Individual' : `${n} per team`}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Total Slots *</label>
              <select value={form.slots} onChange={e => setForm({...form, slots: e.target.value})} className={inputClass}>
                {['8','12','16','24','32','48','64'].map(n => <option key={n} value={n}>{n} Teams/Players</option>)}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Date *</label>
              <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Registration Deadline</label>
            <input type="date" value={form.registrationDeadline} onChange={e => setForm({...form, registrationDeadline: e.target.value})} className={inputClass} />
          </div>

          {/* Venue */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Venue Name *</label>
              <input value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} required
                placeholder="e.g. Vanguard Sports Arena" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>City</label>
              <input value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                placeholder="e.g. Chennai" className={inputClass} />
            </div>
          </div>

          {/* Skill level */}
          <div>
            <label className={labelClass}>Skill Level</label>
            <select value={form.level} onChange={e => setForm({...form, level: e.target.value})} className={inputClass}>
              {['All Levels','Beginner Friendly','Intermediate','Advanced','Elite'].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
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
                placeholder="organizer@email.com" className={inputClass} />
            </div>
          </div>

          {/* Rules */}
          <div>
            <label className={labelClass}>Rules & Format Details</label>
            <textarea value={form.rules} onChange={e => setForm({...form, rules: e.target.value})}
              rows={3} placeholder="e.g. Each team must have min 7 players. No studs allowed on astroturf..." className={`${inputClass} resize-none`} />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Tournament Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              rows={2} placeholder="Brief overview, prizes, special awards..." className={`${inputClass} resize-none`} />
          </div>

          <button type="submit"
            className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-full transition-colors flex items-center justify-center space-x-2">
            <Trophy className="w-4 h-4" />
            <span>Publish Tournament</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────── */
export default function Tournaments({ role }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [tournaments, setTournaments] = useState(TOURNAMENTS);
  const [myTournaments, setMyTournaments] = useState(MY_TOURNAMENTS);
  const [payModal, setPayModal] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [expandedOwnerTournament, setExpandedOwnerTournament] = useState(null);

  const isOwner = role === 'owner';

  const filtered = tournaments.filter(t =>
    activeFilter === 'All' || t.sport === activeFilter
  );

  const handleRegistered = (id) => {
    setTournaments(prev => prev.map(t => t.id === id ? { ...t, registered: true, filled: t.filled + 1 } : t));
  };

  const handleCreate = (form) => {
    const newT = {
      id: Date.now(),
      title: form.title,
      sport: form.sport,
      image: `https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800`,
      prizePool: `₹${form.prizePool}`,
      entryFee: `₹${form.entryFee}`,
      date: form.date,
      slots: parseInt(form.slots),
      filled: 0,
      status: 'Draft',
      registrations: [],
    };
    setMyTournaments(prev => [newT, ...prev]);
  };

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* ── Header ───────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Trophy className="w-5 h-5 text-indigo-400" />
            <span className="text-[10px] text-indigo-400 uppercase font-extrabold tracking-widest">
              {isOwner ? 'Tournament Management' : 'Compete & Win'}
            </span>
          </div>
          <h1 className="text-3xl font-black font-display tracking-tight uppercase text-white">
            {isOwner ? 'Your Tournaments' : 'Tournaments'}
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            {isOwner
              ? 'Create, manage and track all your hosted tournaments'
              : 'Register for upcoming tournaments and win prize money in ₹'}
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center space-x-2 px-6 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-[0_0_20px_rgba(139,92,246,0.2)]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Tournament</span>
          </button>
        )}
      </div>

      {/* ── OWNER: My Tournaments Section ────────────── */}
      {isOwner && (
        <div className="mb-12">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-neutral-400 mb-5">My Hosted Tournaments</h2>
          <div className="space-y-4">
            {myTournaments.length === 0 ? (
              <div className="glass-card p-10 text-center border border-dashed border-white/10">
                <Trophy className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
                <p className="text-neutral-500 text-sm">No tournaments yet. Create your first one!</p>
              </div>
            ) : (
              myTournaments.map(t => (
                <motion.div key={t.id} layout className="glass-card border border-white/5 overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 p-5">
                    <div className="w-full md:w-28 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={t.image} alt={t.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[9px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400">
                          {t.status}
                        </span>
                        <span className="text-[9px] text-neutral-500">{t.sport}</span>
                      </div>
                      <h3 className="font-display font-bold text-white text-base">{t.title}</h3>
                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-neutral-400">
                        <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" />{t.date}</span>
                        <span className="flex items-center"><Users className="w-3 h-3 mr-1" />{t.filled}/{t.slots} Registered</span>
                        <span className="flex items-center"><IndianRupee className="w-3 h-3 mr-0.5" />{t.prizePool.replace('₹','')}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={() => setExpandedOwnerTournament(expandedOwnerTournament === t.id ? null : t.id)}
                        className="text-xs px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-bold"
                      >
                        {expandedOwnerTournament === t.id ? 'Collapse' : 'View Registrations'}
                      </button>
                      <button className="p-2 rounded-full bg-white/5 border border-white/10 text-neutral-400 hover:text-violet-400 transition-colors">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-2 rounded-full bg-white/5 border border-white/10 text-neutral-400 hover:text-rose-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Registrations Drawer */}
                  <AnimatePresence>
                    {expandedOwnerTournament === t.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5 overflow-hidden"
                      >
                        <div className="p-5">
                          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 mb-4">
                            Registered Participants ({t.registrations.length})
                          </h4>
                          {t.registrations.length === 0 ? (
                            <p className="text-neutral-600 text-xs">No registrations yet.</p>
                          ) : (
                            <div className="space-y-2">
                              {t.registrations.map((r, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs">
                                  <div>
                                    <span className="font-bold text-white">{r.name}</span>
                                    <span className="text-neutral-500 ml-2">{r.team}</span>
                                  </div>
                                  <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                                    r.paid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  }`}>
                                    {r.paid ? 'Paid' : 'Pending'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Sport Filter Tabs ─────────────────────────── */}
      <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2 mb-8">
        {SPORTS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${
              activeFilter === tab
                ? 'bg-white text-black border-transparent'
                : 'bg-white/[0.03] text-neutral-400 border-white/8 hover:border-white/20 hover:text-white'
            }`}
          >
            {tab !== 'All' && <SportIcon sport={tab} size={12} />}
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tournament Cards Grid ─────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-neutral-400">
            {isOwner ? 'All Upcoming Tournaments' : 'Open Tournaments'}
            <span className="ml-2 text-neutral-600">({filtered.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
          {filtered.map((t, i) => {
            const sportMeta = SPORT_COLORS[t.sport] || { icon: '🏆', color: 'indigo' };
            const fillPct = Math.round((t.filled / t.slots) * 100);
            const isFull = t.status === 'Full';

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="glass-card overflow-hidden border border-white/5 hover:border-white/10 transition-all duration-300 group"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <img src={t.image} alt={t.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 brightness-75" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                  {/* Prize badge */}
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2">
                    <p className="text-[8px] text-neutral-300 uppercase font-bold tracking-widest">Prize Pool</p>
                    <p className="text-lg font-black text-white font-display">{t.prizePool}</p>
                  </div>

                  {/* Status badge */}
                  <div className={`absolute top-4 right-4 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider border backdrop-blur-md ${
                    isFull ? 'bg-neutral-900/80 text-neutral-400 border-white/10' : 'bg-indigo-600/80 text-white border-indigo-500/30'
                  }`}>
                    {isFull ? '🔴 Full' : '🟢 Open'}
                  </div>

                  {/* Registered check */}
                  {t.registered && (
                    <div className="absolute bottom-4 left-4 flex items-center space-x-1.5 bg-emerald-600/80 backdrop-blur-md px-2.5 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3 text-white" />
                      <span className="text-[9px] text-white font-extrabold uppercase tracking-wider">Registered</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-display font-bold text-white text-base leading-tight">{t.title}</h3>
                      <p className="text-xs text-neutral-400 mt-0.5 flex items-center">
                        <MapPin className="w-3 h-3 mr-1 text-neutral-500" />{t.venue}
                      </p>
                    </div>
                  </div>

                  {/* Meta tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded border ${LEVEL_COLORS[t.level] || 'text-neutral-400 bg-white/5 border-white/10'}`}>
                      {t.level}
                    </span>
                    <span className="text-[10px] font-bold text-neutral-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded uppercase">
                      {t.format}
                    </span>
                    <span className="text-[10px] font-bold text-neutral-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded uppercase flex items-center gap-1.5">
                      <SportIcon sport={t.sport} size={11} />
                      {t.sport}
                    </span>
                  </div>

                  {/* Info row */}
                  <div className="flex flex-wrap gap-4 text-xs text-neutral-400 mb-4">
                    <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" />{t.date}</span>
                    <span className="flex items-center"><Users className="w-3 h-3 mr-1" />{t.filled}/{t.slots}</span>
                    <span className="flex items-center font-semibold text-white">Entry: {t.entryFee}</span>
                  </div>

                  {/* Slots progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[9px] text-neutral-500 mb-1.5">
                      <span>{t.filled} registered</span>
                      <span>{t.slots - t.filled} slots left</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${fillPct >= 90 ? 'bg-rose-500' : fillPct >= 60 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  {!isOwner && (
                    <button
                      onClick={() => !isFull && !t.registered && setPayModal(t)}
                      disabled={isFull || t.registered}
                      className={`w-full py-3 rounded-full text-xs font-extrabold uppercase tracking-widest transition-all duration-300 ${
                        t.registered
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-default'
                          : isFull
                          ? 'bg-white/5 border border-white/10 text-neutral-600 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                      }`}
                    >
                      {t.registered ? '✓ You\'re In' : isFull ? 'Tournament Full' : `Register — ${t.entryFee}`}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────── */}
      <AnimatePresence>
        {payModal && (
          <PaymentModal
            tournament={payModal}
            onClose={() => setPayModal(null)}
            onSuccess={handleRegistered}
          />
        )}
        {createOpen && (
          <CreateTournamentForm
            onClose={() => setCreateOpen(false)}
            onCreated={handleCreate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
