"use client"
import { useSession } from "next-auth/react";
import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero";
import CommunitySection from "@/components/communitySection";
import FeatureSection from "@/components/featureSection";

export default function Home() {

  const { data: session, status } = useSession();

  const user = session?.user;

  return (
    <>
    <Navbar />
    <HeroSection />
    <CommunitySection />
    <FeatureSection />
    </>
  );
}
