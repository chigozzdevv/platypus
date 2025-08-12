import Header from '@/components/header';
import HeroSection from '@/components/hero-section';
import SignalPreviews from '@/components/signal-previews';
import HowItWorks from '@/components/how-it-works';
import FAQ from '@/components/faq';
import CTASection from '@/components/cta-section';
import Footer from '@/components/footer';

export default function Landing() {
  return (
    <main className="min-h-screen flex flex-col relative bg-white">
      <Header />
      <HeroSection />
      <SignalPreviews />
      <HowItWorks />
      <FAQ />
      <CTASection />
      <Footer />
    </main>
  );
}