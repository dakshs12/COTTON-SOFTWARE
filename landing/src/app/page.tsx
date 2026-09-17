import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BeforeAfter from "@/components/BeforeAfter";
import FeatureTabs from "@/components/FeatureTabs";
import HowItWorks from "@/components/HowItWorks";
import SecurityShield from "@/components/SecurityShield";
import FaqSection from "@/components/FaqSection";
import FinalCtaBanner from "@/components/FinalCtaBanner";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF7]">
      {/* Sticky Glassmorphic Navbar */}
      <Navbar />

      {/* Main Conversion Flow */}
      <main className="flex-1">
        {/* A. Hero Section with Live Mockup & CTAs */}
        <HeroSection />

        {/* B. Before vs. After (Pain Point Agitation) */}
        <BeforeAfter />

        {/* C. 5 Core Workflow Feature Deep-Dives */}
        <FeatureTabs />

        {/* D. Fast Onboarding Timeline (How It Works) */}
        <HowItWorks />

        {/* E. Broker Data Ownership & Trade Secret Shield */}
        <SecurityShield />

        {/* F. Frequently Asked Questions Accordion */}
        <FaqSection />

        {/* H. High-Impact Conversion Banner */}
        <FinalCtaBanner />
      </main>

      {/* J. Global Footer */}
      <Footer />
    </div>
  );
}
