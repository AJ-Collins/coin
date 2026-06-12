import Header from "../components/home/Header";
import TickerRibbon from "../components/home/TickerRibbon";
import Hero from "../components/home/Hero";
import Features from "../components/home/Features";
import Charts from "../components/home/Charts";
import MobileApp from "../components/home/MobileApp";
import HowItWorks from "../components/home/HowItWorks";
import MarketData from "../components/home/MarketData";
import Stats from "../components/home/Stats";
import Testimonials from "../components/home/Testimonials";
import FAQ from "../components/home/FAQ";
import CTABanner from "../components/home/CTABanner";
import Footer from "../components/home/Footer";

export default function Home() {
  return (
    <div className="bg-[#070712] text-white overflow-x-hidden">
      <Header />
      <TickerRibbon />
      <Hero />
      <Features />
      <Charts />
      <MobileApp />
      <HowItWorks />
      <MarketData />
      <Stats />
      <Testimonials />
      <FAQ />
      <CTABanner />
      <Footer />
    </div>
  );
}