import React, { useState, useEffect } from "react";
import { db, auth, handleFirestoreError, OperationType } from "../firebase";
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, increment } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { YokaiCard, YokaiButton, YokaiBadge, YokaiHeader, YokaiDivider, YokaiBackground } from "../components/UI";
import { Plus, MessageSquare, Loader2, X, ArrowRight, Activity, Users, Info, Zap, Sparkles, Radio, Scan } from "lucide-react";
import { Character } from "../types";
import { ImageUpload } from "../components/ImageUpload";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export const Characters = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSummoning, setIsSummoning] = useState(false);
  const [newChar, setNewChar] = useState({
    name: "",
    personality: "",
    tone: "",
    style: "",
    background: "",
    avatarUrl: ""
  });

  useEffect(() => {
    const q = query(collection(db, "characters"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Character));
      setCharacters(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "characters");
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return toast.error("SESSION EXPIRED. RE-INITIALIZE.");
    if (!newChar.name || !newChar.personality || !newChar.avatarUrl) {
      return toast.error("INCOMPLETE DATA PACKET. NAME/PORTRAIT REQUIRED.");
    }

    setIsSummoning(true);
    try {
      await addDoc(collection(db, "characters"), {
        ownerId: auth.currentUser.uid,
        name: newChar.name,
        personality: newChar.personality,
        tone: newChar.tone,
        style: newChar.style,
        background: newChar.background,
        avatarUrl: newChar.avatarUrl,
        createdAt: new Date().toISOString(),
        modes: ["Normal", "Roast", "Friendly", "Emotional", "Motivational", "Savage"],
        chatCount: 0
      });
      
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { "stats.charactersCreated": increment(1) });

      setShowForm(false);
      setNewChar({ name: "", personality: "", tone: "", style: "", background: "", avatarUrl: "" });
      toast.success("ENTITY VITALIZED. READY FOR DEPLOYMENT.");
    } catch (error) {
      toast.error("VITALIZATION FAILED. CORE INSTABILITY.");
    } finally {
      setIsSummoning(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-8 md:px-16 py-32 bg-background min-h-screen select-none font-sans">
      {/* Header section */}
      <div className="flex flex-col lg:flex-row items-end justify-between mb-24 gap-10 border-b border-white/5 pb-16 relative">
        <div className="max-w-2xl relative">
          <YokaiBadge className="mb-6">MANIFEST_CORE // 0xSOUL</YokaiBadge>
          <YokaiHeader 
            text="ENTITIES" 
            subtext="NEURAL_RESONANCE // SYNCED" 
            className="mb-6"
          />
          <p className="text-white/40 text-lg font-medium leading-relaxed mt-8 max-w-lg">
            High-fidelity neural models extracted from the <span className="text-accent italic">Aether Grid</span>. Advanced personas. <span className="text-secondary font-bold">Infinite recursion.</span>
          </p>
        </div>
        <YokaiButton 
          onClick={() => setShowForm(true)} 
          variant="solid"
          className="px-8 py-4 group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" /> MANIFEST_NEW
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
              <div className="p-8 border-b border-white/10 flex justify-between items-center sticky top-0 bg-surface z-20">
                <div className="flex flex-col gap-1">
                  <YokaiBadge>NEURAL_CONSTRUCT</YokaiBadge>
                  <h2 className="text-3xl font-display font-black uppercase italic tracking-tighter text-white leading-none">INITIALIZE_MODEL</h2>
                </div>
                <button onClick={() => setShowForm(false)} className="w-10 h-10 glass-panel flex items-center justify-center hover:text-secondary transition-all">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-secondary/60 italic">AVATAR_UPLOAD</label>
                    <div className="border border-dashed border-white/10 bg-white/[0.02] p-6 hover:border-accent transition-all">
                      <ImageUpload 
                        onUploadComplete={(url) => setNewChar({ ...newChar, avatarUrl: url })}
                        folder="avatars"
                      />
                    </div>
                  </div>
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-secondary/60 italic">IDENTIFIER</label>
                      <input
                        type="text"
                        value={newChar.name}
                        onChange={(e) => setNewChar({ ...newChar, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 px-6 py-4 focus:outline-none focus:border-accent transition-all font-display font-bold uppercase italic tracking-tight text-xl text-white"
                        placeholder="NAME..."
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-secondary/60 italic">PERSONA_CORE</label>
                      <input
                        type="text"
                        value={newChar.personality}
                        onChange={(e) => setNewChar({ ...newChar, personality: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 px-6 py-4 focus:outline-none focus:border-accent transition-all font-bold uppercase italic text-sm text-white"
                        placeholder="E.G. BRUTAL ANALYST"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-secondary/60 italic">SPEECH_PATTERN</label>
                    <input
                      type="text"
                      value={newChar.tone}
                      onChange={(e) => setNewChar({ ...newChar, tone: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 px-6 py-4 focus:outline-none focus:border-accent transition-all font-bold uppercase italic text-sm text-white"
                      placeholder="E.G. AGGRESSIVE"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-secondary/60 italic">VISUAL_FRAME</label>
                    <input
                      type="text"
                      value={newChar.style}
                      onChange={(e) => setNewChar({ ...newChar, style: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 px-6 py-4 focus:outline-none focus:border-accent transition-all font-bold uppercase italic text-sm text-white"
                      placeholder="E.G. MECHA-CORE"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-secondary/60 italic">DATA_HISTORY</label>
                  <textarea
                    value={newChar.background}
                    onChange={(e) => setNewChar({ ...newChar, background: e.target.value })}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 px-6 py-4 focus:outline-none focus:border-accent transition-all resize-none italic font-medium leading-relaxed text-lg text-white"
                    placeholder="PROVIDE NEURAL BACKSTORY..."
                  />
                </div>

                <YokaiButton 
                  className="w-full py-6"
                  variant="solid"
                  type="submit" 
                  disabled={isSummoning}
                >
                  {isSummoning ? <Loader2 className="animate-spin mx-auto" size={24} /> : "DEPLOY_CONSTRUCT"}
                </YokaiButton>
              </form>
            </YokaiCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {loading ? (
          <div className="col-span-full py-60 flex flex-col items-center gap-8 text-secondary">
            <Scan className="animate-pulse" size={60} />
            <span className="text-sm font-mono font-bold tracking-[1em] uppercase animate-pulse">EXTRACTING_DATA</span>
          </div>
        ) : characters.length === 0 ? (
          <div className="col-span-full py-32 text-center glass-panel border-dashed border-white/5 italic text-white/10 tracking-[0.5em] uppercase text-xl font-bold">
            ZERO_ENTITIES_DETECTED
          </div>
        ) : (
          characters.map((char, i) => (
            <Link key={char.id} to={`/chat/${char.id}`} className="block h-full group">
              <YokaiCard className="h-full flex flex-col p-0 overflow-hidden transition-all duration-700 bg-surface border border-white/5 hover:neon-border-purple group-hover:scale-[1.02]">
                <div className="relative aspect-[4/5] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                  <img 
                    src={char.avatarUrl || `https://picsum.photos/seed/${char.id}/600/800`} 
                    alt={char.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[10s]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                  <div className="absolute top-4 left-4 -rotate-2 group-hover:rotate-0 transition-all">
                    <YokaiBadge className="bg-secondary/20 text-secondary border border-secondary/30">SLOT_0{i + 1}</YokaiBadge>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-display font-black uppercase tracking-tighter group-hover:text-secondary transition-colors italic leading-none">
                      {char.name}
                    </h3>
                    <div className="text-white/20 group-hover:text-secondary transition-all transform group-hover:translate-x-1">
                      <ArrowRight size={20} />
                    </div>
                  </div>
                  
                  <p className="text-white/40 text-[10px] font-bold italic leading-tight uppercase tracking-tight line-clamp-2 mb-6 bg-white/[0.02] p-4 border-l border-accent/40">
                    "{char.personality || "RESONANCE_PENDING"}"
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-white/5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3 text-white/30 font-mono text-[9px] tracking-widest font-bold italic">
                        <MessageSquare size={14} className="text-secondary" /> {char.chatCount || 0} LOGS
                      </div>
                      <span className="text-white/5 font-mono text-[8px] font-bold tracking-widest">#{char.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </YokaiCard>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

