"use client";

import Link from "next/link";
import React, { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";

const LoginPage = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    const { username, password } = form;

    const result = await signIn("credentials", {
      username,
      password,
      redirect: true,
      callbackUrl: "/dash"
    });

    if (result?.error) {
      console.error("Login failed:", result.error);
      // TODO: show toast notification here
    } else {
      console.log("Login successful");
      // TODO: redirect or show success toast
    }
  };

  const handleGoogleSignIn = async () => {
    await signIn("google");
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-[#00916C]">
      <div className="flex flex-col gap-5 items-center justify-between bg-[#FAFAFA] p-10 m-8 shadow-2xl rounded-2xl w-md">
        <h1 className="text-2xl md:text-4xl font-black">Login</h1>
        <form className="flex flex-col gap-5 w-full" onSubmit={handleSignIn}>
          <div className="flex flex-col gap-1">
            <label className="text-sm md:text-base lg:text-md font-semibold">
              Username
            </label>
            <input
              type="text"
              className="p-3 border-2 border-[#00916C] rounded-xl focus:outline-none"
              name="username"
              value={form.username}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm md:text-base lg:text-md font-semibold">
              Password
            </label>
            <input
              type="password"
              className="p-3 border-2 border-[#00916C] rounded-xl focus:outline-none"
              name="password"
              value={form.password}
              onChange={handleChange}
            />
            <label className="text-right text-sm md:text-base lg:text-md mt-2 text-gray-500">
              Forgot Password?{" "}
              <Link href={"/"} className="text-[#00916C] underline">
                Click Here
              </Link>
            </label>
          </div>
          <button
            type="submit"
            className="bg-[#00916C] text-sm md:text-base lg:text-md text-white font-black p-3 rounded-xl hover:bg-[#007a5a] transition-colors cursor-pointer"
          >
            Submit
          </button>
        </form>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="bg-[#1A1B22] text-sm md:text-base lg:text-md text-white font-black p-3 rounded-xl hover:bg-[#040405] transition-colors cursor-pointer w-full flex items-center justify-center gap-4"
        >
          <Image
            src="/assets/google.svg"
            alt="Google Logo"
            width={20}
            height={20}
          />
          Sign-in with Google
        </button>

        <label className="text-left text-sm md:text-base lg:text-md mt-2 text-black">
          Already have an account?{" "}
          <Link href={"/signup"} className="text-[#00916C] underline">
            Sign up
          </Link>
        </label>
      </div>
    </div>
  );
};

export default LoginPage;
