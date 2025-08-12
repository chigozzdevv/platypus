import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How does the AI signal generation work?',
      answer: 'Our AI analyzes 30+ trading pairs using advanced market models, technical indicators, and sentiment analysis to identify high-probability trading opportunities. Each signal is automatically registered as an IP asset on Camp Network, creating ownership and revenue potential.'
    },
    {
      question: 'What happens when I improve a signal?',
      answer: 'When you improve a signal, you create a derivative IP that becomes your intellectual property. Improvements must score 50+ to be accepted, and you earn a fixed 60% royalty while the original creator earns 40% every time someone purchases your enhanced signal.'
    },
    {
      question: 'How are royalties distributed?',
      answer: 'Revenue is automatically split via Camp Network\'s blockchain infrastructure. Original signal creators receive 40%, improvers get 60%, and the platform takes 2%. All payments are distributed instantly to creators\' wallets upon each purchase.'
    },
    {
      question: 'Can I improve any signal?',
      answer: 'You can improve signals that are less than 24 hours old and haven\'t been improved yet. Each signal can only have one improvement to maintain quality. Improvements are processed first-come, first-served.'
    },
    {
      question: 'What trading exchanges are supported?',
      answer: 'Currently we support Hyperliquid as our primary exchange integration. Users can connect their exchange accounts to execute signals directly or use the signals with their preferred trading platform.'
    },
    {
      question: 'How do I start earning from my trading expertise?',
      answer: 'Connect your wallet, find improvable signals on the Signals page, submit your enhancement with detailed reasoning, and once approved (50+ quality score), your improvement becomes a sellable IP asset earning you 60% royalties.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 px-4 md:px-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
        <p className="text-lg text-neutral-600">
          Everything you need to know about trading IP on Platypus
        </p>
      </motion.div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="bg-white border border-neutral-200 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-neutral-50 transition-colors"
            >
              <span className="font-medium text-neutral-900">{faq.question}</span>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ 
                  duration: 0.3, 
                  ease: [0.04, 0.62, 0.23, 0.98],
                  type: "tween"
                }}
              >
                <ChevronDown className="w-5 h-5 text-neutral-500" />
              </motion.div>
            </button>
            
            <AnimatePresence initial={false}>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{ 
                    duration: 0.4, 
                    ease: [0.04, 0.62, 0.23, 0.98],
                    type: "tween"
                  }}
                  className="overflow-hidden"
                >
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ 
                      duration: 0.3,
                      delay: 0.1,
                      ease: "easeOut"
                    }}
                    className="px-6 pb-4 text-neutral-600 leading-relaxed"
                  >
                    {faq.answer}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}