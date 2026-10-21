/**
 * Turfington Scalable Firestore Community Chat Service
 * Handles batched operations, transactions, pagination, and real-time listeners.
 */

import { db, auth } from './firebase.js';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  writeBatch,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';

/**
 * Default community sports groups to seed
 */
export const DEFAULT_COMMUNITY_GROUPS_CONFIG = [
  {
    groupId: 'group_football_chennai',
    name: '⚽ Chennai Football Turf Hub',
    description: 'Weekly 7v7 turf matches, tactical meetups, and friendly amateur leagues across Chennai.',
    sportCategory: 'Football',
    locationReference: 'Chennai, Tamil Nadu',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600',
    creatorUid: 'usr_amit_patel',
    visibility: 'public',
    memberCount: 48,
    initialMessage: 'Anyone up for 7v7 this Friday 7 PM at Astro Turf?'
  },
  {
    groupId: 'group_box_cricket',
    name: '🏏 Box Cricket Warriors',
    description: 'Fast-paced box cricket tournaments, night matches, and weekend nets. Batsmen & bowlers welcome!',
    sportCategory: 'Cricket',
    locationReference: 'Poonamallee, Chennai',
    imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=600',
    creatorUid: 'usr_rahul',
    visibility: 'public',
    memberCount: 62,
    initialMessage: 'Need 2 more players for tomorrow night box cricket at Turf Together!'
  },
  {
    groupId: 'group_badminton_smashers',
    name: '🏸 Smashers Badminton Club',
    description: 'Wooden and synthetic court doubles, high-intensity rallies, and morning coaching sessions.',
    sportCategory: 'Badminton',
    locationReference: 'Porur, Chennai',
    imageUrl: 'https://images.unsplash.com/photo-1521537634581-0ddea2ffe31a?q=80&w=600',
    creatorUid: 'usr_amit_patel',
    visibility: 'public',
    memberCount: 35,
    initialMessage: 'Court 3 booked for Sunday morning 7 AM. Who is joining for doubles?'
  },
  {
    groupId: 'group_pickleball_padel',
    name: '🎾 Padel & Pickleball Aces',
    description: 'Chennai’s premier racket community. Discover paddle sports, casual doubles, and coaching drills.',
    sportCategory: 'Pickleball',
    locationReference: 'Anna Nagar, Chennai',
    imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=600',
    creatorUid: 'usr_priya',
    visibility: 'public',
    memberCount: 27,
    initialMessage: 'New outdoor pickleball court open in Anna Nagar! Let us test it out.'
  },
  {
    groupId: 'group_table_tennis',
    name: '🏓 Table Tennis Spinners',
    description: 'Ping pong enthusiasts, spin-masters, and local tournament coordination.',
    sportCategory: 'Table Tennis',
    locationReference: 'T. Nagar, Chennai',
    imageUrl: 'https://images.unsplash.com/photo-1611251135345-18c56206b863?q=80&w=600',
    creatorUid: 'usr_amit_patel',
    visibility: 'public',
    memberCount: 19,
    initialMessage: 'Practicing backhand loops tonight at 8 PM at Elite TT Club.'
  },
  {
    groupId: 'group_strike_bowling',
    name: '🎳 Strike Bowling Squad',
    description: '10-pin bowling nights, high score leaderboards, and weekend squad socials.',
    sportCategory: 'Bowling',
    locationReference: 'Velachery, Chennai',
    imageUrl: 'https://images.unsplash.com/photo-1545232979-fbf68fe9b10d?q=80&w=600',
    creatorUid: 'usr_rahul',
    visibility: 'public',
    memberCount: 22,
    initialMessage: 'Who has a score above 180? Team challenge this Saturday!'
  }
];

// ─────────────────────────────────────────────────────────────
// 1. User Profile Management (`users/{uid}`)
// ─────────────────────────────────────────────────────────────

/**
 * Ensures user document exists in `users/{uid}`, reusing profile data
 */
export async function ensureUserProfile(user) {
  const uid = user?.uid || user?.firebase_uid || user?.id;
  if (!uid) return null;

  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);

    const profileData = {
      uid,
      displayName: user.displayName || user.full_name || user.name || 'Athlete',
      email: user.email || '',
      avatarUrl: user.avatarUrl || user.avatar || user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`,
      role: user.role || 'player',
      sport: user.sport || 'Football',
      location: user.location || 'Chennai, India',
      updatedAt: serverTimestamp()
    };

    if (!snap.exists()) {
      await setDoc(userRef, {
        ...profileData,
        createdAt: serverTimestamp()
      });
    } else {
      await setDoc(userRef, profileData, { merge: true });
    }

    return profileData;
  } catch (err) {
    console.warn('ensureUserProfile notice:', err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// 2. Direct Conversations (`conversations/{conversationId}`)
// ─────────────────────────────────────────────────────────────

/**
 * Get deterministic conversation ID between two UIDs to prevent duplicates
 */
export function getDirectConversationId(uid1, uid2) {
  const sorted = [String(uid1), String(uid2)].sort();
  return `direct_${sorted[0]}_${sorted[1]}`;
}

/**
 * Get or create a direct conversation using atomic batch write
 */
export async function getOrCreateDirectConversation(currentUser, targetUser) {
  const currentUid = currentUser?.uid || currentUser?.id || currentUser?.firebase_uid;
  const targetUid = targetUser?.uid || targetUser?.id || targetUser?.firebase_uid;
  
  if (!currentUid || !targetUid) throw new Error('Both users must have valid UIDs');

  const conversationId = getDirectConversationId(currentUid, targetUid);
  const convRef = doc(db, 'conversations', conversationId);

  try {
    const snap = await getDoc(convRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }

    const currentName = currentUser.displayName || currentUser.full_name || currentUser.name || 'Athlete';
    const targetName = targetUser.displayName || targetUser.full_name || targetUser.name || 'Athlete';
    const currentAvatar = currentUser.avatarUrl || currentUser.avatar || currentUser.avatar_url || '';
    const targetAvatar = targetUser.avatarUrl || targetUser.avatar || targetUser.avatar_url || '';

    // Atomic batch creation: conversation + inbox entries for both users
    const batch = writeBatch(db);

    const convData = {
      id: conversationId,
      type: 'direct',
      members: [currentUid, targetUid],
      creatorUid: currentUid,
      lastMessage: null,
      lastMessageTimestamp: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    batch.set(convRef, convData);

    // Current user's inbox
    const myInboxRef = doc(db, 'users', currentUid, 'inbox', conversationId);
    batch.set(myInboxRef, {
      conversationId,
      type: 'direct',
      title: targetName,
      avatarUrl: targetAvatar,
      otherUid: targetUid,
      lastMessage: null,
      lastMessageTimestamp: serverTimestamp(),
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      updatedAt: serverTimestamp()
    });

    // Target user's inbox
    const theirInboxRef = doc(db, 'users', targetUid, 'inbox', conversationId);
    batch.set(theirInboxRef, {
      conversationId,
      type: 'direct',
      title: currentName,
      avatarUrl: currentAvatar,
      otherUid: currentUid,
      lastMessage: null,
      lastMessageTimestamp: serverTimestamp(),
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      updatedAt: serverTimestamp()
    });

    await batch.commit();
    return convData;
  } catch (err) {
    console.warn('getOrCreateDirectConversation notice:', err);
    return {
      id: conversationId,
      type: 'direct',
      members: [currentUid, targetUid],
      creatorUid: currentUid
    };
  }
}

// ─────────────────────────────────────────────────────────────
// 3. Community Groups & Membership
// ─────────────────────────────────────────────────────────────

/**
 * Create a new sports community group and its linked conversation
 */
export async function createCommunityGroup(groupData, creatorUser) {
  const creatorUid = creatorUser?.uid || creatorUser?.id || creatorUser?.firebase_uid || auth.currentUser?.uid || 'usr_amit_patel';
  const creatorName = creatorUser?.displayName || creatorUser?.full_name || creatorUser?.name || 'Athlete';
  const creatorAvatar = creatorUser?.avatarUrl || creatorUser?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${creatorUid}`;

  const groupId = groupData.groupId || `group_${Date.now()}`;
  const conversationId = groupId;

  const sportImages = {
    Football: '/hero/hero_football_stadium_goal.jpg',
    Cricket: '/hero/hero_cricket_batsman.jpg',
    Badminton: '/hybrid_athlete_badminton.jpg',
    Pickleball: '/hero/hero_pickleball_court.jpg',
    'Table Tennis': '/hero/hero_table_tennis_paddle.jpg',
    Bowling: '/hero/hero_bowling_lane_pins.jpg',
    '8 Ball Pool': '/hero/hero_pool_billiards.jpg'
  };
  const finalImage = groupData.imageUrl || sportImages[groupData.sportCategory] || '/hero/hero_football_stadium_goal.jpg';

  const fullGroupData = {
    id: groupId,
    groupId,
    name: groupData.name.trim(),
    description: groupData.description ? groupData.description.trim() : '',
    sportCategory: groupData.sportCategory || 'Football',
    sport: groupData.sportCategory || 'Football',
    locationReference: groupData.locationReference || 'Chennai, Tamil Nadu',
    imageUrl: finalImage,
    creatorUid,
    creatorName,
    creatorAvatar,
    visibility: groupData.visibility || 'public',
    memberCount: 1,
    members: [creatorUid],
    conversationId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const convData = {
    id: conversationId,
    conversationId,
    type: 'group',
    groupId,
    members: [creatorUid],
    groupName: groupData.name.trim(),
    name: groupData.name.trim(),
    groupImage: finalImage,
    avatar: finalImage,
    sport: groupData.sportCategory || 'Football',
    creatorUid,
    lastMessage: `Club "${groupData.name.trim()}" created! Start organizing matches here.`,
    lastMessageTimestamp: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // 1. Immediately cache in localStorage for instant local responsiveness
  try {
    const localGroups = JSON.parse(localStorage.getItem('turfington_community_groups') || '[]');
    const updatedLocal = [fullGroupData, ...localGroups.filter(g => (g.groupId || g.id) !== groupId)];
    localStorage.setItem('turfington_community_groups', JSON.stringify(updatedLocal));

    // Also add to user inbox in localStorage
    const localInboxKey = `turfington_inbox_${creatorUid}`;
    const localInbox = JSON.parse(localStorage.getItem(localInboxKey) || '[]');
    const inboxItem = {
      id: conversationId,
      conversationId,
      type: 'group',
      groupId,
      title: groupData.name.trim(),
      avatarUrl: finalImage,
      sport: groupData.sportCategory || 'Football',
      lastMessage: convData.lastMessage,
      lastMessageTimestamp: convData.lastMessageTimestamp,
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(localInboxKey, JSON.stringify([inboxItem, ...localInbox.filter(i => (i.conversationId || i.id) !== conversationId)]));
  } catch (err) {
    console.warn('Local storage cache error:', err);
  }

  // 2. Persist to Express API server (writes to turfington_db.json so it is visible to ALL users)
  try {
    fetch('http://localhost:5000/api/community-groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...fullGroupData,
        creatorUid,
        creatorName,
        creatorAvatar
      })
    }).catch(e => console.warn('Backend group sync notice:', e));
  } catch (e) {
    console.warn('Backend fetch error:', e);
  }

  // 3. Asynchronously attempt Firestore sync without blocking the user
  try {
    const groupRef = doc(db, 'communityGroups', groupId);
    const convRef = doc(db, 'conversations', conversationId);
    const memberRef = doc(db, 'communityGroups', groupId, 'members', creatorUid);
    const inboxRef = doc(db, 'users', creatorUid, 'inbox', conversationId);

    const batch = writeBatch(db);
    batch.set(groupRef, {
      ...fullGroupData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    batch.set(convRef, {
      ...convData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessageTimestamp: serverTimestamp()
    });
    batch.set(memberRef, {
      uid: creatorUid,
      displayName: creatorName,
      avatarUrl: creatorAvatar,
      role: 'admin',
      status: 'active',
      joinedAt: serverTimestamp()
    });
    batch.set(inboxRef, {
      conversationId,
      type: 'group',
      groupId,
      title: groupData.name.trim(),
      avatarUrl: finalImage,
      sport: groupData.sportCategory || 'Football',
      lastMessage: null,
      lastMessageTimestamp: serverTimestamp(),
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      updatedAt: serverTimestamp()
    });
    batch.commit().catch(e => console.warn('Firestore commit error:', e));
  } catch (firestoreErr) {
    console.warn('Firestore batch setup error:', firestoreErr);
  }

  // Return immediately so UI doesn't hang!
  return { ...fullGroupData, conversation: convData };
}

/**
 * Join a community group with batch updates to members, memberCount, and conversation
 */
export async function joinCommunityGroup(groupId, user) {
  const uid = user?.uid || user?.id || user?.firebase_uid || auth.currentUser?.uid || 'usr_amit_patel';
  if (!uid) return false;

  // 1. Notify Express backend
  try {
    fetch(`http://localhost:5000/api/community-groups/${groupId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uid })
    }).catch(e => console.warn('Backend join notice:', e));
  } catch (e) {}

  // 2. Update localStorage
  try {
    const local = JSON.parse(localStorage.getItem('turfington_community_groups') || '[]');
    const updated = local.map(g => {
      if ((g.groupId || g.id) === groupId) {
        const members = Array.isArray(g.members) ? [...g.members] : [];
        if (!members.includes(uid)) members.push(uid);
        return { ...g, members, memberCount: (g.memberCount || 0) + 1 };
      }
      return g;
    });
    localStorage.setItem('turfington_community_groups', JSON.stringify(updated));
  } catch (e) {}

  // 3. Firestore async sync
  try {
    const groupRef = doc(db, 'communityGroups', groupId);
    const convRef = doc(db, 'conversations', groupId);
    const memberRef = doc(db, 'communityGroups', groupId, 'members', uid);
    const inboxRef = doc(db, 'users', uid, 'inbox', groupId);

    const groupSnap = await getDoc(groupRef);
    if (groupSnap.exists()) {
      const gData = groupSnap.data();
      const batch = writeBatch(db);
      batch.set(memberRef, {
        uid,
        displayName: user?.displayName || user?.full_name || user?.name || 'Athlete',
        avatarUrl: user?.avatarUrl || user?.avatar || '',
        role: 'member',
        status: 'active',
        joinedAt: serverTimestamp()
      });
      batch.update(groupRef, {
        memberCount: increment(1),
        updatedAt: serverTimestamp()
      });
      batch.update(convRef, {
        members: arrayUnion(uid),
        updatedAt: serverTimestamp()
      });
      batch.set(inboxRef, {
        conversationId: groupId,
        type: 'group',
        groupId,
        title: gData.name,
        avatarUrl: gData.imageUrl,
        sport: gData.sportCategory,
        lastMessage: gData.lastMessage || null,
        lastMessageTimestamp: serverTimestamp(),
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
        updatedAt: serverTimestamp()
      });
      batch.commit().catch(e => console.warn('Firestore join commit error:', e));
    }
  } catch (err) {
    console.warn('joinCommunityGroup notice:', err);
  }

  return true;
}

/**
 * Leave a community group
 */
export async function leaveCommunityGroup(groupId, user) {
  const uid = user?.uid || user?.id || user?.firebase_uid || auth.currentUser?.uid || 'usr_amit_patel';
  if (!uid) return false;

  // 1. Notify Express backend
  try {
    fetch(`http://localhost:5000/api/community-groups/${groupId}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uid })
    }).catch(e => console.warn('Backend leave notice:', e));
  } catch (e) {}

  // 2. Update localStorage
  try {
    const local = JSON.parse(localStorage.getItem('turfington_community_groups') || '[]');
    const updated = local.map(g => {
      if ((g.groupId || g.id) === groupId) {
        const members = Array.isArray(g.members) ? g.members.filter(m => m !== uid) : [];
        return { ...g, members, memberCount: Math.max(0, (g.memberCount || 1) - 1) };
      }
      return g;
    });
    localStorage.setItem('turfington_community_groups', JSON.stringify(updated));
  } catch (e) {}

  // 3. Firestore async sync
  try {
    const groupRef = doc(db, 'communityGroups', groupId);
    const convRef = doc(db, 'conversations', groupId);
    const memberRef = doc(db, 'communityGroups', groupId, 'members', uid);
    const inboxRef = doc(db, 'users', uid, 'inbox', groupId);

    const batch = writeBatch(db);
    batch.delete(memberRef);
    batch.delete(inboxRef);
    batch.update(groupRef, {
      memberCount: increment(-1),
      updatedAt: serverTimestamp()
    });
    batch.update(convRef, {
      members: arrayRemove(uid),
      updatedAt: serverTimestamp()
    });
    batch.commit().catch(e => console.warn('Firestore leave commit error:', e));
  } catch (err) {
    console.warn('leaveCommunityGroup notice:', err);
  }

  return true;
}

// ─────────────────────────────────────────────────────────────
// 4. Messages Subcollection & Atomic Inbox Fanout
// ─────────────────────────────────────────────────────────────

/**
 * Send message with batched updates to conversation preview and all members' inboxes
 */
export async function sendChatMessage(conversationId, senderUser, text, options = {}) {
  const senderUid = senderUser?.uid || senderUser?.id || senderUser?.firebase_uid;
  if (!senderUid || !text || !text.trim()) throw new Error('Sender UID and text required');

  const senderName = senderUser.displayName || senderUser.full_name || senderUser.name || 'Athlete';
  const senderAvatar = senderUser.avatarUrl || senderUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${senderUid}`;

  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
  const convRef = doc(db, 'conversations', conversationId);

  // 1. Fetch conversation to determine member list for inbox fanout
  let members = [senderUid];
  let convData = null;
  try {
    const convSnap = await getDoc(convRef);
    if (convSnap.exists()) {
      convData = convSnap.data();
      members = convData.members || [senderUid];
    }
  } catch (e) {}

  const batch = writeBatch(db);

  // 2. Message document
  const messageDoc = {
    id: messageId,
    conversationId,
    senderUid,
    senderName,
    senderAvatar,
    text: text.trim(),
    type: options.type || 'text',
    attachmentUrl: options.attachmentUrl || null,
    attachmentMetadata: options.attachmentMetadata || null,
    replyToId: options.replyToId || null,
    replyToSnippet: options.replyToSnippet || null,
    reactions: {},
    isDeleted: false,
    deletedAt: null,
    editedAt: null,
    createdAt: serverTimestamp()
  };
  batch.set(messageRef, messageDoc);

  // 3. Conversation preview update
  const preview = {
    text: text.trim(),
    senderUid,
    senderName,
    type: options.type || 'text',
    timestamp: Date.now()
  };

  batch.update(convRef, {
    lastMessage: preview,
    lastMessageTimestamp: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  // 4. Fanout to inboxes:
  // Sender gets unreadCount: 0; other recipients get increment(1)
  members.forEach(memberUid => {
    const userInboxRef = doc(db, 'users', memberUid, 'inbox', conversationId);
    const isSender = memberUid === senderUid;

    batch.set(userInboxRef, {
      conversationId,
      lastMessage: preview,
      lastMessageTimestamp: serverTimestamp(),
      unreadCount: isSender ? 0 : increment(1),
      ...(isSender ? { lastReadTimestamp: serverTimestamp() } : {}),
      updatedAt: serverTimestamp()
    }, { merge: true });
  });

  await batch.commit();

  // Express fallback sync
  fetch('http://localhost:5000/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversationId,
      senderId: senderUid,
      senderName,
      content: text.trim(),
      attachments: options.attachmentUrl ? [{ url: options.attachmentUrl }] : []
    })
  }).catch(() => {});

  return { ...messageDoc, createdAt: new Date().toISOString() };
}

/**
 * Edit a message
 */
export async function editChatMessage(conversationId, messageId, senderUid, newText) {
  if (!newText || !newText.trim()) return false;
  try {
    const msgRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    await setDoc(msgRef, {
      text: newText.trim(),
      editedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('editChatMessage error:', err);
    return false;
  }
}

/**
 * Soft delete a message
 */
export async function deleteChatMessage(conversationId, messageId, senderUid) {
  try {
    const msgRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    await setDoc(msgRef, {
      text: 'This message was deleted',
      isDeleted: true,
      deletedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('deleteChatMessage error:', err);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// 5. User Inbox CRUD & Real-Time Listeners
// ─────────────────────────────────────────────────────────────

/**
 * Mark all messages in a conversation as read for the user
 */
export async function markConversationAsRead(uid, conversationId) {
  if (!uid || !conversationId) return;
  try {
    const inboxRef = doc(db, 'users', uid, 'inbox', conversationId);
    await setDoc(inboxRef, {
      unreadCount: 0,
      lastReadTimestamp: serverTimestamp()
    }, { merge: true });
  } catch (e) {}
}

/**
 * Toggle pin status for a conversation in user's inbox
 */
export async function togglePinConversation(uid, conversationId, isPinned) {
  if (!uid || !conversationId) return;
  try {
    const inboxRef = doc(db, 'users', uid, 'inbox', conversationId);
    await setDoc(inboxRef, { isPinned }, { merge: true });
  } catch (e) {}
}

/**
 * Toggle mute notifications for a conversation
 */
export async function toggleMuteConversation(uid, conversationId, isMuted) {
  if (!uid || !conversationId) return;
  try {
    const inboxRef = doc(db, 'users', uid, 'inbox', conversationId);
    await setDoc(inboxRef, { isMuted }, { merge: true });
  } catch (e) {}
}

/**
 * Real-time listener for user's inbox
 */
export function subscribeToUserInbox(uid, callback) {
  if (!uid) return () => {};

  try {
    const inboxQuery = query(
      collection(db, 'users', uid, 'inbox'),
      orderBy('lastMessageTimestamp', 'desc'),
      limit(50)
    );

    return onSnapshot(inboxQuery, (snapshot) => {
      const items = snapshot.docs.map(d => ({
        id: d.id,
        conversationId: d.id,
        ...d.data()
      }));

      // Sort pinned to the top
      items.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        const tA = a.lastMessageTimestamp?.toMillis ? a.lastMessageTimestamp.toMillis() : new Date(a.updatedAt || 0).getTime();
        const tB = b.lastMessageTimestamp?.toMillis ? b.lastMessageTimestamp.toMillis() : new Date(b.updatedAt || 0).getTime();
        return tB - tA;
      });

      callback(items);
    }, (err) => {
      console.warn('subscribeToUserInbox notice:', err);
      callback([]);
    });
  } catch (e) {
    return () => {};
  }
}

// ─────────────────────────────────────────────────────────────
// 6. Paginated Message History Listener
// ─────────────────────────────────────────────────────────────

/**
 * Subscribe to recent messages in a conversation (paginated initial window)
 */
export function subscribeToMessages(conversationId, callback, pageSize = 35) {
  if (!conversationId) return () => {};

  try {
    const msgQuery = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    return onSnapshot(msgQuery, (snapshot) => {
      const docs = snapshot.docs;
      const oldestDoc = docs.length > 0 ? docs[docs.length - 1] : null;

      // Reverse so messages appear in ascending chronological order in the chat window
      const messages = docs.map(d => ({
        id: d.id,
        ...d.data()
      })).reverse();

      callback({ messages, oldestDoc, hasMore: docs.length === pageSize });
    }, (err) => {
      console.warn('subscribeToMessages notice:', err);
      callback({ messages: [], oldestDoc: null, hasMore: false });
    });
  } catch (e) {
    return () => {};
  }
}

/**
 * Load older messages before a given cursor document
 */
export async function loadMoreMessages(conversationId, oldestDoc, pageSize = 30) {
  if (!conversationId || !oldestDoc) return { messages: [], oldestDoc: null, hasMore: false };

  try {
    const msgQuery = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'desc'),
      startAfter(oldestDoc),
      limit(pageSize)
    );

    const snapshot = await getDocs(msgQuery);
    const docs = snapshot.docs;
    const newOldest = docs.length > 0 ? docs[docs.length - 1] : null;

    const messages = docs.map(d => ({
      id: d.id,
      ...d.data()
    })).reverse();

    return {
      messages,
      oldestDoc: newOldest,
      hasMore: docs.length === pageSize
    };
  } catch (err) {
    console.warn('loadMoreMessages error:', err);
    return { messages: [], oldestDoc: null, hasMore: false };
  }
}

// ─────────────────────────────────────────────────────────────
// 7. Community Groups Discovery & Real-Time Listener
// ─────────────────────────────────────────────────────────────

/**
 * Real-time listener for public community sports groups
 */
export function subscribeToCommunityGroups(sportFilter = 'All', callback) {
  try {
    const groupsRef = collection(db, 'communityGroups');
    let q = query(groupsRef, orderBy('memberCount', 'desc'), limit(40));

    if (sportFilter && sportFilter !== 'All') {
      q = query(groupsRef, where('sportCategory', '==', sportFilter), limit(40));
    }

    return onSnapshot(q, (snapshot) => {
      const groups = snapshot.docs.map(d => ({
        groupId: d.id,
        id: d.id,
        ...d.data()
      }));
      callback(groups);
    }, (err) => {
      console.warn('subscribeToCommunityGroups notice:', err);
      callback([]);
    });
  } catch (e) {
    return () => {};
  }
}

// ─────────────────────────────────────────────────────────────
// 8. Device FCM Token Registration (`users/{uid}/devices/{deviceId}`)
// ─────────────────────────────────────────────────────────────

/**
 * Register device FCM token for push notifications
 */
export async function registerDeviceToken(uid, deviceId, fcmToken, platform = 'web') {
  if (!uid || !deviceId || !fcmToken) return false;
  try {
    const deviceRef = doc(db, 'users', uid, 'devices', deviceId);
    await setDoc(deviceRef, {
      deviceId,
      fcmToken,
      platform,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      lastActive: serverTimestamp(),
      createdAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('registerDeviceToken error:', err);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// 9. Initial Seed & Migration Helper
// ─────────────────────────────────────────────────────────────

/**
 * Ensures initial default community groups exist in `communityGroups` and `conversations`
 */
export async function ensureDefaultCommunityData(currentUser) {
  try {
    if (currentUser) {
      await ensureUserProfile(currentUser);
    }

    for (const group of DEFAULT_COMMUNITY_GROUPS_CONFIG) {
      const groupRef = doc(db, 'communityGroups', group.groupId);
      const groupSnap = await getDoc(groupRef);

      if (!groupSnap.exists()) {
        const batch = writeBatch(db);

        batch.set(groupRef, {
          groupId: group.groupId,
          name: group.name,
          description: group.description,
          sportCategory: group.sportCategory,
          locationReference: group.locationReference,
          imageUrl: group.imageUrl,
          creatorUid: group.creatorUid,
          visibility: group.visibility,
          memberCount: group.memberCount,
          conversationId: group.groupId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        const convRef = doc(db, 'conversations', group.groupId);
        batch.set(convRef, {
          id: group.groupId,
          type: 'group',
          groupId: group.groupId,
          members: [group.creatorUid, 'usr_amit_patel', 'usr_rahul'],
          groupName: group.name,
          groupImage: group.imageUrl,
          creatorUid: group.creatorUid,
          lastMessage: {
            text: group.initialMessage,
            senderUid: group.creatorUid,
            senderName: group.name.includes('Football') ? 'Rahul Sharma' : 'Priya Sharma',
            type: 'text',
            timestamp: Date.now() - 1000 * 60 * 30
          },
          lastMessageTimestamp: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Seed initial message
        const initialMsgRef = doc(collection(db, 'conversations', group.groupId, 'messages'));
        batch.set(initialMsgRef, {
          id: initialMsgRef.id,
          conversationId: group.groupId,
          senderUid: group.creatorUid,
          senderName: group.name.includes('Football') ? 'Rahul Sharma' : 'Priya Sharma',
          senderAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${group.creatorUid}`,
          text: group.initialMessage,
          type: 'text',
          reactions: {},
          isDeleted: false,
          createdAt: serverTimestamp()
        });

        await batch.commit();
      }
    }
  } catch (err) {
    console.warn('ensureDefaultCommunityData notice:', err);
  }
}
