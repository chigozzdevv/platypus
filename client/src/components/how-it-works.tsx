import { motion } from 'framer-motion';
import { Bot, Users, DollarSign, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: Bot,
      number: '01',
      title: 'AI Generates',
      subtitle: 'Parent IPs',
      description: 'Smart trading signals created as IP assets using advanced market analysis and machine learning models.',
      color: 'bg-neutral-900'
    },
    {
      icon: Users,
      number: '02',
      title: 'Humans Improve',
      subtitle: 'Derivative IPs',
      description: 'Expert traders enhance signals with market insights, timing adjustments, and risk optimization strategies.',
      color: 'bg-neutral-700'
    },
    {
      icon: DollarSign,
      number: '03',
      title: 'Trade & Earn',
      subtitle: 'Profit & Royalties',
      description: 'Execute proven strategies instantly or collect royalties from improvements when other traders use them.',
      color: 'bg-neutral-600'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 md:px-8 bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="max-w-screen-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-neutral-900">How It Works</h2>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Three simple steps to revolutionize your trading with AI-enhanced intellectual property
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection lines - hidden on mobile */}
          <div className="hidden md:block absolute top-20 left-1/2 transform -translate-x-1/2 w-full max-w-4xl">
            <div className="flex justify-between items-center px-8">
              <div className="w-32 h-0.5 bg-gradient-to-r from-blue-500 to-green-500"></div>
              <div className="w-32 h-0.5 bg-gradient-to-r from-green-500 to-purple-500"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Mobile arrow */}
                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center mt-8 mb-8">
                    <ArrowRight className="w-6 h-6 text-neutral-400" />
                  </div>
                )}
                
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-neutral-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  {/* Step number */}
                  <div className="absolute -top-4 left-8">
                    <div className={`${step.color} text-white text-sm font-bold px-3 py-1 rounded-full`}>
                      {step.number}
                    </div>
                  </div>
                  
                  {/* Icon */}
                  <div className={`${step.color} rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg`}>
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2 text-neutral-900">{step.title}</h3>
                    <p className={`text-sm font-medium mb-4 ${
                      index === 0 ? 'text-blue-600' : 
                      index === 1 ? 'text-green-600' : 
                      'text-purple-600'
                    }`}>{step.subtitle}</p>
                    <p className="text-neutral-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}