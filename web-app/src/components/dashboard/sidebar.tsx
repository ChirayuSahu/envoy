"use client"

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { SquareUser, Settings } from 'lucide-react';
import { signOut } from 'next-auth/react';
import DialogBox from '../dialogBox';
import Link from 'next/link';

const SidebarComp = () => {
  const { setTheme, resolvedTheme } = useTheme();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <div className="hidden font-inter sm:col-span-1 xl:col-span-2 bg-[#00916C] dark:bg-[#007a5a] p-4 md:p-6 xl:p-8 h-full w-full rounded-2xl sm:flex flex-col justify-between shadow-[0_8px_24px_0_rgba(0,0,0,0.1)] hover:shadow-[0_12px_32px_0_rgba(0,0,0,0.15)] transition duration-300 ease-in-out cursor-pointer">

        <div className="flex flex-col items-center gap-6 md:gap-8 xl:gap-12 flex-grow">
          <h1 className="text-white sm:text-sm md:text-md xl:text-2xl font-bold mb-2">.envShare</h1>

          <div className="flex flex-col gap-2 w-full">
            <Link href="/dashboard">
              <div className="text-white w-full text-left sm:text-xs xl:text-base hover:underline dark:hover:underline transition-all cursor-pointer">
                Workspaces
              </div>
            </Link>
            <Link href="/dashboard/shared">
              <div className="text-white w-full text-left sm:text-xs xl:text-base hover:underline dark:hover:underline transition-all cursor-pointer">
                Shared Workspaces
              </div>
            </Link>
          </div>
        </div>

        <div className='flex flex-col gap-4'>
          {/* <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className="text-white w-full flex items-center gap-2 sm:text-xs xl:text-base hover:underline dark:hover:underline transition-all cursor-pointer">
            {resolvedTheme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button> */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="text-white w-full text-left flex items-center gap-2 sm:text-xs xl:text-base hover:underline dark:hover:underline transition-all cursor-pointer"
          >
            <SquareUser className="w-4 h-4 xl:w-6 xl:h-6 text-white" />
            Logout
          </button>
          {/* <button className="text-white w-full flex items-center gap-2 sm:text-xs xl:text-base hover:underline dark:hover:underline transition-all cursor-pointer">
            <Settings className="w-4 h-4 xl:w-6 xl:h-6 text-white" />
            Settings
          </button> */}
        </div>
      </div>


      {/* ✅ Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <DialogBox
          title="Confirm Logout"
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onAction={handleLogout}
          actionLabel="Logout"
        >
          <p className="text-sm text-black dark:text-white">
            Are you sure you want to log out of your account?
          </p>

        </DialogBox>
      )}
    </>
  );
};

export default SidebarComp;
