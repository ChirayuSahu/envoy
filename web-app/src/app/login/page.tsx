"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const LoginPage = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  useEffect(() => {
    if (errorParam === "CredentialsSignin") {
      setErrorMsg("Invalid username or password.");
    } else if (errorParam === "Callback") {
      setErrorMsg("Google sign-in failed. Try again.");
    } else if (errorParam) {
      setErrorMsg(errorParam);
    }
  }, [errorParam]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { username, password } = form;

    const result = await signIn("credentials", {
      username,
      password,
      redirect: true,
      callbackUrl: "/dashboard",
    });

    if (result?.error) {
      setErrorMsg("Invalid credentials");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn("google", {
      redirect: true,
      callbackUrl: "/dashboard",
    });
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-[#00916C]">
      <div className="flex flex-col gap-5 items-center justify-between bg-[#FAFAFA] p-10 m-8 shadow-2xl rounded-2xl w-md max-w-md w-full">
        <h1 className="text-2xl md:text-4xl font-black">Login</h1>

        {errorMsg && (
          <p className="text-red-500 text-sm text-center w-full">{errorMsg}</p>
        )}

        <form className="flex flex-col gap-5 w-full" onSubmit={handleSignIn}>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="p-3 border-2 border-[#00916C] rounded-xl focus:outline-none"
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
              className="p-3 border-2 border-[#00916C] rounded-xl focus:outline-none"
              required
            />
            <label className="text-right text-sm mt-2 text-gray-500">
              Forgot Password?{" "}
              <Link href="/" className="text-[#00916C] underline">
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
        </form>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="bg-[#1A1B22] text-white font-black p-3 rounded-xl hover:bg-[#040405] transition-colors cursor-pointer w-full flex items-center justify-center gap-4"
        >
          <Image
            src="/assets/google.svg"
            alt="Google logo"
            width={20}
            height={20}
          />
          {loading ? "Please wait..." : "Sign in with Google"}
        </button>

        <label className="text-sm mt-2 text-black">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#00916C] underline">
            Sign up
          </Link>
        </label>
      </div>
    </div>
  );
};

export default LoginPage;
