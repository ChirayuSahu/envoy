"use client"
import { useSession } from "next-auth/react";
import Navbar from "@/components/navbar";

export default function Home() {

  const { data: session, status } = useSession();

  const user = session?.user;

  return (
    <>
    <Navbar />
    </>
  );
}
