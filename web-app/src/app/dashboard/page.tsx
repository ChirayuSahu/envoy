"use client"
import React, { useState, useEffect, useRef } from 'react'
import SidebarComp from '@/components/dashboard/sidebar'
import LoadingPage from '@/components/misc/loadingPage'
import { ArrowRight, CirclePlus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DialogBox from '@/components/dialogBox'

const DashboardPage = () => {

  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const workspace = useRef<any>({
    name: "",
    description: "",
  });
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

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

  const handleCreateWorkspace = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/workspace/create", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: workspace.current.name,
          description: workspace.current.description,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Failed to create workspace:", res.status, errorText);
        return;
      }

      const updatedRes = await fetch("/api/workspace");
      const updatedData = await updatedRes.json();
      setWorkspaces(updatedData.workspaces);

    } catch (err) {
      console.error("Error creating workspace:", err);
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <>
      <div className='absolute w-full z-40 bg-[#F0F0F0] h-screen p-6 grid sm:grid-cols-5 xl:grid-cols-12 gap-6'>
        <SidebarComp />
        <div className='sm:col-span-4 xl:col-span-10 p-4 h-full rounded-2xl flex flex-col gap-6'>
          <div className='font-bold text-2xl'>
            Workspaces
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div onClick={() => setShowModal(true)} className='cursor-pointer flex justify-center items-center text-[#00916C] hover:text-white bg-white hover:bg-[#00916C] p-4 rounded-md hover:rounded-xl border-2 border-transparent hover:border-[#00916C] transition-all duration-300'>
              <CirclePlus className='' />
            </div>
            {workspaces.map((workspace: any) => (
              <Link
                key={workspace._id}
                href={`/dashboard/${workspace.uuid}`}
                className="flex justify-between bg-white p-4 rounded-md hover:rounded-xl border-2 border-transparent hover:border-[#00916C] transition-all duration-300"
              >
                <div>
                  <h3 className="text-sm font-semibold">{workspace.name}</h3>
                  <p className="text-xs text-gray-600">{workspace.description}</p>
                  <div className="mt-2">
                    <p className="text-xs text-gray-600">
                      Groups: {workspace.groups?.length ?? 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      Created on: {
                        new Date(workspace.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        }).replace(' ', ', ')
                      }

                    </p>
                  </div>
                </div>

                <div className="self-end p-1 hover:bg-[#00916C] text-[#00916C] hover:text-white rounded-sm transition-all duration-200">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      //modal for creating a new workspace

      {showModal && (
        <DialogBox
          title="New Workspace"
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onAction={handleCreateWorkspace}
          loading={loading}
          actionLabel="Submit"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-semibold text-black">
              Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              defaultValue={workspace.current.name}
              onChange={(e) => {
                workspace.current.name = e.target.value;
              }}
              className="p-3 border-2 border-[#00916C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00916C] transition"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="description"
              className="text-sm font-semibold text-black"
            >
              Description
            </label>
            <input
              id="description"
              type="text"
              name="description"
              defaultValue={workspace.current.description}
              onChange={(e) => {
                workspace.current.description = e.target.value;
              }}
              className="p-3 border-2 border-[#00916C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00916C] transition"
              required
            />
          </div>
        </DialogBox>
      )}

    </>
  )
}

export default DashboardPage