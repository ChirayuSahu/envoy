"use client"
import React from 'react'
import Button from './button'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

const Navbar = () => {

    const router = useRouter();
    const { data: session } = useSession();
    const isAuthenticated = session?.user?.email;

    return (
        <>
            <div className='font-inter bg-[#00916C] dark:bg-[#121212] flex items-center justify-between p-4 dark:p-8 px-6'>
                {/* Logo */}
                <div className='text-white text-md lg:text-xl font-bold font-inter'>.envShare</div>

                {/* Navigation Links */}
                <div className='flex items-center justify-between gap-2'>
                    <Button variant="outline" className='text-white dark:text-white border-none'>Home</Button>
                    <Button variant="outline" className='text-white dark:text-white border-none'>Features</Button>
                    <Button variant="outline" className='text-white dark:text-white border-none'>FAQs</Button>
                </div>

                {/* Auth Buttons */}
                <div className='flex items-center justify-center gap-4'>
                    <Button
                        onClick={() => router.push("/login")}
                        variant="secondary"
                    >
                        {isAuthenticated ? "Dashboard" : "Login"}
                    </Button>
                    <Button
                        onClick={() => router.push("/signup")}
                        variant="primary"
                    >
                        SignUp
                    </Button>
                </div>
            </div>

        </>
    )
}

export default Navbar