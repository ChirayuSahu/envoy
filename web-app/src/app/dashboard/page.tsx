"use client"
import React, { useState, useEffect, useRef } from 'react'
import SidebarComp from '@/components/dashboard/sidebar'
import LoadingPage from '@/components/misc/loadingPage'
import { ArrowRight, CirclePlus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DialogBox from '@/components/dialogBox'
import { toast } from 'sonner'

const DashboardPage = () => {

  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const workspace = useRef<any>({
    name: "",
    description: "",
  });
  const [showModal, setShowModal] = useState(false);
  const deleteWorkspace = useRef<any>({
    id: "",
    name: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchWorkspaces = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/workspace");

        if (!res.ok) {
          const errorText = await res.text();
          toast.error("Failed to fetch workspaces.");
          return;
        }

        const data = await res.json();
        setWorkspaces(data.workspaces);
      } catch (err) {
        toast.error("Failed to fetch workspaces.");
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
        const errorText = await res.json();
        toast.error(errorText.message || "Failed to create workspace.");
        return;
      }

      const updatedRes = await fetch("/api/workspace");
      const updatedData = await updatedRes.json();
      setWorkspaces(updatedData.workspaces);
      toast.success("Workspace created successfully.");

    } catch (err) {
      toast.error("Error creating workspace.");
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    const res = await fetch("/api/workspace/delete", {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ workspaceId }),
    });

    if (!res.ok) {
      toast.error("Failed to delete workspace.");
      return;
    }

    const updatedRes = await fetch("/api/workspace");
    const updatedData = await updatedRes.json();
    setWorkspaces(updatedData.workspaces);
    toast.success(`Workspace deleted successfully.`);
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <>
      <div className="w-full bg-[#F0F0F0] dark:bg-[#121212] min-h-screen p-6 grid sm:grid-cols-5 xl:grid-cols-12 gap-6">
        <SidebarComp />
        <div className="sm:col-span-4 xl:col-span-10 p-4 h-full rounded-2xl flex flex-col gap-6">
          <div className="font-bold text-2xl text-black dark:text-white">Workspaces</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div
              onClick={() => setShowModal(true)}
              className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-3 text-gray-500 transition-colors duration-200 hover:border-[#00916C] hover:bg-[#00916C]/10 hover:text-[#00916C] dark:border-gray-600 dark:text-gray-400 dark:hover:border-[#00916C] dark:hover:bg-[#00916C]/20 dark:hover:text-[#5fc9a9]"
            >
              <CirclePlus />
            </div>

            {workspaces.map((workspace: any) => (
              <div
                key={workspace._id}
                className="flex justify-between bg-white dark:bg-[#1e1e1e] p-4 rounded-md hover:rounded-xl border-2 border-transparent hover:border-[#00916C] dark:hover:border-[#00916C] transition-all duration-300"
              >
                <div>
                  <h3 className="text-sm font-semibold text-black dark:text-white">{workspace.name}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{workspace.description}</p>
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Groups: {workspace.groups?.length ?? 0}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Created on:{" "}
                      {new Date(workspace.createdAt)
                        .toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                        .replace(" ", ", ")}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 justify-center items-center">
                  <Link href={`/dashboard/${workspace.uuid}`}>
                    <div className="self-end p-1 hover:bg-[#00916C] dark:hover:bg-[#00916C] text-[#00916C] dark:text-[#00916C] hover:text-white rounded-sm transition-all duration-200">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </Link>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteWorkspace.current = { id: workspace._id, name: workspace.name };
                      setShowDeleteModal(true);
                    }}
                    className="self-end p-1 cursor-pointer hover:bg-red-600 text-red-600 dark:text-red-500 hover:text-white rounded-sm transition-all duration-200"
                  >
                    <Trash2 className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <DialogBox
          title="New Workspace"
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onAction={handleCreateWorkspace}
          loading={loading}
          actionLabel="Submit"
        >
          <div className="flex flex-col gap-6 p-1">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Workspace Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                name="name"
                defaultValue={workspace.current.name}
                onChange={(e) => {
                  workspace.current.name = e.target.value;
                }}
                className="p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1E1F1F] text-black dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00916C] focus:border-transparent transition-colors duration-200"
                placeholder='Enter Workspace Name'
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                defaultValue={workspace.current.description}
                onChange={(e) => {
                  workspace.current.description = e.target.value;
                }}
                className="p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1E1F1F] text-black dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00916C] focus:border-transparent transition-colors duration-200 resize-none"
                placeholder="A brief summary of what this workspace is for."
              />
            </div>
          </div>
        </DialogBox>
      )}

      {showDeleteModal && (
        <DialogBox
          title={`Delete, ${deleteWorkspace.current.name}?`}
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onAction={() => {
            handleDeleteWorkspace(deleteWorkspace.current.id);
            setShowDeleteModal(false);
          }}
          loading={loading}
          actionLabel="Delete"
        >
          <p className="text-sm text-red-600 dark:text-red-400">
            Are you sure you want to delete this workspace? This action cannot be undone.
          </p>
        </DialogBox>
      )}

    </>
  )
}

export default DashboardPage