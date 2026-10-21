import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle, Clock, Check, X, FileText, UserCheck, Flame } from 'lucide-react';
import SportIcon from './SportIcon';

export default function MatchRegulationsModal({ match, user, onClose, onSubmitRequest }) {
  const [agreeRegulations, setAgreeRegulations] = useState(false);
  const [agreePledge, setAgreePledge] = useState(false);
  const [agreeCancellationPolicy, setAgreeCancellationPolicy] = useState(false);

  const canSubmit = agreeRegulations && agreePledge && agreeCancellationPolicy;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmitRequest({
      matchId: match.id,
      matchTitle: match.title || match.venue || 'Sports Session',
      sport: match.sport || 'Football',
      time: match.time || 'Today',
      acceptedRegulations: true,
      requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        className="relative glass-card border border-white/10 rounded-3xl p-6 max-w-lg w-full z-10 text-left space-y-5 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">Match Entry Protocol</span>
              <h3 className="font-display font-black text-white text-lg leading-tight">Regulations & Commitment</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Match Target Summary */}
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {match.image && (
              <img src={match.image} alt={match.title} className="w-12 h-12 rounded-xl object-cover border border-white/10" />
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[9px] font-black uppercase text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {match.sport}
                </span>
                <span className="text-xs text-neutral-400 font-light">{match.time}</span>
              </div>
              <h4 className="font-bold text-white text-sm mt-0.5">{match.title || match.venue}</h4>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-neutral-500 font-semibold block">Host Review</span>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full inline-block mt-0.5">
              Required
            </span>
          </div>
        </div>

        {/* Scrollable Rules Content */}
        <div className="overflow-y-auto space-y-4 pr-1 text-xs text-neutral-300 font-light max-h-[340px] custom-scrollbar">
          
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 space-y-2">
            <div className="flex items-center space-x-2 text-rose-300 font-bold">
              <Flame className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>Not Just For Fun — Serious Attendance Required</span>
            </div>
            <p className="text-[11px] text-rose-200/80 leading-relaxed">
              Joining a match is a binding commitment to the host and fellow players. Casual "maybe" sign-ups disrupt team line-ups. Ensure you are 100% available before submitting your request.
            </p>
          </div>

          {/* Rule Points */}
          <div className="space-y-3 pt-1">
            <div className="flex items-start space-x-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <Clock className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-bold block text-xs">Punctuality Rule</strong>
                <p className="text-[11px] text-neutral-400 mt-0.5">You must arrive at the venue at least 10 minutes prior to kickoff. Late arrivals negatively impact your Punctuality Score.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-bold block text-xs">Cancellation Host Approval Policy</strong>
                <p className="text-[11px] text-neutral-400 mt-0.5">You CANNOT leave the match unilaterally. Any cancellation requires submitting a formal request stating valid reasons for host review and approval.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <UserCheck className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-bold block text-xs">Host Review & Player Reputation Scores</strong>
                <p className="text-[11px] text-neutral-400 mt-0.5">Your Match Show-Up Score (96%) and On-Time Punctuality Score (98%) will be transmitted to the host to evaluate your request.</p>
              </div>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-2.5 pt-2 border-t border-white/10">
            <label className="flex items-start space-x-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={agreeRegulations} 
                onChange={(e) => setAgreeRegulations(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-indigo-500 bg-neutral-900 border-white/20 cursor-pointer"
              />
              <span className="text-[11px] text-neutral-300 group-hover:text-white transition-colors">
                I have read and agree to all match regulations and punctuality guidelines.
              </span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={agreePledge} 
                onChange={(e) => setAgreePledge(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-indigo-500 bg-neutral-900 border-white/20 cursor-pointer"
              />
              <span className="text-[11px] text-neutral-300 group-hover:text-white transition-colors">
                I pledge to attend seriously and respect the match slot, host, and team mates.
              </span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={agreeCancellationPolicy} 
                onChange={(e) => setAgreeCancellationPolicy(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-indigo-500 bg-neutral-900 border-white/20 cursor-pointer"
              />
              <span className="text-[11px] text-neutral-300 group-hover:text-white transition-colors">
                I understand leaving requires host approval with mandatory reason submission.
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-bold text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={`px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer shadow-lg ${
              canSubmit 
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30' 
                : 'bg-white/10 text-neutral-500 cursor-not-allowed border border-white/5'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Accept Regulations & Send Request</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
