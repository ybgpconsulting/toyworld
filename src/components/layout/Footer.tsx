import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[var(--deep-navy)] text-white pt-12 pb-24 md:pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-bold text-[var(--brand-orange)] tracking-tight">
                TOY<span className="text-white">WORLD</span>
              </span>
            </Link>
            <p className="text-gray-300 text-sm">
              Your one-stop destination for genuine, high-quality toys. Delivering joy across India.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-[var(--brand-gold)]">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">Shop All Toys</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-[var(--brand-gold)]">Policies</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/shipping-policy" className="hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link to="/return-policy" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-[var(--brand-gold)]">Need Help?</h3>
            <p className="text-sm text-gray-300 mb-4">
              We're available on WhatsApp from 9 AM to 8 PM.
            </p>
            <a 
              href="https://wa.me/919416217374" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2 rounded-full font-medium transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp
            </a>
          </div>

        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} TOY WORLD. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
