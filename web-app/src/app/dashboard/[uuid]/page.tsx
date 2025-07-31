'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation';
import SidebarComp from '@/components/dashboard/sidebar';
import { ArrowRight, Trash2, Users, Briefcase, FolderPlus, Plus, CalendarDays } from 'lucide-react';
import LoadingPage from '@/components/misc/loadingPage';
import Link from 'next/link';
import DialogBox from '@/components/dialogBox';
import { toast } from 'sonner';

const GroupsPage = () => {

    const { uuid } = useParams();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [workspace, setWorkspace] = useState<any>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    useEffect(() => {

        const fetchGroups = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/workspace?id=${uuid}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                if (!res.ok) {
                    toast.error('Failed to fetch groups.');
                    return null;
                }

                const data = await res.json();
                setGroups(data.workspace.groups || []);
                setWorkspace(data.workspace);

            } catch (err) {
                toast.error('Error fetching groups.');
            } finally {
                setLoading(false);
            }
        }

        fetchGroups();

    }, []);

    const handleDeleteGroup = async (groupID: String) => {

        try {
            const res = await fetch(`/api/group/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    groupId: groupID,
                }),
            });

            if (!res.ok) {
                toast.error('Error deleting group. Please try again.');
                return;
            }

            const updatedGroups = await fetch(`/api/workspace?id=${uuid}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await updatedGroups.json();
            setGroups(data.workspace.groups || []);

            toast.success('Group deleted successfully.');
        } catch (err) {
            toast.error('Error deleting group.');
        }
    }

    const handleCreateGroup = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/group/create`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    workspaceId: workspace._id,
                    name: newGroupName,
                }),
            });

            if (!res.ok) {
                toast.error('Error creating group. Please try again.');
            }

            const newGroups = await fetch(`/api/workspace?id=${uuid}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await newGroups.json();
            setGroups(data.workspace.groups || []);
            setNewGroupName('');
            setDialogOpen(false);
            toast.success('Group created successfully.');

        } catch (err) {
            toast.error('Error creating group. Please try again.');
        } finally {
            setLoading(false);
        }

    }

    return (
        <>
            <div className="bg-[#F0F0F0] dark:bg-[#121212] h-screen pb-16 lg:pb-6 p-6 grid sm:grid-cols-5 xl:grid-cols-12 gap-6">
                <SidebarComp />

                <div className="sm:col-span-5 lg:col-span-4 xl:col-span-10 p-4 h-full rounded-2xl flex flex-col gap-6">
                    {/* Skeleton State for the main workspace */}
                    {!workspace && (
                        <div className="flex flex-col gap-6 animate-pulse">
                            {/* ... Skeleton header code remains the same ... */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                    <div>
                                        <div className="w-48 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                        <div className="w-64 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    </div>
                                </div>
                                <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg mt-4 sm:mt-0"></div>
                            </div>
                            {/* Skeleton Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="bg-white dark:bg-[#1f1f1f] rounded-xl border border-gray-200 dark:border-gray-800 p-5 animate-pulse">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                                                    <div className="space-y-2">
                                                        <div className="w-32 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-x-4 mt-4">
                                                    <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                                    <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                                </div>
                                            </div>
                                            <div className='flex flex-col items-end gap-2 ml-4'>
                                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Populated State for the main workspace */}
                    {workspace && (
                        <> {/* Use a fragment to avoid adding an extra div */}
                            {/* Redesigned Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg flex-shrink-0">
                                        <Briefcase className="w-6 h-6 text-[#00916C]" />
                                    </div>
                                    <div>
                                        <h1 className="font-bold text-xl text-black dark:text-white">{workspace.name}</h1>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{workspace.description}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setDialogOpen(true)}
                                    className="mt-4 sm:mt-0 flex-shrink-0 flex items-center justify-center gap-2 rounded-lg bg-[#00916C] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#007558] active:scale-95"
                                >
                                    <Plus className="w-4 h-4" />
                                    New Group
                                </button>
                            </div>

                            {/* This is the new wrapper div that handles scrolling */}
                            <div className="flex-grow overflow-y-auto pr-2">
                                {/* The grid div is now only responsible for the grid layout */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {/* Loading state for groups */}
                                    {!groups && Array.from({ length: 4 }).map((_, i) => (
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
                                    ))}

                                    {/* Empty state for groups */}
                                    {groups && groups.length === 0 && (
                                        <div className="col-span-full flex flex-col items-center justify-center text-center py-10">
                                            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full"><FolderPlus className="w-12 h-12 text-gray-400 dark:text-gray-600" /></div>
                                            <h3 className="mt-5 text-lg font-semibold text-gray-800 dark:text-gray-200">Create your first group</h3>
                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Groups help you organize your variables and team members.</p>
                                        </div>
                                    )}

                                    {/* Populated state for groups */}
                                    {groups && groups.length > 0 && (
                                        groups.map((group: any) => (
                                            <div key={group._id} className="bg-white dark:bg-[#1f1f1f] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all duration-300">
                                                <div className="flex justify-between items-start p-5">
                                                    <Link href={`/dashboard/${workspace.uuid}/${group.token}`} className="group flex-grow">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-gray-100 dark:bg-gray-800 p-2.5 rounded-md"><Users className="w-5 h-5 text-[#00916C]" /></div>
                                                            <div>
                                                                <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">{group.name}</h3>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-x-4 text-xs text-gray-500 dark:text-gray-400 mt-4">
                                                            <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{group.members.length} Members</span>
                                                            <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4" />{new Date(group.createdAt).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}</span>
                                                        </div>
                                                    </Link>
                                                    <div className="flex flex-col items-end gap-2 ml-4">
                                                        <Link href={`/dashboard/${workspace.uuid}/${group.token}`} aria-label="Open group" className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"><ArrowRight className="w-5 h-5" /></Link>
                                                        <button onClick={() => handleDeleteGroup(group._id)} aria-label="Delete group" className="p-2 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"><Trash2 className="w-5 h-5" /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {dialogOpen && (
                <DialogBox
                    isOpen={dialogOpen}
                    title="Create New Group"
                    onClose={() => setDialogOpen(false)}
                    onAction={handleCreateGroup}
                    loading={loading}
                    isActionDisabled={!newGroupName.trim()}
                >
                    <div className="flex flex-col gap-2 py-2">
                        <label htmlFor="groupName" className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                            Group Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="groupName"
                            type="text"
                            placeholder="Enter Group Name"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            className="p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1E1F1F] text-black dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00916C] focus:border-transparent transition-colors duration-200"
                            required
                            autoFocus
                        />
                    </div>
                </DialogBox>
            )}

        </>
    )
}

export default GroupsPage