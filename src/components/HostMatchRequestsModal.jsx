import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, XCircle, AlertTriangle, ShieldCheck, Flame, Clock, Award, X, MessageSquare } from 'lucide-react';

export default function HostMatchRequestsModal({ 
  match, 
  requests = [], 
  onClose, 
  onAcceptJoin, 
  onRejectJoin, 
  onApproveCancellation, 
  onDeclineCancellation 
}) {
  const [tab, setTab] = useState('join'); // 'join' | 'cancellation'

  const joinRequests = requests.filter(r => r.status === 'pending_approval');
  const cancellationRequests = requests.filter(r => r.status === 'cancellation_pending');
  const confirmedPlayers = requests.filter(r => r.status === 'approved');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        className="relative glass-card border border-indigo-500/20 rounded-3xl p-6 max-w-xl w-full z-10 text-left space-y-5 shadow-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">Host Command Center</span>
              <h3 className="font-display font-black text-white text-lg leading-tight">Review Match Requests</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Match Header Info */}
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] font-black uppercase text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                {match.sport || 'Match'}
              </span>
              <span className="text-xs text-neutral-400 font-light">{match.time}</span>
            </div>
            <h4 className="font-bold text-white text-sm mt-0.5">{match.title || match.venue}</h4>
          </div>
          <div className="text-right text-xs">
            <span className="text-neutral-400 font-light block">Confirmed Players</span>
            <span className="font-black text-emerald-400 text-sm">{confirmedPlayers.length} Active</span>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-neutral-900 border border-white/10 rounded-full p-1">
          <button
            onClick={() => setTab('join')}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              tab === 'join' ? 'bg-indigo-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Join Requests ({joinRequests.length})</span>
          </button>

          <button
            onClick={() => setTab('cancellation')}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              tab === 'cancellation' ? 'bg-rose-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Cancellation Requests ({cancellationRequests.length})</span>
          </button>
        </div>

        {/* Scrollable Requests List */}
        <div className="overflow-y-auto space-y-3 max-h-[360px] pr-1 custom-scrollbar flex-grow">
          {tab === 'join' ? (
            joinRequests.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Users className="w-8 h-8 text-neutral-600 mx-auto" />
                <p className="text-xs text-neutral-400 font-medium">No pending join requests right now.</p>
              </div>
            ) : (
              joinRequests.map(req => (
                <div key={req.id || req.userId} className="glass-card p-4 border border-white/10 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={req.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200'} 
                        alt={req.userName} 
                        className="w-11 h-11 rounded-xl object-cover border border-white/10" 
                      />
                      <div className="text-left">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-white text-sm">{req.userName || 'Player'}</h4>
                          <span className="text-[9px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                            Pledge Accepted
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-0.5">Requested at {req.requestedAt || 'Just now'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Player Reputation Scores Card (2 Scores Only: Show-Up & On-Time Punctuality) */}
                  <div className="grid grid-cols-2 gap-3 bg-neutral-900/80 p-2.5 rounded-xl border border-white/5 text-center">
                    <div>
                      <span className="text-[9px] text-neutral-400 font-semibold block flex items-center justify-center gap-1">
                        <Flame className="w-3 h-3 text-indigo-400" /> Show-Up Score
                      </span>
                      <span className="text-xs font-black text-indigo-400">{req.showUpScore || req.seriousnessScore || 96}%</span>
                      <span className="text-[9px] text-neutral-500 block">Showed up 24/25</span>
                    </div>

                    <div>
                      <span className="text-[9px] text-neutral-400 font-semibold block flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-400" /> On-Time Punctuality
                      </span>
                      <span className="text-xs font-black text-emerald-400">{req.punctualityScore || 98}%</span>
                      <span className="text-[9px] text-neutral-500 block">10+ mins early</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-1">
                    <button
                      onClick={() => onAcceptJoin(req)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-xs rounded-full transition-all flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Accept Player</span>
                    </button>
                    <button
                      onClick={() => onRejectJoin(req)}
                      className="flex-1 py-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-extrabold text-xs rounded-full transition-all flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))
            )
          ) : (
            cancellationRequests.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <AlertTriangle className="w-8 h-8 text-neutral-600 mx-auto" />
                <p className="text-xs text-neutral-400 font-medium">No cancellation requests pending.</p>
              </div>
            ) : (
              cancellationRequests.map(req => (
                <div key={req.id || req.userId} className="glass-card p-4 border border-rose-500/20 rounded-2xl space-y-3 bg-rose-500/[0.02]">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={req.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200'} 
                      alt={req.userName} 
                      className="w-10 h-10 rounded-xl object-cover border border-white/10" 
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">{req.userName || 'Player'}</h4>
                      <span className="text-[10px] text-rose-400 font-semibold">{req.reasonCategory}</span>
                    </div>
                  </div>

                  <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-xs text-neutral-300 space-y-1">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Player Stated Reason:</span>
                    <p className="text-xs font-light text-neutral-200 italic">"{req.reasonDetails}"</p>
                  </div>

                  {/* Player Reputation Scores (2 Scores Only) */}
                  <div className="grid grid-cols-2 gap-3 bg-neutral-900/80 p-2.5 rounded-xl border border-white/5 text-center">
                    <div>
                      <span className="text-[9px] text-neutral-400 font-semibold block flex items-center justify-center gap-1">
                        <Flame className="w-3 h-3 text-indigo-400" /> Show-Up Score
                      </span>
                      <span className="text-xs font-black text-indigo-400">{req.showUpScore || req.seriousnessScore || 96}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-neutral-400 font-semibold block flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-400" /> On-Time Punctuality
                      </span>
                      <span className="text-xs font-black text-emerald-400">{req.punctualityScore || 98}%</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-1">
                    <button
                      onClick={() => onApproveCancellation(req)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-xs rounded-full transition-all flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve Cancellation</span>
                    </button>
                    <button
                      onClick={() => onDeclineCancellation(req)}
                      className="flex-1 py-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-extrabold text-xs rounded-full transition-all flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </motion.div>
    </div>
  );
}
