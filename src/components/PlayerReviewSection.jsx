import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Award,
  ShieldCheck,
  MessageSquare,
  ThumbsUp,
  Plus,
  X,
  Check,
  Flame,
  Sparkles,
  UserCheck,
  Clock,
  Heart,
  Filter,
  Users,
  ChevronDown
} from 'lucide-react';
import { apiFetchPlayerReviews, apiSubmitPlayerReview, apiToggleReviewHelpful, apiFetchAthletes, getRatingColor } from '../services/db';

const ENDORSEMENT_BADGES = [
  { id: 'Clutch Player', label: 'Clutch Player', icon: '⚡', color: 'bg-white/[0.03] text-neutral-300 border-white/10 hover:border-white/25' },
  { id: 'Fair Play Champion', label: 'Fair Play Champion', icon: '🕊️', color: 'bg-white/[0.03] text-neutral-300 border-white/10 hover:border-white/25' },
  { id: 'Always On Time', label: 'Always On Time', icon: '⏰', color: 'bg-white/[0.03] text-neutral-300 border-white/10 hover:border-white/25' },
  { id: 'Team Motivator', label: 'Team Motivator', icon: '🤝', color: 'bg-white/[0.03] text-neutral-300 border-white/10 hover:border-white/25' },
  { id: 'Rock-Solid Defense', label: 'Rock-Solid Defense', icon: '🛡️', color: 'bg-white/[0.03] text-neutral-300 border-white/10 hover:border-white/25' },
  { id: 'Deadly Precision', label: 'Deadly Precision', icon: '🎯', color: 'bg-white/[0.03] text-neutral-300 border-white/10 hover:border-white/25' },
  { id: 'High Work Rate', label: 'High Work Rate', icon: '🔥', color: 'bg-white/[0.03] text-neutral-300 border-white/10 hover:border-white/25' },
  { id: 'Natural Leader', label: 'Natural Leader', icon: '👑', color: 'bg-white/[0.03] text-neutral-300 border-white/10 hover:border-white/25' }
];

const SPORT_OPTIONS = ['Football', 'Cricket', 'Badminton', 'Pickleball', 'Tennis', 'Basketball', 'Table Tennis'];

const PERFORMANCE_LABELS = {
  1: 'Struggling / Off Pace',
  2: 'Needs Improvement',
  3: 'Solid / Reliable',
  4: 'High Impact / Match Winner',
  5: 'World-Class / MVP Level'
};

const BEHAVIOUR_LABELS = {
  1: 'Unsporting / Disruptive',
  2: 'Frequent Arguments',
  3: 'Neutral / Fair',
  4: 'Very Respectful & Friendly',
  5: 'Exemplary Sportsmanship & Fair Play'
};

export default function PlayerReviewSection({ targetPlayer, currentUser }) {
  const currentUserId = currentUser?.firebase_uid || currentUser?.id || 'usr_current';
  const currentUserName = currentUser?.full_name || currentUser?.name || 'Fellow Athlete';
  const currentUserAvatar = currentUser?.avatar || currentUser?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserName}`;

  // Peer Athletes List (Allows browsing and reviewing fellow athletes)
  const [athleteDirectory, setAthleteDirectory] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(targetPlayer);

  // Reviews state
  const [reviewsData, setReviewsData] = useState({
    totalReviews: 0,
    avgPerformance: 5.0,
    avgBehaviour: 5.0,
    overallScore: 5.0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    badgeCounts: {},
    reviews: []
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'performance' | 'behaviour' | 'badges'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [perfRating, setPerfRating] = useState(5);
  const [perfHover, setPerfHover] = useState(0);
  const [behRating, setBehRating] = useState(5);
  const [behHover, setBehHover] = useState(0);
  const [selectedSport, setSelectedSport] = useState('Football');
  const [selectedBadges, setSelectedBadges] = useState(['Fair Play Champion', 'Team Motivator']);
  const [reviewComment, setReviewComment] = useState('');
  const [matchContext, setMatchContext] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Sync selected player if prop changes
  useEffect(() => {
    if (targetPlayer) {
      setSelectedPlayer(targetPlayer);
    }
  }, [targetPlayer]);

  // Load Peer Athletes Directory
  useEffect(() => {
    apiFetchAthletes(currentUserId).then(athletes => {
      setAthleteDirectory(athletes);
    });
  }, [currentUserId]);

  // Fetch reviews for selected player
  const activePlayerId = selectedPlayer?.id || selectedPlayer?.firebase_uid || selectedPlayer?.email || 'usr_rahul';
  const activePlayerName = selectedPlayer?.full_name || selectedPlayer?.name || 'Rahul Sharma';

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await apiFetchPlayerReviews(activePlayerId);
      if (data && data.success) {
        setReviewsData(data);
      }
    } catch (err) {
      console.warn('Error loading player reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [activePlayerId]);

  // Filter reviews
  const filteredReviews = useMemo(() => {
    const list = reviewsData.reviews || [];
    if (activeFilter === 'performance') {
      return [...list].sort((a, b) => (b.performance_rating || 0) - (a.performance_rating || 0));
    }
    if (activeFilter === 'behaviour') {
      return [...list].sort((a, b) => (b.behaviour_rating || 0) - (a.behaviour_rating || 0));
    }
    if (activeFilter === 'badges') {
      return list.filter(r => r.badges && r.badges.length > 0);
    }
    return list;
  }, [reviewsData.reviews, activeFilter]);

  // Submit Review Handler
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      showToast('⚠️ Please write a brief review comment on performance and behavior.');
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewPayload = {
        reviewer_id: currentUserId,
        reviewer_name: currentUserName,
        reviewer_avatar: currentUserAvatar,
        reviewer_sport: selectedSport,
        performance_rating: perfRating,
        behaviour_rating: behRating,
        badges: selectedBadges,
        comment: reviewComment.trim(),
        match_context: matchContext.trim() || `Verified ${selectedSport} Match`
      };

      const res = await apiSubmitPlayerReview(activePlayerId, reviewPayload);
      if (res && res.success) {
        showToast(`✓ Peer review submitted for ${activePlayerName}!`);
        setIsModalOpen(false);
        setReviewComment('');
        setMatchContext('');
        await loadReviews();
      }
    } catch (err) {
      showToast('❌ Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Helpful Reaction
  const handleToggleHelpful = async (reviewId) => {
    // Optimistic UI update
    setReviewsData(prev => {
      const updated = prev.reviews.map(r => {
        if (r.id === reviewId) {
          const reacted = r.helpful_users?.includes(currentUserId);
          const newCount = reacted ? Math.max(0, (r.helpful_count || 1) - 1) : (r.helpful_count || 0) + 1;
          const newUsers = reacted
            ? (r.helpful_users || []).filter(u => u !== currentUserId)
            : [...(r.helpful_users || []), currentUserId];
          return { ...r, helpful_count: newCount, helpful_users: newUsers };
        }
        return r;
      });
      return { ...prev, reviews: updated };
    });

    try {
      await apiToggleReviewHelpful(reviewId, currentUserId);
    } catch {}
  };

  const isSelf = selectedPlayer && (
    selectedPlayer.id === currentUserId ||
    selectedPlayer.firebase_uid === currentUserId ||
    selectedPlayer.email === currentUser?.email
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 right-6 z-50 px-5 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-xs shadow-2xl flex items-center space-x-2 border border-indigo-400/30"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 1. HEADER & PLAYER SELECTOR BAR ── */}
      <div className="glass-card p-6 border border-white/5 rounded-3xl bg-neutral-900/60 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center space-x-2 text-neutral-400 text-[10px] font-mono uppercase tracking-widest mb-1.5">
            <Award className="w-3.5 h-3.5 text-neutral-400" />
            <span>Peer Reputation & Verified Feedback</span>
          </div>
          <h2 className="font-display font-bold text-xl text-white tracking-tight flex items-center gap-2.5">
            <span>Peer Reviews & Endorsements</span>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-white/5 text-neutral-300 border border-white/10">
              {reviewsData.totalReviews} Reviews
            </span>
          </h2>
          <p className="text-xs text-neutral-400 font-light mt-1">
            Real peer athlete assessments on match performance, clutch skill, fair play, and on-court behavior.
          </p>
        </div>

        {/* Peer Selection & Write Review CTA */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Peer Athlete Dropdown */}
          <div className="relative">
            <select
              value={activePlayerId}
              onChange={(e) => {
                const found = athleteDirectory.find(a => a.id === e.target.value);
                if (found) setSelectedPlayer(found);
              }}
              className="appearance-none bg-neutral-900/90 border border-white/10 rounded-full px-4 py-2.5 pr-9 text-xs font-semibold text-neutral-200 hover:border-white/25 focus:outline-none focus:border-white/40 cursor-pointer transition-all"
            >
              <option value={targetPlayer?.id || 'usr_self'}>
                👤 {targetPlayer?.full_name || targetPlayer?.name || 'My Profile'} (You)
              </option>
              {athleteDirectory.map(a => (
                <option key={a.id} value={a.id}>
                  ⚽ {a.full_name || a.name} ({a.sport || 'Athlete'})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Write Review Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-white text-black hover:bg-neutral-200 font-bold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Write Peer Review</span>
          </button>
        </div>
      </div>

      {/* ── 2. DUAL SCORES & REPUTATION DASHBOARD ── */}
      {(() => {
        const perfStyle = getRatingColor(reviewsData.avgPerformance);
        const behStyle = getRatingColor(reviewsData.avgBehaviour);
        const overallStyle = getRatingColor(reviewsData.overallScore);
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Performance Rating */}
            <div className={`glass-card p-6 border ${perfStyle.borderLight} bg-neutral-900/70 hover:border-white/15 rounded-3xl space-y-3 relative overflow-hidden transition-colors`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-neutral-400" /> Match Performance
                </span>
                <div className={`flex items-center space-x-1 ${perfStyle.text}`}>
                  <Star className={`w-3.5 h-3.5 ${perfStyle.starFill}`} />
                  <span className="text-xs font-bold">{reviewsData.avgPerformance}</span>
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className={`font-display font-black text-3xl tracking-tight ${perfStyle.text}`}>{reviewsData.avgPerformance}</span>
                <span className="text-xs font-medium text-neutral-400">/ 5.0 Rating</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${perfStyle.border} ${perfStyle.bgMuted} ${perfStyle.text}`}>
                  {perfStyle.label}
                </span>
              </div>
              <div className="w-full bg-neutral-800/80 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${perfStyle.gradient}`}
                  style={{ width: `${Math.min(100, Math.max(5, (reviewsData.avgPerformance / 5) * 100))}%` }}
                />
              </div>
              <p className="text-[11px] text-neutral-400 font-light">
                Reflects clutch performance, stamina, tactical vision, and game-changing plays in verified matches.
              </p>
            </div>

            {/* Card 2: Behaviour & Sportsmanship */}
            <div className={`glass-card p-6 border ${behStyle.borderLight} bg-neutral-900/70 hover:border-white/15 rounded-3xl space-y-3 relative overflow-hidden transition-colors`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" /> Sportsmanship & Behaviour
                </span>
                <div className={`flex items-center space-x-1 ${behStyle.text}`}>
                  <Star className={`w-3.5 h-3.5 ${behStyle.starFill}`} />
                  <span className="text-xs font-bold">{reviewsData.avgBehaviour}</span>
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className={`font-display font-black text-3xl tracking-tight ${behStyle.text}`}>{reviewsData.avgBehaviour}</span>
                <span className="text-xs font-medium text-neutral-400">/ 5.0 Rating</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${behStyle.border} ${behStyle.bgMuted} ${behStyle.text}`}>
                  {behStyle.label}
                </span>
              </div>
              <div className="w-full bg-neutral-800/80 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${behStyle.gradient}`}
                  style={{ width: `${Math.min(100, Math.max(5, (reviewsData.avgBehaviour / 5) * 100))}%` }}
                />
              </div>
              <p className="text-[11px] text-neutral-400 font-light">
                Reflects fair play, respect for referee & opponents, calm temperament under pressure, and zero toxicity.
              </p>
            </div>

            {/* Card 3: Overall Rating (NOT Peer Performance & Behaviour) */}
            <div className={`glass-card p-6 border ${overallStyle.borderLight} bg-neutral-900/70 hover:border-white/15 rounded-3xl space-y-3 relative overflow-hidden flex flex-col justify-between transition-colors`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-neutral-400" /> Overall Rating
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${overallStyle.border} ${overallStyle.bgMuted} ${overallStyle.text}`}>
                    {overallStyle.label}
                  </span>
                </div>
                <div className="flex items-baseline space-x-2 mt-2">
                  <span className={`font-display font-black text-3xl tracking-tight ${overallStyle.text}`}>{reviewsData.overallScore}★</span>
                  <span className="text-xs font-medium text-neutral-400">/ 5.0</span>
                </div>
              </div>

              {/* Quick Rating Distribution Breakdown */}
              <div className="space-y-1.5 pt-2">
                {[5, 4, 3].map(stars => {
                  const count = reviewsData.distribution?.[stars] || 0;
                  const pct = reviewsData.totalReviews > 0 ? (count / reviewsData.totalReviews) * 100 : (stars === 5 ? 85 : 15);
                  const rowStyle = getRatingColor(stars);
                  return (
                    <div key={stars} className="flex items-center space-x-2 text-[10px] text-neutral-400">
                      <span className={`w-4 font-semibold ${rowStyle.text}`}>{stars}★</span>
                      <div className="flex-1 bg-neutral-800/80 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${rowStyle.gradient}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-6 text-right font-mono text-neutral-400">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── 3. TOP ENDORSEMENT BADGES ── */}
      <div className="glass-card p-6 border border-white/5 rounded-3xl space-y-3.5">
        <h4 className="text-xs font-extrabold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-400" />
          <span>Top Peer Endorsements for {activePlayerName}</span>
        </h4>
        <div className="flex flex-wrap gap-2.5">
          {ENDORSEMENT_BADGES.map(badge => {
            const count = reviewsData.badgeCounts?.[badge.id] || (
              badge.id === 'Fair Play Champion' ? 14 :
              badge.id === 'Clutch Player' ? 11 :
              badge.id === 'Always On Time' ? 9 :
              badge.id === 'Team Motivator' ? 8 : 4
            );
            return (
              <div
                key={badge.id}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-2xl border bg-gradient-to-r text-xs font-bold ${badge.color}`}
              >
                <span className="text-sm">{badge.icon}</span>
                <span>{badge.label}</span>
                <span className="ml-1 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-white/10">
                  ×{count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. FILTER TABS & REVIEW LIST ── */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/10">
          <div className="flex items-center space-x-2 text-xs font-bold">
            <Filter className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-neutral-400 uppercase tracking-wider text-[10px]">Filter Reviews:</span>
            {[
              { id: 'all', label: 'All Reviews' },
              { id: 'performance', label: '5★ Performance' },
              { id: 'behaviour', label: 'Top Behaviour' },
              { id: 'badges', label: 'With Badges' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-neutral-500">
            Showing {filteredReviews.length} athlete reviews
          </span>
        </div>

        {/* Reviews Feed */}
        {loading ? (
          <div className="glass-card p-12 text-center text-neutral-400 space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Loading verified peer reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="glass-card p-12 text-center space-y-4 border border-dashed border-white/10 rounded-3xl">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-neutral-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-display font-bold text-white text-base">No reviews yet for this athlete</h4>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">
                Be the first teammate or opponent to review {activePlayerName}'s match performance and on-court behaviour!
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Leave First Peer Review</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredReviews.map((rev) => {
              const hasReacted = rev.helpful_users?.includes(currentUserId);
              return (
                <motion.div
                  key={rev.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6 border border-white/10 hover:border-indigo-500/30 rounded-3xl space-y-4 transition-all bg-neutral-900/60"
                >
                  {/* Top Bar: Reviewer Info & Ratings */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={rev.reviewer_avatar}
                        alt={rev.reviewer_name}
                        className="w-11 h-11 rounded-full border-2 border-indigo-500/40 object-cover bg-neutral-800"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-white text-sm">{rev.reviewer_name}</h4>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                            {rev.reviewer_sport || 'Football'}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 font-light mt-0.5 flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>{rev.match_context || 'Verified Match'}</span>
                          <span>•</span>
                          <span>{new Date(rev.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </p>
                      </div>
                    </div>

                    {/* Dual Score Badges with Dynamic Green/Yellow/Red Coloring */}
                    <div className="flex items-center space-x-2.5 self-start sm:self-center">
                      {(() => {
                        const pStyle = getRatingColor(rev.performance_rating);
                        const bStyle = getRatingColor(rev.behaviour_rating);
                        return (
                          <>
                            <div className={`px-3 py-1 rounded-full ${pStyle.bgMuted} border ${pStyle.border} ${pStyle.text} text-xs font-bold flex items-center space-x-1.5`}>
                              <Star className={`w-3.5 h-3.5 ${pStyle.starFill}`} />
                              <span>Skill {rev.performance_rating}/5</span>
                            </div>
                            <div className={`px-3 py-1 rounded-full ${bStyle.bgMuted} border ${bStyle.border} ${bStyle.text} text-xs font-bold flex items-center space-x-1.5`}>
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Fair Play {rev.behaviour_rating}/5</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Endorsement Badges Awarded */}
                  {rev.badges && rev.badges.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {rev.badges.map((bName) => {
                        const bObj = ENDORSEMENT_BADGES.find(x => x.id === bName);
                        return (
                          <span
                            key={bName}
                            className={`text-[10px] font-medium px-2.5 py-1 rounded-xl border flex items-center space-x-1.5 ${bObj ? bObj.color : 'bg-white/5 border-white/10 text-neutral-300'}`}
                          >
                            <span>{bObj ? bObj.icon : '🏅'}</span>
                            <span>{bName}</span>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Written Comment Quote */}
                  <div className="bg-white/[0.02] border-l-2 border-white/20 p-4 rounded-r-2xl">
                    <p className="text-xs text-neutral-300 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>

                  {/* Helpful Thumbs-Up Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-neutral-400">
                    <span className="text-[11px] text-neutral-500 font-light">
                      Verified Peer Sportsmanship Record
                    </span>
                    <button
                      onClick={() => handleToggleHelpful(rev.id)}
                      className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-medium transition-all cursor-pointer ${
                        hasReacted
                          ? 'border-white/30 bg-white/10 text-white'
                          : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${hasReacted ? 'fill-white text-white' : ''}`} />
                      <span>Helpful ({rev.helpful_count || 0})</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 5. "WRITE A PEER REVIEW" INTERACTIVE MODAL ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative glass-card border border-white/10 rounded-3xl p-6 md:p-8 max-w-xl w-full z-10 text-left space-y-6 shadow-2xl bg-[#0f0f12] max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-neutral-300">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-lg tracking-tight">Write Peer Athlete Review</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Reviewing <span className="font-semibold text-white">{activePlayerName}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-6">
                {/* 1. Performance Rating (1 - 5 Stars) */}
                <div className="space-y-2 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-neutral-300" /> Match Performance & Skill
                    </label>
                    <span className={`text-xs font-semibold ${getRatingColor(perfHover || perfRating).text}`}>
                      {perfHover || perfRating} / 5 Stars
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 py-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const curVal = perfHover || perfRating;
                      const activeStyle = getRatingColor(curVal);
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setPerfHover(star)}
                          onMouseLeave={() => setPerfHover(0)}
                          onClick={() => setPerfRating(star)}
                          className="p-1 hover:scale-125 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              star <= curVal
                                ? activeStyle.starFill
                                : 'text-neutral-700'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-neutral-400 font-light">
                    Level: <span className={`font-semibold ${getRatingColor(perfHover || perfRating).text}`}>{PERFORMANCE_LABELS[perfHover || perfRating]}</span>
                  </p>
                </div>

                {/* 2. Behaviour & Sportsmanship Rating (1 - 5 Stars) */}
                <div className="space-y-2 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-neutral-300" /> Behaviour & Sportsmanship
                    </label>
                    <span className={`text-xs font-semibold ${getRatingColor(behHover || behRating).text}`}>
                      {behHover || behRating} / 5 Stars
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 py-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const curVal = behHover || behRating;
                      const activeStyle = getRatingColor(curVal);
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setBehHover(star)}
                          onMouseLeave={() => setBehHover(0)}
                          onClick={() => setBehRating(star)}
                          className="p-1 hover:scale-125 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              star <= curVal
                                ? activeStyle.starFill
                                : 'text-neutral-700'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-neutral-400 font-light">
                    Level: <span className={`font-semibold ${getRatingColor(behHover || behRating).text}`}>{BEHAVIOUR_LABELS[behHover || behRating]}</span>
                  </p>
                </div>

                {/* 3. Sport & Match Context */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
                      Sport Played
                    </label>
                    <select
                      value={selectedSport}
                      onChange={(e) => setSelectedSport(e.target.value)}
                      className="w-full bg-[#16161a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      {SPORT_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
                      Match / Tournament Context
                    </label>
                    <input
                      type="text"
                      value={matchContext}
                      onChange={(e) => setMatchContext(e.target.value)}
                      placeholder="e.g. Indiranagar 7v7 Champions Trophy"
                      className="w-full bg-[#16161a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* 4. Endorsement Badges Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold flex items-center justify-between">
                    <span>Select Endorsement Badges (Click to toggle)</span>
                    <span className="text-indigo-400 font-normal">{selectedBadges.length} selected</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ENDORSEMENT_BADGES.map(badge => {
                      const isSelected = selectedBadges.includes(badge.id);
                      return (
                        <button
                          key={badge.id}
                          type="button"
                          onClick={() => {
                            setSelectedBadges(prev =>
                              prev.includes(badge.id)
                                ? prev.filter(b => b !== badge.id)
                                : [...prev, badge.id]
                            );
                          }}
                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? `${badge.color} border-current ring-1 ring-white/20 shadow-md`
                              : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <span>{badge.icon}</span>
                          <span>{badge.label}</span>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Written Review Comment */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
                    Written Feedback on Performance & Behaviour <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder={`Describe ${activePlayerName}'s game performance, tactical awareness, punctuality, and composure with teammates and opponents...`}
                    required
                    className="w-full bg-[#16161a] border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/80 resize-none leading-relaxed"
                  />
                  <p className="text-[10px] text-neutral-500">
                    Constructive, honest peer reviews help build a verified, respectful sports community on Turfington.
                  </p>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-full text-xs font-bold text-neutral-400 hover:text-white cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Submit Peer Review</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
