"use client"

import React, { useState, useEffect } from 'react'
import SidebarComp from '@/components/dashboard/sidebar'
import { toast } from 'sonner'
import { ArrowRight } from 'lucide-react'
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

  if(loading){
    return <LoadingPage />;
  }


  return (
    <>
      <div className='bg-[#F0F0F0] h-screen p-6 grid sm:grid-cols-5 xl:grid-cols-12 gap-6'>
        <SidebarComp />
        <div className='sm:col-span-4 xl:col-span-10 p-4 h-full rounded-2xl flex flex-col gap-6 overflow-hidden'>
          <div className=''>
            <h1 className='font-bold text-2xl'>Shared Groups</h1>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-y-auto'>
                        {!sharedGroups && (
                            <div className="col-span-4 text-center text-gray-500">
                                No workspace found with this token.
                            </div>
                        )}
                        {sharedGroups.map((group: any) => (
                            <div key={group._id} className="flex gap-2 items-end justify-between bg-white p-4 rounded-md hover:rounded-xl transition-all duration-300 border-2 border-transparent hover:border-2 hover:border-[#00916C]">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-200">{group.name}</h3>
                                    <p className="text-xs text-gray-500">Envs: {group.envs.length}</p>
                                    <div className="mt-2">
                                        <span className="text-xs text-gray-400">
                                            Created on: {
                                                new Date(group.createdAt).toLocaleDateString('en-GB', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric',
                                                }).replace(' ', ', ')
                                            }
                                        </span>
                                    </div>
                                </div>
                                <div className='flex flex-col gap-3 justify-center items-center'>
                                    <Link href={`/dashboard/shared/${group.token}`}>
                                        <div className="self-end p-1 hover:bg-[#00916C] text-[#00916C] hover:text-white rounded-sm transition-all duration-200">
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
        </div>
      </div>
    </>
  )
}

export default SharedGroups