import React from 'react';
import { ArrowRight, Sparkles, Video, Image as ImageIcon, Layout, Zap, CheckCircle, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Adcrea</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it Works</a>
              <Link to="/pricing" className="hover:text-indigo-600 transition-colors">Pricing</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Login</Link>
              <Link to="/studio" className="bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95">
                Start Creating
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6">
                Revolutionize Your Ad Creative
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
                One Product Image. <br />
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">Infinite Possibilities.</span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                Adcrea is your all-in-one AI creative studio. Generate studio-quality photos, video ads, and UGC content in minutes, not weeks.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/studio" className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 group">
                  Try for Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="w-full sm:w-auto bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-full text-lg font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                  <Play className="w-5 h-5 fill-slate-700" /> Watch Demo
                </button>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10" />
            <div className="rounded-2xl border border-slate-200 shadow-2xl overflow-hidden bg-slate-50 aspect-[16/9] flex items-center justify-center relative">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 w-full h-full opacity-40">
                  {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className="bg-white rounded-xl shadow-sm h-full w-full animate-pulse" />
                  ))}
               </div>
               <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full mx-4">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <ImageIcon className="text-indigo-600 w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-slate-50 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-40 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                        <Sparkles className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-sm font-medium">Generating creative...</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="h-2 bg-indigo-600 rounded-full" />
                        <div className="h-2 bg-indigo-600 rounded-full" />
                        <div className="h-2 bg-slate-100 rounded-full" />
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Scale</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">One platform, all formats. Optimized for every major marketing channel.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ImageIcon className="w-6 h-6 text-indigo-600" />}
              title="Studio Photography"
              description="Transform a phone photo into high-end studio shots with custom backgrounds."
            />
            <FeatureCard
              icon={<Video className="w-6 h-6 text-violet-600" />}
              title="Video Ad Generator"
              description="Create scrolls-stopping video ads from static images in seconds."
            />
            <FeatureCard
              icon={<Layout className="w-6 h-6 text-purple-600" />}
              title="Multi-Platform Resize"
              description="Automatically pre-sized for Facebook, Instagram, TikTok, and Amazon."
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6 text-indigo-600" />}
              title="UGC-Style Content"
              description="Generate realistic creator-style content without the high cost of talent."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-violet-600" />}
              title="Faceless Short-Form"
              description="Viral-ready shorts and reels generated from your product details."
            />
            <FeatureCard
              icon={<CheckCircle className="w-6 h-6 text-purple-600" />}
              title="Commercial Licensed"
              description="Full commercial rights to every asset you generate. No hidden fees."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <Sparkles className="text-white w-4 h-4" />
            </div>
            <span className="text-lg font-bold">Adcrea</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Contact</a>
          </div>
          <p className="text-sm text-slate-400">© 2026 Adcrea AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-white p-8 rounded-2xl border border-slate-100 hover:shadow-xl hover:shadow-indigo-50 transition-all group">
    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
);

export default LandingPage;
