"use client"
import React, { useState } from 'react'
import Link from 'next/link';

const SignUpPage = () => {

    const [form, setForm] = useState({
        name: "",
        email: "",
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(form),
        });

        if (res.ok) {
            // Handle successful registration
        } else {
            // Handle registration error
        }
    };

    return (
        <>
            <div className="flex items-center justify-center w-full min-h-screen bg-[#00916C] dark:bg-[#121212]">
                <div className="flex flex-col gap-5 items-center justify-between bg-[#FAFAFA] dark:bg-[#1a1a1a] text-black dark:text-white p-10 m-8 shadow-2xl rounded-2xl w-md">
                    <h1 className="text-2xl md:text-4xl font-black">Sign Up</h1>

                    <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit}>
                        {/* Name */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm md:text-base lg:text-md font-semibold">
                                Name
                            </label>
                            <input
                                type="text"
                                className="p-3 border-2 border-[#00916C] rounded-xl focus:outline-none bg-white dark:bg-[#121212] text-black dark:text-white"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Username */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm md:text-base lg:text-md font-semibold">
                                Username
                            </label>
                            <input
                                type="text"
                                className="p-3 border-2 border-[#00916C] rounded-xl focus:outline-none bg-white dark:bg-[#121212] text-black dark:text-white"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm md:text-base lg:text-md font-semibold">
                                Email
                            </label>
                            <input
                                type="email"
                                className="p-3 border-2 border-[#00916C] rounded-xl focus:outline-none bg-white dark:bg-[#121212] text-black dark:text-white"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm md:text-base lg:text-md font-semibold">
                                Password
                            </label>
                            <input
                                type="password"
                                className="p-3 border-2 border-[#00916C] rounded-xl focus:outline-none bg-white dark:bg-[#121212] text-black dark:text-white"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="bg-[#00916C] text-sm md:text-base lg:text-md text-white font-black p-3 rounded-xl hover:bg-[#007a5a] transition-colors cursor-pointer"
                        >
                            Submit
                        </button>
                    </form>

                    {/* Login Redirect */}
                    <label className="text-left text-sm md:text-base lg:text-md mt-2 text-black dark:text-white">
                        Already have an account?{" "}
                        <Link href={"/login"} className="text-[#00916C] underline dark:text-[#00b388]">
                            Login
                        </Link>
                    </label>
                </div>
            </div>

        </>
    )
}

export default SignUpPage