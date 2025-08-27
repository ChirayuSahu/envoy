// app/login/page.tsx
"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import LoginError from "@/components/loginError";
import Button from "@/components/button";
import Navbar from "@/components/navbar";

const LoginPage = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn("credentials", {
      ...form,
      redirect: true,
      callbackUrl: "/dashboard",
    });
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn("google", {
      redirect: true,
      callbackUrl: "/dashboard",
    });
  };

  return (
    <>
      <div className="min-h-screen bg-[#00916C] dark:bg-[#121212]">
        <Navbar />
        <div className="flex items-center justify-center w-full h-[80vh]">
          <div className="flex flex-col gap-5 items-center justify-between bg-[#FAFAFA] dark:bg-[#1a1a1a] text-black dark:text-white p-10 m-8 shadow-2xl rounded-2xl w-full max-w-md">
            <h1 className="flex items-center mb-4 text-2xl md:text-4xl font-black">
              <Image
                src="/assets/envoy-logo.svg"
                alt="Envoy Logo"
                width={100}
                height={100}
                className='w-10 h-10 mr-4'
                draggable={false}
              />
              Login
            </h1>
            <Suspense fallback={null}>
              <LoginError />
            </Suspense>
            {/* <form className="flex flex-col gap-5 w-full" onSubmit={handleSignIn}>
          <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Username</label>
          <input
          type="text"
          name="username"
          value={form.username}
          onChange={handleChange}
          className="p-3 border-2 border-[#00916C] rounded-xl focus:outline-none bg-white dark:bg-[#121212] text-black dark:text-white"
          required
          />
          </div>
          
          <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Password</label>
          <input
          type="password"
          name="password"
              value={form.password}
              onChange={handleChange}
              className="p-3 border-2 border-[#00916C] rounded-xl focus:outline-none bg-white dark:bg-[#121212] text-black dark:text-white"
              required
            />
            <label className="text-right text-sm mt-2 text-gray-500 dark:text-gray-400">
              Forgot Password?{" "}
              <Link href="/" className="text-[#00916C] underline dark:text-[#00b388]">
                Click Here
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#00916C] text-white font-black p-3 rounded-xl hover:bg-[#007a5a] transition-colors cursor-pointer"
          >
            {loading ? "Logging in..." : "Submit"}
          </button>
        </form> */}

            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="bg-[#1A1B22] dark:bg-[#373737] dark:hover:bg-[#232323] text-white font-black py-4 rounded-xl hover:bg-[#040405] transition-colors cursor-pointer w-full flex items-center justify-center gap-4"
            >
              <Image
                src="/assets/google.svg"
                alt="Google logo"
                width={20}
                height={20}
              />
              {loading ? "Please wait..." : "Sign in with Google"}
            </Button>

            {/* <label className="text-sm mt-2 text-black dark:text-white">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#00916C] underline dark:text-[#00b388]">
            Sign up
          </Link>
        </label> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
