"use client"
import React from 'react'
import Image from 'next/image'
import Button from './button'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

const HeroSection = () => {
    const { data: session } = useSession();
    const isAuthenticated = !!session?.user;

    return (
        <>
            <div className="font-inter flex flex-col-reverse lg:flex-row items-center justify-between bg-white dark:bg-[#121212] gap-8 p-8 md:p-12 lg:p-20">
                <div className="flex flex-col w-full lg:w-1/2 text-center lg:text-left">
                    <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-black dark:text-white">
                        A Platform for Managing and Sharing Environment Variables Securely.
                    </h1>

                    <p className="text-base xl:text-lg text-gray-600 dark:text-gray-400 mt-6">
                        Simplify your development workflow by securely managing and sharing your .env files with your team, ensuring consistency and preventing leaks.
                    </p>

                    <div className="flex gap-4 mt-8 justify-center lg:justify-start">
                        <Link href={isAuthenticated ? "/dashboard" : "/login"}>
                            <Button className="rounded-full px-6 py-3" variant="outline">
                                {isAuthenticated ? "Dashboard" : "Get Started"}
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="flex items-center justify-center w-full lg:w-1/2 mt-8 lg:mt-0">
                    <Image
                        src="/assets/hero-img.svg"
                        alt="Securely sharing environment variables illustration"
                        width={500}
                        height={500}
                        className="max-w-[80%] sm:max-w-sm lg:max-w-full"
                        draggable={false}
                        priority
                    />
                </div>
            </div>

        </>
    )
}

export default HeroSection;