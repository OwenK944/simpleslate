import React, { useEffect } from 'react';
import { useAuthStore } from '../lib/auth';
import { useSlateStore } from '../store';
import { auth, googleProvider, signInWithPopup } from '../lib/firebase';
import { Film, User, ChevronRight, PenTool, Layout, Lock, Cloud, Zap, Download, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export function WelcomeScreen() {
  const { user, loading } = useAuthStore();
  const { setView } = useSlateStore();

  useEffect(() => {
    if (user && !loading) {
      setView('dashboard');
    }
  }, [user, loading, setView]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setView('dashboard');
    } catch (e) {
      console.error(e);
    }
  };

  const handleGuest = () => {
    setView('editor');
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-bg flex items-center justify-center text-synth-cyan">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-bg flex flex-col font-sans text-slate-text overflow-y-auto custom-scrollbar relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }} 
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-synth-purple/20 blur-[120px] rounded-full mix-blend-screen"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[20%] -right-[10%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-synth-cyan/15 blur-[100px] rounded-full mix-blend-screen"
        />
        <motion.div 
          animate={{ y: [0, -50, 0], opacity: [0.05, 0.1, 0.05] }} 
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] left-[20%] w-[70vw] h-[70vw] max-w-[700px] max-h-[700px] bg-synth-pink/20 blur-[120px] rounded-full mix-blend-screen"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Navigation */}
        <motion.nav 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-synth-cyan to-synth-purple rounded-xl flex items-center justify-center shadow-lg shadow-synth-cyan/20">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">Simple<span className="text-synth-cyan">Slate</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <main className="w-full flex-grow flex flex-col items-center justify-center py-20 px-6 max-w-7xl mx-auto">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="text-center max-w-4xl mx-auto flex flex-col items-center z-10"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-card/80 border border-synth-cyan/30 text-synth-cyan text-sm font-medium mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(0,255,255,0.1)]">
              <Sparkles className="w-4 h-4" />
              <span>The future of screenwriting is here</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black text-white leading-tight mb-8 tracking-tighter">
              Write Scripts. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-synth-cyan via-synth-purple to-synth-pink">Without Distractions.</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl leading-relaxed">
              SimpleSlate is a radically minimal, offline-capable screenwriting environment designed for pure focus and creative flow.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogin}
                className="w-full sm:w-auto py-4 px-10 bg-white text-slate-900 rounded-full font-bold transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] flex items-center justify-center gap-2 text-lg group"
              >
                <User className="w-5 h-5" />
                Start Writing (Login)
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGuest}
                className="w-full sm:w-auto py-4 px-10 bg-slate-card/50 backdrop-blur-md border border-slate-border text-white rounded-full font-bold hover:bg-slate-card hover:border-synth-cyan transition-all flex items-center justify-center gap-2 text-lg"
              >
                Start Writing (Guest)
              </motion.button>
            </motion.div>
            
            <motion.p variants={itemVariants} className="text-sm text-slate-500 mt-6">
              100% Free forever. No trials, no paywalls, just writing.
            </motion.p>
          </motion.div>
        </main>
      </div>

      {/* Feature Showcase Grid */}
      <div id="features" className="relative z-10 w-full bg-slate-bg/80 backdrop-blur-xl border-y border-slate-border">
        <div className="max-w-7xl mx-auto px-6 py-32">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Everything you need. <br/><span className="text-synth-purple">Nothing you don't.</span></h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">We stripped away the complex menus and clutter so you can focus entirely on your story.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: PenTool, title: "Fountain Syntax", desc: "Write in standard text. We automatically format it to industry standard screenplays.", color: "text-synth-cyan", bg: "bg-synth-cyan/10" },
              { icon: Layout, title: "Distraction Free", desc: "Enter focus mode to hide everything except your words on the page.", color: "text-synth-pink", bg: "bg-synth-pink/10" },
              { icon: Zap, title: "Lightning Fast", desc: "Built on modern web tech. SimpleSlate loads instantly and never lags.", color: "text-yellow-400", bg: "bg-yellow-400/10" },
              { icon: Lock, title: "Offline First", desc: "Lose your connection? No problem. Keep writing and we'll sync when you're back.", color: "text-green-400", bg: "bg-green-400/10" },
              { icon: Cloud, title: "Cloud Sync", desc: "Access your scripts from any device, anywhere in the world, securely.", color: "text-blue-400", bg: "bg-blue-400/10" },
              { icon: Download, title: "PDF Export", desc: "One click export to an industry-standard PDF, ready to send to producers.", color: "text-synth-purple", bg: "bg-synth-purple/10" }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-slate-card/40 backdrop-blur-md border border-slate-border hover:border-slate-600 rounded-2xl p-8 transition-all group shadow-lg"
              >
                <div className={`w-14 h-14 rounded-xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="relative z-10 w-full py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-card/50"></div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-4xl mx-auto px-6 text-center"
        >
          <h2 className="text-5xl font-black text-white mb-8">Ready to start?</h2>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogin}
            className="py-5 px-12 bg-gradient-to-r from-synth-cyan to-synth-purple text-white rounded-full font-bold text-xl shadow-[0_0_40px_rgba(176,38,255,0.4)] hover:shadow-[0_0_60px_rgba(0,255,255,0.6)] transition-all"
          >
            Start Writing Now
          </motion.button>
        </motion.div>
      </div>
      
      {/* SEO Footer */}
      <footer className="relative z-10 w-full bg-slate-bg border-t border-slate-border py-12 text-center text-slate-500 text-sm">
        <div className="max-w-4xl mx-auto px-6">
          <p className="mb-4">
            SimpleSlate is a <strong>free screenwriting software</strong> designed for maximum focus. 
            Whether you are writing a movie, a TV pilot, or a short film, our <strong>minimalist script writing app</strong> 
            helps you format your screenplay to industry standards automatically using Fountain syntax.
          </p>
          <p>
            No subscriptions, no paywalls, just a clean, offline-capable environment to write your next masterpiece.
          </p>
        </div>
      </footer>
    </div>
  );
}
