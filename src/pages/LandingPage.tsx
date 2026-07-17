import Footer from "@/components/globals/Footer";
import Hero from "@/components/landingPage/Hero";
import InvitationSection from "@/components/landingPage/InvitationSection";
import MemoryLane from "@/components/landingPage/MemoryLane";
import Navbar from "@/components/globals/Navbar";
import ProductSection from "@/components/landingPage/ProductSection";
import ScrollRevealText from "@/components/landingPage/ScrollRevealText";


export default function LandingPage() {
  return (
    <div className="bg-slate-950 min-h-screen text-slate-200 font-sans selection:bg-amber-700/50">
      <Navbar />
      <Hero />
      <ScrollRevealText />
      <MemoryLane />
      <InvitationSection />
      <ProductSection />
      <Footer />
    </div>
  );
}