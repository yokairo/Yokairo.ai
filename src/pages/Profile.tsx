import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { YokaiCard, YokaiButton, YokaiBadge, YokaiHeader, YokaiDivider } from "../components/UI";
import { UserProfile, Character } from "../types";
import { Mail, Sparkles, Activity, Shield, Loader2, X, MessageSquare, ArrowRight, Heart, Star, Fingerprint, Users, Image as ImageIcon, Zap, Radio, Target, Cpu, HardDrive } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "../components/ImageUpload";
import { Link } from "react-router-dom";

export const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [userCharacters, setUserCharacters] = useState<Character[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      const docRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setProfile(data);
        setBio(data.bio || "");
      } else {
        const initialProfile: UserProfile = {
          uid: auth.currentUser.uid,
          displayName: auth.currentUser.displayName || "New User",
          email: auth.currentUser.email || "",
          photoURL: auth.currentUser.photoURL || "",
          bio: "REDEFINING THE ANIME EXPERIENCE. OVERRIDING REALITY.",
          stats: { reviewsCount: 0, likesReceived: 0, charactersCreated: 0 }
        };
        await setDoc(docRef, initialProfile);
        setProfile(initialProfile);
        setBio(initialProfile.bio || "");
      }

      const q = query(collection(db, "characters"), where("ownerId", "==", auth.currentUser.uid));
      const charSnap = await getDocs(q);
      setUserCharacters(charSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Character)));
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!auth.currentUser || !profile) return;
    try {
      await setDoc(doc(db, "users", auth.currentUser.uid), { ...profile, bio }, { merge: true });
      setProfile({ ...profile, bio });
      setIsEditing(false);
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error("Profile update failed.");
    }
  };

  const handlePhotoUpdate = async (url: string) => {
    if (!auth.currentUser || !profile) return;
    try {
      await setDoc(doc(db, "users", auth.currentUser.uid), { photoURL: url }, { merge: true });
      setProfile({ ...profile, photoURL: url });
      toast.success("Identity visual updated.");
    } catch (error) {
      toast.error("An error occurred while updating.");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-12 text-accent">
      <Cpu className="animate-spin" size={100} />
      <span className="text-3xl font-display font-black uppercase italic tracking-[0.5em] animate-pulse">SYNCING IDENTITY NODES</span>
    </div>
  );
  
  if (!profile) return (
    <div className="min-h-screen bg-black flex items-center justify-center italic text-white/20 tracking-[0.5em] uppercase text-4xl font-black">
      IDENTITY NOT FOUND.
    </div>
  );

  return (
    <div className="max-w-[1700px] mx-auto px-8 md:px-16 py-32 bg-black min-h-screen select-none font-display">
      <div className="relative mb-60 h-[45vh] min-h-[400px]">
        <YokaiCard className="p-0 overflow-hidden h-full border-accent/20 relative bg-black shadow-[20px_20px_0_var(--color-accent)]">
          <img 
            src={`https://picsum.photos/seed/${profile.uid}/1600/800`} 
            alt="Banner" 
            className="w-full h-full object-cover opacity-20 grayscale brightness-50 contrast-150 group-hover:scale-110 transition-transform duration-[10s]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-100" />
          <div className="absolute inset-0 opacity-10 bg-[url('https://media.giphy.com/media/Vekcn9Oao9t9S/giphy.gif')] mix-blend-overlay pointer-events-none" />
        </YokaiCard>

        <div className="absolute -bottom-32 left-12 md:left-24 flex flex-col md:flex-row items-end gap-16 z-30">
          <div className="relative group">
            <div className="w-72 h-72 border-8 border-accent p-2 bg-black backdrop-blur-3xl overflow-hidden shadow-[15px_15px_0_white] transition-all duration-700 group-hover:shadow-[15px_15px_0_var(--color-secondary)] -rotate-3 group-hover:rotate-0">
              <img 
                src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`} 
                alt={profile.displayName} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 contrast-125"
                referrerPolicy="no-referrer"
              />
            </div>
            {isEditing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity z-20 p-8">
                <ImageUpload 
                  folder="profiles" 
                  onUploadComplete={handlePhotoUpdate} 
                />
              </div>
            )}
            <div className="absolute -bottom-6 -right-6 px-10 py-4 bg-white text-black font-black text-3xl uppercase italic shadow-[6px_6px_0_var(--color-accent)]">
               LVL_0{Math.floor((profile.stats?.charactersCreated || 0) / 2) + 1}
            </div>
          </div>
          
          <div className="pb-12">
            <YokaiBadge className="mb-8 scale-150 origin-left ml-4 bg-accent text-white italic">OPERATIVE // {profile.uid.slice(0, 8).toUpperCase()}</YokaiBadge>
            <YokaiHeader text={profile.displayName.toUpperCase()} subtext="DIMENSIONAL OVERSEER" className="mb-8" />
            <div className="flex flex-col md:flex-row md:items-center gap-10 text-white/40 text-[14px] tracking-widest font-black uppercase italic">
              <div className="flex items-center gap-4 bg-white/5 px-6 py-2 border-l-4 border-secondary">
                <Mail size={20} className="text-secondary" /> {profile.email.toUpperCase()}
              </div>
              <div className="flex items-center gap-4 bg-white/5 px-6 py-2 border-l-4 border-accent">
                <Activity size={20} className="text-accent animate-ping" /> STATUS: FULLY_SYNCED
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-24 right-12 md:right-24 z-40">
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)} 
            className="bg-white text-black px-16 py-8 text-2xl font-black uppercase italic tracking-widest hover:bg-accent hover:text-white transition-all shadow-[10px_10px_0_var(--color-accent)] active:translate-x-2 active:translate-y-2 active:shadow-none"
          >
            {isEditing ? "SAVE LOGIC" : "OVERRIDE PROFILE"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-24 mt-40">
        <div className="lg:col-span-2 space-y-32">
          <section className="space-y-12">
            <div className="flex items-center gap-6 border-l-8 border-accent pl-8">
               <Fingerprint className="text-accent" size={40} />
               <YokaiBadge className="scale-125">OPERATIVE_MANIFESTO</YokaiBadge>
            </div>
            <YokaiCard className="bg-white/[0.01] border-4 border-white/10 p-16 shadow-[10px_10px_0_var(--color-accent)]">
              {isEditing ? (
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={5}
                  className="w-full bg-transparent border-b-4 border-accent px-0 py-8 focus:outline-none transition-all italic font-black leading-[0.9] text-white text-5xl uppercase tracking-tighter"
                  placeholder="INPUT STORY DATA..."
                />
              ) : (
                <p className="text-white text-6xl font-black italic leading-[0.85] tracking-tighter uppercase">
                  "{profile.bio?.toUpperCase() || "SHARING THE ECHOES OF STORIES YET TO BE TOLD."}"
                </p>
              )}
            </YokaiCard>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { label: "REVIEWS", value: profile.stats?.reviewsCount || 0, icon: <MessageSquare size={32} />, color: "accent" },
              { label: "LIKES", value: profile.stats?.likesReceived || 0, icon: <Heart size={32} />, color: "secondary" },
              { label: "SYNTHS", value: profile.stats?.charactersCreated || 0, icon: <Users size={32} />, color: "white" }
            ].map((stat) => (
              <YokaiCard key={stat.label} className="text-center p-16 bg-black border-4 border-white/5 hover:border-accent hover:shadow-[10px_10px_0_var(--color-accent)] transition-all group overflow-hidden relative">
                 <div className="text-[14px] tracking-[0.4em] text-white/20 mb-10 uppercase font-black italic group-hover:text-accent transition-colors">{stat.label}</div>
                 <div className="text-9xl font-black group-hover:text-white transition-colors leading-none mb-12 tracking-tighter italic">{stat.value}</div>
                 <div className="absolute -bottom-4 -right-4 text-white opacity-5 group-hover:opacity-20 transition-all scale-[4] rotate-[-15deg]">
                  {stat.icon}
                 </div>
              </YokaiCard>
            ))}
          </div>

          <section className="space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b-8 border-white/5 pb-10 gap-8">
               <div className="flex flex-col gap-4">
                 <YokaiBadge className="bg-secondary text-black">SYNTH_VAULT</YokaiBadge>
                 <h3 className="text-6xl font-black uppercase italic tracking-tighter text-white leading-none">PERSONAL GALLERY</h3>
               </div>
               <Link to="/characters">
                 <button className="bg-secondary text-black px-10 py-4 text-xl font-black uppercase italic tracking-tighter shadow-[6px_6px_0_white] hover:bg-white hover:shadow-[6px_6px_0_var(--color-secondary)] transition-all">NEW SYNTH</button>
               </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {userCharacters.map(char => (
                <Link key={char.id} to={`/chat/${char.id}`}>
                  <YokaiCard className="!p-0 h-52 flex items-center gap-10 group hover:border-secondary transition-all bg-black border-4 border-white/10 overflow-hidden shadow-[8px_8px_0_white] hover:shadow-[8px_8px_0_var(--color-secondary)]">
                    <div className="w-52 h-full grayscale group-hover:grayscale-0 transition-all duration-700 overflow-hidden relative border-r-4 border-white/5">
                      <img src={char.avatarUrl} alt="" className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-[8s]" />
                      <div className="absolute inset-0 bg-secondary/20 opacity-0 group-hover:opacity-40 transition-opacity" />
                    </div>
                    <div className="flex-1 pr-12">
                      <h4 className="text-4xl font-black uppercase italic group-hover:text-secondary transition-colors mb-4 tracking-tighter leading-none">{char.name}</h4>
                      <p className="italic text-xl text-white/40 line-clamp-1 mb-8 font-black uppercase tracking-tighter leading-none">
                        "{char.personality?.toUpperCase()}"
                      </p>
                      <div className="flex items-center gap-8 font-display text-[12px] text-white/20 tracking-widest font-black uppercase italic">
                        <span className="flex items-center gap-3"> <MessageSquare size={16} className="text-secondary" /> {char.chatCount || 0} BURSTS</span>
                        <span className="text-white/5">|</span>
                        <span>#{char.id.slice(0, 8).toUpperCase()}</span>
                      </div>
                    </div>
                  </YokaiCard>
                </Link>
              ))}
              {userCharacters.length === 0 && (
                <div className="col-span-full py-40 text-center border-8 border-dashed border-white/5 italic text-white/10 tracking-[0.5em] uppercase text-4xl font-black">
                  EMPTY VAULT.
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-24">
          <section className="space-y-12">
            <YokaiBadge className="bg-white text-black scale-110">OPERATIVE_RECORDS</YokaiBadge>
            <YokaiCard className="bg-black p-12 space-y-12 border-4 border-white/10 shadow-[8px_8px_0_white]">
               <div className="flex justify-between items-center group border-b-2 border-white/5 pb-6">
                 <span className="text-white/20 text-[12px] tracking-widest uppercase group-hover:text-accent transition-colors font-black italic">ESTABLISHED</span>
                 <span className="font-black italic uppercase text-2xl tracking-tighter">04_2026</span>
               </div>
               <div className="flex justify-between items-center group border-b-2 border-white/5 pb-6">
                 <span className="text-white/20 text-[12px] tracking-widest uppercase group-hover:text-secondary transition-colors font-black italic">SECURITY</span>
                 <span className="text-black text-[14px] font-black px-8 py-2 bg-secondary tracking-widest uppercase italic skew-x-[-15deg]">VERIFIED</span>
               </div>
               <div className="flex justify-between items-center group border-b-2 border-white/5 pb-6">
                 <span className="text-white/20 text-[12px] tracking-widest uppercase group-hover:text-white/40 transition-colors font-black italic">NODE_ID</span>
                 <span className="font-mono text-[12px] text-accent tracking-[0.3em] font-black uppercase">{profile.uid.slice(0, 12).toUpperCase()}</span>
               </div>
            </YokaiCard>
          </section>

          <section className="space-y-12">
            <YokaiBadge className="bg-accent text-white scale-110">ACHIEVEMENTS</YokaiBadge>
            <div className="grid grid-cols-2 gap-8 px-4">
              {[Target, Shield, Zap, Sparkles, Radio, HardDrive].map((Icon, i) => (
                <div key={i} className="aspect-square border-4 border-white/5 flex items-center justify-center text-white/5 hover:text-accent hover:border-accent hover:shadow-[6px_6px_0_white] group transition-all duration-700 bg-black rotate-[4deg] hover:rotate-0">
                  <Icon size={48} className="group-hover:scale-125 transition-transform" strokeWidth={3} />
                </div>
              ))}
            </div>
          </section>
          
          <div className="p-12 border-4 border-accent/20 bg-accent/5 flex items-center gap-10 relative overflow-hidden">
             <Activity size={48} className="text-accent animate-ping shrink-0" />
             <p className="text-xl text-accent font-black uppercase tracking-tighter leading-[0.9] italic relative z-10">
               NETWORK_STATUS: OVERDRIVE. SYNCING ALL NODES. 
             </p>
             <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/Vekcn9Oao9t9S/giphy.gif')] opacity-5 mix-blend-overlay" />
          </div>
        </aside>
      </div>
    </div>
  );
};

