import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShoppingBag } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center bg-gray-50">
      <div className="w-32 h-32 md:w-48 md:h-48 relative mb-8 animate-bounce">
        {/* Simple CSS Art Toy Box */}
        <div className="absolute inset-0 bg-orange-200 rounded-lg shadow-lg border-4 border-[var(--brand-orange)]"></div>
        <div className="absolute -top-4 left-4 w-8 h-8 bg-blue-400 rounded-full"></div>
        <div className="absolute -top-6 right-8 w-10 h-10 bg-yellow-400 rounded-sm rotate-12"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl md:text-6xl font-black text-[var(--brand-orange)]">
          404
        </div>
      </div>
      
      <h1 className="text-3xl md:text-5xl font-bold text-[var(--deep-navy)] mb-4">
        Oops! Toy not found.
      </h1>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        Looks like this page got lost in the toy box. Don't worry, there are plenty of other fun things to discover!
      </p>
      
      <Link to="/">
        <Button size="lg" className="px-8 py-4 text-lg">
          <ShoppingBag className="w-5 h-5 mr-2" />
          Back to Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
