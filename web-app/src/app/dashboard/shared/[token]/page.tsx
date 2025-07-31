"use client"
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { decrypt } from '@/utils/encryption';
import SidebarComp from '@/components/dashboard/sidebar';
import LoadingPage from '@/components/misc/loadingPage';
import Button from '@/components/button';
import { Copy, Eye, EyeOffIcon } from 'lucide-react';

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
            <div className="bg-[#F0F0F0] dark:bg-[#121212] h-screen p-6 grid sm:grid-cols-5 xl:grid-cols-12 gap-6">
                <SidebarComp />
                <div className="sm:col-span-5 lg:col-span-4 xl:col-span-10 p-2 h-full rounded-2xl flex flex-col gap-6 overflow-hidden">
                    {group?.name && (
                        <div>
                            <h1 className="font-bold text-2xl text-[#00916C] dark:text-[#00916C]">
                                {group?.name} - {new Date(group?.createdAt)
                                    .toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                    })
                                    .replace(" ", ", ")}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Shared by: {group?.owner?.email || 'Unknown'}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-4 xl:grid-cols-5 sm:grid-rows-4 xl:grid-rows-6 gap-4 h-full overflow-y-auto">
                        {!group?.envs && (
                            <div className="col-span-4 text-center text-gray-500 dark:text-gray-400">
                                No groups found with this token.
                            </div>
                        )}

                        {group?.envs && (
                            <>
                                <div className="col-span-1 sm:col-span-4 xl:col-span-5 rounded-lg border-2 border-[#00916C] hover:rounded-xl transition-all duration-300 row-span-6 h-full flex flex-col bg-white dark:bg-[#1e1e1e]">
                                    <div className="flex justify-start items-center gap-4 p-4 border-b-2 border-[#00916C]">
                                        <Button
                                            onClick={handleCopyEnvs}
                                            className="w-full flex items-center justify-center"
                                        >
                                            <Copy />
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setIsViewing(true);
                                                setTimeout(() => {
                                                    setIsViewing(false);
                                                    toast.info("Sensitive values hidden.");
                                                }, 5000);
                                            }}
                                            className="w-full flex items-center justify-center"
                                        >
                                            {isViewing ? <EyeOffIcon /> : <Eye />}
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
                                                <span className="font-black">:</span>
                                                <input
                                                    className="w-full h-10 bg-[#F0F0F0] dark:bg-[#2b2b2b] dark:text-white p-2 rounded-md focus:outline-none"
                                                    type="text"
                                                    placeholder="Value"
                                                    value={isViewing ? env?.value : '••••••••'}
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