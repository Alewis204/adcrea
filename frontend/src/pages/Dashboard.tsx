import React from 'react';
import { Sparkles, Layout, Clock, Download, MoreVertical, Plus, Image as ImageIcon, Video, Search, Filter, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const assets = [
    { id: 1, type: 'static', title: 'Watch Hero Shot', date: '2 hours ago', size: '1080x1080', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400' },
    { id: 2, type: 'video', title: 'Sneaker Campaign', date: 'Yesterday', size: '9:16 Reels', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400' },
    { id: 3, type: 'ugc', title: 'Skin Care Review', date: '2 days ago', size: '1080x1350', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=400' },
    { id: 4, type: 'static', title: 'Headphone Studio', date: '3 days ago', size: 'Amazon Product', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400' },
    { id: 5, type: 'short', title: 'Summer Sale Promo', date: '5 days ago', size: 'TikTok', url: 'https://images.unsplash.com/photo-1526170315870-ef682c535d42?auto=format&fit=crop&q=80&w=400' },
    { id: 6, type: 'static', title: 'Smart Bottle', date: '1 week ago', size: '1080x1080', url: 'https://images.unsplash.com/photo-1602143393494-138384240751?auto=format&fit=crop&q=80&w=400' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Adcrea</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <SidebarLink icon={<Layout className="w-5 h-5" />} label="Library" active />
          <SidebarLink icon={<Clock className="w-5 h-5" />} label="Recent" />
          <SidebarLink icon={<Plus className="w-5 h-5" />} label="New Project" to="/studio" />
          <div className="pt-8 px-2 pb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workspace</span>
          </div>
          <SidebarLink icon={<ImageIcon className="w-5 h-5" />} label="Static Ads" />
          <SidebarLink icon={<Video className="w-5 h-5" />} label="Video Ads" />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-indigo-50 rounded-2xl p-4">
            <p className="text-xs font-bold text-indigo-900 mb-1">Pro Plan</p>
            <p className="text-[10px] text-indigo-700 mb-3">82 / 100 exports left</p>
            <div className="h-1.5 bg-indigo-200 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-indigo-600 w-[82%]" />
            </div>
            <Link to="/pricing" className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider">Upgrade Plan</Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Creative Library</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search assets..." 
                className="bg-slate-50 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 w-64"
              />
            </div>
            <Link to="/studio" className="bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Asset
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {/* Filters */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex gap-2">
              <FilterBtn label="All" active />
              <FilterBtn label="Static" />
              <FilterBtn label="Video" />
              <FilterBtn label="UGC" />
            </div>
            <button className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
              <Filter className="w-4 h-4" /> Filter By Date
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {assets.map((asset) => (
              <motion.div 
                key={asset.id}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="aspect-square bg-slate-100 relative overflow-hidden">
                  <img src={asset.url} alt={asset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow-sm hover:bg-white text-slate-700">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold rounded uppercase">
                      {asset.type}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-slate-900 truncate mb-1">{asset.title}</h3>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                    {asset.size} • {asset.date}
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                    <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                    <button className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

const SidebarLink = ({ icon, label, active, to = '#' }: { icon: React.ReactNode, label: string, active?: boolean, to?: string }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
      active ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    {icon}
    <span className="text-sm">{label}</span>
  </Link>
);

const FilterBtn = ({ label, active }: { label: string, active?: boolean }) => (
  <button className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
    active ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-100 hover:border-slate-200 shadow-sm'
  }`}>
    {label}
  </button>
);

export default Dashboard;
