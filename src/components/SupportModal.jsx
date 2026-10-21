import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Mail, Phone, MessageSquare, Copy, Check, 
  ExternalLink, Headphones, Clock, ShieldCheck, Send 
} from 'lucide-react';

export default function SupportModal({ isOpen, onClose }) {
  const [copiedType, setCopiedType] = useState(null); // 'email' | 'phone' | null
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');

  const supportEmail = 'mohammedzawadadnan@gmail.com';
  const supportPhone = '+91 90436 51400';
  const rawPhone = '+919043651400';
  const waPhone = '919043651400';

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    const mailSubject = encodeURIComponent(subject || 'Turfington Support Request');
    const mailBody = encodeURIComponent(message || 'Hi Support Team,\n\nI need help with:');
    window.location.href = `mailto:${supportEmail}?subject=${mailSubject}&body=${mailBody}`;
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      message 
        ? `Hello Turfington Support, regarding ${subject || 'my query'}: ${message}` 
        : 'Hello Turfington Support! I have a question regarding my bookings and the platform.'
    );
    window.open(`https://wa.me/${waPhone}?text=${text}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose} 
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
      />

      {/* Modal Dialog */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="relative glass-card border border-white/10 rounded-3xl p-6 sm:p-8 max-w-xl w-full z-10 text-left shadow-2xl max-h-[92vh] overflow-y-auto custom-scrollbar"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-5">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Helpdesk
                </span>
                <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Support
                </span>
              </div>
              <h3 className="font-display font-black text-white text-xl mt-1">Get in Touch with Support</h3>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtitle */}
        <p className="text-xs text-neutral-400 font-light mt-4 leading-relaxed">
          Need assistance with arena bookings, payments, tournaments, or listing a venue? Reach out to us directly through email or phone.
        </p>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5">
          {/* Card 1: Email */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4.5 flex flex-col justify-between hover:border-indigo-500/30 transition-all group">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-neutral-400 font-medium">Email Inquiry</span>
              </div>
              <p className="text-xs font-bold text-white break-all">{supportEmail}</p>
              <p className="text-[10px] text-neutral-500 mt-1">Direct replies within 2-4 hours</p>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
              <a
                href={`mailto:${supportEmail}?subject=Turfington%20Support`}
                className="flex-1 text-center py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Send Mail</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                type="button"
                onClick={() => handleCopy(supportEmail, 'email')}
                className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-neutral-300 hover:text-white transition-all cursor-pointer"
                title="Copy Email"
              >
                {copiedType === 'email' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Card 2: Phone & WhatsApp */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4.5 flex flex-col justify-between hover:border-emerald-500/30 transition-all group">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-neutral-400 font-medium">Phone & WhatsApp</span>
              </div>
              <p className="text-xs font-bold text-white tracking-wide">{supportPhone}</p>
              <p className="text-[10px] text-neutral-500 mt-1">Mon - Sun • 9 AM to 10 PM IST</p>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
              <a
                href={`tel:${rawPhone}`}
                className="flex-1 text-center py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Call Now</span>
                <Phone className="w-3 h-3" />
              </a>
              <button
                type="button"
                onClick={handleWhatsApp}
                className="py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                title="WhatsApp Message"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat</span>
              </button>
              <button
                type="button"
                onClick={() => handleCopy(supportPhone, 'phone')}
                className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-neutral-300 hover:text-white transition-all cursor-pointer"
                title="Copy Phone Number"
              >
                {copiedType === 'phone' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Message Form */}
        <form onSubmit={handleSendEmail} className="mt-5 bg-white/[0.02] border border-white/5 rounded-2xl p-4.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-indigo-400" />
              Draft a Quick Inquiry
            </span>
            <span className="text-[10px] text-neutral-500">Opens your default email client</span>
          </div>

          <input 
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject (e.g. Booking Query, Refund Request, Turf Listing)"
            className="w-full px-3.5 py-2.5 bg-neutral-900/90 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />

          <textarea 
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue or question in detail..."
            className="w-full px-3.5 py-2.5 bg-neutral-900/90 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
          />

          <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleWhatsApp}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Send via WhatsApp</span>
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Send via Email</span>
            </button>
          </div>
        </form>

        {/* Footer info badge */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-500 font-light">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Dedicated 24/7 Support Team
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-neutral-400" /> Quick Resolution Guaranteed
          </span>
        </div>
      </motion.div>
    </div>
  );
}
