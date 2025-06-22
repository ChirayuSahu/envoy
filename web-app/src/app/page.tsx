"use client"
import { useSession } from "next-auth/react";
import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero";

export default function Home() {

  const { data: session, status } = useSession();

  const user = session?.user;

  return (
    <>
    <Navbar />
    <HeroSection />
    </>
  );
}
