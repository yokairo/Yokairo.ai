import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * High-Energy Card Component
 * Enhanced with anime-style corner brackets and scanline effects
 */
export const YokaiCard: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  animate?: boolean;
  scanline?: boolean;
}> = ({ children, className, animate = true, scanline = true }) => (
  <motion.div
    initial={animate ? { opacity: 0, y: 20 } : undefined}
    whileInView={animate ? { opacity: 1, y: 0 } : undefined}
    viewport={{ once: true }}
    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
    className={cn(
      "relative p-6 glass-panel neon-border hover:border-secondary transition-all duration-300 group overflow-hidden", 
      className
    )}
  >
    {/* Corner Brackets */}
    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-accent/40 group-hover:border-accent group-hover:scale-110 transition-all" />
    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-accent/40 group-hover:border-accent group-hover:scale-110 transition-all" />
    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-accent/40 group-hover:border-accent group-hover:scale-110 transition-all" />
    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-accent/40 group-hover:border-accent group-hover:scale-110 transition-all" />

    {/* Top Glow bar */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-accent shadow-[0_0_10px_var(--color-accent)] animate-pulse" />

    <div className="relative z-10">{children}</div>

    {/* Decorative Tech Text */}
    <div className="absolute top-2 right-6 opacity-[0.05] group-hover:opacity-20 transition-opacity flex flex-col items-end pointer-events-none select-none">
      <span className="text-[8px] font-mono leading-none">FRAME_TYPE_09</span>
      <span className="text-[10px] font-bold leading-none mt-1">妖怪炉 // YOKAIRO</span>
    </div>
  </motion.div>
);

/**
 * Slam Action Button
 * Aggressive, slanted, high-energy
 */
export const YokaiButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: "solid" | "outline" | "ghost";
}> = ({ children, className, variant = "outline", ...props }) => {
  const themes = {
    solid: "bg-accent text-black border-accent hover:bg-white hover:border-white shadow-[2px_2px_0_var(--color-secondary)]",
    outline: "bg-white/5 border-white/20 text-white hover:bg-white hover:text-black hover:border-white shadow-[2px_2px_0_rgba(255,255,255,0.1)]",
    ghost: "bg-transparent border-transparent text-white/40 hover:text-accent hover:bg-accent/5 shadow-none"
  };

  return (
    <button 
      className={cn(
        "px-10 py-3 font-display font-black uppercase tracking-widest text-[11px] border transition-all duration-200 relative flex items-center justify-center gap-3 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
        themes[variant],
        className
      )}
      {...(props as any)}
    >
      <span className="relative z-10 italic flex items-center gap-3">{children}</span>
    </button>
  );
};

/**
 * Aggressive Page Header
 */
export const YokaiHeader: React.FC<{ 
  text: string; 
  subtext?: string;
  className?: string;
}> = ({ text, subtext, className }) => (
  <div className={cn("flex flex-col gap-2", className)}>
    <div className="relative">
      <motion.h2 
        initial={{ x: -20, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-5xl md:text-7xl font-display font-black uppercase italic tracking-tighter leading-none text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
      >
        {text}
      </motion.h2>
      <motion.div 
        initial={{ width: 0 }}
        whileInView={{ width: "100%" }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="h-1 bg-gradient-to-r from-accent to-secondary mt-2 shadow-[0_0_10px_var(--color-accent)]"
      />
    </div>
    {subtext && (
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="text-accent/60 font-mono uppercase tracking-[0.4em] text-[10px] pl-1"
      >
        {subtext}
      </motion.div>
    )}
  </div>
);

/**
 * Energy Matrix Background
 */
export const YokaiBackground: React.FC = () => (
  <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#05050A]">
    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
    <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px]" />
    <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[150px]" />
    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
  </div>
);

export const YokaiBadge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <span className={cn(
    "px-3 py-1 text-[9px] font-mono font-bold uppercase tracking-[0.2em] bg-accent/10 text-accent border border-accent/20",
    className
  )}>
    {children}
  </span>
);

export const YokaiDivider: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("h-px w-full bg-white/5 relative overflow-hidden", className)}>
    <motion.div 
      initial={{ x: "-100%" }}
      animate={{ x: "200%" }}
      transition={{ duration: 5, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
      className="absolute inset-0 w-1/2 bg-accent opacity-20"
    />
  </div>
);


