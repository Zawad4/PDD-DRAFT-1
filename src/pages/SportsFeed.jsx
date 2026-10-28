import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Share2, 
  MessageSquare, 
  Flame, 
  Trophy, 
  Zap, 
  Check, 
  Image, 
  MapPin, 
  Clock,
  Plus,
  Send,
  Users,
  Star,
  Settings,
  X,
  Sparkles,
  CornerDownRight,
  Loader2
} from 'lucide-react';
import { 
  apiFetchPosts, 
  apiCreatePost, 
  apiLikePost,
  apiFetchPostComments,
  apiAddPostComment,
  apiLikePostComment
} from '../services/db';

const POST_TAGS = [
  { id: 'achievement', label: '🏆 Achievement', color: 'bg-amber-500/10 text-amber-300 border-amber-500/25' },
  { id: 'highlight',   label: '⚡ Highlight',   color: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25' },
  { id: 'players',     label: '👥 Need Players', color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25' },
  { id: 'announce',    label: '📢 Announcement', color: 'bg-rose-500/10 text-rose-300 border-rose-500/25' },
  { id: 'general',     label: '💬 Discussion',   color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25' },
];

export default function SportsFeed({ user }) {
  const [feedPosts, setFeedPosts] = useState([]);
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [selectedTag, setSelectedTag] = useState('🏆 Achievement');
  const [isPosting, setIsPosting] = useState(false);
  const [copiedPostId, setCopiedPostId] = useState(null);
  const [shareToast, setShareToast] = useState('');

  // Comment & replies state per post
  const [expandedPostComments, setExpandedPostComments] = useState({});
  const [postComments, setPostComments] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [commentInputTexts, setCommentInputTexts] = useState({});
  const [replyingToMap, setReplyingToMap] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});

  useEffect(() => {
    const handleCommentAdded = (e) => {
      const { postId, totalCount } = e.detail || {};
      if (postId) {
        setFeedPosts(prev => prev.map(p => {
          if (String(p.id) === String(postId)) {
            return { ...p, comments: totalCount };
          }
          return p;
        }));
      }
    };
    window.addEventListener('turfington_post_comment_added', handleCommentAdded);
    return () => window.removeEventListener('turfington_post_comment_added', handleCommentAdded);
  }, []);

  const handleToggleComments = async (postId) => {
    const isExpanded = !!expandedPostComments[postId];
    const willExpand = !isExpanded;

    setExpandedPostComments(prev => ({
      ...prev,
      [postId]: willExpand
    }));

    if (willExpand) {
      setLoadingComments(prev => ({ ...prev, [postId]: true }));
      try {
        const comments = await apiFetchPostComments(postId);
        setPostComments(prev => ({ ...prev, [postId]: comments || [] }));
      } catch (err) {
        console.error('Error fetching comments:', err);
      } finally {
        setLoadingComments(prev => ({ ...prev, [postId]: false }));
      }
    }
  };

  const handleStartReply = (postId, parentId, author) => {
    setReplyingToMap(prev => ({
      ...prev,
      [postId]: { parentId, author }
    }));
  };

  const handleCancelReply = (postId) => {
    setReplyingToMap(prev => ({
      ...prev,
      [postId]: null
    }));
  };

  const handleAddComment = async (postId, e) => {
    e.preventDefault();
    const text = (commentInputTexts[postId] || '').trim();
    if (!text || submittingComment[postId]) return;

    setSubmittingComment(prev => ({ ...prev, [postId]: true }));

    const authorName = user?.full_name || user?.name || (user?.role === 'owner' ? 'Venue Owner' : 'Athlete');
    const avatarUrl = user?.avatar || user?.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(authorName)}`;
    const replyingTo = replyingToMap[postId];

    const commentPayload = {
      author: authorName,
      authorId: user?.id || user?.uid || 'usr_anonymous',
      avatar: avatarUrl,
      content: text,
      parentId: replyingTo?.parentId || null,
      replyToAuthor: replyingTo?.author || null
    };

    try {
      const res = await apiAddPostComment(postId, commentPayload);
      if (res && res.success) {
        setPostComments(prev => ({
          ...prev,
          [postId]: res.comments
        }));
        setFeedPosts(prev => prev.map(p => {
          if (String(p.id) === String(postId)) {
            return { ...p, comments: res.totalCount };
          }
          return p;
        }));
        setCommentInputTexts(prev => ({ ...prev, [postId]: '' }));
        setReplyingToMap(prev => ({ ...prev, [postId]: null }));
      }
    } catch (err) {
      console.error('Failed to submit comment:', err);
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleLikeComment = async (postId, commentId) => {
    const userId = user?.id || user?.uid || 'usr_anonymous';
    setPostComments(prev => {
      const currentList = prev[postId] || [];
      const toggleItem = (item) => {
        const likedBy = item.liked_by || [];
        const isLiked = likedBy.includes(userId);
        return {
          ...item,
          liked_by: isLiked ? likedBy.filter(u => u !== userId) : [...likedBy, userId],
          likes: isLiked ? Math.max(0, (item.likes || 1) - 1) : (item.likes || 0) + 1
        };
      };

      const updated = currentList.map(c => {
        if (c.id === commentId) return toggleItem(c);
        if (c.replies && c.replies.length > 0) {
          return {
            ...c,
            replies: c.replies.map(r => r.id === commentId ? toggleItem(r) : r)
          };
        }
        return c;
      });
      return { ...prev, [postId]: updated };
    });

    try {
      await apiLikePostComment(postId, commentId, userId);
    } catch (err) {
      console.error('Error toggling comment like:', err);
    }
  };

  const handleSharePost = async (post) => {
    const textSnippet = post.content ? `"${post.content.slice(0, 80)}..."` : 'Check out this post on Turfington!';
    const shareUrl = window.location.href;
    const shareData = {
      title: 'Turfington Sports Feed',
      text: `${post.author} on Turfington: ${textSnippet}`,
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name !== 'AbortError') console.warn('Share error:', err);
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareData.text}\n${shareUrl}`);
      setCopiedPostId(post.id);
      setShareToast('Post link copied to clipboard!');
      setTimeout(() => {
        setCopiedPostId(null);
        setShareToast('');
      }, 2500);
    } catch {
      setShareToast('Could not copy link');
      setTimeout(() => setShareToast(''), 2500);
    }
  };

  const loadDbPosts = useCallback(async () => {
    const dbPosts = await apiFetchPosts();
    if (dbPosts && dbPosts.length > 0) {
      const formatted = dbPosts.map(p => ({
        id: p.id,
        author: p.author || p.user_name || p.userName || 'Athlete',
        avatar: p.avatar || p.user_avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(p.author || 'User')}`,
        time: p.time || p.timeAgo || 'Just now',
        content: p.content,
        image: p.image,
        tag: p.tag || null,
        likes: p.likes || 0,
        comments: p.commentsCount || p.comments || 0,
        liked: (p.liked_by || []).includes(user?.id) || false
      }));
      setFeedPosts(formatted);
    }
  }, [user?.id]);

  useEffect(() => {
    loadDbPosts();

    // Auto-sync when another account or browser tab posts
    const handleStorage = (e) => {
      if (e.key === 'turfington_feed_posts') {
        loadDbPosts();
      }
    };
    window.addEventListener('storage', handleStorage);

    // Periodic poll every 4 seconds to sync any new posts in real-time
    const interval = setInterval(loadDbPosts, 4000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [loadDbPosts]);

  const handleLikePost = async (postId) => {
    setFeedPosts(prev => prev.map(post => {
      if (String(post.id) === String(postId)) {
        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? Math.max(0, post.likes - 1) : post.likes + 1
        };
      }
      return post;
    }));
    await apiLikePost(postId, user?.id || 'usr_anonymous');
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postText.trim() || isPosting) return;

    setIsPosting(true);
    const authorName = user?.full_name || user?.name || (user?.role === 'owner' ? 'Venue Owner' : 'Athlete');
    const avatarUrl = user?.avatar || user?.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(authorName)}`;

    const textToSend = postText;
    const imgToSend = postImage.trim();
    const tagToSend = selectedTag;

    setPostText('');
    setPostImage('');
    setShowImageInput(false);

    try {
      await apiCreatePost({
        author: authorName,
        author_id: user?.id || user?.uid || 'usr_anonymous',
        avatar: avatarUrl,
        content: textToSend,
        image: imgToSend || null,
        tag: tagToSend
      });
      await loadDbPosts();
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Flame className="w-5 h-5 text-indigo-400" />
            <span className="text-[10px] text-indigo-400 uppercase font-extrabold tracking-widest">Real-time Feed</span>
          </div>
          <h1 className="text-3xl font-black font-display tracking-tight uppercase text-white">Feed</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Share achievements, post match highlights, find teammates, and stay connected with athletes</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Post Builder Card */}
        <div className="glass-card p-5 border border-white/8 bg-white/[0.01] rounded-3xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {(user?.full_name || user?.name)?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-grow">
              <form onSubmit={handleCreatePost} className="space-y-3">
                {/* Category / Achievement Tags */}
                <div className="flex flex-wrap gap-2 pb-1">
                  {POST_TAGS.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTag(t.label)}
                      className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-all cursor-pointer ${
                        selectedTag === t.label 
                          ? `${t.color} shadow-sm ring-1 ring-white/20` 
                          : 'bg-white/[0.03] text-neutral-400 border-white/5 hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <textarea 
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder={
                    user?.role === 'owner' 
                      ? "Announce slots opening, highlight tournaments, or share turf updates..." 
                      : "Share your sports achievement, match victory, looking for players, or highlights..."
                  }
                  className="w-full bg-[#0d0d0d] border border-white/5 rounded-2xl p-4 text-sm text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-indigo-500/40 resize-none h-24 transition-colors"
                  required
                />

                <AnimatePresence>
                  {showImageInput && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden space-y-2.5 pb-2"
                    >
                      <div className="flex flex-col gap-2.5 p-3 bg-white/[0.01] border border-white/5 rounded-2xl">
                        <div>
                          <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-extrabold block mb-1">Choose Photo or Video from device</span>
                          <input 
                            type="file"
                            accept="image/*,video/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setPostImage(reader.result);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="w-full text-xs text-neutral-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-indigo-600/10 file:text-indigo-400 hover:file:bg-indigo-600/20 cursor-pointer"
                          />
                        </div>
                        {postImage && (
                          <div className="relative w-full h-36 rounded-xl overflow-hidden border border-white/10 bg-black/20 mt-1">
                            {postImage.startsWith('data:video') || postImage.match(/\.(mp4|webm|ogg)($|\?)/i) ? (
                              <video src={postImage} controls className="w-full h-full object-cover" />
                            ) : (
                              <img src={postImage} alt="Post Preview" className="w-full h-full object-cover" />
                            )}
                            <button
                              type="button"
                              onClick={() => setPostImage('')}
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 border border-white/10 hover:bg-black/85 text-white transition-all hover:scale-105 cursor-pointer z-10"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <button 
                    type="button"
                    onClick={() => setShowImageInput(!showImageInput)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
                      showImageInput ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400' : 'bg-white/5 border-white/8 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Image className="w-3.5 h-3.5" />
                    <span>{showImageInput ? 'Hide Upload Section' : 'Add Photo / Video'}</span>
                  </button>
                  
                  <button 
                    type="submit"
                    disabled={isPosting}
                    className="px-5 py-2 bg-white hover:bg-neutral-200 text-black text-xs font-bold rounded-full transition-all flex items-center space-x-1.5 hover:scale-102 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isPosting ? 'Posting...' : 'Post to Feed'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Feed Posts */}
        <div className="space-y-5">
          {feedPosts.map(post => (
            <div key={post.id} className="glass-card p-5 border border-white/5 hover:border-white/10 transition-all duration-300 bg-white/[0.003] rounded-3xl">
              <div className="flex items-center space-x-3 mb-4">
                {post.avatar ? (
                  <img src={post.avatar} alt={post.author} className="w-10 h-10 rounded-xl object-cover border border-white/10" onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'; }} />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    {post.author?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-white font-display">{post.author}</h4>
                    {post.tag && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25">
                        {post.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-neutral-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {post.time}
                  </p>
                </div>
              </div>

              <p className="text-neutral-300 text-sm font-light leading-relaxed mb-4 whitespace-pre-wrap">
                {post.content}
              </p>

              {post.image && (
                <div className="rounded-2xl overflow-hidden max-h-80 mb-4 border border-white/5">
                  {post.image.startsWith('data:video') || post.image.match(/\.(mp4|webm|ogg)($|\?)/i) ? (
                    <video src={post.image} controls className="w-full h-full object-cover" />
                  ) : (
                    <img src={post.image} alt="Media content" className="w-full h-full object-cover brightness-95" />
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-white/5 text-neutral-500">
                <button 
                  onClick={() => handleLikePost(post.id)}
                  className={`flex items-center text-xs space-x-1.5 hover:text-white transition-colors cursor-pointer ${
                    post.liked ? 'text-rose-400 font-bold' : ''
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.liked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{post.likes} Likes</span>
                </button>

                <button 
                  type="button"
                  onClick={() => handleToggleComments(post.id)}
                  className={`flex items-center text-xs space-x-1.5 transition-all cursor-pointer ${
                    expandedPostComments[post.id] 
                      ? 'text-indigo-400 font-bold' 
                      : 'hover:text-white text-neutral-400'
                  }`}
                >
                  <MessageSquare className={`w-4 h-4 ${expandedPostComments[post.id] ? 'fill-indigo-400/20 text-indigo-400' : ''}`} />
                  <span>{post.comments || 0} {post.comments === 1 ? 'Comment' : 'Comments'}</span>
                </button>

                <button 
                  type="button"
                  onClick={() => handleSharePost(post)}
                  className={`hover:text-white transition-colors flex items-center space-x-1.5 cursor-pointer text-xs ${
                    copiedPostId === post.id ? 'text-emerald-400 font-bold' : 'text-neutral-400'
                  }`}
                  title="Share post"
                >
                  {copiedPostId === post.id ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-[11px] font-bold text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span className="text-[11px]">Share</span>
                    </>
                  )}
                </button>
              </div>

              {/* Expandable Comments & Replies Section */}
              <AnimatePresence>
                {expandedPostComments[post.id] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden mt-4 pt-4 border-t border-white/5 space-y-4"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Comments & Replies ({post.comments || 0})
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500">Live thread</span>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-3.5">
                      {loadingComments[post.id] ? (
                        <div className="flex items-center justify-center py-6 text-neutral-400 space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                          <span className="text-xs">Loading replies & comments...</span>
                        </div>
                      ) : (postComments[post.id] || []).length === 0 ? (
                        <div className="py-6 text-center text-xs text-neutral-500 bg-white/[0.015] rounded-2xl border border-dashed border-white/8">
                          No comments yet. Be the first to start the conversation!
                        </div>
                      ) : (
                        (postComments[post.id] || []).map((comm) => (
                          <div key={comm.id} className="space-y-2.5">
                            {/* Main Comment Item */}
                            <div className="flex items-start space-x-3">
                              <img
                                src={comm.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(comm.author)}`}
                                alt={comm.author}
                                className="w-8 h-8 rounded-full object-cover border border-white/10 flex-shrink-0"
                                onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'; }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="bg-white/[0.03] border border-white/8 rounded-2xl px-3.5 py-2.5">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-white font-display truncate">{comm.author}</span>
                                    <span className="text-[10px] text-neutral-500 flex-shrink-0 ml-2">{comm.time || 'Just now'}</span>
                                  </div>
                                  <p className="text-xs text-neutral-300 leading-relaxed break-words font-light">
                                    {comm.content}
                                  </p>
                                </div>
                                {/* Actions under comment */}
                                <div className="flex items-center space-x-4 mt-1.5 px-2 text-[11px] text-neutral-400">
                                  <button
                                    type="button"
                                    onClick={() => handleLikeComment(post.id, comm.id)}
                                    className={`flex items-center space-x-1 transition-colors cursor-pointer ${
                                      comm.liked_by?.includes(user?.id) ? 'text-rose-400 font-bold' : 'hover:text-rose-400'
                                    }`}
                                  >
                                    <Heart className={`w-3.5 h-3.5 ${comm.liked_by?.includes(user?.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                                    <span>{comm.likes || 0}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleStartReply(post.id, comm.id, comm.author)}
                                    className="flex items-center space-x-1 hover:text-white transition-colors cursor-pointer font-medium"
                                  >
                                    <CornerDownRight className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Reply</span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Nested Replies */}
                            {comm.replies && comm.replies.length > 0 && (
                              <div className="ml-9 space-y-2.5 border-l-2 border-indigo-500/20 pl-3 pt-1">
                                {comm.replies.map((reply) => (
                                  <div key={reply.id} className="flex items-start space-x-2.5">
                                    <img
                                      src={reply.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(reply.author)}`}
                                      alt={reply.author}
                                      className="w-6 h-6 rounded-full object-cover border border-white/10 flex-shrink-0"
                                      onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'; }}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl px-3 py-2">
                                        <div className="flex items-center justify-between mb-1">
                                          <div className="flex items-center space-x-1.5 truncate">
                                            <span className="text-xs font-bold text-white truncate">{reply.author}</span>
                                            {reply.replyToAuthor && (
                                              <span className="text-[10px] text-indigo-400 font-semibold bg-indigo-500/10 px-1.5 py-0.5 rounded-full">
                                                @{reply.replyToAuthor}
                                              </span>
                                            )}
                                          </div>
                                          <span className="text-[9px] text-neutral-500 flex-shrink-0 ml-2">{reply.time || 'Just now'}</span>
                                        </div>
                                        <p className="text-xs text-neutral-300 leading-relaxed break-words font-light">
                                          {reply.content}
                                        </p>
                                      </div>
                                      {/* Nested reply actions */}
                                      <div className="flex items-center space-x-4 mt-1 px-2 text-[10px] text-neutral-400">
                                        <button
                                          type="button"
                                          onClick={() => handleLikeComment(post.id, reply.id)}
                                          className={`flex items-center space-x-1 transition-colors cursor-pointer ${
                                            reply.liked_by?.includes(user?.id) ? 'text-rose-400 font-bold' : 'hover:text-rose-400'
                                          }`}
                                        >
                                          <Heart className={`w-3 h-3 ${reply.liked_by?.includes(user?.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                                          <span>{reply.likes || 0}</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleStartReply(post.id, comm.id, reply.author)}
                                          className="flex items-center space-x-1 hover:text-white transition-colors cursor-pointer font-medium"
                                        >
                                          <CornerDownRight className="w-3 h-3 text-indigo-400" />
                                          <span>Reply</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Replying banner indicator */}
                    {replyingToMap[post.id] && (
                      <div className="flex items-center justify-between px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300">
                        <div className="flex items-center space-x-1.5 truncate">
                          <CornerDownRight className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                          <span className="truncate">Replying to <strong className="text-indigo-200">@{replyingToMap[post.id].author}</strong></span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCancelReply(post.id)}
                          className="text-neutral-400 hover:text-white p-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
                          title="Cancel reply"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Write Comment Form */}
                    <form onSubmit={(e) => handleAddComment(post.id, e)} className="flex items-center space-x-2 pt-1">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {(user?.full_name || user?.name)?.[0]?.toUpperCase() || 'A'}
                      </div>
                      <input
                        type="text"
                        value={commentInputTexts[post.id] || ''}
                        onChange={(e) => setCommentInputTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder={
                          replyingToMap[post.id]
                            ? `Write reply to @${replyingToMap[post.id].author}...`
                            : "Write a reply or comment..."
                        }
                        className="flex-1 bg-white/[0.04] border border-white/8 focus:border-indigo-500/50 rounded-full px-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={!commentInputTexts[post.id]?.trim() || submittingComment[post.id]}
                        className="px-4 py-2 bg-[#5842fe] hover:bg-[#4832ee] text-white text-xs font-bold rounded-full transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:scale-102 flex-shrink-0 shadow-[0_0_12px_rgba(88,66,254,0.3)]"
                      >
                        {submittingComment[post.id] ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">Reply</span>
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Share Toast Notification */}
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-400/30"
          >
            <Check className="w-4 h-4" />
            <span>{shareToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
