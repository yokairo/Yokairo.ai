import React, { useState, useEffect } from "react";
import { db, auth, handleFirestoreError, OperationType } from "../firebase";
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, increment, setDoc } from "firebase/firestore";
import { YokaiCard, YokaiButton, YokaiBadge, YokaiHeader, YokaiDivider } from "../components/UI";
import { ImageUpload } from "../components/ImageUpload";
import { Review, AnimeCategory } from "../types";
import { Sparkles, Star, Heart, Search, Filter, TrendingUp, Loader2, X, ArrowRight, MessageSquare, Plus, Zap, Target, Flame, Radio } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"newest" | "rating" | "trending">("newest");

  const [newReview, setNewReview] = useState({
    animeTitle: "",
    rating: 5,
    content: "",
    category: "Action" as AnimeCategory,
    imageUrl: ""
  });
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      setReviews(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "reviews");
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    let result = [...reviews];
    if (searchTerm) {
      result = result.filter(r => r.animeTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (selectedCategory !== "All") {
      result = result.filter(r => r.category === selectedCategory);
    }
    if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "trending") {
      result.sort((a, b) => b.likesCount - a.likesCount);
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    setFilteredReviews(result);
  }, [reviews, searchTerm, selectedCategory, sortBy]);

  const handleEnhance = async () => {
    if (!newReview.content) return toast.error("Please enter some content for the AI to enhance.");
    setIsEnhancing(true);
    try {
      const response = await fetch("/api/ai-enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newReview.content })
      });
      const data = await response.json();
      if (data.enhancedText) {
        setNewReview({ ...newReview, content: data.enhancedText });
        toast.success("Content optimized by AI.");
      }
    } catch (error) {
      toast.error("AI enhancement failed.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return toast.error("Please sign in to publish a manifest.");
    if (!newReview.animeTitle || !newReview.content || !newReview.imageUrl) {
      return toast.error("Please fill in all required data fields.");
    }

    setIsPublishing(true);
    try {
      await addDoc(collection(db, "reviews"), {
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || "Anonymous",
        authorPhoto: auth.currentUser.photoURL || "",
        animeTitle: newReview.animeTitle,
        rating: newReview.rating,
        content: newReview.content,
        category: newReview.category,
        imageUrl: newReview.imageUrl,
        isAiAssisted: true,
        createdAt: new Date().toISOString(),
        likesCount: 0
      });
      setShowForm(false);
      setNewReview({ animeTitle: "", rating: 5, content: "", category: "Action", imageUrl: "" });
      toast.success("Manifest successfully synchronized to the grid.");
    } catch (error) {
      toast.error("Synchronization failed. System connection error.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleLike = async (reviewId: string) => {
    if (!auth.currentUser) return toast.error("Please sign in to sync resonance.");
    const likeRef = doc(db, "reviews", reviewId, "likes", auth.currentUser.uid);
    try {
      await setDoc(likeRef, { liked: true });
      await updateDoc(doc(db, "reviews", reviewId), { likesCount: increment(1) });
    } catch (error) {
      toast.error("Resonance sync failed.");
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-8 md:px-16 py-32 bg-background min-h-screen select-none font-sans">
      <div className="flex flex-col lg:flex-row items-end justify-between mb-24 gap-10 border-b border-white/5 pb-16">
        <div className="max-w-2xl relative">
          <YokaiBadge className="mb-6">0xCRIT // ANALYTICS_MODE</YokaiBadge>
          <YokaiHeader text="CRITIQUES" subtext="SHATTERING THE NARRATIVE FRAME" className="mb-6" />
          <p className="text-white/60 text-lg font-medium leading-relaxed mt-8">
            The collective's raw judgment. No filters. <span className="text-accent font-bold">Pure cinematic intensity.</span>
          </p>
        </div>
        <YokaiButton 
          onClick={() => setShowForm(true)} 
          variant="solid"
          className="px-8 py-4 text-sm font-bold neon-border group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" /> DEPLOY REVIEW
        </YokaiButton>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl"
          >
            <YokaiCard className="max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide !p-0 bg-surface/95 backdrop-blur-2xl neon-border-purple">
              <div className="p-8 border-b border-white/10 flex justify-between items-center sticky top-0 bg-surface z-20">
                <div className="flex flex-col gap-1">
                  <YokaiBadge>DEPLOYMENT POD</YokaiBadge>
                  <h2 className="text-3xl font-display font-black uppercase italic tracking-tighter text-white">NEW MANIFEST</h2>
                </div>
                <button onClick={() => setShowForm(false)} className="w-10 h-10 glass-panel flex items-center justify-center hover:text-accent transition-all">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-accent/60 italic">ANIME_IDENTIFIER</label>
                      <input 
                        type="text" 
                        value={newReview.animeTitle}
                        onChange={(e) => setNewReview({...newReview, animeTitle: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 px-6 py-4 focus:outline-none focus:border-accent transition-all font-display font-bold uppercase italic tracking-tight text-xl text-white"
                        placeholder="ENTER TITLE..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-accent/60 italic">VECTOR</label>
                        <select 
                          value={newReview.category}
                          onChange={(e) => setNewReview({...newReview, category: e.target.value as AnimeCategory})}
                          className="w-full bg-white/5 border border-white/10 px-4 py-4 focus:outline-none focus:border-accent transition-all font-bold uppercase italic text-xs h-14 bg-surface text-white"
                        >
                          {["Action", "Romance", "Dark/Fantasy", "Sci-Fi", "Slice of Life", "Other"].map(c => (
                            <option key={c} value={c} className="bg-surface text-white">{c.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-accent/60 italic">VOLTAGE ({newReview.rating})</label>
                        <input 
                          type="range" min="0" max="10" step="0.5"
                          value={newReview.rating}
                          onChange={(e) => setNewReview({...newReview, rating: parseFloat(e.target.value)})}
                          className="w-full h-14 bg-white/5 appearance-none cursor-pointer accent-accent"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-accent/60 italic">VISUAL_SOURCE</label>
                    <div className="border border-dashed border-white/10 bg-white/[0.02] p-6">
                      <ImageUpload 
                        folder="posters" 
                        onUploadComplete={(url) => setNewReview({...newReview, imageUrl: url})} 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-accent/60 italic">RAW_CRITIQUE</label>
                    <button 
                      type="button" onClick={handleEnhance} disabled={isEnhancing}
                      className="bg-secondary/10 border border-secondary/20 text-secondary px-4 py-1.5 text-[8px] font-mono font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-secondary/20 transition-all shadow-sm"
                    >
                      {isEnhancing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      AI_AUGMENT
                    </button>
                  </div>
                  <textarea 
                    value={newReview.content}
                    onChange={(e) => setNewReview({...newReview, content: e.target.value})}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 px-6 py-4 focus:outline-none focus:border-accent transition-all resize-none font-sans font-medium text-lg text-white"
                    placeholder="UNLEASH YOUR THOUGHTS..."
                  />
                </div>

                <YokaiButton 
                  variant="solid"
                  className="w-full py-6 text-sm font-bold neon-border"
                  type="submit" 
                  disabled={isPublishing}
                >
                  {isPublishing ? <Loader2 className="animate-spin mx-auto" size={24} /> : "PUBLISH MANIFEST"}
                </YokaiButton>
              </form>
            </YokaiCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row gap-6 mb-24 items-center bg-white/[0.02] p-6 border-l border-accent">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={24} />
          <input 
            type="text" 
            placeholder="SEARCH CODES..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-b border-white/10 px-16 py-4 focus:outline-none focus:border-accent transition-all font-display font-bold italic tracking-tight text-2xl text-white placeholder:text-white/5 uppercase"
          />
        </div>
        <div className="flex flex-wrap items-center gap-6 w-full lg:w-auto">
          <div className="flex items-center gap-4 glass-panel px-6 py-3 transition-all group scale-105 -rotate-1">
            <Filter size={18} className="text-accent/60 group-hover:text-accent" />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-[10px] font-mono font-bold uppercase tracking-widest focus:outline-none appearance-none text-white cursor-pointer"
            >
              <option value="All" className="bg-surface">ALL_VECTORS</option>
              {["Action", "Romance", "Dark/Fantasy", "Sci-Fi", "Slice of Life", "Other"].map(c => (
                <option key={c} value={c} className="bg-surface">{c.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-4 glass-panel neon-border-purple px-6 py-3 transition-all group rotate-1">
            <TrendingUp size={18} className="text-secondary group-hover:text-white" />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-[10px] font-mono font-bold uppercase tracking-widest focus:outline-none appearance-none text-white cursor-pointer"
            >
              <option value="newest" className="bg-surface">NEWEST</option>
              <option value="rating" className="bg-surface">VOLTAGE</option>
              <option value="trending" className="bg-surface">HYPED</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {loading ? (
          <div className="col-span-full py-60 flex flex-col items-center gap-8">
            <Radio className="animate-spin text-accent" size={60} />
            <span className="text-sm font-mono font-bold tracking-[0.8em] text-accent font-black uppercase animate-pulse">SYNCHRONIZING ARCHIVE</span>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="col-span-full py-32 text-center glass-panel border-dashed border-white/5 italic text-white/10 tracking-widest uppercase text-2xl font-bold">
            NO MANIFESTS FOUND IN THIS NODE.
          </div>
        ) : (
          filteredReviews.map((review, i) => (
            <YokaiCard key={review.id} className="h-full !p-0 flex flex-col group transition-all duration-700 bg-surface border border-white/5 hover:neon-border">
              <div className="h-[400px] relative overflow-hidden group-hover:grayscale-0 grayscale transition-all duration-1000">
                <img 
                  src={review.imageUrl} 
                  alt={review.animeTitle} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[10s]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <div className="absolute top-4 left-4">
                  <YokaiBadge className="bg-accent/20 text-accent border border-accent/30">{review.category.toUpperCase()}</YokaiBadge>
                </div>
                <div className="absolute top-4 right-4 group-hover:scale-110 transition-transform">
                   <div className="glass-panel text-white font-mono font-bold text-xl px-3 py-1 italic neon-border">
                     {review.rating}
                   </div>
                </div>
                
                <div className="absolute bottom-6 left-6 p-4">
                  <h3 className="text-4xl font-display font-black uppercase italic tracking-tighter text-white group-hover:text-accent transition-colors leading-none mb-3 [text-shadow:2px_2px_10px_rgba(0,0,0,0.5)]">
                    {review.animeTitle}
                  </h3>
                  <div className="flex items-center gap-3 text-[10px] font-mono font-bold text-secondary uppercase tracking-widest italic opacity-80">
                    <Target size={14} /> BATTLE_DATA_RELIABLE
                  </div>
                </div>
              </div>
              
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full border border-accent/40 p-0.5 overflow-hidden transition-all group-hover:neon-border">
                      <img 
                        src={review.authorPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.authorId}`} 
                        alt="" 
                        className="w-full h-full object-cover rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-accent/60 italic block">OPERATIVE</span>
                      <span className="text-sm font-bold uppercase tracking-tight text-white italic">{review.authorName}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-white/20 font-bold tracking-widest">#{review.id.slice(0, 8).toUpperCase()}</span>
                </div>
                
                <p className="text-white/60 text-base font-medium leading-relaxed italic bg-white/[0.02] p-4 border-l-2 border-secondary mb-10 line-clamp-3">
                  "{review.content}"
                </p>

                <div className="mt-auto pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => handleLike(review.id)}
                      className="flex items-center gap-3 text-white/30 hover:text-accent transition-all group/like"
                    >
                      <Heart size={20} className={review.likesCount > 0 ? "fill-accent text-accent" : "group-hover:fill-accent"} />
                      <span className="text-xl font-display font-bold italic tracking-tighter group-hover:scale-110">{review.likesCount}</span>
                    </button>
                    {review.isAiAssisted && (
                      <div className="flex items-center gap-2 text-[9px] font-mono font-bold text-secondary italic tracking-widest bg-secondary/10 px-3 py-1.5 border border-secondary/20">
                         <Sparkles size={12} /> AI_CORE_SYNC
                      </div>
                    )}
                    <div className="text-right">
                      <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest font-bold block mb-1 italic">MANIFESTED</span>
                      <span className="text-xs text-white/40 font-bold uppercase italic tracking-tighter">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </YokaiCard>
          ))
        )}
      </div>
    </div>
  );
};

