'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation';
import SidebarComp from '@/components/dashboard/sidebar';
import { ArrowRight, Trash2, CirclePlus } from 'lucide-react';
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


    if (loading) {
        return <LoadingPage />;
    }

    return (
        <>
            <div className='bg-[#F0F0F0] h-screen p-6 grid sm:grid-cols-5 xl:grid-cols-12 gap-6'>
                <SidebarComp />
                <div className='sm:col-span-4 xl:col-span-10 p-4 h-full rounded-2xl flex flex-col gap-6 overflow-hidden'>
                    <div className=''>
                        <h1 className='font-bold text-2xl'>{workspace?.name}</h1>
                        <p>{workspace?.description}</p>
                    </div>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-y-auto'>
                        {groups.length === 0 && (
                            <div className="col-span-4 text-center text-gray-500">
                                No workspace found with this token.
                            </div>
                        )}
                        {workspace && (
                            <div onClick={() => setDialogOpen(true)} className='cursor-pointer flex justify-center items-center text-[#00916C] hover:text-white bg-white hover:bg-[#00916C] p-4 rounded-md hover:rounded-xl border-2 border-transparent hover:border-[#00916C] transition-all duration-300'>
                                <CirclePlus className='' />
                            </div>
                        )}
                        {groups.map((group: any) => (
                            <div key={group._id} className="flex gap-2 items-end justify-between bg-white p-4 rounded-md hover:rounded-xl transition-all duration-300 border-2 border-transparent hover:border-2 hover:border-[#00916C]">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-200">{group.name}</h3>
                                    <p className="text-xs text-gray-500">Members: {group.members.length}</p>
                                    <div className="mt-2">
                                        <span className="text-xs text-gray-400">
                                            Created on: {
                                                new Date(workspace.createdAt).toLocaleDateString('en-GB', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric',
                                                }).replace(' ', ', ')
                                            }
                                        </span>
                                    </div>
                                </div>
                                <div className='flex flex-col gap-3 justify-center items-center'>
                                    <Link href={`/dashboard/${workspace.uuid}/${group.token}`}>
                                        <div className="self-end p-1 hover:bg-[#00916C] text-[#00916C] hover:text-white rounded-sm transition-all duration-200">
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    </Link>
                                    <div
                                        onClick={() => handleDeleteGroup(group._id)}
                                        className="self-end p-1 cursor-pointer hover:bg-red-600 text-red-600 hover:text-white rounded-sm transition-all duration-200"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {dialogOpen && (
                <DialogBox
                    isOpen={dialogOpen}
                    title="Create New Group"
                    onClose={() => setDialogOpen(false)}
                    onAction={handleCreateGroup}
                    loading={loading}
                >
                    <input
                        placeholder="Group Name"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="p-3 border-2 border-[#00916C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00916C] transition"
                        required
                    />
                </DialogBox>
            )}
        </>
    )
}

export default GroupsPage