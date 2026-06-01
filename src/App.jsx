import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, Home as HomeIcon, ShoppingBag, Trophy,
  User, LayoutDashboard, Menu, Building2, ChevronDown,
  LogOut, Settings, UserCircle, MapPin, Flame
} from 'lucide-react';

// Pages
import Landing   from './pages/Landing';
import Home      from './pages/Home';
import Discovery from './pages/Discovery';
import Marketplace from './pages/Marketplace';
import Community from './pages/Community';
import Profile   from './pages/Profile';
import Dashboard from './pages/Dashboard';
import RoleSelect from './pages/RoleSelect';
import Tournaments from './pages/Tournaments';
import VenueManager from './pages/VenueManager';
import Auth from './pages/Auth';
import SportsFeed from './pages/SportsFeed';

/* ── helpers ─────────────────────────────────────────────── */
const loadUser = () => {
  try {
    const s = localStorage.getItem('turfington_user');
    return s ? JSON.parse(s) : null;
  } catch { return null; }
};

const saveUser = (u) => {
  try { localStorage.setItem('turfington_user', JSON.stringify(u)); } catch {}
};

const loadLocalState = (key, fallback) => {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch { return fallback; }
};

const saveLocalState = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

/* ════════════════════════════════════════════════════════════
   APP ROOT
   ════════════════════════════════════════════════════════════ */
export default function App() {
  /* ── auth & role ─────────────────────────────────────────── */
  const [user, setUser] = useState(loadUser);                 // null → show Auth
  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);


  /* ── navigation ──────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [preSelectedSport, setPreSelectedSport] = useState('All');
  const [communityActiveSubTab, setCommunityActiveSubTab] = useState(null);
  const [openMarketplaceChatForProduct, setOpenMarketplaceChatForProduct] = useState(null);

  const [venueOffers, setVenueOffers] = useState(() => loadLocalState('turfington_venue_offers', [
    { id: 1, venueId: 1, type: 'booking', title: '15% Off Weekday Evenings', discount: '15%', description: 'Applicable on bookings between Monday to Thursday 5pm to 8pm' },
    { id: 2, venueId: 1, type: 'membership', title: 'Vanguard Monthly Pass', price: '₹1,499/mo', benefits: 'Includes 4 peak slots per month + priority booking' },
    { id: 3, venueId: 2, type: 'booking', title: 'Morning Bird Flat ₹150 Off', discount: '₹150 Flat', description: 'Valid on slots before 10 AM' }
  ]));

  /* ── global state hub ────────────────────────────────────── */
  const [cart, setCart] = useState(() => loadLocalState('turfington_cart', []));
  const [likedProducts, setLikedProducts] = useState(() => loadLocalState('turfington_liked_products', []));
  const [joinedMatches, setJoinedMatches] = useState(() => loadLocalState('turfington_joined_matches', [101]));
  const [bookings, setBookings] = useState(() => loadLocalState('turfington_bookings', [
    { id: 99, title: 'Vanguard Astro Turf 1', sport: 'Football', time: 'Today, 8:00 PM', price: '₹1,200/hr',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=400' }
  ]));

  useEffect(() => {
    saveLocalState('turfington_venue_offers', venueOffers);
  }, [venueOffers]);

  useEffect(() => {
    saveLocalState('turfington_cart', cart);
  }, [cart]);

  useEffect(() => {
    saveLocalState('turfington_liked_products', likedProducts);
  }, [likedProducts]);

  useEffect(() => {
    saveLocalState('turfington_joined_matches', joinedMatches);
  }, [joinedMatches]);

  useEffect(() => {
    saveLocalState('turfington_bookings', bookings);
  }, [bookings]);

  /* ── close user menu on outside click ───────────────────── */
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── auth handlers ───────────────────────────────────────── */
  const handleLogin = (userData) => {
    const full = { ...userData };
    if (!full.role) {
      setShowRoleSelect(true);
    }
    saveUser(full);
    setUser(full);
    if (full.role) setActiveTab(full.role === 'owner' ? 'venue-manager' : 'discovery');
  };

  const handleRoleSelect = (selectedRole) => {
    const updated = { ...user, role: selectedRole };
    saveUser(updated);
    setUser(updated);
    setShowRoleSelect(false);
    setActiveTab(selectedRole === 'owner' ? 'venue-manager' : 'discovery');
  };

  const handleLogout = () => {
    localStorage.removeItem('turfington_user');
    setUser(null);
    setShowUserMenu(false);
    setActiveTab('landing');
    setMobileMenuOpen(false);
  };



  /* ── navigation ──────────────────────────────────────────── */
  const handleNavClick = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const handleGetStarted = () => {
    if (!user) { setShowRoleSelect(false); setUser(null); } // triggers Auth page below
    else if (!user.role) setShowRoleSelect(true);
    else handleNavClick(user.role === 'owner' ? 'venue-manager' : 'discovery');
  };

  /* ── nav items ───────────────────────────────────────────── */
  const isOwner = user?.role === 'owner';
  const navItems = isOwner
    ? [
        { id: 'landing',      label: 'Home' },
        { id: 'sports-feed',  label: 'Sports Feed' },
        { id: 'tournaments',  label: 'Tournaments' },
        { id: 'marketplace',  label: 'Marketplace' },
        { id: 'community',    label: 'Communities' },
        { id: 'venue-manager', label: 'My Venues', badge: 'Owner' },
        { id: 'dashboard',    label: 'Bookings' },
        { id: 'profile',      label: 'Profile' },
      ]
    : [
        { id: 'landing',      label: 'Home' },
        { id: 'discovery',    label: 'Discover' },
        { id: 'sports-feed',  label: 'Sports Feed' },
        { id: 'tournaments',  label: 'Tournaments' },
        { id: 'marketplace',  label: 'Marketplace' },
        { id: 'community',    label: 'Communities' },
        { id: 'dashboard',    label: 'Your Bookings' },
        { id: 'profile',      label: 'Profile' },
      ];

  /* ─── Show Auth if not logged in ──────────────────────────── */
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  /* ─── Show Role Select overlay ───────────────────────────── */
  const roleSelectEl = showRoleSelect && (
    <motion.div key="rs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] overflow-y-auto">
      <RoleSelect onRoleSelect={handleRoleSelect} />
    </motion.div>
  );

  /* ═══════════════════════════════════════════════════════════
     MAIN APP (logged in)
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className={`min-h-screen flex flex-col font-sans select-none antialiased bg-[#080808] text-white`}>
      <AnimatePresence>{showRoleSelect && roleSelectEl}</AnimatePresence>

      {/* ── NAVBAR ──────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 w-full glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center space-x-2.5 flex-shrink-0 group cursor-pointer" onClick={() => handleNavClick('landing')}>
            <img src="/favicon.png" alt="Turfington Logo" className="w-9 h-9 rounded-xl object-cover shadow-[0_0_15px_rgba(255,255,255,0.15)] group-hover:scale-105 transition-all" />
            <span className="font-display font-black text-lg tracking-wider hidden sm:inline-block" style={{ color: 'inherit' }}>TURFINGTON</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden xl:flex items-center space-x-5 text-xs font-bold uppercase tracking-wider text-neutral-400">
            {navItems.map(item => (
              <button key={item.id} onClick={() => handleNavClick(item.id)}
                className={`relative hover:text-white transition-colors py-2 px-1 flex items-center gap-1.5 ${activeTab === item.id ? 'text-white' : ''}`}>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">{item.badge}</span>
                )}
                {activeTab === item.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400 rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Right: User avatar / menu */}
          <div className="hidden xl:flex items-center space-x-3 flex-shrink-0" ref={userMenuRef}>
            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] transition-all group">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-white/20 flex-shrink-0"
                    onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'; }}
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className="text-xs font-bold text-white max-w-[120px] truncate">{user.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                    {/* User info header */}
                    <div className="px-4 py-3.5 border-b border-white/5">
                      <p className="font-bold text-white text-sm">{user.name}</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5 truncate">{user.email || user.phone || 'Turfington Member'}</p>
                      {user.role && (
                        <span className={`inline-flex mt-1.5 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          user.role === 'owner' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        }`}>{user.role === 'owner' ? 'Venue Owner' : 'Player'}</span>
                      )}
                    </div>
                    {/* Menu items */}
                    {[
                      { icon: UserCircle, label: 'My Profile', action: () => { handleNavClick('profile'); setShowUserMenu(false); } },
                      { icon: LayoutDashboard, label: 'Your Bookings', action: () => { handleNavClick('dashboard'); setShowUserMenu(false); } },

                      { icon: Settings, label: 'Settings', action: () => { handleNavClick('profile'); setShowUserMenu(false); } },
                    ].map(item => (
                      <button key={item.label} onClick={item.action}
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-medium text-neutral-300 hover:bg-white/[0.04] hover:text-white transition-colors text-left">
                        <item.icon className="w-4 h-4 text-neutral-500" />
                        {item.label}
                      </button>
                    ))}
                    <div className="border-t border-white/5">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors text-left">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="xl:hidden p-2 text-neutral-400 hover:text-white transition-colors">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* MOBILE FULL-SCREEN MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-[#080808]/98 backdrop-blur-xl z-[45] flex flex-col justify-center px-8 pt-20 overflow-y-auto">

            {/* User chip */}
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/8">
              {user.avatar
                ? <img src={user.avatar} className="w-12 h-12 rounded-2xl object-cover border border-white/15" alt={user.name} onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'; }} />
                : <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg">{user.name?.[0]?.toUpperCase()}</div>
              }
              <div>
                <p className="font-bold text-white">{user.name}</p>
                <p className="text-[10px] text-neutral-500">{user.email || user.phone || 'Turfington Member'}</p>
              </div>
            </div>

            {/* Nav links */}
            <div className="space-y-3">
              {navItems.map(tab => (
                <button key={tab.id} onClick={() => handleNavClick(tab.id)}
                  className={`w-full text-2xl font-display font-black tracking-tight uppercase text-left ${
                    activeTab === tab.id ? 'text-white' : 'text-neutral-600'
                  }`}>{tab.label}</button>
              ))}
            </div>

            <div className="pt-6 mt-4 border-t border-white/8 flex flex-col gap-3">

              <button onClick={handleLogout}
                className="w-full py-3.5 bg-rose-600/20 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-widest rounded-full">
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <main className="flex-grow">
        {activeTab === 'landing' && <Landing setTab={handleNavClick} onGetStarted={() => handleNavClick('home')} setPreSelectedSport={setPreSelectedSport} />}
        {activeTab === 'home' && (
          <Home setTab={handleNavClick} joinedMatches={joinedMatches} toggleJoinMatch={(id) =>
            setJoinedMatches(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
          } bookings={bookings} setBookings={setBookings} user={user} role={user?.role} />
        )}
        {activeTab === 'discovery' && (
          <Discovery joinedMatches={joinedMatches}
            toggleJoinMatch={(id) => setJoinedMatches(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
            bookings={bookings} setBookings={setBookings} user={user}
            initialSport={preSelectedSport} setInitialSport={setPreSelectedSport}
            venueOffers={venueOffers} />
        )}
        {activeTab === 'marketplace' && (
          <Marketplace 
            likedProducts={likedProducts} 
            setLikedProducts={setLikedProducts} 
            onContactSeller={(product) => {
              setCommunityActiveSubTab('marketplace');
              setOpenMarketplaceChatForProduct(product);
              handleNavClick('community');
            }}
          />
        )}
        {activeTab === 'sports-feed' && <SportsFeed user={user} />}
        {activeTab === 'community' && (
          <Community 
            user={user} 
            initialSubTab={communityActiveSubTab}
            setInitialSubTab={setCommunityActiveSubTab}
            marketplaceChatProduct={openMarketplaceChatForProduct}
            setMarketplaceChatProduct={setOpenMarketplaceChatForProduct}
          />
        )}
        {activeTab === 'tournaments' && <Tournaments role={user?.role} />}
        {activeTab === 'venue-manager' && <VenueManager venueOffers={venueOffers} setVenueOffers={setVenueOffers} />}
        {activeTab === 'profile' && (
          <Profile user={user} role={user?.role}
            onLogout={handleLogout}
            onUpdateUser={(newData) => {
              const updated = { ...user, ...newData };
              saveUser(updated);
              setUser(updated);
            }}
            setRole={(r) => {
              const updated = { ...user, role: r };
              saveUser(updated);
              setUser(updated);
            }} />
        )}
        {activeTab === 'dashboard' && <Dashboard user={user} role={user?.role} />}
      </main>

      {/* MOBILE BOTTOM TAB BAR */}
      <div className="xl:hidden fixed bottom-6 left-4 right-4 z-40 flex items-center justify-around py-3 px-4 glass-card border border-white/10 shadow-2xl">
        {(isOwner
          ? [
              { id: 'sports-feed',  Icon: Compass,         label: 'Feed' },
              { id: 'tournaments',  Icon: Trophy,          label: 'Events' },
              { id: 'marketplace',  Icon: ShoppingBag,     label: 'Shop' },
              { id: 'venue-manager', Icon: Building2,      label: 'Venues' },
              { id: 'dashboard',    Icon: LayoutDashboard, label: 'Bookings' },
            ]
          : [
              { id: 'landing',     Icon: HomeIcon,        label: 'Home' },
              { id: 'discovery',   Icon: Compass,         label: 'Discover' },
              { id: 'sports-feed', Icon: Flame,           label: 'Feed' },
              { id: 'tournaments', Icon: Trophy,          label: 'Events' },
              { id: 'profile',     Icon: User,            label: 'Profile' },
            ]
        ).map(({ id, Icon, label }) => (
          <button key={id} onClick={() => handleNavClick(id)}
            className={`flex flex-col items-center space-y-1 transition-colors ${
              activeTab === id
                ? id === 'venue-manager' ? 'text-violet-400' : 'text-white'
                : 'text-neutral-500'
            }`}>
            <Icon className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
          </button>
        ))}
      </div>

      {/* FOOTER */}
      <footer className="py-8 bg-[#040404] border-t border-white/5 text-center text-xs text-neutral-500 font-light pb-28 xl:pb-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Turfington Platform. Made in India 🇮🇳</p>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
