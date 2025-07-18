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
            <div className='font-inter bg-[#00916C] flex items-center justify-between p-4 px-6 m-4 rounded-xl'>
                <div className='text-white text-md lg:text-xl font-bold font-inter'>.envShare</div>
                <div className='flex items-center justify-between gap-2'>
                    <Button variant="outline" className='text-white'>Home</Button>
                    <Button variant="outline" className='text-white'>Features</Button>
                    <Button variant="outline" className='text-white'>FAQs</Button>
                </div>
                <div className='flex items-center justify-center gap-4'>
                    <Button onClick={()=>router.push("/login")} variant="secondary" className=''>{isAuthenticated ? "Dashboard" : "Login"}</Button>
                    <Button onClick={()=>router.push("/signup")} variant="primary" className=''>SignUp</Button>
                </div>
            </div>
        </>
    )
}

export default Navbar