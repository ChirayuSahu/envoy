"use client"
import React from 'react'
import Image from 'next/image'
import Button from './button'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

const HeroSection = () => {
    const { data: session } = useSession()
    const isAuthenticated = session?.user?.email;
    return (
        <>
            <div className='font-inter flex justify-center items-center gap-30 m-20'>
                <div className='flex items-center justify-start max-w-[40vw]'>
                    <div className='flex flex-col'>
                        <h1 className='text-2xl lg:text-4xl xl:text-5xl font-bold text-wrap '>A Platform for Managing and Sharing Environment Variables Securely.</h1>
                        <p className='text-sm xl:text-lg text-gray-500 mt-4'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam, atque omnis. Ducimus dolorum ipsa molestiae rerum eum expedita fug</p>
                        <div className='flex gap-2 mt-6'>
                            <Link href={"/login"}>
                                <Button className='rounded-3xl' variant='outline' >{isAuthenticated ? "Dashboard" : "Get Started"}</Button>
                            </Link>
                            <Link href={"/signup"}>
                                <Button className='rounded-3xl' variant='primary' >Sign Up</Button>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className='flex items-center justify-center min-w-[30vw]'>
                    <Image
                        src="/assets/hero-img.svg"
                        alt="Hero Image"
                        width={400}
                        height={400}
                        className='lg:w-75 xl:w-100'
                        draggable={false}
                    />
                </div>
            </div>
        </>
    )
}

export default HeroSection