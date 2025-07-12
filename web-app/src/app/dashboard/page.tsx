"use client"
import React, { useState, useEffect } from 'react'
import SidebarComp from '@/components/dashboard/sidebar'
import LoadingPage from '@/components/misc/loadingPage'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

const DashboardPage = () => {

  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/workspace");

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Failed to fetch workspaces:", res.status, errorText);
          return;
        }

        const data = await res.json();
        setWorkspaces(data.workspaces);
        console.log("Fetched workspaces:", data.workspaces);
      } catch (err) {
        console.error("Failed to fetch workspaces:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);


  if (loading) {
    return <LoadingPage />;
  }

  return (
    <>
      <div className='bg-[#F0F0F0] h-screen p-6 grid sm:grid-cols-5 xl:grid-cols-12 gap-6'>
        <SidebarComp />
        <div className='sm:col-span-4 xl:col-span-10 p-4 h-full rounded-2xl flex flex-col gap-6'>
          <div className='font-bold text-2xl'>
            Workspaces
          </div>
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
            {workspaces.map((workspace: any) => (
              <Link
                key={workspace._id}
                href={`/dashboard/${workspace.uuid}`}
                className="flex flex-col justify-between bg-white p-4 rounded-lg border-2 border-transparent hover:border-[#00916C] transition-all duration-300"
              >
                <div>
                  <h3 className="text-sm font-semibold">{workspace.name}</h3>
                  <p className="text-xs text-gray-600">{workspace.description}</p>
                  <div className="mt-2">
                    <p className="text-xs text-gray-600">
                      Groups: {workspace.groups?.length ?? 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      Created on: {new Date(workspace.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="self-end mt-4 p-1 hover:bg-[#00916C] text-[#00916C] hover:text-white rounded-sm transition-all duration-200">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
            <div className='flex justify-between items-center bg-white p-4 rounded-lg border-2 border-transparent hover:border-[#00916C] transition-all duration-300'>
              
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default DashboardPage