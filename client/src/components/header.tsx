import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary flex items-center">
            <ShieldCheck className="h-8 w-8 mr-2 text-accent" />
            AI Defense Watermarker
          </h1>
          <a href="#" className="text-accent hover:text-accent/80 font-medium">Help</a>
        </div>
      </div>
    </header>
  );
}
