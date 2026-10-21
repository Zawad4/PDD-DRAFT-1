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
  Sparkles
} from 'lucide-react';
import { apiFetchPosts, apiCreatePost, apiLikePost } from '../services/db';

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

                <button className="flex items-center text-xs space-x-1.5 hover:text-white transition-colors cursor-pointer">
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.comments} Comments</span>
                </button>

                <button className="hover:text-white transition-colors flex items-center space-x-1 cursor-pointer">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
