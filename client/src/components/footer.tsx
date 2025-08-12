import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 py-8 px-4 md:px-8">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-neutral-900 h-8 w-8 rounded flex items-center justify-center text-white font-bold mr-2">
              P
            </div>
            <span className="text-xl font-semibold">Platypus</span>
          </div>
          
          <div className="flex space-x-6 text-sm text-neutral-600">
            <Link to="/terms" className="hover:text-neutral-900 transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-neutral-900 transition-colors">
              Privacy
            </Link>
            <a 
              href="mailto:contact@platypus.trading"
              className="hover:text-neutral-900 transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-neutral-200 text-center text-sm text-neutral-500">
          <p>&copy; 2024 Platypus Trading Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}