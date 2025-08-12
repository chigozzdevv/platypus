import { motion } from 'framer-motion';
import Button from './button';

export default function CTASection() {
  return (
    <section className="py-16 px-4 md:px-8 bg-neutral-900 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Transform Your Trading?
        </h2>
        <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
          Join the future of trading where AI meets human expertise. 
          Start earning from your trading knowledge or access proven strategies today.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            variant="secondary"
            size="lg"
            to="/auth"
            showArrow={true}
            className="bg-white text-neutral-900 hover:bg-neutral-100"
          >
            Get Started Now
          </Button>
          <button
            onClick={() => {
              const element = document.getElementById('marketplace');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="text-neutral-300 hover:text-white underline underline-offset-4 text-lg"
          >
            View Live Signals
          </button>
        </div>
      </motion.div>
    </section>
  );
}