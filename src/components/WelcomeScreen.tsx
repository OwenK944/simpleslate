import React, { useEffect } from 'react';
import { useAuthStore } from '../lib/auth';
import { useSlateStore } from '../store';
import { auth, googleProvider, signInWithPopup } from '../lib/firebase';
import { Film, User, ChevronRight, PenTool, Layout, Lock, Cloud, Zap, Download, Heart, Star } from 'lucide-react';
import { motion } from 'motion/react';

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
    <div className="min-h-screen bg-slate-bg flex flex-col font-sans text-slate-text overflow-y-auto custom-scrollbar">
      {/* Navigation */}
      <nav className="w-full max-w-6xl mx-auto px-6 py-8 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Film className="w-8 h-8 text-synth-purple" />
          <span className="text-2xl font-bold text-white tracking-tighter">SimpleSlate</span>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 w-full flex flex-col items-center">
        <section className="w-full max-w-6xl mx-auto px-6 pt-12 pb-20 flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-synth-cyan/10 border border-synth-cyan/20 text-synth-cyan text-xs font-bold uppercase tracking-widest mb-8">
              <Star className="w-3.5 h-3.5" /> 100% Free Screenwriting Software
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter leading-tight mb-6">
              Write your screenplay.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-synth-cyan via-synth-purple to-synth-pink">Without the friction.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              SimpleSlate is a radically simple, totally free screenwriting editor. 
              No paywalls, no subscriptions, and no complicated menus. Just a clean interface designed by writers, for writers, to keep you in the creative flow.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-lg mx-auto">
              <button 
                onClick={handleLogin}
                className="w-full py-4 px-6 bg-synth-purple text-white rounded-xl font-bold hover:bg-synth-pink transition-colors shadow-[0_0_25px_rgba(176,38,255,0.4)] hover:shadow-[0_0_35px_rgba(255,38,255,0.6)] flex items-center justify-center gap-2 text-lg"
              >
                <User className="w-5 h-5" />
                Sign Up / Login for Free
              </button>
              <button 
                onClick={handleGuest}
                className="w-full py-4 px-6 bg-slate-card border border-slate-border text-white rounded-xl font-bold hover:border-synth-cyan transition-colors flex items-center justify-center gap-2 text-lg"
              >
                Continue as Guest
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-5">
              * Logging in gives you free cloud storage for your projects. Guest mode saves everything locally to your browser.
            </p>
          </motion.div>
        </section>

        {/* The Mission Section */}
        <section className="w-full bg-slate-card/30 border-y border-slate-border py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Why we built SimpleSlate.</h2>
            <div className="space-y-6 text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto text-left md:text-center">
              <p>
                We believe that storytelling should be accessible to everyone. The industry standard screenwriting software is notoriously expensive, often costing hundreds of dollars or locking you into monthly subscriptions just to type words on a page.
              </p>
              <p>
                <strong>We wanted completely free software to write scripts.</strong> No trials. No premium tiers. No watermarks on your PDFs unless you put them there. 
              </p>
              <p>
                SimpleSlate was built to strip away the clutter. It focuses purely on the creative work, giving you an intuitive, lightning-fast, distraction-free environment to get your story out of your head and onto the page.
              </p>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="w-full max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything you need. Nothing you don't.</h2>
            <p className="text-slate-400">Professional tools built into a minimalist interface.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-card/80 p-8 rounded-3xl border border-slate-border text-left hover:border-synth-cyan transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-synth-cyan/10 flex items-center justify-center mb-6 group-hover:bg-synth-cyan/20 transition-colors">
                <Zap className="w-7 h-7 text-synth-cyan" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Smart Auto-Formatting</h3>
              <p className="text-slate-400 leading-relaxed">Focus on the story. SimpleSlate automatically detects scene headings, characters, and dialogue as you type based on industry standards.</p>
            </div>
            
            <div className="bg-slate-card/80 p-8 rounded-3xl border border-slate-border text-left hover:border-synth-purple transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-synth-purple/10 flex items-center justify-center mb-6 group-hover:bg-synth-purple/20 transition-colors">
                <Cloud className="w-7 h-7 text-synth-purple" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Free Cloud Sync</h3>
              <p className="text-slate-400 leading-relaxed">Create a free account to securely back up your projects in the cloud. Access your scripts from any device, anywhere, instantly.</p>
            </div>
            
            <div className="bg-slate-card/80 p-8 rounded-3xl border border-slate-border text-left hover:border-synth-pink transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-synth-pink/10 flex items-center justify-center mb-6 group-hover:bg-synth-pink/20 transition-colors">
                <Download className="w-7 h-7 text-synth-pink" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Standard Export</h3>
              <p className="text-slate-400 leading-relaxed">Generate perfect, industry-standard PDFs ready for production. Add title pages, cover images, and watermarks effortlessly.</p>
            </div>

            <div className="bg-slate-card/80 p-8 rounded-3xl border border-slate-border text-left hover:border-slate-300 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-slate-700/50 flex items-center justify-center mb-6 group-hover:bg-slate-600 transition-colors">
                <Layout className="w-7 h-7 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Distraction-Free</h3>
              <p className="text-slate-400 leading-relaxed">Toggle Focus Mode to hide all UI elements and immerse yourself completely in your script. Just you and the cursor.</p>
            </div>

            <div className="bg-slate-card/80 p-8 rounded-3xl border border-slate-border text-left hover:border-slate-300 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-slate-700/50 flex items-center justify-center mb-6 group-hover:bg-slate-600 transition-colors">
                <Lock className="w-7 h-7 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Privacy First</h3>
              <p className="text-slate-400 leading-relaxed">Guest mode keeps your data entirely within your browser. Even with an account, your scripts remain private and secure.</p>
            </div>

            <div className="bg-slate-card/80 p-8 rounded-3xl border border-slate-border text-left hover:border-slate-300 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-slate-700/50 flex items-center justify-center mb-6 group-hover:bg-slate-600 transition-colors">
                <PenTool className="w-7 h-7 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Built for Speed</h3>
              <p className="text-slate-400 leading-relaxed">Navigate entirely via keyboard shortcuts. Drag and drop scenes to reorder. Attach sticky notes to blocks for rapid revisions.</p>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="w-full bg-gradient-to-b from-slate-bg to-slate-card border-t border-slate-border py-20 text-center">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-white mb-8">Ready to write your next masterpiece?</h2>
            <button 
              onClick={handleGuest}
              className="py-4 px-10 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-200 transition-colors shadow-xl text-lg inline-flex items-center gap-2"
            >
              Start Writing Now <ChevronRight className="w-5 h-5" />
            </button>
            <div className="mt-16 flex items-center justify-center gap-2 text-sm text-slate-500">
              Made with <Heart className="w-4 h-4 text-synth-pink" /> by writers, for writers.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
