'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation';
import SidebarComp from '@/components/dashboard/sidebar';
import { Pencil } from 'lucide-react';
import LoadingPage from '@/components/misc/loadingPage';

const GroupsPage = () => {

    const { uuid } = useParams();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [workspace, setWorkspace] = useState<any>(null);

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
                    console.error('Failed to fetch groups:', res.statusText);
                }

                const data = await res.json();
                setGroups(data.workspace.groups || []);
                setWorkspace(data.workspace);

            } catch (err) {
                console.error('Error fetching groups:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchGroups();

    }, []);

    if(loading) {
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
                    <div className='grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto py-8'>
                        {groups.map((group: any) => (
                            <div key={group._id} className="flex gap-2 items-end justify-between bg-white p-4 rounded-lg transition-all duration-300 shadow-md border border-transparent hover:border hover:border-[#00916C]">
                                <div>
                                    <h3 className="text-base font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-200">{group.name}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                                    <p className="text-sm text-gray-500 mt-1">Members: {group.members.length}</p>
                                    <div className="mt-2">
                                        <span className="text-xs text-gray-400">
                                            Created on: {new Date(group.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <Pencil className="w-4 h-4 text-gray-500 mt-2 cursor-pointer hover:text-gray-700 transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default GroupsPage