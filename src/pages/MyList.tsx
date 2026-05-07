import React, { useState, useEffect } from "react";
import { db, auth, handleFirestoreError, OperationType } from "../firebase";
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { YokaiCard, YokaiButton, YokaiBadge, YokaiHeader, YokaiDivider } from "../components/UI";
import { Plus, Trash2, Loader2, X, Bookmark, Play, CheckCircle2, Zap, Activity, Radio, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

interface ListItem {
  id: string;
  animeTitle: string;
  status: "Watching" | "Completed" | "Plan to Watch";
  rating?: number;
  episodesWatched: number;
  totalEpisodes: number;
}

export const MyList = () => {
  const [list, setList] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ animeTitle: "", totalEpisodes: 12, status: "Plan to Watch" as any });

  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const path = `users/${uid}/mylist`;
    const q = query(collection(db, path));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ListItem));
      setList(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      setLoading(false);
    });
    return unsubscribe;
  }, [auth.currentUser]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (!newItem.animeTitle) return toast.error("TITLE IDENTIFIER REQUIRED.");
    try {
      await addDoc(collection(db, `users/${auth.currentUser.uid}/mylist`), {
        ...newItem,
        episodesWatched: 0,
        createdAt: new Date().toISOString()
      });
      setShowAdd(false);
      setNewItem({ animeTitle: "", totalEpisodes: 12, status: "Plan to Watch" });
      toast.success("STREAM DATA BUFFERED.");
    } catch (error) {
      toast.error("BUFFER FAILED.");
    }
  };

  const updateEpisodes = async (id: string, current: number, total: number) => {
    if (!auth.currentUser) return;
    if (current >= total) return;
    try {
      await updateDoc(doc(db, `users/${auth.currentUser.uid}/mylist`, id), {
        episodesWatched: current + 1,
        status: current + 1 === total ? "Completed" : "Watching"
      });
    } catch (error) {
      toast.error("SYNC COLLISION.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!auth.currentUser) return;
    try {
      await deleteDoc(doc(db, `users/${auth.currentUser.uid}/mylist`, id));
      toast.success("ENTRY SHREDDED.");
    } catch (error) {
      toast.error("PURGE ABORTED.");
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-8 md:px-16 py-32 bg-background min-h-screen select-none font-sans">
      <div className="flex flex-col lg:flex-row items-end justify-between mb-24 gap-10 border-b border-white/5 pb-16 relative">
        <div className="max-w-2xl relative">
          <YokaiBadge className="mb-6">0xSTREAM // BUFFER_STABLE</YokaiBadge>
          <YokaiHeader text="STREAM" subtext="TRACK YOUR EVOLUTION" className="mb-6" />
          <p className="text-white/60 text-lg font-medium leading-relaxed mt-8">
            Archive your progression through the <span className="text-accent font-bold">anime multiverse.</span> Real-time sync enabled.
          </p>
        </div>
        <YokaiButton 
          onClick={() => setShowAdd(true)} 
          variant="solid"
          className="px-8 py-4 text-sm font-bold neon-border group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" /> INITIALIZE STREAM
        </YokaiButton>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl"
          >
            <YokaiCard className="max-w-xl w-full !p-0 bg-surface/95 backdrop-blur-2xl neon-border-purple">
              <div className="p-8 border-b border-white/10 flex justify-between items-center sticky top-0 z-20">
                 <div className="flex flex-col gap-1">
                   <YokaiBadge>ENTRY_MODE</YokaiBadge>
                   <h2 className="text-3xl font-display font-black uppercase italic tracking-tighter text-white">ADD TITLES</h2>
                 </div>
                 <button onClick={() => setShowAdd(false)} className="w-10 h-10 glass-panel flex items-center justify-center hover:text-accent transition-all">
                   <X size={20} />
                 </button>
              </div>

              <form onSubmit={handleAdd} className="p-8 space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-accent/60">IDENTIFIER</label>
                  <input 
                    type="text" 
                    value={newItem.animeTitle}
                    onChange={(e) => setNewItem({...newItem, animeTitle: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 px-6 py-4 focus:outline-none focus:border-accent transition-all font-display font-bold uppercase italic tracking-tight text-2xl text-white"
                    placeholder="ENTER ANIME TITLE..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-accent/60">NODES</label>
                    <input 
                      type="number" 
                      value={newItem.totalEpisodes}
                      onChange={(e) => setNewItem({...newItem, totalEpisodes: parseInt(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 px-6 py-4 focus:outline-none focus:border-accent transition-all font-bold text-lg text-white"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-accent/60">PROTOCOL</label>
                    <select 
                      value={newItem.status}
                      onChange={(e) => setNewItem({...newItem, status: e.target.value as any})}
                      className="w-full bg-white/5 border border-white/10 px-6 py-4 focus:outline-none focus:border-accent transition-all font-bold uppercase text-xs h-full appearance-none cursor-pointer text-white"
                    >
                      <option value="Plan to Watch" className="bg-surface">PLAN TO WATCH</option>
                      <option value="Watching" className="bg-surface">WATCHING</option>
                      <option value="Completed" className="bg-surface">COMPLETED</option>
                    </select>
                  </div>
                </div>
                <YokaiButton 
                  className="w-full py-6 text-sm font-bold neon-border"
                  type="submit"
                >
                  INITIALIZE STREAM
                </YokaiButton>
              </form>
            </YokaiCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-60 flex flex-col items-center gap-8 text-accent">
            <Radio className="animate-ping" size={60} />
            <span className="text-sm font-mono font-bold tracking-[1em] uppercase animate-pulse">STREAMING DATA...</span>
          </div>
        ) : list.length === 0 ? (
          <div className="py-32 text-center glass-panel border-dashed border-white/5 italic text-white/10 tracking-[0.5em] uppercase text-xl font-bold">
            EMPTY STREAM DETECTED.
          </div>
        ) : (
          list.map((item, i) => (
            <YokaiCard key={item.id} className="flex flex-col lg:flex-row items-center justify-between !p-0 group transition-all duration-700 bg-surface border border-white/5 hover:neon-border overflow-hidden relative">
              <div className="flex items-center gap-8 w-full lg:w-auto p-6 bg-white/[0.01]">
                <div className="w-24 h-24 border border-white/10 p-1 transition-all duration-700 shrink-0 relative overflow-hidden grayscale group-hover:grayscale-0 rotate-[-2deg] group-hover:rotate-0">
                  <img 
                    src={`https://picsum.photos/seed/${item.animeTitle}/400/400`} 
                    alt="" 
                    className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-[8s]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-40 transition-opacity" />
                </div>
                <div>
                  <h3 className="text-3xl font-display font-black uppercase italic tracking-tighter mb-3 group-hover:text-accent transition-colors leading-none pr-8">{item.animeTitle}</h3>
                  <div className="flex items-center gap-8">
                    <div className={cn(
                      "text-[10px] px-4 py-1 font-mono font-bold uppercase tracking-widest transition-all",
                      item.status === "Completed" ? "bg-accent/10 text-accent border border-accent/20" :
                      item.status === "Watching" ? "bg-secondary/10 text-secondary border border-secondary/20" :
                      "bg-white/5 text-white/30 border border-white/10"
                    )}>
                      {item.status.toUpperCase()}
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="text-[10px] text-white/30 tracking-widest uppercase font-mono font-bold">SYNC_RATIO</span>
                       <span className="text-xl font-display font-black italic text-white tracking-tighter">{item.episodesWatched} <span className="text-white/20">/</span> {item.totalEpisodes}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row items-center gap-8 w-full lg:w-auto px-10 pb-8 lg:pb-0 lg:flex-1 justify-end max-w-2xl">
                <div className="w-full h-2 bg-white/5 rounded-full relative overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.episodesWatched / item.totalEpisodes) * 100}%` }}
                    className="h-full bg-gradient-to-r from-accent to-secondary shadow-[0_0_15px_var(--color-accent)] relative" 
                  />
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => updateEpisodes(item.id, item.episodesWatched, item.totalEpisodes)}
                    className="w-12 h-12 glass-panel neon-border flex items-center justify-center hover:bg-accent/20 transition-all group/plus active:scale-95"
                  >
                    <Plus size={24} className="group-hover/plus:rotate-90 transition-transform font-black" />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="w-12 h-12 glass-panel border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/40 transition-all active:scale-95"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </YokaiCard>
          ))
        )}
      </div>
    </div>
  );
};

