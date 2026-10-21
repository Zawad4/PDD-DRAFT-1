import {
  ensureUserProfile,
  getDirectConversationId,
  getOrCreateDirectConversation,
  createCommunityGroup,
  joinCommunityGroup,
  leaveCommunityGroup,
  sendChatMessage,
  editChatMessage,
  deleteChatMessage,
  markConversationAsRead,
  togglePinConversation,
  toggleMuteConversation,
  registerDeviceToken
} from '../src/services/chatService.js';
import { db } from '../src/services/firebase.js';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

async function runTestSuite() {
  console.log('====================================================');
  console.log('🚀 TURFINGTON FIRESTORE CHAT DATA MODEL TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  const timestamp = Date.now();
  const testUserA = {
    uid: `test_user_a_${timestamp}`,
    displayName: 'Test Athlete Alpha',
    email: `alpha_${timestamp}@turfington.test`,
    role: 'player',
    sport: 'Football',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=alpha'
  };

  const testUserB = {
    uid: `test_user_b_${timestamp}`,
    displayName: 'Test Athlete Bravo',
    email: `bravo_${timestamp}@turfington.test`,
    role: 'venue_manager',
    sport: 'Cricket',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=bravo'
  };

  try {
    // -----------------------------------------------------------------
    // TEST 1: Collection 1 - users/{uid}
    // -----------------------------------------------------------------
    console.log('1. Testing users/{uid} profile initialization and reuse...');
    const userAProfile = await ensureUserProfile(testUserA);
    const userBProfile = await ensureUserProfile(testUserB);

    const userASnap = await getDoc(doc(db, 'users', testUserA.uid));
    assert(userASnap.exists(), 'users/{uid} document created for User A');
    assert(userASnap.data()?.displayName === testUserA.displayName, 'users/{uid} contains correct display name');
    assert(userASnap.data()?.role === 'player', 'users/{uid} preserves role');

    // Test profile reuse (should not duplicate or error)
    const updatedProfile = await ensureUserProfile({ ...testUserA, displayName: 'Test Athlete Alpha Updated' });
    const userASnapUpdated = await getDoc(doc(db, 'users', testUserA.uid));
    assert(userASnapUpdated.data()?.displayName === 'Test Athlete Alpha Updated', 'users/{uid} successfully reused and merged');

    // -----------------------------------------------------------------
    // TEST 2: Collection 2 - conversations/{conversationId} & Deduplication
    // -----------------------------------------------------------------
    console.log('\n2. Testing conversations/{conversationId} & Direct Chat Deduplication...');
    const expectedDirectId = getDirectConversationId(testUserA.uid, testUserB.uid);
    console.log(`   Deterministic conversation ID: ${expectedDirectId}`);

    const directConv1 = await getOrCreateDirectConversation(testUserA, testUserB);
    assert(directConv1.id === expectedDirectId, 'Direct conversation ID matches deterministic formula');

    // Attempt creation with reverse order (User B -> User A)
    const directConv2 = await getOrCreateDirectConversation(testUserB, testUserA);
    assert(directConv2.id === expectedDirectId, 'Reverse lookup returns identical conversation ID (0 duplicate chats)');

    const convSnap = await getDoc(doc(db, 'conversations', expectedDirectId));
    assert(convSnap.exists(), 'conversations/{conversationId} document exists');
    assert(convSnap.data()?.type === 'direct', 'Conversation type is direct');
    assert(convSnap.data()?.members.includes(testUserA.uid) && convSnap.data()?.members.includes(testUserB.uid), 'Conversation includes both member UIDs');

    // -----------------------------------------------------------------
    // TEST 3: Collection 4 - users/{uid}/inbox/{conversationId}
    // -----------------------------------------------------------------
    console.log('\n3. Testing users/{uid}/inbox/{conversationId} on direct chat creation...');
    const inboxASnap = await getDoc(doc(db, 'users', testUserA.uid, 'inbox', expectedDirectId));
    const inboxBSnap = await getDoc(doc(db, 'users', testUserB.uid, 'inbox', expectedDirectId));
    assert(inboxASnap.exists(), "User A's inbox contains conversation entry");
    assert(inboxBSnap.exists(), "User B's inbox contains conversation entry");
    assert(inboxASnap.data()?.otherUid === testUserB.uid, "User A's inbox correctly references User B as otherUid");
    assert(inboxASnap.data()?.unreadCount === 0, 'Initial unreadCount is 0');

    // -----------------------------------------------------------------
    // TEST 4: Collection 5 & 6 - communityGroups/{groupId} & members/{uid}
    // -----------------------------------------------------------------
    console.log('\n4. Testing communityGroups/{groupId} and subcollection members/{uid}...');
    const testGroupId = `group_test_${timestamp}`;
    const newGroup = await createCommunityGroup({
      groupId: testGroupId,
      name: '🏸 Chennai Badminton Masters',
      description: 'Competitive and casual badminton meetups in T. Nagar',
      sportCategory: 'Badminton',
      locationReference: 'T. Nagar, Chennai',
      visibility: 'public'
    }, testUserA);

    const groupSnap = await getDoc(doc(db, 'communityGroups', testGroupId));
    assert(groupSnap.exists(), 'communityGroups/{groupId} document created');
    assert(groupSnap.data()?.sportCategory === 'Badminton', 'Group sport category is Badminton');
    assert(groupSnap.data()?.memberCount === 1, 'Initial memberCount is 1');

    // Verify creator in subcollection communityGroups/{groupId}/members/{uid}
    const creatorMemberSnap = await getDoc(doc(db, 'communityGroups', testGroupId, 'members', testUserA.uid));
    assert(creatorMemberSnap.exists(), 'communityGroups/{groupId}/members/{uid} creator document exists');
    assert(creatorMemberSnap.data()?.role === 'admin', 'Creator role is admin');

    // Test User B joining the group
    console.log('   Testing User B joining community group...');
    const joinResult = await joinCommunityGroup(testGroupId, testUserB);
    assert(joinResult === true, 'joinCommunityGroup returned true');

    const joinedMemberSnap = await getDoc(doc(db, 'communityGroups', testGroupId, 'members', testUserB.uid));
    assert(joinedMemberSnap.exists(), 'User B exists in members subcollection');
    assert(joinedMemberSnap.data()?.role === 'member', 'Joined user has member role');

    const groupSnapAfterJoin = await getDoc(doc(db, 'communityGroups', testGroupId));
    assert(groupSnapAfterJoin.data()?.memberCount === 2, 'Group memberCount incremented to 2');

    const inboxBGroupSnap = await getDoc(doc(db, 'users', testUserB.uid, 'inbox', testGroupId));
    assert(inboxBGroupSnap.exists(), "User B's inbox received entry for joined group");

    // -----------------------------------------------------------------
    // TEST 5: Collection 3 - conversations/{id}/messages/{id} & Atomic Inbox Fanout
    // -----------------------------------------------------------------
    console.log('\n5. Testing atomic message sending and inbox fanout...');
    const sentMsg = await sendChatMessage(testGroupId, testUserA, 'Hey Badminton team, match at 7 PM today?', {
      type: 'text'
    });
    assert(!!sentMsg.id, 'Message created with generated ID');

    const msgSnap = await getDoc(doc(db, 'conversations', testGroupId, 'messages', sentMsg.id));
    assert(msgSnap.exists(), 'Message exists in conversations/{id}/messages/{id} subcollection');
    assert(msgSnap.data()?.senderUid === testUserA.uid, 'Message senderUid is User A');
    assert(msgSnap.data()?.text === 'Hey Badminton team, match at 7 PM today?', 'Message text matches');
    assert(msgSnap.data()?.isDeleted === false, 'isDeleted is initially false');

    // Check conversation doc lastMessage preview
    const convAfterMsg = await getDoc(doc(db, 'conversations', testGroupId));
    assert(convAfterMsg.data()?.lastMessage?.text === 'Hey Badminton team, match at 7 PM today?', 'Conversation lastMessage preview updated');

    // Check inbox fanout unread counts
    const inboxAAfterMsg = await getDoc(doc(db, 'users', testUserA.uid, 'inbox', testGroupId));
    const inboxBAfterMsg = await getDoc(doc(db, 'users', testUserB.uid, 'inbox', testGroupId));
    assert(inboxAAfterMsg.data()?.unreadCount === 0, "Sender User A's unreadCount remains 0");
    assert(inboxBAfterMsg.data()?.unreadCount === 1, "Recipient User B's unreadCount incremented to 1");

    // -----------------------------------------------------------------
    // TEST 6: Message Editing & Soft Deletion
    // -----------------------------------------------------------------
    console.log('\n6. Testing message editing and soft deletion...');
    const editOk = await editChatMessage(testGroupId, sentMsg.id, testUserA.uid, 'Hey Badminton team, match at 8 PM today! (Updated)');
    assert(editOk === true, 'editChatMessage returned true');
    const msgEditedSnap = await getDoc(doc(db, 'conversations', testGroupId, 'messages', sentMsg.id));
    assert(msgEditedSnap.data()?.text.includes('8 PM'), 'Message text updated to edited content');

    const deleteOk = await deleteChatMessage(testGroupId, sentMsg.id, testUserA.uid);
    assert(deleteOk === true, 'deleteChatMessage returned true');
    const msgDeletedSnap = await getDoc(doc(db, 'conversations', testGroupId, 'messages', sentMsg.id));
    assert(msgDeletedSnap.data()?.isDeleted === true, 'Message marked as isDeleted: true');

    // -----------------------------------------------------------------
    // TEST 7: Inbox Read / Pin / Mute Status
    // -----------------------------------------------------------------
    console.log('\n7. Testing inbox mark-as-read, pin, and mute toggles...');
    await markConversationAsRead(testUserB.uid, testGroupId);
    const inboxBReadSnap = await getDoc(doc(db, 'users', testUserB.uid, 'inbox', testGroupId));
    assert(inboxBReadSnap.data()?.unreadCount === 0, "Recipient User B's unreadCount reset to 0 after read");

    await togglePinConversation(testUserB.uid, testGroupId, true);
    const inboxBPinSnap = await getDoc(doc(db, 'users', testUserB.uid, 'inbox', testGroupId));
    assert(inboxBPinSnap.data()?.isPinned === true, 'Conversation isPinned set to true');

    await toggleMuteConversation(testUserB.uid, testGroupId, true);
    const inboxBMuteSnap = await getDoc(doc(db, 'users', testUserB.uid, 'inbox', testGroupId));
    assert(inboxBMuteSnap.data()?.isMuted === true, 'Conversation isMuted set to true');

    // -----------------------------------------------------------------
    // TEST 8: Collection 7 - users/{uid}/devices/{deviceId} (FCM Push)
    // -----------------------------------------------------------------
    console.log('\n8. Testing users/{uid}/devices/{deviceId} push tokens...');
    const deviceId = `fcm_android_${timestamp}`;
    const fcmToken = `fcm_mock_token_sample_${timestamp}`;
    await registerDeviceToken(testUserA.uid, deviceId, fcmToken, 'android');

    const deviceSnap = await getDoc(doc(db, 'users', testUserA.uid, 'devices', deviceId));
    assert(deviceSnap.exists(), 'Device document created in users/{uid}/devices/{deviceId}');
    assert(deviceSnap.data()?.token === fcmToken, 'Device FCM token matches');
    assert(deviceSnap.data()?.platform === 'android', 'Device platform is android');

    console.log('\n====================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal test error:', error);
    process.exit(1);
  }
}

runTestSuite();
