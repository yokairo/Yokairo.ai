import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { Navbar } from "./components/Navbar";
import { YokaiBackground } from "./components/UI";
import { motion, AnimatePresence } from "framer-motion";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Reviews } from "./pages/Reviews";
import { Community } from "./pages/Community";
import { Clubs } from "./pages/Clubs";
import { MyList } from "./pages/MyList";
import { Profile } from "./pages/Profile";
import { Characters } from "./pages/Characters";
import { Chat } from "./pages/Chat";
import { Toaster } from "sonner";

export default function App() {
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black overflow-hidden relative">
        <YokaiBackground />
        <div className="scanline-overlay" />
        <div className="relative z-10 flex flex-col items-center">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.05, 1], opacity: 1 }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-7xl font-black text-white uppercase italic tracking-tighter leading-none"
            >
              YOKAI<span className="text-secondary">RO</span>
            </motion.div>
            <div className="mt-8 flex flex-col items-center gap-4">
               <motion.div animate={{ width: [0, 200, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="h-1 bg-accent shadow-[0_0_15px_var(--color-accent)]" />
               <span className="text-[10px] font-mono font-bold text-accent/60 tracking-[1em] uppercase animate-pulse">INIT_RESONANCE...</span>
            </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen text-white selection:bg-accent selection:text-white relative bg-black font-display antialiased overflow-x-hidden">
        <YokaiBackground />
        <div className="scanline-overlay" />
        <Navbar />
        <main className="min-h-screen relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/characters" element={<Characters />} />
            <Route path="/chat/:characterId" element={user ? <Chat /> : <Navigate to="/login" />} />
            <Route path="/community" element={<Community />} />
            <Route path="/clubs" element={<Clubs />} />
            <Route path="/mylist" element={user ? <MyList /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          </Routes>
        </main>
        <Toaster position="bottom-right" theme="dark" richColors />
      </div>
    </Router>
  );
}
