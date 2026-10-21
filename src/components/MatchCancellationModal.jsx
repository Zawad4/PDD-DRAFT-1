import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Send, X, ShieldAlert, FileText, Info } from 'lucide-react';

const CANCELLATION_REASONS = [
  'Medical Emergency / Sudden Illness',
  'Unexpected Work / Exam Conflict',
  'Physical Injury or Extreme Fatigue',
  'Transportation / Travel Emergency',
  'Personal / Family Emergency'
];

export default function MatchCancellationModal({ match, user, onClose, onSubmitCancellation }) {
  const [reasonCategory, setReasonCategory] = useState(CANCELLATION_REASONS[0]);
  const [reasonDetails, setReasonDetails] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reasonDetails.trim() || reasonDetails.trim().length < 10) {
      setErrorMsg('Please provide a valid explanation (at least 10 characters) for the host.');
      return;
    }

    onSubmitCancellation({
      matchId: match.id,
      matchTitle: match.title || match.venue || 'Sports Session',
      reasonCategory,
      reasonDetails: reasonDetails.trim(),
      requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        className="relative glass-card border border-rose-500/20 rounded-3xl p-6 max-w-md w-full z-10 text-left space-y-5 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-400">Host Approval Protocol</span>
              <h3 className="font-display font-black text-white text-lg leading-tight">Request Match Cancellation</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 space-y-1">
          <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Host Review & Approval Required</span>
          </div>
          <p className="text-[11px] text-amber-200/80 leading-relaxed font-light">
            You cannot leave a match directly. Your cancellation request will be routed to the Match Host for review. State your reasons clearly to avoid score penalties.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reason Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-300 block">Select Category Reason</label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500/50"
            >
              {CANCELLATION_REASONS.map(r => (
                <option key={r} value={r} className="bg-neutral-900 text-white">{r}</option>
              ))}
            </select>
          </div>

          {/* Explanation Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-300 block flex items-center justify-between">
              <span>Detailed Explanation to Host</span>
              <span className="text-[10px] text-rose-400 font-semibold">*Mandatory</span>
            </label>
            <textarea
              rows={3}
              value={reasonDetails}
              onChange={(e) => { setReasonDetails(e.target.value); setErrorMsg(''); }}
              placeholder="Explain why you cannot attend (e.g. Sudden high fever, doctor advised rest...)"
              className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500/50 resize-none"
            />
            {errorMsg && (
              <p className="text-[11px] text-rose-400 font-semibold mt-1">{errorMsg}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              Back
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer shadow-lg shadow-rose-600/30"
            >
              <Send className="w-4 h-4" />
              <span>Submit Request to Host</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
