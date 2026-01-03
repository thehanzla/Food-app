import React from 'react';
import { motion } from 'framer-motion';
import { Utensils, Heart, CheckCircle, Brain, Users, Globe } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-[#f8f5f0] pt-28 pb-20 px-6 overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute top-20 left-[10%] opacity-10 text-stone-900 pointer-events-none text-9xl animate-float-slow z-0">🍅</div>
      <div className="absolute bottom-40 right-[5%] opacity-10 text-stone-900 pointer-events-none text-9xl animate-float-medium z-0">🥬</div>

      {/* Scroll Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-600 origin-left z-50" style={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.5 }} />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-4 bg-orange-100 rounded-full mb-6">
            <Utensils className="size-10 text-orange-600" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-stone-900 mb-6 font-serif">
            Revolutionizing <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Dining</span>
          </h1>
          <p className="text-xl text-stone-500 max-w-2xl mx-auto leading-relaxed">
            FoodieAI is Lahore's first AI-powered culinary assistant, designed to solve the eternal question: "What should I eat today?"
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100"
          >
            <Brain className="size-12 text-orange-500 mb-6" />
            <h3 className="text-2xl font-bold text-stone-900 mb-4 font-serif">Smart Recommendations</h3>
            <p className="text-stone-500 leading-relaxed">
              Our advanced AI analyzes your cravings, budget, and dietary preferences to suggest the perfect meal from hundreds of local restaurants. No more scrolling aimlessly.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100"
          >
            <Globe className="size-12 text-orange-500 mb-6" />
            <h3 className="text-2xl font-bold text-stone-900 mb-4 font-serif">Hyper-Local Focus</h3>
            <p className="text-stone-500 leading-relaxed">
              We are proudly built in and for Lahore. From hidden street food gems in Anarkali to premium fine dining in Gulberg, we know the city's taste better than anyone.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-stone-900 text-white p-12 rounded-[3rem] text-center relative overflow-hidden"
        >
          <div className="relative z-10">
            <h3 className="text-3xl font-black mb-6 font-serif">Our Mission</h3>
            <p className="text-xl text-stone-300 max-w-3xl mx-auto mb-10 leading-relaxed">
              To connect food lovers with their perfect meals instantly, supporting local businesses and celebrating the rich culinary heritage of Pakistan.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
                <CheckCircle size={20} className="text-green-400" /> <span>100+ Partners</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
                <CheckCircle size={20} className="text-green-400" /> <span>AI Powered</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
                <CheckCircle size={20} className="text-green-400" /> <span>24/7 Support</span>
              </div>
            </div>
          </div>

          {/* Decorative Pattern */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        </motion.div>

        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-stone-900 mb-8 font-serif">Meet the Team</h3>
          <div className="flex justify-center flex-wrap gap-8">
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-stone-100 w-64 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-24 h-24 bg-stone-100 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white shadow-md">
                <Users className="w-full h-full p-4 text-stone-400" />
              </div>
              <h4 className="font-black text-stone-900 text-lg">Hanzla</h4>
              <p className="text-orange-500 font-bold text-xs uppercase tracking-wider mb-2">Founder & Lead Dev</p>
              <p className="text-stone-400 text-sm">Visionary behind FoodieAI, passionate about tech and food.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutUs;
