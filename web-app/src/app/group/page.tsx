"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { decrypt } from '@/utils/encryption';
import Button from '@/components/button';
import { Copy, Eye, EyeOffIcon } from 'lucide-react';
import LoadingPage from '@/components/misc/loadingPage';
import { useRouter } from 'next/navigation';

const GroupContent = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [loading, setLoading] = useState(true);
    const [group, setGroup] = useState<any>(null);
    const [isViewing, setIsViewing] = useState(false);
    const hasFetchedRef = useRef(false);
    const router = useRouter()

    useEffect(() => {
        if (!token || hasFetchedRef.current) {
            if (!token) setLoading(false);
            router.push("/")
            return;
        }

        hasFetchedRef.current = true;

        const fetchGroup = async () => {
            try {
                const res = await fetch(`/api/group?token=${token}`);
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || 'Failed to fetch group.');
                }

                const decryptedEnvs = (data.group?.envs || []).map((env: any) => ({
                    ...env,
                    value: decrypt(env.value),
                }));

                setGroup({
                    ...data.group,
                    envs: decryptedEnvs,
                });
            } catch (err: any) {
                toast.error(err.message || "Error fetching group.");
                setGroup(null); 
            } finally {
                setLoading(false);
            }
        };

        fetchGroup();
    }, [token]);

    const handleCopyEnvs = () => {
        // ... (your existing handleCopyEnvs function)
        if (!group?.envs || group.envs.length === 0) return;
        const formatted = group.envs
            .filter((env: any) => env.key?.trim())
            .map((env: any) => `${env.key}=${env.value}`)
            .join('\n');
        navigator.clipboard.writeText(formatted)
            .then(() => toast.success("Copied to clipboard!"))
            .catch((err) => toast.error("Failed to copy:", err));
    };


    if (loading) {
        return <LoadingPage />;
    }

    if (!group) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400">
                    No group found with this token or an error occurred.
                </p>
            </div>
        )
    }

    return (
        <div className="sm:col-span-4 xl:col-span-10 p-6 h-full rounded-2xl flex flex-col gap-6 overflow-hidden">
            <div>
                <h1 className="font-bold text-2xl text-[#00916C] dark:text-[#00916C]">
                    {group.name} - {new Date(group.createdAt).toLocaleDateString()}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Shared by: {group.owner?.email || 'Unknown'}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 xl:grid-cols-5 sm:grid-rows-4 xl:grid-rows-6 gap-4 h-full overflow-y-auto">
                <div className="col-span-1 sm:col-span-4 xl:col-span-5 rounded-lg border-2 border-[#00916C] hover:rounded-xl transition-all duration-300 row-span-6 h-full flex flex-col bg-white dark:bg-[#1e1e1e]">
                    <div className="flex justify-end items-center gap-4 p-4 border-b-2 border-[#00916C]">
                        {/* ... (Your Button components) ... */}
                        <Button
                            onClick={handleCopyEnvs}
                            className="flex items-center justify-center"
                            variant='modern'
                        >
                            <Copy className='w-4 h-4' />
                        </Button>
                        <Button
                            onClick={() => {
                                setIsViewing(() => !isViewing);
                                if (isViewing) {
                                    setTimeout(() => {
                                        setIsViewing(false);
                                    }, 5000);
                                }
                            }}
                            className="flex items-center justify-center"
                            variant='modern'
                        >
                            {isViewing ? <EyeOffIcon className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar text-black dark:text-gray-200">
                        <div className="space-y-4 font-pt-mono text-xs sm:text-sm">
                            {group.envs.map((env: any, index: number) => (
                                <div key={env.id || index} className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <input className="w-full h-10 bg-[#F0F0F0] dark:bg-[#2b2b2b] text-black dark:text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00916C] transition" type="text" placeholder="Key" value={env?.key ?? ""} readOnly />
                                    <span className="hidden sm:block text-black dark:text-white font-semibold text-lg">=</span>

                                    <input className="w-full h-10 bg-[#F0F0F0] dark:bg-[#2b2b2b] text-black dark:text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00916C] transition" type={isViewing ? 'text' : 'password'} placeholder="Value" value={env?.value ?? ""} readOnly />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupContent;