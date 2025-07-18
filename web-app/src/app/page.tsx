"use client"
import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero";
import CommunitySection from "@/components/communitySection";
import FeatureSection from "@/components/featureSection";

export default function Home() {

  return (
    <>
    <div className="">
    <Navbar />
    <HeroSection />
    <CommunitySection />
    <FeatureSection />
    </div>
    </>
  );
}
