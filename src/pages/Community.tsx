import React, { useState, useEffect } from "react";
import { db, auth, handleFirestoreError, OperationType } from "../firebase";
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, increment } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { YokaiCard, YokaiButton, YokaiBadge, YokaiHeader, YokaiDivider } from "../components/UI";
import { MessageSquare, ArrowBigUp, ArrowBigDown, Share2, Activity, Globe, Loader2, X, Sparkles, Heart, Zap, Link2, Info, Users, Plus, Radiation, Radio, Send, Terminal } from "lucide-react";
import { Post } from "../types";
import { toast } from "sonner";

export const Community = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [showCreator, setShowCreator] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "posts");
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return toast.error("Please sign in to deploy a signal.");
    if (!newPost.title || !newPost.content) return toast.error("Identifier and content required.");

    setIsTransmitting(true);
    try {
      await addDoc(collection(db, "posts"), {
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || "Anonymous",
        authorPhoto: auth.currentUser.photoURL || "",
        title: newPost.title,
        content: newPost.content,
        createdAt: new Date().toISOString(),
        upvotes: 0,
        commentsCount: 0,
        reactions: { fire: 0, laugh: 0, skull: 0, ghost: 0 }
      });
      setNewPost({ title: "", content: "" });
      setShowCreator(false);
      toast.success("Signal successfully transmitted to the collective.");
    } catch (error) {
      toast.error("Transmission failed. Network interference detected.");
    } finally {
      setIsTransmitting(false);
    }
  };

  const handleVote = async (postId: string, amount: number) => {
    if (!auth.currentUser) return toast.error("Authentication required to upvote.");
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, { upvotes: increment(amount) });
  };

  return (
    <div className="max-w-[1400px] mx-auto px-8 md:px-16 py-32 bg-background min-h-screen select-none font-sans">
      <div className="flex flex-col lg:flex-row items-end justify-between mb-24 gap-10 border-l-4 border-secondary pl-8 relative">
        <div className="absolute -left-1 top-0 h-full w-1 bg-secondary shadow-[0_0_15px_var(--color-secondary)]" />
        <div className="max-w-2xl relative">
          <YokaiBadge className="mb-6">THE_GRID // 0xCOMM</YokaiBadge>
          <YokaiHeader text="VOID_SIGNAL" subtext="SYNC_CORE_OR_DECAY" className="mb-6" />
          <p className="text-white/40 text-lg font-medium leading-relaxed mt-8 max-w-lg italic">
            The pulse of the hub. Broadcast your neural reality. <span className="text-secondary font-bold">Resonate with the collective.</span>
          </p>
        </div>
        <YokaiButton 
          onClick={() => setShowCreator(true)} 
          variant="solid"
          className="px-8 py-4 group"
        >
          <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> IGNITE_SIGNAL
        </YokaiButton>
      </div>

      <AnimatePresence>
        {showCreator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl"
          >
            <YokaiCard className="max-w-xl w-full !p-0 bg-surface/95 backdrop-blur-2xl">
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-surface">
                <div className="flex flex-col gap-1">
                  <YokaiBadge>SIGNAL_INIT</YokaiBadge>
                  <h2 className="text-3xl font-display font-black uppercase italic tracking-tighter text-white">CONSTRUCT_DATA</h2>
                </div>
                <button onClick={() => setShowCreator(false)} className="w-10 h-10 glass-panel flex items-center justify-center hover:text-secondary transition-all">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-secondary/60 italic">IDENTIFIER_HEX</label>
                  <input 
                    type="text" 
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 px-6 py-4 focus:outline-none focus:border-secondary transition-all font-display font-bold uppercase italic tracking-tight text-xl text-white"
                    placeholder="SIGNAL_SUBJECT..."
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-secondary/60 italic">NEURAL_DEPOSIT</label>
                  <textarea 
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 px-6 py-4 focus:outline-none focus:border-secondary transition-all resize-none italic font-medium leading-relaxed text-lg text-white"
                    placeholder="STREAM_DATA..."
                  />
                </div>
                <YokaiButton 
                  variant="solid"
                  className="w-full py-6" 
                  type="submit" 
                  disabled={isTransmitting || !newPost.content}
                >
                  {isTransmitting ? <Loader2 size={24} className="animate-spin mx-auto" /> : "DEPLOY_SIGNAL"}
                </YokaiButton>
              </form>
            </YokaiCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-10">
        {loading ? (
          <div className="py-40 flex flex-col items-center gap-8 text-secondary">
            <Radio className="animate-ping" size={60} />
            <span className="text-sm font-mono font-bold tracking-[1em] uppercase animate-pulse">CONNECTING TO PULSE</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-32 text-center glass-panel border-dashed border-white/5 italic text-white/10 tracking-widest uppercase text-2xl font-bold">
            THE COLLECTIVE IS SILENT. BREAK THE VOID.
          </div>
        ) : (
          <div className="grid gap-10">
            {posts.map((post, i) => (
              <YokaiCard key={post.id} className="!p-0 overflow-hidden flex flex-col lg:flex-row border border-white/5 bg-surface hover:neon-border-purple transition-all duration-700 group">
                <div className="flex flex-row lg:flex-col items-center justify-center gap-6 bg-white/[0.03] lg:border-r border-white/10 py-8 px-8 group-hover:bg-secondary/5 transition-colors">
                  <button 
                    onClick={() => handleVote(post.id!, 1)} 
                    className="text-white/20 hover:text-secondary transition-all hover:scale-110 active:scale-95"
                  >
                    <ArrowBigUp size={48} fill="currentColor" />
                  </button>
                  <span className="font-display font-black text-4xl italic tracking-tighter text-white">{post.upvotes}</span>
                  <button 
                    onClick={() => handleVote(post.id!, -1)} 
                    className="text-white/20 hover:text-secondary transition-all hover:scale-110 active:scale-95"
                  >
                    <ArrowBigDown size={48} fill="currentColor" />
                  </button>
                </div>

                <div className="flex-1 p-8 flex flex-col relative">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 border border-secondary/40 p-0.5 group-hover:neon-border transition-all overflow-hidden bg-black shadow-sm">
                        <img 
                          src={post.authorPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId}`} 
                          alt="" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-secondary/60 mb-0.5 italic">SOURCE_NODE</span>
                        <span className="text-lg font-bold uppercase tracking-tight leading-none text-white italic">{post.authorName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <YokaiBadge className="italic px-3 py-1 text-[10px]">DATA_BURST</YokaiBadge>
                       <span className="text-[10px] font-mono text-white/5 hidden sm:block">#{post.id?.slice(0, 8).toUpperCase()}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-4xl font-display font-black uppercase tracking-tighter mb-6 leading-none group-hover:text-secondary transition-colors italic line-clamp-1">{post.title}</h3>
                  <p className="text-white/60 text-lg font-medium italic leading-relaxed mb-10 pr-8 bg-white/[0.01] p-6 border-l-2 border-accent/40 shadow-[inner_0_0_20px_black]">
                    "{post.content}"
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-white/5">
                    <div className="flex flex-wrap items-center justify-between gap-8">
                      <div className="flex items-center gap-8">
                        <button className="flex items-center gap-3 text-white/20 hover:text-secondary transition-all group/comm">
                           <MessageSquare size={20} className="text-secondary/40 group-hover:text-secondary" />
                           <span className="text-lg font-display font-bold italic tracking-tighter">{post.commentsCount} BURSTS</span>
                        </button>
                        <button className="text-white/10 hover:text-secondary transition-all hover:rotate-12">
                          <Share2 size={20} />
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                         <div className="w-2 h-2 bg-secondary animate-pulse rounded-full" />
                         <span className="text-[10px] font-mono text-white/20 font-bold tracking-widest uppercase italic">
                           LIVE_BURST // {new Date(post.createdAt).toLocaleTimeString()}
                         </span>
                      </div>
                    </div>
                  </div>
                </div>
              </YokaiCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

