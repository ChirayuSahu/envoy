"use client"

import React, { useState } from 'react';
import { LogOut, LayoutGrid, Users, User, ArrowLeft } from 'lucide-react';
import { signOut } from 'next-auth/react';
import DialogBox from '../dialogBox';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const SidebarComp = () => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await signOut({ callbackUrl: "/" });
  };

  const navItems = [
    { href: "/dashboard", icon: <LayoutGrid className="w-5 h-5" />, label: "Workspaces" },
    { href: "/dashboard/shared", icon: <Users className="w-5 h-5" />, label: "Shared" },
    { href: "/dashboard/account", icon: <User className="w-5 h-5" />, label: "My Account" },
  ];

  return (
    <>
      <aside className="hidden font-inter sm:col-span-1 xl:col-span-2 bg-[#00916C] dark:bg-[#007a5a] p-4 md:p-6 xl:p-8 h-full w-full rounded-2xl lg:flex flex-col justify-between shadow-lg">
        <div className="flex flex-col items-center gap-6 md:gap-8 xl:gap-12 flex-grow">
          <h1 className="text-white text-xl xl:text-2xl font-bold mb-4">{process.env.NEXT_PUBLIC_APP_NAME}</h1>

          <nav className="flex flex-col gap-4 w-full">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="text-white w-full text-left flex items-center gap-3 p-2 rounded-md text-sm xl:text-base hover:bg-white/10 transition-colors cursor-pointer">
                  {item.icon}
                  {item.label}
                </div>
              </Link>
            ))}
          </nav>
        </div>

        <div className='flex flex-col gap-2'>
          {/* <ThemeToggleButton /> */}
          <button
            onClick={() => router.back()}
            className="text-white w-full flex items-center gap-3 p-2 rounded-md text-sm xl:text-base hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ArrowLeft />
            <span>Back</span>
          </button>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="text-white w-full flex items-center gap-3 p-2 rounded-md text-sm xl:text-base hover:bg-white/10 transition-colors cursor-pointer"
          >
            <LogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="flex flex-col items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-[#00916C] dark:hover:text-white transition-colors">
                {item.icon}
                <span className="text-xs">{item.label}</span>
              </div>
            </Link>
          ))}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex flex-col items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-[#00916C] dark:hover:text-white transition-colors"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs">Logout</span>
          </button>
        </div>
      </nav>

      {showLogoutConfirm && (
        <DialogBox
          title="Confirm Logout"
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onAction={handleLogout}
          actionLabel="Logout"
          variant='danger'
        >
          <p className="text-sm text-gray-800 dark:text-gray-200">
            Are you sure you want to log out of your account?
          </p>
        </DialogBox>
      )}
    </>
  );
};

export default SidebarComp;
