import React from 'react';
import {
  Home as HomeIcon,
  Compass,
  ShoppingBag,
  MessageSquare,
  Trophy,
  LayoutDashboard,
  Building2
} from 'lucide-react';

export default function MobileNav({
  isOwner,
  activeTab,
  onNavClick,
  unreadMessageCount = 0,
  cartCount = 0
}) {
  const tabs = isOwner
    ? [
        { id: 'landing', Icon: HomeIcon, label: 'Home' },
        { id: 'venue-manager', Icon: Building2, label: 'Venues' },
        { id: 'marketplace', Icon: ShoppingBag, label: 'Marketplace' },
        { id: 'community', Icon: MessageSquare, label: 'Messages' },
        { id: 'tournaments', Icon: Trophy, label: 'Tournaments' },
        { id: 'dashboard', Icon: LayoutDashboard, label: 'Bookings' }
      ]
    : [
        { id: 'landing', Icon: HomeIcon, label: 'Home' },
        { id: 'discovery', Icon: Compass, label: 'Discover' },
        { id: 'marketplace', Icon: ShoppingBag, label: 'Marketplace' },
        { id: 'community', Icon: MessageSquare, label: 'Messages' },
        { id: 'tournaments', Icon: Trophy, label: 'Tournaments' },
        { id: 'dashboard', Icon: LayoutDashboard, label: 'My Bookings' }
      ];

  return (
    <nav className="xl:hidden fixed bottom-6 left-3 right-3 z-40 flex items-center justify-around py-3 px-2 glass-card border border-white/10 shadow-2xl">
      {tabs.map(({ id, Icon, label }) => (
        <button
          key={id}
          onClick={() => onNavClick(id)}
          className={`flex flex-col items-center space-y-1 transition-colors relative ${
            activeTab === id
              ? id === 'venue-manager'
                ? 'text-violet-400'
                : 'text-white'
              : 'text-neutral-500'
          }`}
        >
          <div className="relative">
            <Icon className="w-5 h-5" />
            {id === 'community' && unreadMessageCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse border border-[#080808]" />
            )}
            {id === 'marketplace' && cartCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 border border-[#080808]" />
            )}
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
        </button>
      ))}
    </nav>
  );
}

