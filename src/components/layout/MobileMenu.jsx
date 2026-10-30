import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Headphones } from 'lucide-react';
import UserAvatar from '../UserAvatar';

export default function MobileMenu({
  isOpen,
  onClose,
  navItems,
  activeTab,
  onNavClick,
  user,
  onOpenSupport,
  onLogout
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 bg-[#080808]/98 backdrop-blur-xl z-[45] flex flex-col justify-center px-8 pt-20 overflow-y-auto"
        >
          {/* Top Bar with Back Button on the top left */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-300 hover:text-white transition-all group"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-400 group-hover:text-white group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-wider">Back</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-400 hover:text-white transition-all"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User chip */}
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/8 mt-6">
            <UserAvatar user={user} className="w-12 h-12 text-lg" />
            <div>
              <p className="font-bold text-white">{user?.full_name || 'Athlete'}</p>
              <p className="text-[10px] text-neutral-500">
                {user?.email || user?.phone || 'Turfington Member'}
              </p>
            </div>
          </div>

          {/* Nav links */}
          <div className="space-y-3">
            {navItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  onNavClick(tab.id);
                  onClose();
                }}
                className={`w-full text-2xl font-display font-black tracking-tight uppercase text-left ${
                  activeTab === tab.id ? 'text-white' : 'text-neutral-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="pt-6 mt-4 border-t border-white/8 flex flex-col gap-3">
            <button
              onClick={() => {
                onOpenSupport();
                onClose();
              }}
              className="w-full py-3 bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <Headphones className="w-4 h-4 text-indigo-400" />
              Support & Helpdesk
            </button>

            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full py-3.5 bg-rose-600/20 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-widest rounded-full"
            >
              Sign Out
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
