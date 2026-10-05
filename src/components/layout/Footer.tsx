import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Phone, MapPin, Mail, ShieldCheck, Truck, Heart } from 'lucide-react';
import { WHATSAPP_URL, WHATSAPP_NUMBER } from '../../lib/constants';
import { MOCK_CATEGORIES } from '../../lib/mockData';

const Footer = () => {
  return (
    <footer className="relative bg-[var(--deep-navy)] text-white pt-16 pb-24 md:pb-12 border-t border-orange-500/20 overflow-hidden">
      {/* Background Toy Doodles Texture */}
      <div className="absolute inset-0 bg-toy-doodles-dark opacity-15 pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--brand-orange)] to-amber-400 flex items-center justify-center text-2xl shadow-md">
                🧸
              </div>
              <span className="text-2xl font-black text-[var(--brand-orange)] tracking-tight">
                TOY<span className="text-white">WORLD</span>
              </span>
            </Link>
            <p className="text-gray-300 text-sm max-w-sm leading-relaxed">
              India’s premier online toy destination. We bring joy to children with curated educational, creative, and adrenaline-packed toys with 100% BIS safety certification.
            </p>

            <div className="space-y-2 text-xs text-gray-300 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--brand-orange)] flex-shrink-0" />
                <span>123 Market Road, Main Bazar, Hisar, Haryana - 125001</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>+91 {WHATSAPP_NUMBER} (Mon–Sat: 10am–8pm)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>contact@toyworld.in</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-black text-sm uppercase tracking-wider mb-4 text-[var(--brand-gold)]">
              Explore Store
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li><Link to="/" className="hover:text-[var(--brand-orange)] transition-colors">Home Page</Link></li>
              <li><Link to="/shop" className="hover:text-[var(--brand-orange)] transition-colors font-bold text-white">Shop All Toys</Link></li>
              <li><Link to="/about" className="hover:text-[var(--brand-orange)] transition-colors">About Toy World</Link></li>
              <li><Link to="/contact" className="hover:text-[var(--brand-orange)] transition-colors">Contact Us</Link></li>
              <li><Link to="/search" className="hover:text-[var(--brand-orange)] transition-colors">Search Catalog</Link></li>
            </ul>
          </div>

          {/* Top Categories */}
          <div>
            <h3 className="font-black text-sm uppercase tracking-wider mb-4 text-[var(--brand-gold)]">
              Categories
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-300">
              {MOCK_CATEGORIES.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.slug}`} className="hover:text-[var(--brand-orange)] transition-colors line-clamp-1">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care & WhatsApp */}
          <div>
            <h3 className="font-black text-sm uppercase tracking-wider mb-4 text-[var(--brand-gold)]">
              Customer Support
            </h3>
            <p className="text-xs text-gray-300 mb-4 leading-relaxed">
              Have questions about toy safety, age suitability, or shipping? Chat live with our toy specialists!
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2.5 rounded-full font-bold text-xs transition-all shadow-md hover:scale-105"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>WhatsApp Us Now</span>
            </a>

            <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-2 text-[11px] text-gray-400">
              <Link to="/shipping-policy" className="hover:text-white">Shipping</Link> •
              <Link to="/return-policy" className="hover:text-white">Returns</Link> •
              <Link to="/terms" className="hover:text-white">Terms</Link>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p className="flex items-center gap-1">
            <span>&copy; {new Date().getFullYear()} TOY WORLD. Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
            <span>for Indian Kids.</span>
          </p>

          <div className="flex items-center gap-3 text-[11px] text-gray-300">
            <span className="bg-white/10 px-2 py-1 rounded">UPI Accepted</span>
            <span className="bg-white/10 px-2 py-1 rounded">Google Pay</span>
            <span className="bg-white/10 px-2 py-1 rounded">PhonePe</span>
            <span className="bg-white/10 px-2 py-1 rounded">WhatsApp Pay</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
