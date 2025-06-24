"use client"

import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { signIn } from 'next-auth/react'
import { useRef } from 'react'

const LoginPage = () => {

    const form = useRef({
        username: "",
        password: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        form.current = {
            ...form.current,
            [name]: value
        };
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();

        const username = form.current.username;
        const password = form.current.password;

        const result = await signIn("credentials", {
            username,
            password,
            redirect: false,
        });

        if (result?.error) {
            console.error("Login failed:", result.error);
            
            // will add toast notificaiton later for all errors

        } else {

            console.log("Login successful");
        }
    };


    return (
        <>
            <div className="flex items-center justify-center w-full min-h-screen bg-[#00916C]">
                <div className='flex flex-col gap-5 items-center justify-between bg-[#FAFAFA] p-10 m-8 shadow-2xl rounded-2xl w-md'>
                    <h1 className='text-2xl md:text-4xl font-black'>Login</h1>
                    <form className='flex flex-col gap-5 w-full' onSubmit={handleSignIn}>
                        <div className='flex flex-col gap-1'>
                            <label className='text-sm md:text-base lg:text-md font-semibold'>Username</label>
                            <input
                                type="username"
                                className='p-3 border-2 border-[#00916C] rounded-xl focus:outline-none'
                                name="username"
                                onChange={handleChange}
                            />
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label className='text-sm md:text-base lg:text-md font-semibold'>Password</label>
                            <input
                                type="password"
                                className='p-3 border-2 border-[#00916C] rounded-xl focus:outline-none'
                                name="password"
                                onChange={handleChange}
                            />
                            <label className='text-right text-sm md:text-base lg:text-md mt-2 text-gray-500'>Forgot Password? <Link href={'/'} className='text-[#00916C] underline'>Click Here</Link></label>
                        </div>
                        <button
                            type="submit"
                            className='bg-[#00916C] text-sm md:text-base lg:text-md text-white font-black p-3 rounded-xl hover:bg-[#007a5a] transition-colors cursor-pointer'
                        >
                            Submit
                        </button>
                        <button
                            type="submit"
                            className='bg-[#1A1B22] text-sm md:text-base lg:text-md text-white font-black p-3 rounded-xl hover:bg-[#040405] transition-colors cursor-pointer'
                        >
                            <Image
                                src="/assets/google.svg"
                                alt="Google Logo"
                                width={20}
                                height={20}
                                className='inline mr-4'
                            />
                            Sign-in with Google
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default LoginPage