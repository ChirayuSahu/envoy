"use client"

import React from 'react'
import Button from '../button'
import { SquareUser } from 'lucide-react'
import { Settings } from 'lucide-react'
import { useSession } from 'next-auth/react'

const SidebarComp = () => {
    const { data: session } = useSession()
    const user = session?.user;
    return (
        <>
            <div className="hidden sm:block font-inter sm:col-span-1 xl:col-span-2 bg-[#00916C] p-4 md:p-6 xl:p-8 h-full w-full rounded-2xl flex flex-col justify-between shadow-[0_8px_24px_0_rgba(0,0,0,0.1)] hover:shadow-[0_12px_32px_0_rgba(0,0,0,0.15)] hover:-translate-y-1 transition duration-300 ease-in-out cursor-pointer">
                <div className="flex flex-col items-center gap-6 md:gap-8 xl:gap-12 flex-grow">
                    <h1 className="text-white sm:text-sm md:text-md xl:text-2xl font-bold mb-2">.envShare</h1>
                    <div className="flex flex-col gap-2 w-full">
                        <div className="text-white w-full text-left sm:text-xs xl:text-base hover:underline transition-all cursor-pointer">Create Workspace</div>
                        <div className="text-white w-full text-left sm:text-xs xl:text-base hover:underline transition-all cursor-pointer">Workspaces</div>
                    </div>
                </div>
                <div className='flex flex-col gap-4'>
                    <div className="text-white w-full text-left flex items-center gap-2 sm:text-xs xl:text-base hover:underline transition-all cursor-pointer">
                        <SquareUser className="w-4 h-4 xl:w-6 xl:h-6 text-white" />
                        {user?.name || "User Name"}
                    </div>
                    <div className="text-white w-full flex items-center gap-2 sm:text-xs xl:text-base hover:underline transition-all cursor-pointer">
                        <Settings className="w-4 h-4 xl:w-6 xl:h-6 text-white" />
                        Settings
                    </div>
                </div>
            </div>

        </>
    )
}

export default SidebarComp