import React from 'react';
import { Check, Sparkles, Zap, Shield, Users, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Pricing = () => {
  const tiers = [
    {
      name: 'Free',
      price: '0',
      description: 'Perfect for trying out our AI magic.',
      features: [
        '5 low-res exports per month',
        'Watermarked assets',
        'Basic templates',
        'Email support',
      ],
      cta: 'Start for Free',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '29',
      description: 'The standard for professional marketers.',
      features: [
        '100 full-res exports per month',
        'All formats included',
        'Commercial license',
        'No watermarks',
        'Priority generation',
      ],
      cta: 'Get Started Pro',
      highlighted: true,
    },
    {
      name: 'Agency',
      price: '99',
      description: 'For high-volume creative teams.',
      features: [
        '500 exports per month',
        '5 team seats',
        'API Access',
        'Custom brand profiles',
        'White-label options',
        'Dedicated account manager',
      ],
      cta: 'Go Agency',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navigation */}
      <nav className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">Adcrea</span>
        </Link>
        <Link to="/studio" className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all active:scale-95">
          Start Creating
        </Link>
      </nav>

      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Simple, Transparent Pricing</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Choose the plan that fits your creative volume. Scale as you grow.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {tiers.map((tier, idx) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative bg-white rounded-3xl p-8 shadow-xl flex flex-col ${
                  tier.highlighted ? 'ring-4 ring-indigo-600 scale-105 z-10' : 'border border-slate-100'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                    Most Popular
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{tier.name}</h3>
                  <p className="text-slate-500 text-sm">{tier.description}</p>
                </div>
                <div className="mb-8">
                  <span className="text-5xl font-extrabold text-slate-900">${tier.price}</span>
                  <span className="text-slate-400 font-medium">/mo</span>
                </div>
                <div className="flex-1 space-y-4 mb-8">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <span className="text-sm text-slate-600">{feature}</span>
                    </div>
                  ))}
                </div>
                <button
                  className={`w-full py-4 rounded-2xl font-bold transition-all active:scale-95 ${
                    tier.highlighted
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'
                      : 'bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {tier.cta}
                </button>
              </motion.div>
            ))}
          </div>

          <div className="mt-24 grid md:grid-cols-4 gap-8">
            <TrustCard icon={<Zap className="w-6 h-6 text-indigo-600" />} title="Fast Generation" description="Assets ready in seconds." />
            <TrustCard icon={<Shield className="w-6 h-6 text-indigo-600" />} title="Secure Storage" description="Cloud encrypted assets." />
            <TrustCard icon={<Users className="w-6 h-6 text-indigo-600" />} title="Team Collab" description="Shared workspaces available." />
            <TrustCard icon={<Globe className="w-6 h-6 text-indigo-600" />} title="All Platforms" description="Global export support." />
          </div>
        </div>
      </section>
    </div>
  );
};

const TrustCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="flex flex-col items-center text-center">
    <div className="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center mb-4 border border-slate-50">
      {icon}
    </div>
    <h4 className="font-bold text-slate-900 mb-1">{title}</h4>
    <p className="text-xs text-slate-500">{description}</p>
  </div>
);

export default Pricing;
