import React, { useState, useEffect } from "react";
import { db, auth, handleFirestoreError, OperationType } from "../firebase";
import { collection, query, orderBy, onSnapshot, addDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { YokaiCard, YokaiButton, YokaiBadge, YokaiHeader, YokaiDivider } from "../components/UI";
import { Users, Plus, Loader2, X, Globe, Activity, ArrowRight, Cpu, Layers, Sparkles, Compass, Shield, Sword, Zap, Target } from "lucide-react";
import { Club } from "../types";
import { ImageUpload } from "../components/ImageUpload";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export const Clubs = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newClub, setNewClub] = useState({
    name: "",
    description: "",
    bannerUrl: "",
    category: "General"
  });

  useEffect(() => {
    const q = query(collection(db, "clubs"), orderBy("memberCount", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Club));
      setClubs(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "clubs");
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return toast.error("Please sign in to establish a faction.");
    if (!newClub.name || !newClub.bannerUrl) return toast.error("Name and banner are required.");

    setIsCreating(true);
    try {
      await addDoc(collection(db, "clubs"), {
        ...newClub,
        ownerId: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
        memberCount: 1
      });
      setShowForm(false);
      setNewClub({ name: "", description: "", bannerUrl: "", category: "General" });
      toast.success("Faction successfully established.");
    } catch (error) {
      toast.error("Failed to forge faction. System error.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = (clubName: string) => {
    if (!auth.currentUser) return toast.error("Authentication required to join factions.");
    toast.success(`You have successfully resonated with ${clubName}.`);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-8 md:px-16 py-32 bg-background min-h-screen select-none font-sans">
      <div className="flex flex-col lg:flex-row items-end justify-between mb-24 gap-10 border-b border-accent pb-16 relative">
        <div className="max-w-2xl relative">
          <YokaiBadge className="mb-6">SECTORS // 0xGUILD</YokaiBadge>
          <YokaiHeader text="SYNDICATES" subtext="MAP_THE_MULTIVERSE" className="mb-6" />
          <p className="text-white/40 text-lg font-medium leading-relaxed mt-8 max-w-lg italic">
            Establish your territory. Connect with operatives who share your <span className="text-accent font-bold">high-voltage obsession.</span>
          </p>
        </div>
        <YokaiButton 
          onClick={() => setShowForm(true)} 
          variant="solid"
          className="px-8 py-4 group"
        >
          <Target size={18} className="group-hover:scale-110 transition-transform" /> ACTIVATE_SECTOR
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
            <YokaiCard className="max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide !p-0 bg-surface/95 backdrop-blur-2xl">
              <div className="p-8 border-b border-accent flex justify-between items-center sticky top-0 bg-surface z-20">
                <div className="flex flex-col gap-1">
                  <YokaiBadge>GENESIS_SYNC</YokaiBadge>
                  <h2 className="text-3xl font-display font-black uppercase italic tracking-tighter text-white leading-none">ESTABLISH_SYNDICATE</h2>
                </div>
                <button onClick={() => setShowForm(false)} className="w-10 h-10 glass-panel flex items-center justify-center hover:text-accent transition-all">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-12">
                <div className="space-y-6">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-accent/60 italic">SECTOR_FRAME</label>
                  <div className="border border-dashed border-white/10 bg-white/[0.02] p-6 hover:border-accent transition-all">
                    <ImageUpload 
                      onUploadComplete={(url) => setNewClub({ ...newClub, bannerUrl: url })}
                      folder="club-banners"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-accent/60 italic">SECTOR_IDENTIFIER</label>
                    <input
                      type="text"
                      value={newClub.name}
                      onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 px-6 py-4 focus:outline-none focus:border-accent transition-all font-display font-bold uppercase italic tracking-tight text-xl text-white"
                      placeholder="NAME..."
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-accent/60 italic">SECTOR_TYPE</label>
                    <select
                      value={newClub.category}
                      onChange={(e) => setNewClub({ ...newClub, category: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 px-6 py-4 focus:outline-none focus:border-accent transition-all font-bold uppercase italic text-sm text-white appearance-none cursor-pointer"
                    >
                      <option value="General">GENERAL</option>
                      <option value="Action">ACTION</option>
                      <option value="Romance">ROMANCE</option>
                      <option value="Slice of Life">SLICE OF LIFE</option>
                      <option value="Fantasy">FANTASY</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-accent/60 italic">SECTOR_MANIFESTO</label>
                  <textarea
                    value={newClub.description}
                    onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 px-6 py-4 focus:outline-none focus:border-accent transition-all resize-none italic font-medium leading-relaxed text-lg text-white"
                    placeholder="INITIATE ETHOS..."
                  />
                </div>

                <YokaiButton 
                  className="w-full py-6"
                  variant="solid"
                  type="submit" 
                  disabled={isCreating}
                >
                  {isCreating ? <Loader2 className="animate-spin mx-auto text-white" size={24} /> : "ACTIVATE_SECTOR"}
                </YokaiButton>
              </form>
            </YokaiCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {loading ? (
          <div className="col-span-full py-60 flex flex-col items-center gap-8 text-accent">
            <Cpu className="animate-spin" size={60} />
            <span className="text-sm font-mono font-bold tracking-[1em] uppercase animate-pulse">SYNCING FACTION NODES</span>
          </div>
        ) : clubs.length === 0 ? (
          <div className="col-span-full py-32 text-center glass-panel border-dashed border-white/5 italic text-white/10 tracking-[0.5em] uppercase text-xl font-bold">
            NO FACTIONS DETECTED.
          </div>
        ) : (
          clubs.map((club, i) => (
            <YokaiCard key={club.id} className="h-full !p-0 flex flex-col group transition-all duration-700 bg-surface border border-white/5 hover:neon-border overflow-hidden">
              <div className="relative h-64 overflow-hidden bg-black">
                <img 
                  src={club.bannerUrl || `https://picsum.photos/seed/${club.id}/800/400`} 
                  alt={club.name}
                  className="w-full h-full object-cover grayscale opacity-20 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-100" />
                <div className="absolute top-4 right-4">
                  <YokaiBadge className="bg-accent/20 text-accent border border-accent/30">{club.category.toUpperCase()}</YokaiBadge>
                </div>
                
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="text-[10px] font-mono text-accent font-bold tracking-widest uppercase flex items-center gap-2 italic">
                       <span className="w-2 h-2 rounded-full bg-accent animate-pulse" /> SECTOR_ACTIVE
                     </span>
                  </div>
                  <h3 className="text-3xl font-display font-black text-white tracking-tighter uppercase italic group-hover:text-accent transition-all duration-500 line-clamp-1 leading-none">
                    {club.name}
                  </h3>
                </div>
              </div>
              
              <div className="p-8 flex flex-col flex-1 border-t border-white/5">
                <p className="text-white/40 text-sm font-bold italic leading-relaxed pr-6 mb-8 uppercase tracking-tight line-clamp-3 bg-white/[0.01] p-6 border-l-2 border-secondary/20 group-hover:text-white/80 transition-colors">
                  {club.description || "Awaiting mandate. This faction needs its narrative forged in the fires of the collective."}
                </p>
                
                <div className="mt-auto pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-mono text-white/20 mb-1 uppercase tracking-widest font-bold italic">ASSETS</span>
                        <div className="flex items-center gap-2 text-xl font-display font-black italic text-white tracking-tighter">
                          <Users size={16} className="text-accent" /> {club.memberCount || 0}
                        </div>
                      </div>
                    </div>
                    <YokaiButton onClick={() => handleJoin(club.name)} className="px-6 py-2 text-xs font-bold" variant="solid">
                      RESONATE
                    </YokaiButton>
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

