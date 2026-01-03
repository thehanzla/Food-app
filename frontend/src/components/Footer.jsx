import React from 'react';
import { Link } from 'react-router-dom';
import { ShareIcon, MapPin, Mail, Smartphone, Heart, Instagram, Twitter, MessageCircle, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';

const sectionReveal = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1] }
  }
};

const Footer = () => {
  return (
    <footer className="pt-24 pb-12 bg-stone-900 text-stone-300 relative overflow-hidden">
      {/* Footer Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#a8a29e 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20"
        >
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-6">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-stone-800 rounded-xl"><Utensils size={24} className="text-orange-500" /></span>
              <h3 className="text-2xl font-black text-orange-500 font-serif tracking-tight food">FoodieAI</h3>
            </div>
            <p className="text-stone-300 leading-relaxed">
              Revolutionizing how you decide what to eat. powered by advanced AI to bring you the best culinary experiences in Lahore.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all">
                <span className="sr-only">Instagram</span>
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-black hover:text-white transition-all">
                <span className="sr-only">X</span>
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all">
                <span className="sr-only">WhatsApp</span>
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="text-orange-500 font-bold mb-6 text-lg food">Explore</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-stone-300 hover:text-orange-500 transition-colors">Home</Link></li>
              <li><Link to="/restaurants" className="text-stone-300 hover:text-orange-500 transition-colors">Restaurants</Link></li>
              <li><Link to="/deals" className="text-stone-300 hover:text-orange-500 transition-colors">Deals</Link></li>
              <li><Link to="/ai-chat" className="text-stone-300 hover:text-orange-500 transition-colors">AI & Chat</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="text-orange-500 font-bold mb-6 text-lg food">Company</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-stone-300 hover:text-orange-500 transition-colors">About Us</Link></li>
              <li><Link to="/restaurant-signup" className="text-stone-300 hover:text-orange-500 transition-colors">Become a Partner</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-orange-500 font-bold mb-6 text-lg food">Contact Us</h4>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <MapPin className="text-orange-500 flex-shrink-0" size={24} />
                <span className="text-stone-300">Lahore, Pakistan</span>
              </li>
              <li className="flex gap-4">
                <Mail className="text-orange-500 flex-shrink-0" size={24} />
                <span className="text-stone-300">thehanzalatariq@gmail.com</span>
              </li>
              <li className="flex gap-4">
                <Smartphone className="text-orange-500 flex-shrink-0" size={24} />
                <span className="text-stone-300">+92 310 4167838</span>
              </li>
            </ul>
          </div>
        </motion.div>

        <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-stone-500">
          <p>&copy; 2025 FoodieAI. All rights reserved.</p>
          <p className="flex items-center gap-1">Crafted with <Heart size={14} className="text-red-600 fill-red-600" /> in Lahore</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
