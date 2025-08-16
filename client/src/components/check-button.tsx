import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

type Props = {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  label?: string;
  title?: string;
};

export default function CheckButton({
  onClick,
  disabled = false,
  loading = false,
  className = '',
  label = 'Ask AI to Check',
  title,
}: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      title={title || label}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={[
        'inline-flex items-center justify-center rounded-lg px-5 py-2.5 font-medium',
        'text-white bg-gradient-to-r from-blue-600 to-indigo-600',
        'hover:from-blue-700 hover:to-indigo-700',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        className,
      ].join(' ')}
    >
      {loading ? (
        <span className="inline-flex items-center">
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-b-transparent" />
          Checking…
        </span>
      ) : (
        <span className="inline-flex items-center">
          <Bot className="w-4 h-4 mr-2" />
          {label}
        </span>
      )}
    </motion.button>
  );
}
