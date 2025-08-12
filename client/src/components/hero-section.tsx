import { motion, type Variants } from 'framer-motion';
import Button from './button';

export default function HeroSection() {
  const staggerChildren: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <section className="py-8 md:py-16 px-4 md:px-8 max-w-screen-xl mx-auto text-center h-[calc(100vh-64px)] flex flex-col justify-center pt-36 md:pt-40">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerChildren}
        className="flex flex-col items-center"
      >
        <motion.h2 
          variants={fadeInUp}
          className="text-neutral-400 text-xl md:text-2xl mb-4 md:mb-6"
        >
          Meet Platypus
        </motion.h2>
        
        <motion.div
          variants={fadeInUp}
          className="mb-4 md:mb-8"
        >
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900">
            <div className="mb-1">The best way to</div>
            <div className="mb-1">buy and sell</div>
            <div>human-enhanced trading IPs</div>
          </h1>
        </motion.div>
        
        <motion.div 
          variants={fadeInUp}
          className="max-w-2xl mx-auto mb-8 md:mb-10"
        >
          <p className="text-base md:text-lg text-neutral-600">
            With Platypus, AI generates base signals as <em>parent IPs</em> using advanced market models, 
            and expert traders improve them to own a <em>derivative IP</em>, powered by <span className="font-semibold text-neutral-900">Camp Network</span>. 
            Buy proven strategies to execute instantly, or improve AI outputs and earn royalties when traders use them.
          </p>
        </motion.div>
        
        <motion.div variants={fadeInUp} className="flex justify-center">
          <Button 
            variant="primary"
            size="lg"
            to="/auth"
            showArrow={true}
          >
            Try Platypus Now
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}