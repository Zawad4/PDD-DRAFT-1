import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Star, 
  X, 
  Check, 
  Award, 
  ArrowRight, 
  PlusCircle, 
  Grid, 
  Lock, 
  MessageSquare,
  Sparkles,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export default function Marketplace({ 
  likedProducts, 
  setLikedProducts,
  onContactSeller
}) {
  const [activeSection, setActiveSection] = useState('browse'); // 'browse' or 'sell'
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Form states for Listing Gear
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('Equipment');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCondition, setItemCondition] = useState('New (Sealed Pack)');
  const [itemDesc, setItemDesc] = useState('');
  const [listSuccess, setListSuccess] = useState(false);

  // Guidelines confirmation checkboxes
  const [confirmPhoto, setConfirmPhoto] = useState(false);
  const [confirmPrice, setConfirmPrice] = useState(false);

  // Marketplace Products List (Stateful so users can list new items)
  const [productsList, setProductsList] = useState([
    {
      id: 1,
      name: 'FIFA World Cup 2026 Competition Ball',
      category: 'Equipment',
      image: '/soccer_ball.jpg',
      price: 399,
      rating: 4.9,
      tag: 'New (Sealed Pack)',
      sellerName: 'Amit Patel',
      sellerAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Amit'
    },
    {
      id: 2,
      name: 'Yonex Astrox 100 Tour Badminton Racket',
      category: 'Rackets',
      image: '/badminton_racket.png',
      price: 999,
      rating: 4.8,
      tag: 'Pre-owned (Like New)',
      sellerName: 'Priya Nair',
      sellerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'
    },
    {
      id: 3,
      name: 'Nike stealth pro',
      category: 'Shoes',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400',
      price: 799,
      rating: 4.7,
      tag: 'Pre-owned (Good)',
      sellerName: 'Deepak Kumar',
      sellerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Deepak'
    },
    {
      id: 4,
      name: "PUMA Men's AC Milan 25-26 Home Jersey",
      category: 'Jerseys',
      image: '/jersey.png',
      price: 299,
      rating: 4.6,
      tag: 'New (Sealed Pack)',
      sellerName: 'Arjun Sharma',
      sellerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun'
    },
    {
      id: 6,
      name: 'SG IK Players English Willow Cricket Bat',
      category: 'Equipment',
      image: '/cricket_bat.png',
      price: 1299,
      rating: 4.9,
      tag: 'Pre-owned (Like New)',
      sellerName: 'Amit Patel',
      sellerAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Amit'
    }
  ]);

  const categories = ['All', 'Equipment', 'Jerseys', 'Shoes', 'Accessories', 'Rackets', 'Bowling gear'];

  const filteredProducts = selectedCategory === 'All' 
    ? productsList 
    : productsList.filter(p => p.category === selectedCategory);

  const toggleWishlist = (productId) => {
    setLikedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  // Submit Listing
  const handleListProduct = (e) => {
    e.preventDefault();
    if (!itemName || !itemPrice || !confirmPhoto || !confirmPrice) return;

    // Use category-specific preset images for realistic preview look
    let presetImage = 'https://images.unsplash.com/photo-1511067007398-7e4b90cfa4bc?q=80&w=400'; 
    if (itemCategory === 'Equipment' || itemCategory === 'Jerseys') {
      presetImage = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=400'; 
    } else if (itemCategory === 'Shoes') {
      presetImage = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400';
    } else if (itemCategory === 'Rackets') {
      presetImage = 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=400'; 
    } else if (itemCategory === 'Bowling gear') {
      presetImage = 'https://images.unsplash.com/photo-1565992441121-4367fe2034cf?q=80&w=400';
    }

    const newListing = {
      id: Date.now(),
      name: itemName,
      category: itemCategory,
      image: presetImage,
      price: parseFloat(itemPrice),
      rating: 5.0,
      tag: itemCondition,
      sellerName: 'You',
      sellerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You'
    };

    setListSuccess(true);
    setTimeout(() => {
      setProductsList([newListing, ...productsList]);
      setListSuccess(false);
      setItemName('');
      setItemPrice('');
      setItemDesc('');
      setItemCondition('New (Sealed Pack)');
      setConfirmPhoto(false);
      setConfirmPrice(false);
      setActiveSection('browse');
    }, 1500);
  };

  // Helper to color code condition tags
  const getTagColors = (tag) => {
    const text = tag.toLowerCase();
    if (text.includes('sealed') || text.includes('new')) {
      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    } else if (text.includes('like new')) {
      return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
    } else if (text.includes('good')) {
      return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    } else {
      return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative text-left">
      
      {/* 1. SHOP HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black font-display tracking-tight uppercase">Peer-to-Peer Marketplace</h1>
          <p className="text-xs text-neutral-500 mt-1">Buy and sell sports gear directly within the Turfington athletic community</p>
        </div>

        {/* View togglers */}
        <div className="flex items-center space-x-3.5 self-start md:self-end">
          <div className="flex bg-[#121212] border border-white/5 p-1 rounded-full text-xs font-bold">
            <button 
              onClick={() => setActiveSection('browse')}
              className={`px-5 py-2.5 rounded-full flex items-center space-x-1.5 transition-all ${
                activeSection === 'browse' ? 'bg-white text-black font-extrabold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Browse Gear</span>
            </button>
            
            <button 
              onClick={() => setActiveSection('sell')}
              className={`px-5 py-2.5 rounded-full flex items-center space-x-1.5 transition-all ${
                activeSection === 'sell' ? 'bg-white text-black font-extrabold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>List Your Gear</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE VIEW */}
      {activeSection === 'browse' ? (
        <>
          {/* BANNER PROMO */}
          <div className="glass-card mb-12 p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between border border-white/5">
            <div className="text-left space-y-4 max-w-lg z-10">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] uppercase font-bold tracking-widest text-indigo-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>COMMUNITY EXCLUSIVES</span>
              </span>
              <h2 className="text-3xl md:text-5xl font-black font-display tracking-tight leading-tight">
                Stealth Pro<br />
                <span className="chrome-text">Aero Shoes</span>
              </h2>
              <p className="text-neutral-400 font-light text-sm max-w-sm leading-relaxed">
                Listed by Deepak Kumar. Excellent condition pre-owned shoes with professional carbon plate inserts.
              </p>
              <button 
                onClick={() => onContactSeller(productsList[2])}
                className="group inline-flex items-center justify-center px-6 py-3.5 bg-white text-black text-xs font-bold rounded-full hover:scale-102 transition-transform duration-300"
              >
                <span>Chat to Pre-order</span>
                <MessageSquare className="ml-2 w-3.5 h-3.5 text-black" />
              </button>
            </div>

            <div className="relative mt-8 md:mt-0 w-[260px] h-[200px] flex items-center justify-center z-10">
              <img 
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400" 
                alt="Sneaker" 
                className="w-full h-full object-cover rounded-2xl border border-white/10"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
            
            <div className="absolute right-0 bottom-0 top-0 w-1/2 bg-indigo-500/[0.01] rounded-l-full blur-3xl pointer-events-none" />
          </div>

          {/* CATEGORIES NAVIGATION */}
          <div className="flex space-x-2.5 overflow-x-auto no-scrollbar pb-6 mb-8 max-w-full">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
                  selectedCategory === c 
                    ? 'bg-white text-black font-extrabold shadow-md' 
                    : 'bg-white/[0.02] text-neutral-400 hover:text-white border border-white/5'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* PRODUCTS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(p => {
              const isLiked = likedProducts.includes(p.id);
              const tagColors = getTagColors(p.tag);
              return (
                <div 
                  key={p.id} 
                  className="glass-card overflow-hidden group border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col text-left"
                >
                  <div className="h-60 overflow-hidden relative bg-neutral-900/50">
                    <img 
                      src={p.image} 
                      alt={p.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />
                    
                    <div className="absolute top-4 left-4 flex flex-col space-y-2">
                      <span className={`text-[9px] uppercase font-black tracking-wider bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-md border ${tagColors}`}>
                        {p.tag}
                      </span>
                    </div>

                    <button 
                      onClick={() => toggleWishlist(p.id)}
                      className="absolute top-4 right-4 p-2.5 bg-black/60 backdrop-blur-md hover:bg-neutral-800 rounded-full border border-white/5 transition-all text-neutral-400 hover:text-rose-500"
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'text-rose-500 fill-rose-500' : ''}`} />
                    </button>
                  </div>

                  <div className="p-5 flex flex-col flex-grow justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2.5">
                        <div className="flex items-center space-x-1.5">
                          {p.sellerAvatar ? (
                            <img src={p.sellerAvatar} className="w-4.5 h-4.5 rounded-full object-cover border border-white/10" alt={p.sellerName} />
                          ) : (
                            <div className="w-4.5 h-4.5 rounded-full bg-indigo-600 flex items-center justify-center text-[8px] font-bold text-white">
                              {p.sellerName?.[0]}
                            </div>
                          )}
                          <span className="text-[10px] text-neutral-400 font-bold truncate max-w-[120px]">
                            {p.sellerName || 'Seller'}
                          </span>
                        </div>
                        <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-extrabold">
                          {p.category}
                        </span>
                      </div>

                      <h3 className="font-display font-bold text-white text-base leading-snug group-hover:text-neutral-200 transition-colors">
                        {p.name}
                      </h3>
                    </div>

                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
                      <span className="font-display font-black text-lg text-white">
                        ₹{p.price.toLocaleString('en-IN')}
                      </span>
                      
                      <button 
                        onClick={() => onContactSeller(p)}
                        className="inline-flex items-center space-x-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-full transition-colors shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat with Seller</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* SELL GEAR DASHBOARD FORM */
        <div className="max-w-2xl mx-auto">
          <div className="glass-card p-6 md:p-8 border border-white/5 space-y-6">
            <div className="pb-4 border-b border-white/5">
              <h2 className="font-display font-black text-xl uppercase">List Your Equipment</h2>
              <p className="text-xs text-neutral-500 mt-1">Submit your sports gear to the Turfington community</p>
            </div>

            <form onSubmit={handleListProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Item Name */}
                <div className="space-y-2">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Product Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. English Willow Cricket Bat"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    required
                    className="w-full bg-[#0d0d0d] border border-white/5 rounded-xl px-4 py-3.5 text-xs text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-indigo-500/40 transition-colors"
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Category</label>
                  <select 
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    className="w-full bg-[#0d0d0d] border border-white/5 rounded-xl px-3 py-3.5 text-xs text-neutral-300 focus:outline-none focus:border-indigo-500/40 transition-colors"
                  >
                    <option value="Equipment">Equipment</option>
                    <option value="Jerseys">Jerseys</option>
                    <option value="Shoes">Shoes</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Rackets">Rackets</option>
                    <option value="Bowling gear">Bowling gear</option>
                  </select>
                </div>

                {/* Item Price */}
                <div className="space-y-2">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Price (₹ INR)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 1500"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    required
                    className="w-full bg-[#0d0d0d] border border-white/5 rounded-xl px-4 py-3.5 text-xs text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-indigo-500/40 transition-colors"
                  />
                </div>

                {/* Item Condition */}
                <div className="space-y-2">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Condition</label>
                  <select 
                    value={itemCondition}
                    onChange={(e) => setItemCondition(e.target.value)}
                    className="w-full bg-[#0d0d0d] border border-white/5 rounded-xl px-3 py-3.5 text-xs text-neutral-300 focus:outline-none focus:border-indigo-500/40 transition-colors"
                  >
                    <option value="New (Sealed Pack)">New (Sealed Pack)</option>
                    <option value="Pre-owned (Like New)">Pre-owned (Like New)</option>
                    <option value="Pre-owned (Good)">Pre-owned (Good)</option>
                    <option value="Pre-owned (Fair)">Pre-owned (Fair)</option>
                  </select>
                </div>

              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Product Description</label>
                <textarea 
                  rows="4"
                  placeholder="Describe your item details, minor wear, original pricing, reasons for selling..."
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  className="w-full bg-[#0d0d0d] border border-white/5 rounded-xl px-4 py-3.5 text-xs text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-indigo-500/40 transition-colors resize-none"
                  required
                />
              </div>

              {/* Peer-to-Peer Guidelines & Confirmations */}
              <div className="space-y-3.5 p-5 bg-white/[0.01] border border-white/5 rounded-2xl text-xs font-light">
                <div className="flex items-center space-x-2 pb-2.5 border-b border-white/5 text-neutral-300 font-bold uppercase tracking-wider text-[10px]">
                  <ShieldCheck className="w-4.5 h-4.5 text-indigo-400" />
                  <span>Community Peer-to-Peer Rules</span>
                </div>
                <p className="text-neutral-500 text-[11px] leading-relaxed">
                  Turfington acts solely as a P2P listing platform (similar to OLX). You will connect with buyers directly in your chat portal. Payments, handovers, or shipping are arranged directly.
                </p>
                <div className="space-y-3 pt-1">
                  <label className="flex items-start space-x-3 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={confirmPhoto}
                      onChange={(e) => setConfirmPhoto(e.target.checked)}
                      required 
                      className="rounded bg-black border-white/10 text-indigo-600 focus:ring-0 focus:ring-offset-0 w-4 h-4 mt-0.5" 
                    />
                    <span className="leading-tight">I confirm the uploaded image or description is clear, accurate, and represents the actual gear.</span>
                  </label>
                  <label className="flex items-start space-x-3 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={confirmPrice}
                      onChange={(e) => setConfirmPrice(e.target.checked)}
                      required 
                      className="rounded bg-black border-white/10 text-indigo-600 focus:ring-0 focus:ring-offset-0 w-4 h-4 mt-0.5" 
                    />
                    <span className="leading-tight">I confirm the price listed is reasonable, fair, and not overpriced.</span>
                  </label>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-4 pt-2">
                <button 
                  type="button"
                  onClick={() => setActiveSection('browse')}
                  className="flex-1 py-4 text-xs font-bold border border-white/10 hover:bg-white/5 rounded-full text-center cursor-pointer transition-all"
                >
                  Cancel
                </button>
                
                <button 
                  type="submit"
                  disabled={listSuccess || !confirmPhoto || !confirmPrice}
                  className="flex-1 py-4 bg-white text-black font-extrabold text-xs uppercase tracking-widest rounded-full hover:bg-neutral-200 transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-30 disabled:hover:bg-white transition-all"
                >
                  {listSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Listing Live!</span>
                    </>
                  ) : (
                    <span>List Item</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
