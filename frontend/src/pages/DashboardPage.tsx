import WelcomeStats from "../components/dashboard/WelcomeStats";
import TickerRibbon from "../components/home/TickerRibbon";
import TrendingAssets from "../components/dashboard/TrendingAssets";
import GainersLosers from "../components/dashboard/GainersLosers";
import Footer from "../components/home/Footer";

export default function DashboardPage() {
  return (
    <div className="bg-[#090f1a]">
      <WelcomeStats />
      <TickerRibbon />
      <TrendingAssets />
      <GainersLosers />
      <Footer />
    </div>
  );
}