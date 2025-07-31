"use client"

import React, { useState, useEffect } from 'react'
import SidebarComp from '@/components/dashboard/sidebar'
import { toast } from 'sonner'
import { ArrowRight, FolderKanban, Layers, CalendarDays, Share2, FolderX } from 'lucide-react'
import Link from 'next/link'
import LoadingPage from '@/components/misc/loadingPage'

const SharedGroups = () => {

  const [loading, setLoading] = useState(true);
  const [sharedGroups, setSharedGroups] = useState([]);

  useEffect(() => {
    const fetchSharedGroups = async () => {
      try {

        const res = await fetch('/api/group/shared', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          const data = await res.json();
          console.error(data.message);
          return;
        }
        const data = await res.json();
        setSharedGroups(data.otherGroups || []);
      } catch (error) {
        toast.error('Failed to fetch shared groups.');
      } finally {
        setLoading(false);
      }
    }
    fetchSharedGroups();
  }, []);


  return (
    <>
      <div className="bg-[#F0F0F0] dark:bg-[#121212] h-screen pb-18 sm:pb-6 p-6 grid sm:grid-cols-5 xl:grid-cols-12 gap-6">
        <SidebarComp />
        <div className="sm:col-span-5 lg:col-span-4 xl:col-span-10 p-4 h-full rounded-2xl flex flex-col gap-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                <Share2 className="w-6 h-6 text-[#00916C]" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-black dark:text-white">
                  Shared Groups
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Groups that have been shared with you.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading && (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-[#1f1f1f] rounded-xl border border-gray-200 dark:border-gray-800 p-5 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                    <div className="w-2/3 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="mt-5 space-y-3">
                    <div className="w-1/2 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))
            )}

            {sharedGroups && sharedGroups.length === 0 && !loading&& (
              <div className="col-span-full flex flex-col items-center justify-center text-center py-16">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full">
                  <FolderX className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-gray-800 dark:text-gray-200">
                  No Shared Groups Found
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  It seems there are no groups associated with this token.
                </p>
              </div>
            )}

            {sharedGroups && sharedGroups.length > 0 && (
              sharedGroups.map((group: any) => (
                <Link
                  href={`/dashboard/shared/${group.token}`}
                  key={group._id}
                  className="group relative block bg-white dark:bg-[#1f1f1f] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 dark:bg-gray-800 p-2.5 rounded-md">
                        <FolderKanban className="w-5 h-5 text-[#00916C]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
                          {group.name}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-x-4 text-xs text-gray-500 dark:text-gray-400 mt-4">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-4 h-4" />
                        {group.envs.length} Variables
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4" />
                        {new Date(group.createdAt).toLocaleDateString("en-GB", {
                          month: "short",
                          day: "numeric",
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className='absolute top-5 right-5 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors'>
                    <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

    </>
  )
}

export default SharedGroups