import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { YokaiCard, YokaiButton, YokaiHeader, YokaiBadge, YokaiDivider } from "../components/UI";
import { Link } from "react-router-dom";
import { ArrowRight, MessageSquare, Library, Globe, Ghost, ChevronRight, Zap, Target, Flame, Sparkles } from "lucide-react";

export const Home = () => {
  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 800], [0, 200]);
  const opacityHero = useTransform(scrollY, [0, 500], [1, 0]);

  const modules = [
    { title: "Characters", icon: <Ghost size={32} />, path: "/characters", desc: "Forge bonds with AI entities. High-velocity narrative synchronization." },
    { title: "Reviews", icon: <Library size={32} />, path: "/reviews", desc: "Shatter the frame. Exploded analysis of the definitive anime masterpieces." },
    { title: "Community", icon: <MessageSquare size={32} />, path: "/community", desc: "The collective is vibrating. Real-time neural links and shared chaos." },
    { title: "Clubs", icon: <Globe size={32} />, path: "/clubs", desc: "Underground factions. Join the dedicated nodes of pure obsession." },
  ];

  return (
    <div className="relative min-h-screen bg-background select-none">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center px-8 md:px-16 overflow-hidden border-b border-white/5">
        <motion.div style={{ y: yHero, opacity: opacityHero }} className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1578632738981-4330ce12271d?q=80&w=2574&auto=format&fit=crop" 
            alt="Dynamic Anime Visual" 
            className="w-full h-full object-cover scale-110 brightness-[0.3]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background to-transparent" />
        </motion.div>

        <div className="relative z-10 w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 pt-20">
          <div className="lg:col-span-8 flex flex-col items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-10 bg-accent/20 border border-accent/40 text-accent px-6 py-2 skew-x-[-15deg]"
            >
              <Zap size={14} className="fill-accent group-hover:animate-pulse" />
              <span className="text-[10px] font-mono font-bold tracking-[0.4em] uppercase italic">SYSTEM_READY // NODE_0x1F4</span>
            </motion.div>
            
            <YokaiHeader 
              text="SOUL_RESONANCE" 
              subtext="UNLEASH THE AETHER DIMENSION" 
              className="mb-10"
            />
            
            <p className="text-xl md:text-2xl text-white/50 font-medium max-w-2xl mb-12 leading-relaxed tracking-tight italic">
              Hyper-fidelity reviews. Neural Persona Deployment. Underground Syndicates. <span className="text-secondary font-bold">Experience the digital singularity.</span>
            </p>

            <div className="flex flex-wrap gap-6">
              <Link to="/characters">
                <YokaiButton variant="solid" className="px-10 py-6 group">
                  INITIALIZE_RESONANCE <Flame size={18} className="ml-2 group-hover:text-white" />
                </YokaiButton>
              </Link>
              <Link to="/reviews">
                <YokaiButton variant="outline" className="px-10 py-6 group">
                  ACCESS_ARCHIVE <Sparkles size={18} className="ml-2" />
                </YokaiButton>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 hidden lg:flex flex-col justify-end items-end gap-10 pb-20">
             <div className="text-right glass-panel p-8 neon-border-purple -rotate-2 group hover:rotate-0 transition-transform relative">
                <div className="absolute top-0 right-0 p-1 opacity-20 text-[8px] font-mono">NODE_STAT_01</div>
                <div className="text-secondary font-display font-black text-6xl leading-none italic drop-shadow-[0_0_10px_var(--color-secondary)] group-hover:scale-110 transition-transform">99%</div>
                <div className="text-[10px] font-mono tracking-[0.3em] text-white/50 uppercase mt-2">VOLTAGE_SPIKE</div>
             </div>
             <div className="text-right glass-panel p-8 neon-border rotate-2 group hover:rotate-0 transition-transform relative">
                <div className="absolute top-0 left-0 p-1 opacity-20 text-[8px] font-mono">NODE_STAT_02</div>
                <div className="text-accent font-display font-black text-6xl leading-none italic drop-shadow-[0_0_10px_var(--color-accent)] group-hover:scale-110 transition-transform">5.1k</div>
                <div className="text-[10px] font-mono tracking-[0.3em] text-white/50 uppercase mt-2">NEURAL_NODES</div>
             </div>
          </div>
        </div>

        {/* Dynamic scanlines */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-accent/20 to-transparent pointer-events-none" />
      </section>

      {/* Grid Overflow */}
      <section className="px-8 md:px-16 py-32 max-w-[1400px] mx-auto relative">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
           <Target size={400} className="text-accent rotate-12" />
        </div>

        <div className="flex flex-col lg:flex-row items-end justify-between mb-24 gap-12">
          <div className="max-w-2xl relative">
             <h2 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter leading-none italic text-white mb-6">
               THE <span className="text-accent drop-shadow-[0_0_10px_var(--color-accent)]">CORE</span> MODULES
             </h2>
             <p className="text-secondary text-sm font-mono font-bold uppercase italic tracking-[0.3em]">
               Shattering the boundary between reality and narrative.
             </p>
          </div>
          <div className="hidden lg:block w-32 h-1 bg-accent/30 neon-border" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((m, i) => (
            <Link key={m.title} to={m.path} className="group">
              <YokaiCard className="h-[450px] flex flex-col justify-between p-8 border border-white/5 group-hover:neon-border group-hover:scale-[1.02]">
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 glass-panel flex items-center justify-center -rotate-6 group-hover:rotate-12 group-hover:bg-accent/10 group-hover:border-accent transition-all duration-300">
                    <span className="group-hover:text-accent transition-colors">{m.icon}</span>
                  </div>
                  <span className="text-5xl font-display font-black text-white/5 group-hover:text-accent/10 transition-colors uppercase italic tracking-tighter leading-none">0{i + 1}</span>
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-3xl font-display font-black uppercase italic tracking-tighter group-hover:text-accent transition-colors">{m.title}</h3>
                  <p className="text-white/40 font-medium uppercase italic text-xs leading-relaxed group-hover:text-white/80 transition-colors">
                    {m.desc}
                  </p>
                  <YokaiDivider className="h-px bg-white/10" />
                  <div className="flex items-center gap-3 text-[10px] font-mono font-bold tracking-[0.2em] text-secondary group-hover:text-accent transition-all">
                     INITIATE_SYNC <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </YokaiCard>
            </Link>
          ))}
        </div>
      </section>

      {/* Extreme CTA */}
      <section className="py-40 bg-secondary/10 relative overflow-hidden flex items-center justify-center border-y border-white/5">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }} 
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center text-white/10 font-display font-black text-[15vw] leading-none uppercase italic tracking-tighter pointer-events-none"
        >
          SYNC_NODE
        </motion.div>
        
        <div className="relative z-10 text-center max-w-4xl px-8">
           <h2 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter leading-[0.9] italic text-white mb-12 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              VIBRATE<br/><span className="text-secondary drop-shadow-[0_0_15px_var(--color-secondary)]">HIGHER</span>
           </h2>
           <Link to="/login">
             <YokaiButton variant="solid" className="px-16 py-8 text-lg font-black group neon-border-purple">
                ENTER THE CORE <Zap size={22} className="ml-4 group-hover:animate-pulse" />
             </YokaiButton>
           </Link>
        </div>
      </section>

      <footer className="py-20 bg-background border-t border-white/5 px-8 md:px-16">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 items-center gap-12">
          <Link to="/" className="flex items-center gap-4 group justify-center lg:justify-start">
             <div className="w-12 h-12 glass-panel neon-border flex items-center justify-center -skew-x-12">
                <Zap size={24} className="text-accent fill-accent" />
             </div>
             <span className="text-3xl font-display font-black tracking-tighter italic skew-x-[-10deg] group-hover:text-accent transition-colors">YOKAIRO</span>
          </Link>
          
          <div className="flex justify-center gap-10 font-mono text-[9px] tracking-[0.4em] text-white/30 uppercase font-bold italic">
             <a href="#" className="hover:text-accent transition-colors">Manifesto</a>
             <a href="#" className="hover:text-accent transition-colors">Privacy</a>
             <a href="#" className="hover:text-accent transition-colors">Nodes</a>
          </div>
          
          <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest text-center lg:text-right">
             © 2026 YOKAIRO_PROTOCOLS. SYSTEM_STABLE.
          </div>
        </div>
      </footer>
    </div>
  );
};

