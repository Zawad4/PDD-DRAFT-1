import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, MessageSquare, Plus, Search, Shield, Flame, Trophy,
  Zap, Star, Bell, BellRing, Check, CheckCheck, X, ChevronRight,
  Filter, Sparkles, Compass, MapPin, Activity, ArrowLeft,
  UserPlus, Radio, Circle, Pin, VolumeX, Volume2
} from 'lucide-react';
import SportIcon from '../components/SportIcon';
import ChatWindowEnhanced from '../components/ChatWindowEnhanced';
import {
  subscribeToUserInbox,
  subscribeToCommunityGroups,
  joinCommunityGroup,
  leaveCommunityGroup,
  getOrCreateDirectConversation,
  createCommunityGroup,
  togglePinConversation,
  toggleMuteConversation,
  registerDeviceToken,
  ensureDefaultCommunityData,
  markConversationAsRead
} from '../services/chatService';
import { apiFetchAthletes } from '../services/db';
import { auth, setupPushNotifications } from '../services/firebase';

const SPORT_CATEGORIES = ['All', 'Football', 'Cricket', 'Badminton', 'Pickleball', 'Table Tennis', 'Bowling'];

export default function Community({ user, setTab }) {
  const currentUserId = user?.firebase_uid || user?.id || user?.uid || auth.currentUser?.uid || 'usr_amit_patel';
  const currentUserName = user?.full_name || user?.displayName || user?.name || 'Athlete';
  const currentUserAvatar = user?.avatar || user?.avatarUrl || user?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUserId}`;

  // State
  const [inboxItems, setInboxItems] = useState([]);
  const [communityGroups, setCommunityGroups] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [activeTabMode, setActiveTabMode] = useState('hubs'); // 'hubs' | 'direct'
  const [selectedSport, setSelectedSport] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupSport, setNewGroupSport] = useState('Football');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Push notifications
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  // 1. Initial Setup: Seed default groups and subscribe to User's Inbox + Community Groups
  useEffect(() => {
    let isMounted = true;

    // Seed defaults in Firestore if needed
    ensureDefaultCommunityData(user);

    // 1. Subscribe to User's personalized Inbox (users/{uid}/inbox)
    const unsubInbox = subscribeToUserInbox(currentUserId, (items) => {
      if (!isMounted) return;
      setInboxItems(items);
      setLoading(false);

      // Keep active chat in sync with updated inbox item
      setActiveChat(prev => {
        if (!prev) return null;
        const matching = items.find(i => i.conversationId === (prev.conversationId || prev.id));
        return matching ? { ...prev, ...matching } : prev;
      });
    });

    // 2. Subscribe to Community Groups (communityGroups/{groupId})
    const unsubGroups = subscribeToCommunityGroups(selectedSport, (groups) => {
      if (!isMounted) return;
      setCommunityGroups(groups);
    });

    // 3. Fetch athletes for direct messaging
    apiFetchAthletes(currentUserId).then(data => {
      if (isMounted) setAthletes(data);
    });

    // 4. Notification status
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationEnabled(Notification.permission === 'granted');
    }

    return () => {
      isMounted = false;
      unsubInbox();
      unsubGroups();
    };
  }, [currentUserId, selectedSport]);

  // Request push notifications & register device token
  const handleEnableNotifications = async () => {
    const res = await setupPushNotifications();
    if (res && res.success) {
      setNotificationEnabled(true);
      const deviceId = 'web_' + (typeof navigator !== 'undefined' ? navigator.userAgent.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16) : Date.now());
      await registerDeviceToken(currentUserId, deviceId, res.token || 'web_push_granted', 'web');
    }
  };

  // Switch chat & mark as read
  // Derived set of joined group IDs
  const joinedGroupIds = useMemo(() => {
    return new Set(inboxItems.filter(i => i.type === 'group').map(i => i.groupId || i.conversationId));
  }, [inboxItems]);

  const handleSelectChat = (chat) => {
    const convId = chat.conversationId || chat.groupId || chat.id;
    const isGrp = chat.type === 'group' || (!chat.type && !!chat.groupId);
    const isMember = isGrp ? joinedGroupIds.has(convId) : true;
    const inboxEntry = inboxItems.find(i => i.conversationId === convId);

    const formattedChat = {
      ...chat,
      id: convId,
      conversationId: convId,
      groupId: isGrp ? convId : undefined,
      type: isGrp ? 'group' : 'direct',
      name: chat.title || chat.name || chat.groupName || 'Sports Hub',
      avatar: chat.avatarUrl || chat.imageUrl || chat.avatar || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600',
      isMember,
      isPinned: inboxEntry?.isPinned || false,
      isMuted: inboxEntry?.isMuted || false,
      sport: chat.sportCategory || chat.sport || 'Football'
    };
    setActiveChat(formattedChat);
    markConversationAsRead(currentUserId, convId);
  };

  // Group membership toggle
  const handleJoinGroup = async (group) => {
    const gid = group.groupId || group.id || group.conversationId;
    await joinCommunityGroup(gid, user);
    setActiveChat(prev => prev ? { ...prev, isMember: true } : null);
  };

  const handleLeaveGroup = async (group) => {
    const gid = group.groupId || group.id || group.conversationId;
    await leaveCommunityGroup(gid, user);
    setActiveChat(prev => prev ? { ...prev, isMember: false } : null);
  };

  // Pin & Mute controls
  const handleTogglePin = async (e, convId, currentStatus) => {
    e.stopPropagation();
    await togglePinConversation(currentUserId, convId, !currentStatus);
  };

  const handleToggleMute = async (e, convId, currentStatus) => {
    e.stopPropagation();
    await toggleMuteConversation(currentUserId, convId, !currentStatus);
  };

  // Start 1:1 Direct Message with an athlete
  const handleStartDirectChat = async (athlete) => {
    setShowNewChatModal(false);
    const conv = await getOrCreateDirectConversation(user, athlete);
    if (conv) {
      const athleteName = athlete.displayName || athlete.full_name || athlete.name || 'Athlete';
      const athleteAvatar = athlete.avatarUrl || athlete.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${athlete.id}`;
      const formatted = {
        ...conv,
        id: conv.id,
        conversationId: conv.id,
        type: 'direct',
        name: athleteName,
        avatar: athleteAvatar,
        isMember: true,
        participants: [currentUserId, athlete.id || athlete.uid || athlete.firebase_uid]
      };
      setActiveChat(formatted);
      setActiveTabMode('direct');
      markConversationAsRead(currentUserId, conv.id);
    }
  };

  // Create new sports group
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setCreatingGroup(true);
    const created = await createCommunityGroup({
      name: newGroupName.trim(),
      sportCategory: newGroupSport,
      description: newGroupDesc.trim()
    }, user);
    setCreatingGroup(false);
    if (created) {
      setShowCreateGroupModal(false);
      setNewGroupName('');
      setNewGroupDesc('');
      handleSelectChat(created);
      setActiveTabMode('hubs');
    }
  };

  // Total unread counts
  const totalUnreadHubs = useMemo(() => {
    return inboxItems
      .filter(item => item.type === 'group')
      .reduce((acc, item) => acc + (item.unreadCount || 0), 0);
  }, [inboxItems]);

  const totalUnreadDirect = useMemo(() => {
    return inboxItems
      .filter(item => item.type === 'direct')
      .reduce((acc, item) => acc + (item.unreadCount || 0), 0);
  }, [inboxItems]);

  // Filtered lists
  const filteredHubs = useMemo(() => {
    return communityGroups.filter(group => {
      if (selectedSport !== 'All' && group.sportCategory !== selectedSport) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (group.name || '').toLowerCase();
        const sport = (group.sportCategory || '').toLowerCase();
        const desc = (group.description || '').toLowerCase();
        const loc = (group.locationReference || '').toLowerCase();
        return name.includes(q) || sport.includes(q) || desc.includes(q) || loc.includes(q);
      }
      return true;
    }).sort((a, b) => {
      const aJoined = joinedGroupIds.has(a.groupId || a.id);
      const bJoined = joinedGroupIds.has(b.groupId || b.id);
      if (aJoined && !bJoined) return -1;
      if (!aJoined && bJoined) return 1;
      return (b.memberCount || 0) - (a.memberCount || 0);
    });
  }, [communityGroups, selectedSport, searchQuery, joinedGroupIds]);

  const filteredDirect = useMemo(() => {
    return inboxItems.filter(item => {
      if (item.type !== 'direct') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const title = (item.title || '').toLowerCase();
        const lastMsg = (item.lastMessage?.text || '').toLowerCase();
        return title.includes(q) || lastMsg.includes(q);
      }
      return true;
    });
  }, [inboxItems, searchQuery]);

  const formatTimestamp = (ts) => {
    if (!ts) return '';
    try {
      const date = ts?.toDate ? ts.toDate() : (ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts));
      if (isNaN(date.getTime())) return '';
      const now = new Date();
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-[#08080a] text-white flex flex-col font-sans select-none antialiased">
      {/* ── TOP HERO BANNER ───────────────────────────────────────── */}
      <div className="border-b border-white/8 bg-[#0c0c10]/90 backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Live Firestore Sync
              </span>
              <span className="text-[11px] text-neutral-400">Persistent across Android, iOS & Web</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight uppercase mt-1">
              Community Hub & Live Chat
            </h1>
            <p className="text-xs text-neutral-400 font-light max-w-xl">
              Connect with fellow athletes in Chennai, join specialized sports clubs, coordinate friendly turf matches, and chat in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {!notificationEnabled && (
              <button
                onClick={handleEnableNotifications}
                className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-neutral-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Bell className="w-3.5 h-3.5 text-indigo-400" />
                <span>Enable Push Notifications</span>
              </button>
            )}

            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Create Sports Club</span>
            </button>

            <button
              onClick={() => setShowNewChatModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.35)] cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Message Athlete</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER (SPLIT PANE) ──────────────────── */}
      <div className="max-w-7xl mx-auto w-full flex-grow flex p-3 sm:p-5 lg:p-6 gap-5 h-[calc(100vh-140px)]">
        
        {/* ── LEFT PANE: CONVERSATION LIST ── */}
        <div className={`w-full lg:w-96 flex-shrink-0 flex flex-col bg-[#101014] border border-white/8 rounded-3xl overflow-hidden shadow-2xl ${
          activeChat ? 'hidden lg:flex' : 'flex'
        }`}>
          
          {/* Tabs: Sports Hubs vs Direct Chats */}
          <div className="p-3 border-b border-white/8 bg-white/[0.02]">
            <div className="grid grid-cols-2 p-1 bg-black/40 rounded-2xl border border-white/6">
              <button
                onClick={() => setActiveTabMode('hubs')}
                className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTabMode === 'hubs'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Sports Hubs</span>
                {totalUnreadHubs > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                    {totalUnreadHubs}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTabMode('direct')}
                className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTabMode === 'direct'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Direct DMs</span>
                {totalUnreadDirect > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                    {totalUnreadDirect}
                  </span>
                )}
              </button>
            </div>

            {/* Search Input */}
            <div className="mt-3 relative">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={activeTabMode === 'hubs' ? 'Search sports clubs, leagues...' : 'Search direct messages...'}
                className="w-full bg-black/40 border border-white/8 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Sport Category Pills for Hubs */}
            {activeTabMode === 'hubs' && (
              <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 scrollbar-none">
                {SPORT_CATEGORIES.map(sport => (
                  <button
                    key={sport}
                    onClick={() => setSelectedSport(sport)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                      selectedSport === sport
                        ? 'bg-white text-black font-extrabold shadow-sm'
                        : 'bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    {sport}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Conversations List */}
          <div className="flex-grow overflow-y-auto divide-y divide-white/[0.04] scrollbar-thin">
            {loading ? (
              <div className="p-8 text-center text-neutral-500 space-y-2">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs">Connecting to Firestore message streams...</p>
              </div>
            ) : activeTabMode === 'hubs' ? (
              /* ── HUBS TAB LIST ── */
              filteredHubs.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center mx-auto text-xl">
                    🏆
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-300">No sports clubs found</p>
                    <p className="text-[11px] text-neutral-500 mt-1">Try another sport filter or create a new sports club.</p>
                  </div>
                </div>
              ) : (
                filteredHubs.map(group => {
                  const gid = group.groupId || group.id;
                  const isSelected = activeChat?.id === gid || activeChat?.groupId === gid;
                  const isJoined = joinedGroupIds.has(gid);
                  const inboxEntry = inboxItems.find(i => i.conversationId === gid);
                  const unread = inboxEntry?.unreadCount || 0;
                  const isPinned = inboxEntry?.isPinned;
                  const isMuted = inboxEntry?.isMuted;
                  const lastSnippet = inboxEntry?.lastMessage?.text || group.description || 'Open sports group';

                  return (
                    <div
                      key={gid}
                      onClick={() => handleSelectChat(group)}
                      className={`p-3.5 flex items-center gap-3 transition-colors cursor-pointer group ${
                        isSelected
                          ? 'bg-indigo-600/15 border-l-4 border-indigo-500'
                          : 'hover:bg-white/[0.04]'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={group.imageUrl}
                          alt={group.name}
                          className="w-11 h-11 rounded-2xl object-cover border border-white/10 shadow-sm"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-black/90 border border-white/20 flex items-center justify-center text-[10px]">
                          <SportIcon sport={group.sportCategory || 'Football'} className="w-3 h-3 text-indigo-400" />
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 truncate">
                            {isPinned && <Pin className="w-3 h-3 text-amber-400 flex-shrink-0 rotate-45" />}
                            <h4 className="font-display font-black text-xs text-white truncate tracking-tight">
                              {group.name}
                            </h4>
                          </div>

                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase flex-shrink-0 ${
                            isJoined
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                              : 'bg-white/5 text-neutral-400 border border-white/10'
                          }`}>
                            {isJoined ? 'Joined' : 'Open'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p className="text-[11px] text-neutral-400 truncate font-light">
                            {lastSnippet}
                          </p>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {isMuted && <VolumeX className="w-3 h-3 text-neutral-500" />}
                            {unread > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black shadow-md">
                                {unread}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-1">
                          <span>{group.memberCount || 1} members • {group.locationReference || 'Chennai'}</span>
                          {isJoined && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                title={isPinned ? 'Unpin' : 'Pin to top'}
                                onClick={(e) => handleTogglePin(e, gid, isPinned)}
                                className="p-1 hover:text-amber-400"
                              >
                                <Pin className="w-2.5 h-2.5" />
                              </button>
                              <button
                                title={isMuted ? 'Unmute' : 'Mute'}
                                onClick={(e) => handleToggleMute(e, gid, isMuted)}
                                className="p-1 hover:text-neutral-300"
                              >
                                {isMuted ? <Volume2 className="w-2.5 h-2.5" /> : <VolumeX className="w-2.5 h-2.5" />}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              /* ── DIRECT DMS TAB LIST ── */
              filteredDirect.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center mx-auto text-xl">
                    💬
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-300">No direct messages yet</p>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Reach out to fellow players or venue hosts to start a 1:1 conversation.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowNewChatModal(true)}
                    className="px-3.5 py-1.5 bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 text-xs font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                  >
                    + Find Athletes to Chat
                  </button>
                </div>
              ) : (
                filteredDirect.map(item => {
                  const isSelected = activeChat?.id === item.conversationId;
                  const unread = item.unreadCount || 0;
                  const lastSnippet = item.lastMessage?.text || 'Started a conversation';
                  const timeFormatted = formatTimestamp(item.lastMessageTimestamp);

                  return (
                    <div
                      key={item.conversationId}
                      onClick={() => handleSelectChat(item)}
                      className={`p-3.5 flex items-center gap-3 transition-colors cursor-pointer group ${
                        isSelected
                          ? 'bg-indigo-600/15 border-l-4 border-indigo-500'
                          : 'hover:bg-white/[0.04]'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={item.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.conversationId}`}
                          alt={item.title}
                          className="w-11 h-11 rounded-2xl object-cover border border-white/10 shadow-sm"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#101014]" />
                      </div>

                      {/* Details */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 truncate">
                            {item.isPinned && <Pin className="w-3 h-3 text-amber-400 flex-shrink-0 rotate-45" />}
                            <h4 className="font-display font-black text-xs text-white truncate tracking-tight">
                              {item.title}
                            </h4>
                          </div>

                          <span className="text-[10px] text-neutral-500 flex-shrink-0">
                            {timeFormatted}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p className="text-[11px] text-neutral-400 truncate font-light">
                            {item.lastMessage?.senderName && (
                              <span className="font-semibold text-neutral-300">
                                {item.lastMessage.senderUid === currentUserId ? 'You: ' : `${item.lastMessage.senderName}: `}
                              </span>
                            )}
                            {lastSnippet}
                          </p>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {item.isMuted && <VolumeX className="w-3 h-3 text-neutral-500" />}
                            {unread > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-black shadow-md">
                                {unread}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quick Hover Controls */}
                        <div className="flex items-center justify-end text-[10px] text-neutral-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            title={item.isPinned ? 'Unpin' : 'Pin to top'}
                            onClick={(e) => handleTogglePin(e, item.conversationId, item.isPinned)}
                            className="p-1 hover:text-amber-400"
                          >
                            <Pin className="w-2.5 h-2.5" />
                          </button>
                          <button
                            title={item.isMuted ? 'Unmute' : 'Mute'}
                            onClick={(e) => handleToggleMute(e, item.conversationId, item.isMuted)}
                            className="p-1 hover:text-neutral-300"
                          >
                            {item.isMuted ? <Volume2 className="w-2.5 h-2.5" /> : <VolumeX className="w-2.5 h-2.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>

        {/* ── RIGHT PANE: ACTIVE CHAT OR WELCOME BANNER ── */}
        <div className={`flex-grow flex flex-col bg-[#101014] border border-white/8 rounded-3xl overflow-hidden shadow-2xl ${
          activeChat ? 'flex' : 'hidden lg:flex'
        }`}>
          {activeChat ? (
            <ChatWindowEnhanced
              key={activeChat.id}
              chat={activeChat}
              currentUser={{
                id: currentUserId,
                uid: currentUserId,
                name: currentUserName,
                full_name: currentUserName,
                avatar: currentUserAvatar,
                avatarUrl: currentUserAvatar
              }}
              isGroup={activeChat.type === 'group'}
              isMember={activeChat.type !== 'group' || joinedGroupIds.has(activeChat.id || activeChat.groupId)}
              onJoinGroup={() => handleJoinGroup(activeChat)}
              onLeaveGroup={() => handleLeaveGroup(activeChat)}
              onBack={() => setActiveChat(null)}
            />
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-neutral-500 relative overflow-hidden">
              {/* Background ambient light */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

              <div className="relative z-10 max-w-md space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-indigo-600/15 border border-indigo-500/25 flex items-center justify-center mx-auto text-3xl shadow-[0_0_30px_rgba(99,102,241,0.25)]">
                  🏟️
                </div>

                <div>
                  <h3 className="font-display font-black text-white text-lg tracking-tight uppercase">
                    Select a Sports Hub or Message an Athlete
                  </h3>
                  <p className="text-xs text-neutral-400 font-light mt-1">
                    Join live discussions, discover local players, book turf slots, and stay updated with your sports circle in real-time.
                  </p>
                </div>

                {/* Popular Sports Hubs Quick-Join */}
                <div className="pt-4 border-t border-white/6 text-left space-y-2">
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-400">
                    Featured Community Hubs
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {communityGroups.slice(0, 4).map(group => (
                      <button
                        key={group.groupId || group.id}
                        onClick={() => handleSelectChat(group)}
                        className="p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/8 transition-all flex items-center gap-2.5 text-left cursor-pointer group"
                      >
                        <img
                          src={group.imageUrl}
                          alt=""
                          className="w-8 h-8 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="min-w-0 flex-grow">
                          <p className="text-xs font-bold text-white truncate group-hover:text-indigo-400 transition-colors">
                            {group.name}
                          </p>
                          <p className="text-[10px] text-neutral-500 truncate">{group.memberCount || 1}+ members</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── MODAL: MESSAGE ATHLETE (1:1 DIRECT CHAT) ─────────────── */}
      <AnimatePresence>
        {showNewChatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#121216] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl text-left"
            >
              <div className="p-5 border-b border-white/8 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-black text-white text-base tracking-tight uppercase">
                    Connect With Athletes
                  </h3>
                  <p className="text-[11px] text-neutral-400">Start a one-on-one direct message</p>
                </div>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 max-h-80 overflow-y-auto divide-y divide-white/[0.04]">
                {athletes.length === 0 ? (
                  <p className="text-xs text-neutral-500 text-center py-6">No other athletes registered yet.</p>
                ) : (
                  athletes.map(athlete => (
                    <div
                      key={athlete.id}
                      onClick={() => handleStartDirectChat(athlete)}
                      className="py-3 px-2 flex items-center justify-between hover:bg-white/[0.04] rounded-2xl transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={athlete.avatar || athlete.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${athlete.id}`}
                          alt=""
                          className="w-10 h-10 rounded-2xl object-cover border border-white/10"
                        />
                        <div>
                          <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                            {athlete.full_name || athlete.name}
                          </p>
                          <p className="text-[10px] text-neutral-400">
                            {athlete.sport || 'Sports Enthusiast'} • {athlete.location || 'Chennai'}
                          </p>
                        </div>
                      </div>

                      <button className="px-3 py-1 rounded-xl bg-indigo-600/20 text-indigo-400 text-xs font-bold border border-indigo-500/30 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        Message
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: CREATE SPORTS GROUP ────────────────────────────── */}
      <AnimatePresence>
        {showCreateGroupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#121216] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl text-left"
            >
              <div className="p-5 border-b border-white/8 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-black text-white text-base tracking-tight uppercase">
                    Create Sports Club Hub
                  </h3>
                  <p className="text-[11px] text-neutral-400">Start an open group for match coordination</p>
                </div>
                <button
                  onClick={() => setShowCreateGroupModal(false)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="p-5 space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1.5">
                    Club / Group Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newGroupName}
                    onChange={e => setNewGroupName(e.target.value)}
                    placeholder="e.g. Porur Weekend Box Cricket Club"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1.5">
                    Primary Sport
                  </label>
                  <select
                    value={newGroupSport}
                    onChange={e => setNewGroupSport(e.target.value)}
                    className="w-full bg-[#18181f] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                  >
                    {SPORT_CATEGORIES.filter(s => s !== 'All').map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1.5">
                    Description & Rules
                  </label>
                  <textarea
                    rows={3}
                    value={newGroupDesc}
                    onChange={e => setNewGroupDesc(e.target.value)}
                    placeholder="Describe meetup times, skill levels, turf venues, and group expectations..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateGroupModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingGroup || !newGroupName.trim()}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    {creatingGroup ? 'Creating Hub...' : 'Create Hub'}
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
