"use client"
import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero";
import CommunitySection from "@/components/communitySection";
import FeatureSection from "@/components/featureSection";
import FAQDropdown from "@/components/faqSection";
import Footer from "@/components/footer";

export default function Home() {

  return (
    <>
    <div className="">
    <Navbar />
    <HeroSection />
    <CommunitySection />
    <FeatureSection />
    <FAQDropdown />
    <Footer />
    </div>
    </>
  );
}
