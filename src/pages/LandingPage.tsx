import { Helmet } from 'react-helmet-async';
import Footer from "@/components/globals/Footer";
import Hero from "@/components/landingPage/Hero";
import InvitationSection from "@/components/landingPage/InvitationSection";
import MemoryLane from "@/components/landingPage/MemoryLane";
import Navbar from "@/components/globals/Navbar";
import ProductSection from "@/components/landingPage/ProductSection";
import ScrollRevealText from "@/components/landingPage/ScrollRevealText";

const SITE_URL = 'https://www.ogbonnasmemorial.com';
const OG_IMAGE = `${SITE_URL}/og-image.jpeg`;
const TITLE    = 'Celebrating the Lives of Wilfred & Justina Ogbonna';
const DESC     = 'Join us as we gather to honor the enduring legacy of Wilfred & Justina Ogbonna, share cherished memories, and celebrate the beautiful journey of our dear parents.';

export default function LandingPage() {
  return (
    <div className="bg-slate-950 min-h-screen text-slate-200 font-sans selection:bg-amber-700/50">
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESC} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={SITE_URL} />

        {/* Open Graph */}
        <meta property="og:type"        content="website" />
        <meta property="og:url"         content={SITE_URL} />
        <meta property="og:title"       content={TITLE} />
        <meta property="og:description" content={DESC} />
        <meta property="og:image"       content={OG_IMAGE} />
        <meta property="og:image:width"  content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt"   content="Wilfred & Justina Ogbonna - A celebration of life" />
        <meta property="og:site_name"   content="Ogbonnas Memorial" />
        <meta property="og:locale"      content="en_GB" />

        {/* Twitter / X Card */}
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:url"         content={SITE_URL} />
        <meta name="twitter:title"       content={TITLE} />
        <meta name="twitter:description" content={DESC} />
        <meta name="twitter:image"       content={OG_IMAGE} />
        <meta name="twitter:image:alt"   content="Wilfred & Justina Ogbonna - A celebration of life" />
      </Helmet>

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