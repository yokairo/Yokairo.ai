import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Menu, X, LogOut, MessageSquare, List, Home as HomeIcon, Ghost, Library, Globe, Zap } from "lucide-react";
import { YokaiButton } from "./UI";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const navLinks = [
    { name: "GATE", path: "/", icon: <HomeIcon size={14} /> },
    { name: "SYNTHS", path: "/characters", icon: <Ghost size={14} /> },
    { name: "MANIFESTS", path: "/reviews", icon: <Library size={14} /> },
    { name: "SECTOR", path: "/community", icon: <MessageSquare size={14} /> },
    { name: "FACTIONS", path: "/clubs", icon: <Globe size={14} /> },
    { name: "STREAM", path: "/mylist", icon: <List size={14} /> },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-300 ${scrolled ? "h-20 bg-background/90 backdrop-blur-xl border-b border-white/10" : "h-20 bg-transparent"}`}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 glass-panel neon-border flex items-center justify-center -skew-x-12 group-hover:skew-x-0 transition-all duration-300">
               <Zap size={20} className="text-accent fill-accent animate-pulse" />
            </div>
          </div>
          <span className="text-2xl font-black tracking-tighter leading-none italic group-hover:text-accent transition-all skew-x-[-10deg] group-hover:skew-x-0">YOKAI<span className="text-secondary">RO</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-10">
          <div className="flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`text-[10px] font-bold uppercase tracking-[0.25em] transition-all relative py-2 group italic ${location.pathname === link.path ? "text-accent" : "text-white/40 hover:text-white"}`}
              >
                {link.name}
                <span className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-accent to-secondary transition-all duration-500 ${location.pathname === link.path ? "w-full" : "w-0 group-hover:w-full"}`} />
              </Link>
            ))}
          </div>

          <div className="w-px h-6 bg-white/10" />

          {user ? (
            <div className="flex items-center space-x-6">
              <Link to="/profile" className="flex items-center gap-3 group relative">
                <div className="w-9 h-9 border border-white/10 p-0.5 group-hover:neon-border transition-all overflow-hidden bg-black -rotate-3 group-hover:rotate-0">
                  <img 
                    src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold tracking-[0.1em] uppercase truncate max-w-[100px] italic leading-tight">
                    {user.displayName?.toUpperCase() || "OPERATIVE"}
                  </span>
                  <span className="text-[7px] text-accent font-bold tracking-widest italic opacity-50">NODE_ACTIVE</span>
                </div>
              </Link>
              <button onClick={handleLogout} className="text-white/20 hover:text-accent transition-all hover:scale-110">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/login">
              <YokaiButton className="px-6 py-2 text-[10px] font-bold neon-border">
                SIGN_IN
              </YokaiButton>
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="lg:hidden text-white hover:text-accent transition-all z-[1100] p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[1050] lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
              className="fixed right-0 top-0 h-full w-[80%] max-w-[280px] bg-background/95 backdrop-blur-2xl z-[1080] lg:hidden border-l border-white/10 p-8 pt-24 flex flex-col gap-6 overflow-hidden neon-border-purple"
            >
              <div className="text-secondary/60 text-[10px] font-mono font-bold tracking-[0.4em] uppercase mb-4 italic border-b border-white/10 pb-4">NAV_MENU</div>
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  onClick={() => setIsOpen(false)}
                  className={`text-2xl font-black uppercase tracking-tighter italic transition-all leading-none ${location.pathname === link.path ? "text-accent translate-x-2" : "text-white/30 hover:text-white"}`}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="mt-auto space-y-6">
                {user ? (
                  <div className="flex flex-col gap-4">
                    <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 glass-panel p-3 neon-border">
                      <div className="w-10 h-10 border border-accent/20 p-0.5 overflow-hidden">
                        <img src={user.photoURL || ""} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-black uppercase tracking-tighter italic leading-none">{user.displayName}</span>
                        <span className="text-[7px] text-accent font-bold italic tracking-widest opacity-50">ACTIVE_NODE</span>
                      </div>
                    </Link>
                    <YokaiButton 
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }} 
                      className="w-full py-3 text-xs font-bold neon-border-purple"
                    >
                      LOGOUT
                    </YokaiButton>
                  </div>
                ) : (
                  <Link to="/login" onClick={() => setIsOpen(false)} className="w-full">
                    <YokaiButton className="w-full py-4 text-sm font-bold neon-border">
                      INITIALIZE
                    </YokaiButton>
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};
