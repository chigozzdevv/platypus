import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  to?: string;
  onClick?: () => void;
  className?: string;
  showArrow?: boolean;
  disabled?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  to,
  onClick,
  className = '',
  showArrow = false,
  disabled = false,
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-500 overflow-hidden relative disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-neutral-900 text-white hover:bg-neutral-800 disabled:hover:bg-neutral-900',
    secondary: 'bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50 disabled:hover:bg-white',
  };
  
  const sizeStyles = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-6 text-base',
    lg: 'h-12 px-8 text-lg',
  };
  
  const styles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
  
  const textVariants = {
    initial: { opacity: 1, x: 0 },
    hover: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };
  
  const arrowVariants = {
    initial: { opacity: 0, x: 20 },
    hover: { opacity: 1, x: 0, transition: { duration: 0.2 } }
  };
  
  const buttonContent = (
    <motion.div
      className="relative w-full h-full flex items-center justify-center"
      initial="initial"
      whileHover={disabled ? "initial" : "hover"}
    >
      <motion.div variants={textVariants} className="flex items-center">
        {children}
        {showArrow && (
          <ChevronRight className="ml-2 h-5 w-5" />
        )}
      </motion.div>
      
      <motion.div 
        variants={arrowVariants} 
        className="absolute inset-0 flex items-center justify-center"
      >
        <ChevronRight className="h-6 w-6" />
      </motion.div>
    </motion.div>
  );
  
  if (to) {
    return (
      <Link to={to} className={styles}>
        {buttonContent}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={styles}>
        {buttonContent}
      </a>
    );
  }
  
  return (
    <button onClick={onClick} className={styles} disabled={disabled}>
      {buttonContent}
    </button>
  );
}