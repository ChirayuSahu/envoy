"use client"
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { decrypt } from '@/utils/encryption';
import SidebarComp from '@/components/dashboard/sidebar';
import LoadingPage from '@/components/misc/loadingPage';
import Button from '@/components/button';
import { Copy, Eye, EyeOffIcon, AlertTriangle, Share2 } from 'lucide-react';

const SharedGroupPage = () => {

    const { token } = useParams();
    const [loading, setLoading] = useState(true);
    const [group, setGroup] = useState<any>([]);
    const { data: session, status } = useSession();
    const [isViewing, setIsViewing] = useState(false);

    useEffect(() => {

        if (status !== "authenticated") return;

        const fetchGroup = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/group?token=${token}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!res.ok) {
                    const data = await res.json();
                    toast.error(data.message || 'Failed to fetch group.');
                    return;
                }

                const data = await res.json();

                // Strip `_id` from envs
                const cleanEnvs = (data.group?.envs || []).map(({ key, value }: any) => ({
                    key,
                    value,
                }));

                const decryptedEnvs = cleanEnvs.map((env: any) => ({
                    ...env,
                    value: decrypt(env.value),
                }));

                setGroup({
                    ...data.group,
                    envs: decryptedEnvs,
                });

            } catch (err: any) {
                toast.error('Error fetching group.');
            } finally {
                setLoading(false);
            }
        };

        fetchGroup();
    }, [token, status]);

    const handleCopyEnvs = () => {
        if (!group?.envs || group.envs.length === 0) return;

        const formatted = group.envs
            .filter((env: any) => env.key?.trim())
            .map((env: any) => `${env.key}=${env.value}`)
            .join('\n');

        navigator.clipboard.writeText(formatted)
            .then(() => {
                toast.success("Copied to clipboard!");
            })
            .catch((err) => {
                toast.error("Failed to copy:", err);
            });
    };

    if (loading) {
        return <LoadingPage />;
    }

    return (
        <>
            <div className="bg-[#F0F0F0] dark:bg-[#121212] h-screen pb-16 lg:pb-6 p-6 grid sm:grid-cols-5 xl:grid-cols-12 gap-6">
                <SidebarComp />
                <div className="sm:col-span-5 lg:col-span-4 xl:col-span-10 p-2 h-full rounded-2xl flex flex-col gap-6 overflow-hidden">
                    {group?.name && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-4">
                                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg flex-shrink-0">
                                    <Share2 className="w-6 h-6 text-[#00916C]" />
                                </div>
                                <div>
                                    <h1 className="font-bold text-xl text-black dark:text-white">{group.name}</h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Shared by <span className="font-semibold text-black dark:text-white">{group?.owner?.email || 'Unknown'}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-4 xl:grid-cols-5 sm:grid-rows-4 xl:grid-rows-6 gap-4 h-full overflow-y-auto">
                        {!group?.envs && (
                            <div className="col-span-full row-span-full text-center text-gray-500 dark:text-gray-400">
                                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                    <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full">
                                        <AlertTriangle className="w-12 h-12 text-red-500 dark:text-red-400" />
                                    </div>
                                    <h2 className="mt-6 text-xl font-bold text-gray-800 dark:text-gray-200">
                                        Group Not Found
                                    </h2>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                                        The link may be broken, or the group may have been deleted. Please check the URL and try again.
                                    </p>
                                </div>
                            </div>
                        )}

                        {group?.envs && (
                            <>
                                <div className="col-span-1 sm:col-span-4 xl:col-span-5 rounded-lg border-2 border-[#00916C] hover:rounded-xl transition-all duration-300 row-span-6 h-full flex flex-col bg-white dark:bg-[#1e1e1e]">
                                    <div className="flex justify-end items-center gap-4 p-4 border-b-2 border-[#00916C]">
                                        <Button
                                            onClick={handleCopyEnvs}
                                            className="flex items-center justify-center"
                                            variant='modern'
                                        >
                                            <Copy className='w-5 h-5' />
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setIsViewing(() => !isViewing);
                                            }}
                                            className="flex items-center justify-center"
                                            variant='modern'
                                        >
                                            {isViewing ? <EyeOffIcon className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                                        </Button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar text-black dark:text-gray-200">
                                        {group?.envs?.map((env: any, index: number) => (
                                            <div key={index} className="font-pt-mono text-xs sm:text-sm flex items-center gap-2 mb-2">
                                                <input
                                                    className="w-full h-10 bg-[#F0F0F0] dark:bg-[#2b2b2b] dark:text-white p-2 rounded-md focus:outline-none"
                                                    type="text"
                                                    placeholder="Key"
                                                    value={env?.key}
                                                    readOnly
                                                />
                                                <span className="font-black">=</span>
                                                <input
                                                    className="w-full h-10 bg-[#F0F0F0] dark:bg-[#2b2b2b] text-black dark:text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00916C] transition"
                                                    type={isViewing ? 'text' : 'password'}
                                                    placeholder="Value"
                                                    value={env?.value ?? ""}
                                                    readOnly
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default SharedGroupPage