
import React, { useState } from 'react';

interface NavbarProps {
  onWhatsAppClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onWhatsAppClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Home', href: '#' },
    { name: 'Contact', href: '#' },
    { name: 'Help', href: '#' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center justify-between px-6 md:px-12 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">G</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-800 hidden sm:block">
          Gyanbindu<span className="text-emerald-600 font-extrabold italic">.</span>
        </span>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-8">
        {menuItems.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className="text-gray-600 hover:text-emerald-600 font-medium transition-colors duration-200"
          >
            {item.name}
          </a>
        ))}
        <button
          onClick={onWhatsAppClick}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full font-semibold flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.767 5.767 0 1.267.405 2.436 1.087 3.39l-1.137 3.313 3.483-1.071c.905.518 1.954.814 3.072.814 3.181 0 5.767-2.586 5.767-5.767 0-3.181-2.586-5.767-5.767-5.767zm0 1.25c2.495 0 4.517 2.022 4.517 4.517 0 2.495-2.022 4.517-4.517 4.517-1.109 0-2.113-.4-2.895-1.066l-.196-.118-2.038.627.66-1.921-.132-.218a4.49 4.49 0 0 1-.916-2.821c0-2.495 2.022-4.517 4.517-4.517z" />
          </svg>
          WhatsApp
        </button>
      </div>

      {/* Mobile Menu Button */}
      <button 
        className="md:hidden text-gray-700 p-2"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="absolute top-[60px] left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-100 p-6 flex flex-col gap-4 shadow-2xl md:hidden animate-in slide-in-from-top duration-300">
          {menuItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-lg font-medium text-gray-800 hover:text-emerald-600 py-2 border-b border-gray-50 last:border-0"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </a>
          ))}
          <button
            onClick={() => {
              onWhatsAppClick();
              setIsMenuOpen(false);
            }}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold mt-2 shadow-lg shadow-emerald-100"
          >
            Connect on WhatsApp
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
