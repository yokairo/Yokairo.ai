import React from "react";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup, signInAnonymously } from "firebase/auth";
import { YokaiCard, YokaiButton, YokaiHeader, YokaiBadge, YokaiDivider } from "../components/UI";
import { LogIn, Loader2, Shield, Globe, Activity, Lock, Zap, Sparkles, Flame, UserCircle } from "lucide-react";
import { toast } from "sonner";

export const Login = () => {
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const [isGuestLoggingIn, setIsGuestLoggingIn] = React.useState(false);

  const handleGoogleLogin = async () => {
    if (isLoggingIn || isGuestLoggingIn) return;
    setIsLoggingIn(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success("Identity synchronized successfully. Welcome back.");
    } catch (error: any) {
      console.error("Login Error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        toast.error("Authentication cancelled.");
      } else {
        toast.error("Connection failed. System error.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGuestLogin = async () => {
    if (isLoggingIn || isGuestLoggingIn) return;
    setIsGuestLoggingIn(true);
    try {
      await signInAnonymously(auth);
      toast.success("Guest resonance established.");
    } catch (error) {
       console.error("Guest Login Error:", error);
       toast.error("Failed to establish guest connection.");
    } finally {
      setIsGuestLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 md:px-12 relative overflow-hidden bg-black select-none">
      
      {/* Background kinetic energy */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-accent)_0%,transparent_70%)] opacity-10 animate-pulse" />
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-px h-full bg-accent/20 animate-[scanline_10s_linear_infinite]" />
        <div className="absolute top-1/4 right-1/4 w-px h-full bg-secondary/20 animate-[scanline_12s_linear_infinite]" />
      </div>

      <YokaiCard className="max-w-4xl w-full p-8 md:p-16 relative bg-surface/90 backdrop-blur-3xl border border-white/10" scanline={true}>
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
           <Zap size={400} className="text-accent fill-accent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10 text-white">
          <div className="flex flex-col justify-center">
            <YokaiBadge className="mb-8 w-fit italic skew-x-[-15deg] bg-accent/20 text-accent border-accent/40 px-6">GATE_IDENT // 0xNEON</YokaiBadge>
            
            <div className="mb-12">
              <YokaiHeader text="IGNITE" subtext="PROTOCOL_ZERO // INITIALIZING" className="mb-6" />
              <p className="text-white/40 text-lg font-medium leading-relaxed max-w-sm mt-8">
                Manifest your digital existence. Connect to the <span className="text-secondary font-bold italic">Yokairo Resonance Matrix.</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-6 text-[9px] font-mono font-bold tracking-[0.2em] uppercase italic opacity-40">
              <div className="flex items-center gap-2 text-accent">
                <Activity size={12} className="animate-pulse" /> SYSTEM_ONLINE
              </div>
              <div className="flex items-center gap-2 text-secondary">
                <Globe size={12} className="animate-spin-slow" /> HUB_CONNECTED
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center glass-panel border border-white/5 p-8 md:p-12 space-y-10 relative overflow-hidden group/box">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-secondary/5 opacity-0 group-hover/box:opacity-100 transition-opacity" />
            
            <div className="absolute top-0 left-0 p-6 opacity-20">
               <Shield size={32} className="text-white/20 group-hover/box:text-accent transition-colors" />
            </div>

            <div className="text-center space-y-2 relative">
               <h3 className="text-4xl font-display font-black uppercase tracking-tighter italic text-white leading-none">RESONANCE</h3>
               <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.5em] italic">AUTHENTICATE_SOUL</p>
            </div>

            <div className="w-full space-y-6 relative">
              <YokaiButton 
                onClick={handleGoogleLogin} 
                variant="solid" 
                disabled={isLoggingIn || isGuestLoggingIn}
                className="w-full py-6 group"
              >
                {isLoggingIn ? (
                  <Loader2 className="animate-spin mx-auto" size={24} />
                ) : (
                  <span className="tracking-[0.15em] flex items-center justify-center gap-4">
                    SYNC_IDENTITY <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                  </span>
                )}
              </YokaiButton>

              <YokaiButton 
                onClick={handleGuestLogin} 
                variant="outline" 
                disabled={isLoggingIn || isGuestLoggingIn}
                className="w-full py-6 group border-white/10 hover:border-secondary/40"
              >
                {isGuestLoggingIn ? (
                  <Loader2 className="animate-spin mx-auto" size={24} />
                ) : (
                  <span className="tracking-[0.15em] flex items-center justify-center gap-4">
                    GUEST_ACCESS <UserCircle size={18} className="group-hover:scale-110 transition-transform" />
                  </span>
                )}
              </YokaiButton>
              
              <div className="flex justify-between items-center opacity-10">
                 <div className="h-px w-full bg-gradient-to-r from-transparent via-white to-transparent" />
              </div>
            </div>

            <div className="text-[8px] font-mono text-white/20 uppercase tracking-widest leading-relaxed text-center italic max-w-xs space-y-1">
              <div>BY_CONTINUING_YOU_ACCEPT_PROTOCOLS</div>
              <div className="text-accent/30 tracking-[0.5em]">YOKAIRO_ECOSYSTEM_V_2.0</div>
            </div>
          </div>
        </div>
      </YokaiCard>
    </div>
  );
};

