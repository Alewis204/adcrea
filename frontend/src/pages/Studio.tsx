import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Video, User, Layout, Download, ChevronRight, Sparkles, Wand2, Monitor, Instagram, Facebook, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const Studio = () => {
  const [step, setStep] = useState(1);
  const [selectedFormat, setSelectedFormat] = useState('static');
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const formats = [
    { id: 'static', name: 'Static Ad', icon: <ImageIcon className="w-5 h-5" />, description: 'Professional product photography' },
    { id: 'video', name: 'Video Ad', icon: <Video className="w-5 h-5" />, description: 'Scroll-stopping motion graphics' },
    { id: 'ugc', name: 'UGC Content', icon: <User className="w-5 h-5" />, description: 'Realistic creator-style shots' },
    { id: 'short', name: 'Faceless Video', icon: <Monitor className="w-5 h-5" />, description: 'Viral-ready short form content' },
  ];

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: <Instagram className="w-5 h-5" /> },
    { id: 'facebook', name: 'Facebook', icon: <Facebook className="w-5 h-5" /> },
    { id: 'tiktok', name: 'TikTok', icon: <span className="font-bold text-xs">TT</span> },
    { id: 'amazon', name: 'Amazon', icon: <ShoppingBag className="w-5 h-5" /> },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setPreviewImage('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">Adcrea Studio</span>
          </Link>
          <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-400">
            <span className={step >= 1 ? "text-indigo-600" : ""}>Upload</span>
            <ChevronRight className="w-4 h-4" />
            <span className={step >= 2 ? "text-indigo-600" : ""}>Configure</span>
            <ChevronRight className="w-4 h-4" />
            <span className={step >= 3 ? "text-indigo-600" : ""}>Preview</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Save Draft</button>
          <Link to="/dashboard" className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
            <User className="w-5 h-5 text-slate-500" />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar Controls */}
        <aside className="w-80 bg-white border-r border-slate-200 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Step 1: Upload */}
            <section>
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                Product Image
              </h3>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
                </div>
                <p className="text-xs font-semibold text-slate-900 mb-1">Click to upload</p>
                <p className="text-[10px] text-slate-500">PNG, JPG up to 10MB</p>
              </div>
            </section>

            {/* Step 2: Format */}
            <section>
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                Creative Format
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {formats.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFormat(f.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      selectedFormat === f.id
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      selectedFormat === f.id ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500'
                    }`}>
                      {f.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{f.name}</p>
                      <p className="text-[10px] text-slate-500">{f.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Step 3: Platform */}
            <section>
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                Target Platform
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlatform(p.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                      selectedPlatform === p.id
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      selectedPlatform === p.id ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500'
                    }`}>
                      {p.icon}
                    </div>
                    <span className="text-[10px] font-bold text-slate-900">{p.name}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="p-6 border-t border-slate-200 bg-slate-50">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Generate Magic
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Preview Canvas */}
        <section className="flex-1 bg-slate-100 flex items-center justify-center p-12 relative overflow-hidden">
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-50" />

          <AnimatePresence mode="wait">
            {!previewImage && !isGenerating && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center text-center max-w-sm"
              >
                <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6">
                  <Layout className="w-10 h-10 text-slate-300" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Preview Canvas</h2>
                <p className="text-slate-500 text-sm">Upload a product photo and select a format to see your AI-generated creative here.</p>
              </motion.div>
            )}

            {isGenerating && (
              <motion.div
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <div className="w-64 h-80 bg-white rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden relative">
                   <div className="absolute inset-0 bg-gradient-to-t from-indigo-50 to-transparent" />
                   <motion.div
                      animate={{
                        y: [-20, 20, -20],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                   >
                     <Sparkles className="w-12 h-12 text-indigo-400 opacity-50" />
                   </motion.div>
                   <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 3 }}
                          className="h-full bg-indigo-600"
                        />
                      </div>
                   </div>
                </div>
                <p className="mt-6 text-sm font-bold text-slate-900 animate-pulse">Our AI is dreaming up your creative...</p>
              </motion.div>
            )}

            {previewImage && !isGenerating && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center"
              >
                <div className="relative group">
                  <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-white transition-all duration-500 ${
                    selectedPlatform === 'instagram' ? 'aspect-square w-[400px]' :
                    selectedPlatform === 'tiktok' ? 'aspect-[9/16] h-[600px]' :
                    'aspect-video w-[600px]'
                  }`}>
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg hover:bg-white text-slate-700">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-8 bg-white px-6 py-4 rounded-full shadow-xl border border-slate-100 flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated CTR</span>
                    <span className="text-sm font-bold text-green-600">+2.4%</span>
                  </div>
                  <div className="w-px h-8 bg-slate-100" />
                  <button className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:indigo-700 transition-colors">
                    <Download className="w-4 h-4" />
                    Export All Sizes
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
};

export default Studio;
