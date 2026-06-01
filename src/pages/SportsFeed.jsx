import React, { useState } from 'react';
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
  X
} from 'lucide-react';

export default function SportsFeed({ user }) {
  const [feedPosts, setFeedPosts] = useState([
    {
      id: 501,
      author: 'Rahul Sharma',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Rahul',
      time: '2 hours ago',
      content: 'Just booked the main court at Vanguard Arena for 7 PM tomorrow. We need 3 more players for a 5v5 friendly. Skill level: Intermediate. Let me know if you want in!',
      image: '/turf_story_highlight.png',
      likes: 18,
      comments: 6,
      liked: false
    },
    {
      id: 502,
      author: 'Vanguard Sports Arena',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Vanguard',
      time: '4 hours ago',
      content: '🔥 WET SLOTS AVAILABLE TONIGHT: Astroturf Court 2 has open slots between 9 PM and 11 PM. Flat 15% discount for bookings made in the next hour! Contact us now to reserve.',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600',
      likes: 45,
      comments: 11,
      liked: true
    },
    {
      id: 503,
      author: 'Sonia Verma',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sonia',
      time: '5 hours ago',
      content: 'Personal best at the Bowling Championship League today! 240 score. Shoutout to the Turfington crew for organizing!',
      image: '/bowling.jpg',
      likes: 34,
      comments: 12,
      liked: false
    }
  ]);

  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);

  const handleLikePost = (postId) => {
    setFeedPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!postText.trim()) return;

    const newPost = {
      id: Date.now(),
      author: user?.name || (user?.role === 'owner' ? 'Venue Owner' : 'Athlete'),
      avatar: user?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.role === 'owner' ? 'Owner' : 'Player'}`,
      time: 'Just now',
      content: postText,
      image: postImage.trim() || null,
      likes: 0,
      comments: 0,
      liked: false
    };

    setFeedPosts([newPost, ...feedPosts]);
    setPostText('');
    setPostImage('');
    setShowImageInput(false);
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
          <h1 className="text-3xl font-black font-display tracking-tight uppercase text-white">Sports Feed</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Stay connected with players, post slot releases, and share arena announcements</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Feed posting & List */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Post Builder Card */}
          <div className="glass-card p-5 border border-white/8 bg-white/[0.01]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'O'}
              </div>
              <div className="flex-grow">
                <form onSubmit={handleCreatePost} className="space-y-3">
                  <textarea 
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    placeholder={user?.role === 'owner' ? "Announce slots opening, highlight tournaments, or share turf updates..." : "Looking for players, sharing achievements, or asking turf questions? Post it here..."}
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
                            <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-extrabold block mb-1">Upload from local storage</span>
                            <input 
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setPostImage(reader.result); // Base64 data URL
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="w-full text-xs text-neutral-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-indigo-600/10 file:text-indigo-400 hover:file:bg-indigo-600/20 cursor-pointer"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-extrabold block mb-1">Or paste image URL</span>
                            <input 
                              type="text"
                              value={postImage.startsWith('data:') ? '' : postImage}
                              onChange={(e) => setPostImage(e.target.value)}
                              placeholder="Paste image URL here..."
                              className="w-full bg-[#0d0d0d] border border-white/5 rounded-xl px-4 py-2 text-xs text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-indigo-500/40 transition-colors"
                            />
                          </div>
                          {postImage && (
                            <div className="relative w-full h-32 rounded-xl overflow-hidden border border-white/10 bg-black/20 mt-1">
                              <img src={postImage} alt="Post Preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setPostImage('')}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 border border-white/10 hover:bg-black/85 text-white transition-all hover:scale-105 cursor-pointer"
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
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                        showImageInput ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400' : 'bg-white/5 border-white/8 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Image className="w-3.5 h-3.5" />
                      <span>{showImageInput ? 'Hide Upload Section' : 'Add Image / Upload'}</span>
                    </button>
                    
                    <button 
                      type="submit"
                      className="px-5 py-2 bg-white hover:bg-neutral-200 text-black text-xs font-bold rounded-full transition-all flex items-center space-x-1.5 hover:scale-102"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Update</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Feed Posts */}
          <div className="space-y-5">
            {feedPosts.map(post => (
              <div key={post.id} className="glass-card p-5 border border-white/5 hover:border-white/10 transition-all duration-300 bg-white/[0.003]">
                <div className="flex items-center space-x-3 mb-4">
                  {post.avatar ? (
                    <img src={post.avatar} alt={post.author} className="w-10 h-10 rounded-xl object-cover border border-white/10" onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'; }} />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                      {post.author?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-sm text-white font-display">{post.author}</h4>
                    <p className="text-[10px] text-neutral-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.time}
                    </p>
                  </div>
                </div>

                <p className="text-neutral-300 text-sm font-light leading-relaxed mb-4">
                  {post.content}
                </p>

                {post.image && (
                  <div className="rounded-2xl overflow-hidden max-h-80 mb-4 border border-white/5">
                    <img src={post.image} alt="Media content" className="w-full h-full object-cover brightness-95" />
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-neutral-500">
                  <button 
                    onClick={() => handleLikePost(post.id)}
                    className={`flex items-center text-xs space-x-1.5 hover:text-white transition-colors ${
                      post.liked ? 'text-rose-400 font-bold' : ''
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.liked ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{post.likes} Likes</span>
                  </button>

                  <button className="flex items-center text-xs space-x-1.5 hover:text-white transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments} Comments</span>
                  </button>

                  <button className="hover:text-white transition-colors flex items-center space-x-1">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column: Guidelines & Stats */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Dynamic Feed Tips Widget */}
          <div className="glass-card p-5 border border-white/5 space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-white/5">
              <Zap className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
              <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-white">
                {user?.role === 'owner' ? 'Owner Dashboard Tips' : 'Athlete Feed Guidelines'}
              </h3>
            </div>
            {user?.role === 'owner' ? (
              <div className="space-y-4 text-xs font-light text-neutral-400 text-left">
                <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-1">
                  <p className="font-bold text-white uppercase tracking-wider text-[9px] text-indigo-400">🔥 Post Slot Releases</p>
                  <p className="leading-relaxed">Announce last-minute slots or price drops. Players will see them directly in their discover feeds.</p>
                </div>
                <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-1">
                  <p className="font-bold text-white uppercase tracking-wider text-[9px] text-amber-400">🏆 Highlight Tournaments</p>
                  <p className="leading-relaxed">Promote upcoming tournament registration links and bracket drawings to increase team sign-ups.</p>
                </div>
                <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-1">
                  <p className="font-bold text-white uppercase tracking-wider text-[9px] text-emerald-400">💬 Connect Directly</p>
                  <p className="leading-relaxed">Answer questions left in comments or group chats instantly to maintain a high ratings score.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs font-light text-neutral-400 text-left">
                <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-1">
                  <p className="font-bold text-white uppercase tracking-wider text-[9px] text-indigo-400">🔥 Find Match Sessions</p>
                  <p className="leading-relaxed">Spot friendly games or slot openings created by other local players and join in.</p>
                </div>
                <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-1">
                  <p className="font-bold text-white uppercase tracking-wider text-[9px] text-amber-400">🎟️ Grab Turf Offers</p>
                  <p className="leading-relaxed">Watch out for venue owner announcements on last-minute booking discounts and monthly passes.</p>
                </div>
                <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-1">
                  <p className="font-bold text-white uppercase tracking-wider text-[9px] text-emerald-400">💬 Match Coordination</p>
                  <p className="leading-relaxed">Leave comments or connect in group chats to coordinate squad size, time slots, and play times.</p>
                </div>
              </div>
            )}
          </div>

          {/* Trending Communities */}
          <div className="glass-card p-5 border border-white/5 space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-white/5">
              <Trophy className="w-4.5 h-4.5 text-amber-400" />
              <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-white">Trending Arenas</h3>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Vanguard Sports Arena', location: 'Chennai', trend: '+15%', rating: 4.9 },
                { name: 'Apex Bowling Syndicate', location: 'Chennai', trend: '+8%', rating: 4.8 },
                { name: 'Smash Masters Badminton', location: 'Chennai', trend: '+12%', rating: 4.8 }
              ].map((item, index) => (
                <div key={item.name} className="flex justify-between items-center">
                  <div className="flex items-center space-x-3 text-left">
                    <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white">{index + 1}</span>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">{item.name}</p>
                      <p className="text-[10px] text-neutral-500">{item.location} · ⭐ {item.rating}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-400">{item.trend}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
