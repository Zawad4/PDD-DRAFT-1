import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, MessageSquare, Plus, Search, Shield, Flame, Trophy,
  Zap, Star, Bell, BellRing, Check, CheckCheck, X, ChevronRight,
  Filter, Sparkles, Compass, MapPin, Activity, ArrowLeft,
  UserPlus, UserCheck, Radio, Circle, Pin, VolumeX, Volume2, Lock, ShieldCheck
} from 'lucide-react';
import SportIcon from '../components/SportIcon';
import ChatWindowEnhanced from '../components/ChatWindowEnhanced';
import {
  subscribeToUserInbox,
  subscribeToCommunityGroups,
  joinCommunityGroup,
  leaveCommunityGroup,
  getOrCreateDirectConversation,
  getDirectConversationId,
  createCommunityGroup,
  togglePinConversation,
  toggleMuteConversation,
  registerDeviceToken,
  ensureDefaultCommunityData,
  markConversationAsRead
} from '../services/chatService';
import { apiFetchAthletes, apiSearchUsers, apiFollowUser, NPC_TEST_USER_IDS } from '../services/db';
import { auth, setupPushNotifications } from '../services/firebase';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD ? '' : 'http://localhost:5000');


const SPORT_CATEGORIES = ['All', 'Football', 'Cricket', 'Badminton', 'Pickleball', 'Table Tennis', 'Bowling'];

export function getGroupImage(group) {
  if (!group) return '/bowling_group.jpg';
  const name = String(group.name || group.title || group.groupName || '').toLowerCase();
  const sport = String(group.sportCategory || group.sport || '').toLowerCase();
  const gid = String(group.groupId || group.id || '').toLowerCase();
  
  // Bowling group photo uploaded by user: strictly use /bowling_group.jpg
  if (sport.includes('bowling') || gid.includes('bowling') || name.includes('bowling')) {
    return '/bowling_group.jpg';
  }
  if (group.imageUrl) {
    if (group.imageUrl.includes('bowling')) return '/bowling_group.jpg';
    return group.imageUrl;
  }
  if (sport.includes('badminton') || gid.includes('badminton') || name.includes('badminton') || name.includes('smasher')) {
    return 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=600';
  }
  if (sport.includes('cricket') || gid.includes('cricket') || name.includes('cricket')) {
    return 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=600';
  }
  if (sport.includes('pickleball') || sport.includes('padel') || gid.includes('pickleball') || gid.includes('padel') || name.includes('padel')) {
    return 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=600';
  }
  if (sport.includes('tennis') || gid.includes('tennis') || name.includes('tennis')) {
    return 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=600';
  }
  if (sport.includes('football') || gid.includes('football') || name.includes('football') || name.includes('turf hub')) {
    return 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600';
  }
  return 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600';
}

export function GroupAvatar({ group, className = "w-14 h-14 rounded-2xl", showBadge = true }) {
  const [imgFailed, setImgFailed] = useState(false);
  const sport = group?.sportCategory || group?.sport || 'Football';
  const imgUrl = getGroupImage(group);

  const getGradient = (sp) => {
    const s = String(sp).toLowerCase();
    if (s.includes('badminton')) return 'from-emerald-600 to-teal-800';
    if (s.includes('cricket')) return 'from-amber-600 to-orange-800';
    if (s.includes('pickleball') || s.includes('padel') || s.includes('tennis')) return 'from-lime-600 to-emerald-800';
    if (s.includes('bowling')) return 'from-cyan-600 to-blue-800';
    return 'from-indigo-600 to-purple-800';
  };

  return (
    <div className="relative flex-shrink-0">
      {!imgFailed ? (
        <img
          src={imgUrl}
          alt=""
          onError={() => setImgFailed(true)}
          className={`${className} object-cover border border-white/10 shadow-sm`}
        />
      ) : (
        <div className={`${className} bg-gradient-to-br ${getGradient(sport)} flex items-center justify-center border border-white/10 shadow-sm text-white font-black text-xs`}>
          <SportIcon sport={sport} className="w-6 h-6 text-white/90" />
        </div>
      )}
      {showBadge && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-black/90 border border-white/20 flex items-center justify-center text-[10px]">
          <SportIcon sport={sport} className="w-3.5 h-3.5 text-indigo-400" />
        </div>
      )}
    </div>
  );
}

export default function Community({ user, setTab }) {
  const currentUserId = user?.firebase_uid || user?.id || user?.uid || auth.currentUser?.uid || 'usr_guest';
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

  // Friends & Live Search States
  const [followedAthletes, setFollowedAthletes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`turfington_friends_${currentUserId}`) || '[]');
    } catch {
      return [];
    }
  });
  const followedAthletesSet = useMemo(() => new Set(followedAthletes), [followedAthletes]);
  const [dynamicSearchResults, setDynamicSearchResults] = useState([]);
  const [modalDynamicResults, setModalDynamicResults] = useState([]);

  // Modals
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [athleteModalSearch, setAthleteModalSearch] = useState('');
  const [athleteFilterTab, setAthleteFilterTab] = useState('all'); // 'all' | 'google'
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupSport, setNewGroupSport] = useState('Football');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Push notifications
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  // Friend toggle handler
  const handleToggleFriend = async (e, athleteId) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const isFollowing = followedAthletes.includes(athleteId);
    const updated = isFollowing ? followedAthletes.filter(id => id !== athleteId) : [...followedAthletes, athleteId];
    setFollowedAthletes(updated);
    try {
      localStorage.setItem(`turfington_friends_${currentUserId}`, JSON.stringify(updated));
    } catch {}
    await apiFollowUser(currentUserId, athleteId);
  };

  // Check if routed from Discovery to start a direct chat
  useEffect(() => {
    try {
      const targetRaw = localStorage.getItem('turfington_target_chat_user');
      if (targetRaw) {
        localStorage.removeItem('turfington_target_chat_user');
        const targetPlayer = JSON.parse(targetRaw);
        if (targetPlayer) {
          handleStartDirectChat(targetPlayer);
        }
      }
    } catch {}
  }, []);

  // Live player search effects
  useEffect(() => {
    if (!searchQuery.trim()) {
      setDynamicSearchResults([]);
      return;
    }
    let active = true;
    apiSearchUsers(searchQuery, currentUserId).then(results => {
      if (active) setDynamicSearchResults(results);
    });
    return () => { active = false; };
  }, [searchQuery, currentUserId]);

  useEffect(() => {
    if (!athleteModalSearch.trim()) {
      setModalDynamicResults([]);
      return;
    }
    let active = true;
    apiSearchUsers(athleteModalSearch, currentUserId).then(results => {
      if (active) setModalDynamicResults(results);
    });
    return () => { active = false; };
  }, [athleteModalSearch, currentUserId]);

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

      // Keep active chat in sync with updated inbox item without changing id / remounting!
      setActiveChat(prev => {
        if (!prev) return null;
        const prevId = prev.id || prev.conversationId || prev.groupId;
        const matching = items.find(i => (i.conversationId === prevId || i.id === prevId || i.groupId === prevId));
        if (!matching) return prev;
        return {
          ...prev,
          ...matching,
          id: prevId,
          conversationId: prevId
        };
      });
    });

    // 2. Subscribe to Community Groups (communityGroups/{groupId})
    const unsubGroups = subscribeToCommunityGroups(selectedSport, (groups) => {
      if (!isMounted) return;
      setCommunityGroups(groups);
    });

    // 3. Fetch athletes for direct messaging (strictly excluding venue owners)
    apiFetchAthletes(currentUserId).then(data => {
      if (isMounted) {
        const isOwner = (u) => {
          const r = (u?.role || u?.userRole || u?.user_role || '').toLowerCase().trim();
          const em = (u?.email || '').toLowerCase().trim();
          return r === 'owner' || r === 'venue_owner' || r === 'turf_owner' || !!u?.is_owner || !!u?.venue_owner || em === 'owner123@gmail.cpm' || em === 'owner123@gmail.com' || em.startsWith('owner');
        };
        setAthletes((Array.isArray(data) ? data : []).filter(u => !isOwner(u)));
      }
    });

    // 4. Notification status
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationEnabled(Notification.permission === 'granted');
    }

    // 5. External chat open handler (from notification banner)
    const handleOpenChat = (e) => {
      if (!isMounted) return;
      const convId = e.detail?.conversationId;
      if (!convId) return;
      setActiveTabMode('direct');
      const target = inboxItems.find(i => (i.conversationId === convId || i.id === convId));
      if (target) {
        handleSelectChat(target);
      }
    };
    window.addEventListener('turfington_open_chat', handleOpenChat);

    return () => {
      isMounted = false;
      unsubInbox();
      unsubGroups();
      window.removeEventListener('turfington_open_chat', handleOpenChat);
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
    if (!chat) return;
    const convId = chat.conversationId || chat.groupId || chat.id;
    const isGrp = chat.type === 'group' || (!chat.type && !!chat.groupId);
    const isMember = isGrp ? joinedGroupIds.has(convId) : true;
    const inboxEntry = inboxItems.find(i => (i.conversationId === convId || i.id === convId));

    let otherUid = chat.otherUid || inboxEntry?.otherUid;
    if (!otherUid && convId && convId.startsWith('direct_')) {
      const parts = convId.replace('direct_', '').split('_');
      otherUid = parts.find(p => p !== currentUserId) || null;
    }

    const partnerName = chat.title || chat.name || chat.groupName || inboxEntry?.title || inboxEntry?.name || 'Athlete';
    const partnerAvatar = isGrp ? getGroupImage(chat) : (chat.avatarUrl || chat.avatar || inboxEntry?.avatarUrl || inboxEntry?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${otherUid || 'chat'}`);

    const formattedChat = {
      ...chat,
      id: convId,
      conversationId: convId,
      groupId: isGrp ? convId : undefined,
      type: isGrp ? 'group' : 'direct',
      name: partnerName,
      title: partnerName,
      avatar: partnerAvatar,
      avatarUrl: partnerAvatar,
      otherUid,
      participants: chat.participants || (otherUid ? [currentUserId, otherUid] : [currentUserId]),
      isMember,
      isPinned: inboxEntry?.isPinned || false,
      isMuted: inboxEntry?.isMuted || false,
      sport: chat.sportCategory || chat.sport || 'Football'
    };
    setActiveChat(formattedChat);
    markConversationAsRead(currentUserId, convId);
    setInboxItems(prev => prev.map(i => (i.conversationId === convId || i.id === convId) ? { ...i, unreadCount: 0 } : i));
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
  const handleStartDirectChat = async (athlete, e = null) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    if (!athlete) return;
    setShowNewChatModal(false);

    try {
      const athleteId = athlete.id || athlete.uid || athlete.firebase_uid;
      if (!athleteId) return;
      const athleteName = athlete.displayName || athlete.full_name || athlete.name || 'Athlete';
      const athleteAvatar = athlete.avatarUrl || athlete.avatar || athlete.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${athleteId}`;

      const me = {
        id: currentUserId,
        uid: currentUserId,
        firebase_uid: currentUserId,
        displayName: currentUserName,
        name: currentUserName,
        avatarUrl: currentUserAvatar,
        avatar: currentUserAvatar,
        is_google_user: !!(user?.is_google_user || user?.auth_provider === 'google' || auth.currentUser?.providerData?.some(p => p.providerId === 'google.com'))
      };

      let conv = null;
      try {
        conv = await getOrCreateDirectConversation(me, athlete);
      } catch (err) {
        console.warn('getOrCreateDirectConversation error:', err);
      }

      const convId = conv?.id || conv?.conversationId || getDirectConversationId(currentUserId, athleteId);

      const formatted = {
        ...(conv || {}),
        id: convId,
        conversationId: convId,
        type: 'direct',
        name: athleteName,
        title: athleteName,
        avatar: athleteAvatar,
        avatarUrl: athleteAvatar,
        isMember: true,
        participants: [currentUserId, athleteId]
      };

      // Immediately add/ensure in inboxItems state so conversation is visible in Direct DMs list
      setInboxItems(prev => {
        const exists = prev.some(i => (i.conversationId === convId || i.id === convId));
        if (exists) return prev;
        const newInboxEntry = {
          id: convId,
          conversationId: convId,
          type: 'direct',
          title: athleteName,
          name: athleteName,
          avatarUrl: athleteAvatar,
          otherUid: athleteId,
          isEncrypted: true,
          unreadCount: 0,
          isPinned: false,
          isMuted: false,
          lastMessage: null,
          lastMessageTimestamp: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return [newInboxEntry, ...prev];
      });

      // Notify backend Express server
      try {
        fetch(`${API_BASE}/api/chats/direct`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user1Id: currentUserId, user2Id: athleteId })
        }).catch(() => {});
      } catch {}

      setActiveChat(formatted);
      setActiveTabMode('direct');
      markConversationAsRead(currentUserId, convId);
    } catch (err) {
      console.error('handleStartDirectChat error:', err);
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
      const isDirect = item.type === 'direct' || String(item.conversationId || item.id || '').startsWith('direct_');
      if (!isDirect) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const title = (item.title || item.name || '').toLowerCase();
        const lastMsg = (item.lastMessage?.text || '').toLowerCase();
        return title.includes(q) || lastMsg.includes(q);
      }
      return true;
    });
  }, [inboxItems, searchQuery]);

  const isOwnerUser = (u) => {
    if (!u) return false;
    const r = (u.role || u.userRole || u.user_role || '').toLowerCase().trim();
    const em = (u.email || '').toLowerCase().trim();
    return r === 'owner' || r === 'venue_owner' || r === 'turf_owner' || !!u.is_owner || !!u.venue_owner || em === 'owner123@gmail.cpm' || em === 'owner123@gmail.com' || em.startsWith('owner');
  };

  // Athletes matching the main search bar for direct instant messaging
  const matchingAthletesFromSearch = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const cleanQ = q.replace(/^@/, '');

    const map = new Map();
    // 1. Add dynamic search results from server/database
    dynamicSearchResults.forEach(u => {
      const uid = u.id || u.firebase_uid || u.uid;
      if (uid && uid !== currentUserId && !NPC_TEST_USER_IDS.has(uid) && !isOwnerUser(u)) {
        map.set(uid, u);
      }
    });

    // 2. Add local athletes matching name, handle, player_id, email, or sport
    athletes.forEach(a => {
      const uid = a.id || a.firebase_uid || a.uid;
      if (!uid || uid === currentUserId || NPC_TEST_USER_IDS.has(uid) || isOwnerUser(a)) return;

      const name = (a.name || a.full_name || a.displayName || '').toLowerCase();
      const uName = (a.username || '').toLowerCase();
      const pId = (a.player_id || a.handle || '').toLowerCase();
      const email = (a.email || '').toLowerCase();
      const sport = (a.sport || '').toLowerCase();
      const loc = (a.location || '').toLowerCase();

      if (
        name.includes(cleanQ) ||
        uName.includes(cleanQ) ||
        pId.includes(q) ||
        pId.includes(cleanQ) ||
        email.includes(cleanQ) ||
        sport.includes(cleanQ) ||
        loc.includes(cleanQ)
      ) {
        if (!map.has(uid)) map.set(uid, a);
      }
    });

    return Array.from(map.values());
  }, [athletes, searchQuery, dynamicSearchResults, currentUserId]);

  // If user types a specific email into main search that isn't yet in preloaded list
  const directInviteAthlete = useMemo(() => {
    const q = searchQuery.trim();
    if (!q || !q.includes('@')) return null;
    const cleanEmail = q.toLowerCase();
    if (cleanEmail === 'owner123@gmail.cpm' || cleanEmail === 'owner123@gmail.com' || cleanEmail.startsWith('owner')) return null;
    const exists = athletes.some(a => (a.email || '').toLowerCase() === cleanEmail);
    if (exists) return null;
    const id = 'usr_email_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
    return {
      id,
      uid: id,
      firebase_uid: id,
      name: cleanEmail.split('@')[0],
      full_name: cleanEmail.split('@')[0],
      displayName: cleanEmail.split('@')[0],
      player_id: `@${cleanEmail.split('@')[0]}`,
      handle: `@${cleanEmail.split('@')[0]}`,
      email: cleanEmail,
      auth_provider: 'google',
      is_google_user: true,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`,
      sport: 'Google Athlete',
      location: 'Direct Recipient',
      isDirectInvite: true
    };
  }, [athletes, searchQuery]);

  // Athletes inside the Connect With Athletes modal
  const modalFilteredAthletes = useMemo(() => {
    const map = new Map();

    // 1. If searching, prioritize dynamic live database results
    modalDynamicResults.forEach(u => {
      const uid = u.id || u.firebase_uid || u.uid;
      if (uid && uid !== currentUserId && !NPC_TEST_USER_IDS.has(uid) && !isOwnerUser(u)) {
        map.set(uid, u);
      }
    });

    // 2. Filter in-memory athletes
    let baseList = athletes.filter(a => {
      const uid = a.id || a.firebase_uid || a.uid;
      return uid && uid !== currentUserId && !NPC_TEST_USER_IDS.has(uid) && !isOwnerUser(a);
    });

    if (athleteFilterTab === 'google') {
      baseList = baseList.filter(a => a.is_google_user || a.auth_provider === 'google' || a.email?.endsWith('@gmail.com'));
    }

    if (athleteModalSearch.trim()) {
      const q = athleteModalSearch.toLowerCase().trim();
      const cleanQ = q.replace(/^@/, '');
      baseList = baseList.filter(a => {
        const name = (a.name || a.full_name || a.displayName || '').toLowerCase();
        const uName = (a.username || '').toLowerCase();
        const pId = (a.player_id || a.handle || '').toLowerCase();
        const email = (a.email || '').toLowerCase();
        const sport = (a.sport || '').toLowerCase();
        const loc = (a.location || '').toLowerCase();
        return (
          name.includes(cleanQ) ||
          uName.includes(cleanQ) ||
          pId.includes(q) ||
          pId.includes(cleanQ) ||
          email.includes(cleanQ) ||
          sport.includes(cleanQ) ||
          loc.includes(cleanQ)
        );
      });
    }

    baseList.forEach(a => {
      const uid = a.id || a.firebase_uid || a.uid;
      if (!map.has(uid)) map.set(uid, a);
    });

    return Array.from(map.values());
  }, [athletes, athleteFilterTab, athleteModalSearch, modalDynamicResults, currentUserId]);

  // If user types an email in the Connect modal that isn't yet in preloaded list
  const modalDirectInviteAthlete = useMemo(() => {
    const q = athleteModalSearch.trim();
    if (!q || !q.includes('@')) return null;
    const cleanEmail = q.toLowerCase();
    if (cleanEmail === 'owner123@gmail.cpm' || cleanEmail === 'owner123@gmail.com' || cleanEmail.startsWith('owner')) return null;
    const exists = athletes.some(a => (a.email || '').toLowerCase() === cleanEmail);
    if (exists) return null;
    const id = 'usr_email_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
    return {
      id,
      uid: id,
      firebase_uid: id,
      name: cleanEmail.split('@')[0],
      full_name: cleanEmail.split('@')[0],
      displayName: cleanEmail.split('@')[0],
      email: cleanEmail,
      auth_provider: 'google',
      is_google_user: true,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`,
      sport: 'Google Athlete',
      location: 'Direct Recipient',
      isDirectInvite: true
    };
  }, [athletes, athleteModalSearch]);

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
              onClick={() => {
                apiFetchAthletes(currentUserId).then(data => setAthletes(data));
                setShowNewChatModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.35)] cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Find Athletes</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER (SPLIT PANE) ──────────────────── */}
      <div className="max-w-[1550px] mx-auto w-full flex-grow flex p-3 sm:p-5 lg:p-6 gap-5 h-[calc(100vh-140px)]">
        
        {/* ── LEFT PANE: CONVERSATION LIST (ENLARGED & SPACIOUS) ── */}
        <div className={`w-full lg:w-[420px] xl:w-[460px] flex-shrink-0 flex flex-col bg-[#101014] border border-white/8 rounded-3xl overflow-hidden shadow-2xl ${
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
                      className={`p-4 flex items-center gap-3.5 transition-colors cursor-pointer group ${
                        isSelected
                          ? 'bg-indigo-600/15 border-l-4 border-indigo-500'
                          : 'hover:bg-white/[0.04]'
                      }`}
                    >
                      {/* Avatar */}
                      <GroupAvatar group={group} className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl" showBadge={true} />

                      {/* Details */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 truncate">
                            {isPinned && <Pin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 rotate-45" />}
                            <h4 className="font-display font-black text-sm text-white truncate tracking-tight">
                              {group.name}
                            </h4>
                          </div>

                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase flex-shrink-0 ${
                            isJoined
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                              : 'bg-white/5 text-neutral-400 border border-white/10'
                          }`}>
                            {isJoined ? 'Joined' : 'Open'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p className="text-xs text-neutral-400 truncate font-normal">
                            {lastSnippet}
                          </p>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {isMuted && <VolumeX className="w-3.5 h-3.5 text-neutral-500" />}
                            {unread > 0 && (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black shadow-md">
                                {unread}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-neutral-500 mt-1.5">
                          <span>{group.memberCount || 1} members • {group.locationReference || 'Chennai'}</span>
                          {isJoined && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                title={isPinned ? 'Unpin' : 'Pin to top'}
                                onClick={(e) => handleTogglePin(e, gid, isPinned)}
                                className="p-1 hover:text-amber-400"
                              >
                                <Pin className="w-3 h-3" />
                              </button>
                              <button
                                title={isMuted ? 'Unmute' : 'Mute'}
                                onClick={(e) => handleToggleMute(e, gid, isMuted)}
                                className="p-1 hover:text-neutral-300"
                              >
                                {isMuted ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
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
              (filteredDirect.length === 0 && matchingAthletesFromSearch.length === 0 && !directInviteAthlete) ? (
                <div className="p-8 text-center text-neutral-500 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center mx-auto text-xl">
                    💬
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-300">
                      {searchQuery.trim() ? `No chats or athletes matching "${searchQuery}"` : 'No direct messages yet'}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      {searchQuery.trim() ? 'Type a Google email address or search another name.' : 'Reach out to fellow players or venue hosts to start a secure 1:1 conversation.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      apiFetchAthletes(currentUserId).then(data => {
                        const isOwner = (u) => {
                          const r = (u?.role || u?.userRole || u?.user_role || '').toLowerCase().trim();
                          const em = (u?.email || '').toLowerCase().trim();
                          return r === 'owner' || r === 'venue_owner' || r === 'turf_owner' || !!u?.is_owner || !!u?.venue_owner || em === 'owner123@gmail.cpm' || em === 'owner123@gmail.com' || em.startsWith('owner');
                        };
                        setAthletes((Array.isArray(data) ? data : []).filter(u => !isOwner(u)));
                      });
                      setShowNewChatModal(true);
                    }}
                    className="px-3.5 py-1.5 bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 text-xs font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                  >
                    + Find Athletes to Chat
                  </button>
                </div>
              ) : (
                <>
                  {/* Direct Email Action Card */}
                  {directInviteAthlete && (
                    <div
                      onClick={() => handleStartDirectChat(directInviteAthlete)}
                      className="p-3 mx-2 my-2 bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-500/30 hover:border-blue-500/60 rounded-2xl flex items-center justify-between gap-3 shadow-lg transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 border border-blue-400/40 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-md">
                          G
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                              {directInviteAthlete.email}
                            </p>
                            <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 text-[8px] font-bold">
                              Google Direct
                            </span>
                          </div>
                          <p className="text-[10px] text-neutral-400 truncate">
                            Start 1:1 end-to-end encrypted chat with this Google email
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleStartDirectChat(directInviteAthlete); }}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md flex-shrink-0 transition-all cursor-pointer"
                      >
                        <Lock className="w-3 h-3 text-emerald-300" />
                        <span>Message</span>
                      </button>
                    </div>
                  )}

                  {/* Active existing conversations */}
                  {filteredDirect.map(item => {
                    const isSelected = activeChat?.id === item.conversationId;
                    const unread = item.unreadCount || 0;
                    const lastSnippet = item.lastMessage?.text || 'Started a conversation';
                    const timeFormatted = formatTimestamp(item.lastMessageTimestamp);

                    return (
                      <div
                        key={item.conversationId}
                        onClick={() => handleSelectChat(item)}
                        className={`p-4 flex items-center gap-3.5 transition-colors cursor-pointer group ${
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
                            className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover border border-white/10 shadow-sm"
                          />
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#101014]" />
                        </div>

                        {/* Details */}
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 truncate">
                              {item.isPinned && <Pin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 rotate-45" />}
                              <h4 className="font-display font-black text-sm text-white truncate tracking-tight">
                                {item.title}
                              </h4>
                            </div>

                            <span className="text-xs text-neutral-500 flex-shrink-0">
                              {timeFormatted}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-2 mt-1">
                            <p className="text-xs text-neutral-400 truncate font-normal flex items-center gap-1">
                              {item.lastMessage?.senderName && (
                                <span className="font-semibold text-neutral-300">
                                  {item.lastMessage.senderUid === currentUserId ? 'You: ' : `${item.lastMessage.senderName}: `}
                                </span>
                              )}
                              <span className="truncate">{lastSnippet}</span>
                            </p>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <Lock className="w-3 h-3 text-emerald-400/80" title="End-to-End Encrypted" />
                              {item.isMuted && <VolumeX className="w-3.5 h-3.5 text-neutral-500" />}
                              {unread > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black shadow-md">
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
                  })}

                  {/* Registered athletes & Google accounts matching search query */}
                  {searchQuery.trim() && matchingAthletesFromSearch.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/8">
                      <div className="px-4 py-1.5 flex items-center justify-between text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest">
                        <span>Athletes & Google Accounts ({matchingAthletesFromSearch.length})</span>
                        <span className="text-[9px] text-indigo-400 font-medium">Tap to Message</span>
                      </div>
                      {matchingAthletesFromSearch.map(athlete => {
                        const isFriend = followedAthletesSet.has(athlete.id);
                        const playerId = athlete.player_id || athlete.handle || (athlete.username ? `@${athlete.username}` : '');
                        return (
                          <div
                            key={'search_' + athlete.id}
                            onClick={() => handleStartDirectChat(athlete)}
                            className="p-3 mx-2 my-1 flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.06] rounded-2xl border border-white/6 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="relative flex-shrink-0">
                                <img
                                  src={athlete.avatar || athlete.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${athlete.id}`}
                                  alt=""
                                  className="w-9 h-9 rounded-xl object-cover border border-white/10"
                                />
                                {athlete.is_google_user && (
                                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-600 border border-black flex items-center justify-center text-[7px] text-white font-black" title="Google Verified">
                                    G
                                  </span>
                                )}
                              </div>
                              <div className="truncate">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                                    {athlete.full_name || athlete.name}
                                  </p>
                                  {athlete.is_google_user && (
                                    <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 text-[8px] font-bold">
                                      Google
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 truncate mt-0.5">
                                  {playerId && (
                                    <span className="text-indigo-400 font-mono font-bold bg-indigo-500/10 px-1 py-0.2 rounded text-[9px]">{playerId}</span>
                                  )}
                                  {athlete.email ? (
                                    <span className="text-neutral-400 font-mono truncate">{athlete.email}</span>
                                  ) : (
                                    <span>{athlete.sport || 'Sports Athlete'}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button
                                type="button"
                                onClick={(e) => handleToggleFriend(e, athlete.id)}
                                className={`px-2 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                  isFriend
                                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white border border-white/10'
                                }`}
                              >
                                {isFriend ? <UserCheck className="w-2.5 h-2.5" /> : <UserPlus className="w-2.5 h-2.5" />}
                                <span>{isFriend ? 'Friends' : 'Add Friend+'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleStartDirectChat(athlete); }}
                                className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-500 transition-all flex items-center gap-1 shadow-sm flex-shrink-0 cursor-pointer"
                              >
                                <Lock className="w-2.5 h-2.5 text-emerald-300" />
                                <span>Message</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
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
                        <GroupAvatar group={group} className="w-8 h-8 rounded-xl" showBadge={false} />
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
                  <h3 className="font-display font-black text-white text-base tracking-tight uppercase flex items-center gap-2">
                    <span>Find Athletes & Connect</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> E2EE
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-400">Search players by Player ID or name to add friends & chat</p>
                </div>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Bar & Filter Tabs */}
              <div className="p-4 border-b border-white/6 bg-white/[0.02] space-y-3">
                <div className="relative flex items-center bg-white/[0.05] border border-white/10 focus-within:border-indigo-500/50 rounded-2xl px-3.5 py-2.5 transition-colors">
                  <Search className="w-4 h-4 text-neutral-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    value={athleteModalSearch}
                    onChange={(e) => setAthleteModalSearch(e.target.value)}
                    placeholder="Search by Player ID (e.g. @player), name, or email..."
                    className="w-full bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
                    autoFocus
                  />
                  {athleteModalSearch && (
                    <button onClick={() => setAthleteModalSearch('')} className="text-neutral-500 hover:text-white p-0.5 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAthleteFilterTab('all')}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                      athleteFilterTab === 'all'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white border border-white/8'
                    }`}
                  >
                    All Athletes ({athletes.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAthleteFilterTab('google')}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                      athleteFilterTab === 'google'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white border border-white/8'
                    }`}
                  >
                    <svg className="w-3 h-3" viewBox="0 0 18 18" fill="none">
                      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                      <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
                      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
                    </svg>
                    <span>Google Signed-In ({athletes.filter(a => a.is_google_user || a.auth_provider === 'google' || a.email?.endsWith('@gmail.com')).length})</span>
                  </button>
                </div>
              </div>

              <div className="p-4 max-h-80 overflow-y-auto divide-y divide-white/[0.04]">
                {modalDirectInviteAthlete && (
                  <div
                    onClick={() => handleStartDirectChat(modalDirectInviteAthlete)}
                    className="mb-3 p-3 bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-500/30 hover:border-blue-500/60 rounded-2xl flex items-center justify-between gap-3 shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-blue-600 border border-blue-400/40 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-md">
                        G
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                            {modalDirectInviteAthlete.email}
                          </p>
                          <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 text-[8px] font-bold">
                            Google Direct
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 truncate">
                          Send 1:1 encrypted message to this Google account
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleStartDirectChat(modalDirectInviteAthlete); }}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md flex-shrink-0 transition-all cursor-pointer"
                    >
                      <Lock className="w-3 h-3 text-emerald-300" />
                      <span>Message</span>
                    </button>
                  </div>
                )}

                {modalFilteredAthletes.length === 0 && !modalDirectInviteAthlete ? (
                  <div className="text-center py-8 space-y-2">
                    <p className="text-xs text-neutral-400 font-bold">No users found</p>
                    <p className="text-[11px] text-neutral-500">
                      {athleteModalSearch ? `No users found matching "${athleteModalSearch}".` : 'No users found.'}
                    </p>
                  </div>
                ) : (
                  modalFilteredAthletes.map(athlete => {
                    const isFriend = followedAthletesSet.has(athlete.id);
                    const playerId = athlete.player_id || athlete.handle || (athlete.username ? `@${athlete.username}` : '');
                    return (
                      <div
                        key={athlete.id}
                        onClick={() => handleStartDirectChat(athlete)}
                        className="py-3 px-3 flex items-center justify-between hover:bg-white/[0.04] rounded-2xl transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative flex-shrink-0">
                            <img
                              src={athlete.avatar || athlete.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${athlete.id}`}
                              alt=""
                              className="w-11 h-11 rounded-2xl object-cover border border-white/10"
                            />
                            {athlete.is_google_user && (
                              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-600 border border-black flex items-center justify-center text-[8px] text-white font-black" title="Signed in with Google">
                                G
                              </span>
                            )}
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-2 truncate">
                              <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                                {athlete.full_name || athlete.name}
                              </p>
                              {playerId && (
                                <span className="text-[10px] text-indigo-400 font-mono font-bold bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded-md">
                                  {playerId}
                                </span>
                              )}
                              {athlete.is_google_user && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/15 border border-blue-500/25 text-blue-400 text-[9px] font-extrabold flex-shrink-0">
                                  Google
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                              {athlete.email ? <span className="text-neutral-300 font-mono">{athlete.email}</span> : (athlete.sport || 'Sports Athlete')} • {athlete.location || 'Chennai'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleToggleFriend(e, athlete.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isFriend
                                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30'
                                : 'bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white border border-white/10'
                            }`}
                          >
                            {isFriend ? (
                              <>
                                <UserCheck className="w-3 h-3" />
                                <span>Friends</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3 h-3" />
                                <span>Add Friend+</span>
                              </>
                            )}
                          </button>

                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleStartDirectChat(athlete); }}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/30 flex-shrink-0 cursor-pointer"
                          >
                            <Lock className="w-3 h-3 text-emerald-300" />
                            <span>Message</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
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
