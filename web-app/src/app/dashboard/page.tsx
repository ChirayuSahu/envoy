"use client"
import React, { useState, useEffect, useRef } from 'react'
import SidebarComp from '@/components/dashboard/sidebar'
import LoadingPage from '@/components/misc/loadingPage'
import { ArrowRight, FolderPlus, Trash2, CalendarDays, Users, Briefcase, Plus } from 'lucide-react'
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

  return (
    <>
      <div className="w-full bg-[#F0F0F0] dark:bg-[#121212] min-h-screen p-6 grid sm:grid-cols-5 xl:grid-cols-12 gap-6">
        <SidebarComp />
        <div className="sm:col-span-5 lg:col-span-4 xl:col-span-10 p-4 h-full rounded-2xl flex flex-col gap-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 dark:bg-gray-800 p-2.5 rounded-lg">
                <Briefcase className="w-6 h-6 text-[#00916C]" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-black dark:text-white">Workspaces</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your collaborative environments.</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 sm:mt-0 flex items-center justify-center gap-2 rounded-lg bg-[#00916C] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#007558] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              New Workspace
            </button>
          </div>

          <div className="flex-grow">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {loading && (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-[#1f1f1f] rounded-xl border border-gray-200 dark:border-gray-800 p-5 animate-pulse">
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                          <div className="space-y-2">
                            <div className="w-32 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="w-48 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-x-4 mt-4">
                          <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      </div>
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                    </div>
                  </div>
                ))
              )}

              {/* EMPTY CASE */}
              {!loading && workspaces && workspaces.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center text-center py-16">
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full">
                    <FolderPlus className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Create your first workspace
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Click the "New Workspace" button to get started.
                  </p>
                </div>
              )}

              {workspaces && workspaces.length > 0 && (
                workspaces.map((workspace: any) => (
                  <div
                    key={workspace._id}
                    className="bg-white dark:bg-[#1f1f1f] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div className="flex justify-between items-start p-5">
                      <Link href={`/dashboard/${workspace.uuid}`} className="group flex-grow">
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 dark:bg-gray-800 p-2.5 rounded-md">
                            <Briefcase className="w-5 h-5 text-[#00916C]" />
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
                              {workspace.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                              {workspace.description || 'No description available.'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-x-4 text-xs text-gray-500 dark:text-gray-400 mt-4">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            {workspace.groups?.length ?? 0} Groups
                          </span>
                          <span className="flex items-center gap-1.5">
                            <CalendarDays className="w-4 h-4" />
                            {new Date(workspace.createdAt).toLocaleDateString("en-GB", {
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })}
                          </span>
                        </div>
                      </Link>
                      <div className="flex flex-col items-end gap-2 ml-4">
                        <Link
                          href={`/dashboard/${workspace.uuid}`}
                          aria-label="Open workspace"
                          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteWorkspace.current = { id: workspace._id, name: workspace.name };
                            setShowDeleteModal(true);
                          }}
                          aria-label="Delete workspace"
                          className="p-2 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
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