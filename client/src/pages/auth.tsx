import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AuthModal from '@/components/auth-modal';

export default function Auth() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="w-full h-16 py-3 px-4 md:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <div className="bg-neutral-900 h-8 w-8 rounded flex items-center justify-center text-white font-bold mr-2">
            P
          </div>
          <span className="text-xl font-semibold">Platypus</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          <h1 className="text-3xl font-bold mb-4">Welcome to Platypus</h1>
          <p className="text-neutral-600 mb-8">
            Connect your wallet to access the platform and start trading.
          </p>
          <AuthModal />
        </motion.div>
      </div>
    </div>
  );
}
