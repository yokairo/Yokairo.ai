import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { db, auth, handleFirestoreError, OperationType } from "../firebase";
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { YokaiCard, YokaiButton, YokaiBadge, YokaiHeader, YokaiDivider } from "../components/UI";
import { Send, ArrowLeft, Zap, AlertCircle, User, Bot, Loader2, Cpu, Activity, Globe, MessageSquare, ChevronLeft, Sparkles, Info, Radio, Terminal, Scan } from "lucide-react";
import { Character, ChatMessage, CharacterMode } from "../types";
import { toast } from "sonner";
import { cn } from "../lib/utils";

export const Chat = () => {
  const { characterId } = useParams<{ characterId: string }>();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [currentMode, setCurrentMode] = useState<CharacterMode>("Normal");
  const [expression, setExpression] = useState<string>("Neutral");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChar = async () => {
      if (!characterId) return;
      const docRef = doc(db, "characters", characterId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCharacter({ id: docSnap.id, ...docSnap.data() } as Character);
      } else {
        toast.error("Character index not found.");
        navigate("/characters");
      }
    };
    fetchChar();
  }, [characterId]);

  useEffect(() => {
    if (!characterId || !auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const path = `characters/${characterId}/chats/${uid}/messages`;
    const q = query(
      collection(db, path),
      orderBy("timestamp", "asc"),
      limit(50)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      setMessages(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      setLoading(false);
    });
    return unsubscribe;
  }, [characterId, auth.currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !character || !auth.currentUser || !characterId) return;

    const userMsg = inputText;
    setInputText("");
    setIsTyping(true);

    try {
      await addDoc(collection(db, `characters/${characterId}/chats/${auth.currentUser.uid}/messages`), {
        sender: "user",
        text: userMsg,
        timestamp: new Date().toISOString(),
        mode: currentMode
      });

      const response = await fetch("/api/character-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          character,
          message: userMsg,
          mode: currentMode,
          history: messages.slice(-5).map(m => ({ role: m.sender === "user" ? "user" : "model", text: m.text }))
        })
      });

      const data = await response.json();
      const delay = Math.min(Math.max(data.reply.length * 20, 1000), 3000);
      await new Promise(resolve => setTimeout(resolve, delay));

      const expressionMatch = data.reply.match(/^\[(.*?)\]/);
      if (expressionMatch) {
        setExpression(expressionMatch[1]);
      }

      await addDoc(collection(db, `characters/${characterId}/chats/${auth.currentUser.uid}/messages`), {
        sender: "character",
        text: data.reply,
        timestamp: new Date().toISOString(),
        mode: currentMode
      });
    } catch (error) {
      toast.error("Transmission interrupted. Please check your connection.");
    } finally {
      setIsTyping(false);
    }
  };

  if (loading || !character) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-12 text-accent">
        <Radio className="animate-spin" size={100} strokeWidth={3} />
        <span className="text-4xl font-black tracking-[1em] uppercase italic animate-pulse">SYNCHRONIZING VOID</span>
      </div>
    );
  }

  const modeAliases: Record<string, string> = {
    "Normal": "PROTOCOL_X",
    "Friendly": "PROTOCOL_Y",
    "Roast": "BURN_MODE",
    "Savage": "ABSOLUTE_VOID"
  };

  return (
    <div className="h-[calc(100vh-80px)] max-w-[1700px] mx-auto px-4 md:px-16 py-6 md:py-12 flex flex-col gap-6 md:gap-10 select-none font-display">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-10 bg-black border-4 border-accent p-6 md:p-10 relative overflow-hidden group shadow-[10px_10px_0_white] md:shadow-[15px_15px_0_white]">
        <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-12 z-10 w-full lg:w-auto">
          <button onClick={() => navigate("/characters")} className="w-12 h-12 md:w-20 md:h-20 bg-white text-black flex items-center justify-center hover:bg-accent hover:text-white transition-all -rotate-3 hover:rotate-3 shadow-[4px_4px_0_var(--color-accent)] md:shadow-[6px_6px_0_var(--color-accent)] active:shadow-none">
            <ChevronLeft className="w-8 h-8 md:w-12 md:h-12" strokeWidth={4} />
          </button>
          
          <div className="flex items-center gap-6 md:gap-12">
            <div className="w-20 h-20 md:w-32 md:h-32 border-4 border-white/20 p-1 transition-all duration-700 group-hover:border-accent shadow-[6px_6px_0_white] md:shadow-[10px_10px_0_white] -rotate-2 group-hover:rotate-0 overflow-hidden relative grayscale group-hover:grayscale-0">
              <img src={character.avatarUrl} alt={character.name} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-[8s]" />
              <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-40 transition-opacity" />
            </div>
            <div>
              <div className="flex items-center gap-4 md:gap-8 mb-2 md:mb-4">
                <h2 className="text-3xl md:text-7xl font-black uppercase italic tracking-tighter leading-none group-hover:text-accent transition-colors">{character.name}</h2>
                <YokaiBadge className="bg-accent text-white italic scale-100 md:scale-125 origin-left">{modeAliases[currentMode as string] || currentMode.toUpperCase()}</YokaiBadge>
              </div>
              <div className="flex items-center gap-6 md:gap-10 text-[10px] md:text-[14px] font-black tracking-widest uppercase italic text-white/50">
                 <div className="flex items-center gap-2 md:gap-3 text-accent bg-accent/10 px-2 md:px-4 py-1 border-l-4 border-accent">
                   <Activity className="w-4 h-4 md:w-5 md:h-5 animate-ping" />
                   LIVE
                 </div>
                 <div className="flex items-center gap-2 md:gap-3">
                   <Scan className="w-4 h-4 md:w-5 md:h-5 text-white/20" />
                   MODE: <span className="text-white font-black">{expression.toUpperCase()}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 z-10 bg-white/5 p-2 border-2 border-white/10 shrink-0">
          {["Normal", "Friendly", "Roast", "Savage"].map((mode) => (
            <button
              key={mode}
              onClick={() => setCurrentMode(mode as CharacterMode)}
              className={cn(
                "px-4 md:px-8 py-2 md:py-4 text-[10px] md:text-[12px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] italic transition-all skew-x-[-10deg]",
                currentMode === mode 
                  ? "bg-accent text-white shadow-[2px_2px_0_white] md:shadow-[4px_4px_0_white]" 
                  : "text-white/20 hover:text-white hover:bg-white/10"
              )}
            >
              {modeAliases[mode] || mode}
            </button>
          ))}
        </div>
        <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/Vekcn9Oao9t9S/giphy.gif')] opacity-5 mix-blend-overlay pointer-events-none" />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 md:gap-12 min-h-0">
        <div className="flex-1 flex flex-col gap-6 md:gap-10 min-h-0">
          <YokaiCard className="flex-1 overflow-hidden flex flex-col !p-0 border-4 border-white/10 relative bg-black shadow-[10px_10px_0_var(--color-accent)] md:shadow-[20px_20px_0_var(--color-accent)]">
            <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-10 md:space-y-16 scrollbar-hide relative z-10">
              <AnimatePresence initial={false}>
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-10 py-32 md:py-60">
                    <Terminal className="w-20 h-20 md:w-40 md:h-40 mb-8 md:mb-12 text-accent animate-pulse" />
                    <span className="text-xl md:text-4xl font-black tracking-[0.5em] md:tracking-[1em] uppercase italic">NO DATA</span>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <motion.div
                    key={msg.id || i}
                    initial={{ opacity: 0, x: msg.sender === "user" ? 50 : -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] md:max-w-[75%] flex flex-col gap-4 md:gap-6 ${msg.sender === "user" ? "items-end text-right" : "items-start text-left"}`}>
                       <div className={`flex items-center gap-2 md:gap-4 text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] italic ${msg.sender === "user" ? "text-accent" : "text-white/30"}`}>
                          <div className={cn("w-2 h-2 md:w-3 md:h-3 rotate-45", msg.sender === "user" ? "bg-accent shadow-[0_0_10px_var(--color-accent)]" : "bg-white/10")} />
                          {msg.sender === "user" ? "OPERATIVE" : character.name.toUpperCase()}
                       </div>
                      <div className={cn(
                        "px-6 md:px-10 py-4 md:py-8 transition-all duration-700 border-2 md:border-4 relative",
                        msg.sender === "user" 
                          ? "bg-white text-black border-white shadow-[6px_6px_0_var(--color-accent)] md:shadow-[10px_10px_0_var(--color-accent)] skew-x-[-2deg] text-xl md:text-3xl font-black italic tracking-tighter" 
                          : "bg-black/80 border-white/10 text-white text-2xl md:text-4xl font-black italic tracking-tighter leading-[0.9] skew-x-[2deg] group-hover:border-accent"
                      )}>
                        {msg.text}
                      </div>
                      <span className="text-[8px] md:text-[10px] font-black tracking-[0.2em] md:tracking-[0.5em] uppercase text-white/10 italic">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isTyping && (
                <div className="flex justify-start">
                   <div className="flex gap-2 md:gap-4 p-4 md:p-8 bg-white/5 border-2 md:border-4 border-accent/20 px-6 md:px-12 rotate-3">
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-2 md:w-4 md:h-4 bg-accent shadow-[0_0_15px_var(--color-accent)]" />
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-2 h-2 md:w-4 md:h-4 bg-accent shadow-[0_0_15px_var(--color-accent)]" />
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-2 h-2 md:w-4 md:h-4 bg-accent shadow-[0_0_15px_var(--color-accent)]" />
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 md:p-12 border-t-4 md:border-t-8 border-accent bg-black relative">
              <form onSubmit={handleSendMessage} className="flex gap-4 md:gap-10 items-center">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="TRANSMIT..."
                  className="flex-1 bg-white/5 border-2 md:border-4 border-white/10 py-3 md:py-6 px-4 md:px-10 text-xl md:text-4xl font-black italic tracking-tighter focus:outline-none focus:border-accent transition-all text-white placeholder:text-white/5"
                />
                <button 
                  type="submit" 
                  disabled={isTyping || !inputText.trim()} 
                  className="bg-accent text-white px-8 md:px-20 py-3 md:py-8 text-xl md:text-4xl font-black uppercase italic tracking-tighter shadow-[4px_4px_0_white] md:shadow-[10px_10px_0_white] hover:bg-white hover:text-black transition-all disabled:opacity-30 disabled:grayscale"
                >
                  {isTyping ? <Radio className="w-6 h-6 md:w-10 md:h-10 animate-spin mx-auto" /> : "FIRE"}
                </button>
              </form>
            </div>
          </YokaiCard>
        </div>

        <aside className="hidden lg:flex w-[400px] flex-col gap-12">
          <section className="space-y-8">
            <YokaiBadge className="bg-white text-black scale-125 origin-left">ENTITY_DIAGNOSTICS</YokaiBadge>
            <YokaiCard className="bg-black p-12 space-y-16 border-4 border-white/10 shadow-[10px_10px_0_white]">
               <div className="space-y-8">
                 <div className="flex justify-between text-[14px] font-black tracking-[0.4em] uppercase italic">
                   <span className="text-white/20">RESONANCE_RATIO</span>
                   <span className="text-accent">99.8% // PEAK</span>
                 </div>
                 <div className="h-6 bg-white/5 border-2 border-white/10 p-1">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: "99.8%" }}
                     className="h-full bg-accent shadow-[0_0_25px_var(--color-accent)] relative overflow-hidden"
                   >
                     <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/Vekcn9Oao9t9S/giphy.gif')] opacity-20 mix-blend-overlay" />
                   </motion.div>
                 </div>
               </div>

               <div className="grid grid-cols-1 gap-12">
                 <div className="flex items-center justify-between border-b-2 border-white/5 pb-4">
                    <div className="flex flex-col gap-2">
                      <span className="text-[12px] font-black text-white/20 uppercase tracking-[0.3em] italic">LATENCY</span>
                      <div className="text-5xl font-black text-white leading-none tracking-tighter">0.02ms</div>
                    </div>
                    <Cpu size={40} className="text-white/10" />
                 </div>
                 <div className="flex items-center justify-between border-b-2 border-white/5 pb-4">
                    <div className="flex flex-col gap-2">
                       <span className="text-[12px] font-black text-white/20 uppercase tracking-[0.3em] italic">ACTIVE_PROTOCOL</span>
                       <div className="text-5xl font-black text-accent leading-none tracking-tighter italic">{modeAliases[currentMode as string] || "UNKNOWN"}</div>
                    </div>
                    <Terminal size={40} className="text-accent/20" />
                 </div>
               </div>

               <div className="p-10 border-4 border-accent/20 bg-accent/5 flex flex-col gap-8 relative overflow-hidden">
                  <Sparkles size={40} className="text-accent opacity-60 animate-pulse" />
                  <p className="text-xl text-white/60 font-black leading-tight italic tracking-tighter uppercase relative z-10">
                    STABLE_RESONANCE. ENTITY IS RESPONSIVE TO HIGH-ENERGY STIMULI. VOID SYNC ESTABLISHED.
                  </p>
                  <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/Vekcn9Oao9t9S/giphy.gif')] opacity-10 mix-blend-overlay pointer-events-none" />
               </div>
            </YokaiCard>
          </section>

          <section className="space-y-8 flex-1 flex flex-col">
            <YokaiBadge className="bg-secondary text-black scale-125 origin-left">SHADOW_ECHOES</YokaiBadge>
            <YokaiCard className="flex-1 bg-black border-4 border-dashed border-white/10 flex flex-col items-center justify-center text-center p-16 rotate-2 hover:rotate-0 transition-transform">
               <Info size={64} className="mb-8 text-white/5" strokeWidth={3} />
               <p className="text-2xl font-black tracking-[0.2em] uppercase italic text-white/10 px-6 leading-tight">ZERO HISTORICAL LOGS EXTRACTED FROM THIS SECTOR.</p>
            </YokaiCard>
          </section>
        </aside>
      </div>
    </div>
  );
};

