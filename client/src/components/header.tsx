import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };
  
  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 w-full h-16 py-3 px-4 md:px-8 flex items-center justify-between bg-white border-b border-neutral-200 z-20"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Link to="/" className="flex items-center z-20">
        <div className="flex items-center mr-2">
          <div className="bg-neutral-900 h-8 w-8 rounded flex items-center justify-center text-white font-bold">
            P
          </div>
        </div>
        <span className="text-xl font-semibold">Platypus</span>
      </Link>
      
      <div className="hidden md:flex items-center space-x-6">
        <button 
          onClick={() => scrollToSection('marketplace')}
          className="text-neutral-700 hover:text-neutral-900 text-sm md:text-base relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-neutral-900 after:scale-x-0 after:origin-right after:transition-transform hover:after:scale-x-100 hover:after:origin-left"
        >
          Marketplace
        </button>
        
        <button 
          onClick={() => scrollToSection('how-it-works')}
          className="text-neutral-700 hover:text-neutral-900 text-sm md:text-base relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-neutral-900 after:scale-x-0 after:origin-right after:transition-transform hover:after:scale-x-100 hover:after:origin-left"
        >
          How it Works
        </button>
        
        <button 
          onClick={() => scrollToSection('faq')}
          className="text-neutral-700 hover:text-neutral-900 text-sm md:text-base relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-neutral-900 after:scale-x-0 after:origin-right after:transition-transform hover:after:scale-x-100 hover:after:origin-left"
        >
          FAQ
        </button>
        
        <a 
          href="https://github.com/chigozzdev/platypus"
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-700 hover:text-neutral-900 text-sm md:text-base relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-neutral-900 after:scale-x-0 after:origin-right after:transition-transform hover:after:scale-x-100 hover:after:origin-left"
        >
          Docs
        </a>
        
        <Link 
          to="/auth" 
          className="bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-neutral-700 hover:bg-neutral-100 transition-colors text-sm md:text-base"
        >
          Get Started
        </Link>
      </div>
      
      <button 
        className="flex md:hidden z-20 text-neutral-700 hover:text-neutral-900"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
      
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="fixed inset-0 bg-white z-10 flex flex-col p-6 pt-20"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => scrollToSection('marketplace')}
                className="py-2 text-neutral-700 hover:text-neutral-900 border-b border-neutral-100 text-left"
              >
                Marketplace
              </button>
              
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="py-2 text-neutral-700 hover:text-neutral-900 border-b border-neutral-100 text-left"
              >
                How it Works
              </button>
              
              <button
                onClick={() => scrollToSection('faq')}
                className="py-2 text-neutral-700 hover:text-neutral-900 border-b border-neutral-100 text-left"
              >
                FAQ
              </button>
              
              <a
                href="https://github.com/platypus-trading/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 text-neutral-700 hover:text-neutral-900 border-b border-neutral-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Docs
              </a>
              
              <Link
                to="/auth"
                className="py-2 text-neutral-700 hover:text-neutral-900 border-b border-neutral-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}