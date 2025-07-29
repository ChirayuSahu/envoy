"use client"
import React, { useState } from 'react'
import Button from './button'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Menu, X } from 'lucide-react'

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();
    const { data: session } = useSession();
    const isAuthenticated = !!session?.user;

    const handleLinkClick = (path: any) => {
        router.push(path);
        setIsMenuOpen(false); 
    };

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/features', label: 'Features' },
        { href: '/faq', label: 'FAQs' },
    ];

    return (
        <nav className='relative font-inter bg-[#00916C] dark:bg-[#121212]'>
            <div className='flex items-center justify-between p-4 px-6'>
                <div
                    className='text-white text-md lg:text-xl font-bold font-inter cursor-pointer'
                    onClick={() => router.push('/')}
                >
                    .envShare
                </div>

                <div className='hidden md:flex items-center justify-between gap-2'>
                    {navLinks.map((link) => (
                        <Button
                            key={link.href}
                            variant="outline"
                            className='text-white dark:text-white border-none'
                            onClick={() => router.push(link.href)}
                        >
                            {link.label}
                        </Button>
                    ))}
                </div>

                <div className='hidden md:flex items-center justify-center gap-4'>
                    <Button
                        onClick={() => router.push(isAuthenticated ? "/dashboard" : "/login")}
                        variant="secondary"
                    >
                        {isAuthenticated ? "Dashboard" : "Login"}
                    </Button>
                    {!isAuthenticated && (
                        <Button
                            onClick={() => router.push("/signup")}
                            variant="primary"
                        >
                            Sign Up
                        </Button>
                    )}
                </div>

                <div className='md:hidden'>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className='text-white focus:outline-none'
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className='md:hidden absolute top-full left-0 w-full bg-[#00916C] dark:bg-[#121212] z-20'>
                    <div className='flex flex-col items-center gap-4 p-6'>
                        {navLinks.map((link) => (
                            <Button
                                key={link.href}
                                variant="outline"
                                className='text-white dark:text-white border-none w-full'
                                onClick={() => handleLinkClick(link.href)}
                            >
                                {link.label}
                            </Button>
                        ))}

                        <hr className='w-full border-gray-500 my-2' />

                        <Button
                            onClick={() => handleLinkClick(isAuthenticated ? "/dashboard" : "/login")}
                            variant="secondary"
                            className="w-full"
                        >
                            {isAuthenticated ? "Dashboard" : "Login"}
                        </Button>
                        {!isAuthenticated && (
                            <Button
                                onClick={() => handleLinkClick("/signup")}
                                variant="primary"
                                className="w-full"
                            >
                                Sign Up
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Navbar;