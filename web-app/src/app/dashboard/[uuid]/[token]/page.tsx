"use client"

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import SidebarComp from '@/components/dashboard/sidebar';
import LoadingPage from '@/components/misc/loadingPage';
import Button from '@/components/button';
import { Copy, Plus, Trash2, Pencil, Save } from 'lucide-react';

const GroupPage = () => {

    const { token } = useParams();
    const [group, setGroup] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
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
                    console.log('Failed to fetch group:', res.statusText);
                    return;
                }

                const data = await res.json();

                // Strip `_id` from envs
                const cleanEnvs = (data.group?.envs || []).map(({ key, value }: any) => ({
                    key,
                    value,
                }));

                setGroup({
                    ...data.group,
                    envs: cleanEnvs,
                });

                console.log("Fetched clean group:", { ...data.group, envs: cleanEnvs });

            } catch (err) {
                console.log('Error fetching group:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchGroup();
    }, [token]);


    const handleEnvChange = (index: number, field: 'key' | 'value', value: string) => {
        setGroup((prevGroup: any) => {
            const updatedEnvs = [...prevGroup.envs];
            updatedEnvs[index] = { ...updatedEnvs[index], [field]: value };
            return { ...prevGroup, envs: updatedEnvs };
        });
    };

    const handleAddEnv = () => {
        setGroup((prevGroup: any) => ({
            ...prevGroup,
            envs: [...prevGroup.envs, { key: '', value: '' }],
        }));
    };

    const handleRemoveEnv = (index: number) => {
        setGroup((prevGroup: any) => {
            const updatedEnvs = [...prevGroup.envs];
            updatedEnvs.splice(index, 1); // remove one item at the specified index
            return { ...prevGroup, envs: updatedEnvs };
        });
    };


    const handleCopyEnvs = () => {
        if (!group?.envs || group.envs.length === 0) return;

        const formatted = group.envs
            .filter((env: any) => env.key?.trim()) // skip empty keys
            .map((env: any) => `${env.key}=${env.value}`)
            .join('\n');

        navigator.clipboard.writeText(formatted)
            .then(() => {
                alert("Copied to clipboard!");
            })
            .catch((err) => {
                console.error("Failed to copy:", err);
            });
    };

    const handleSaveChanges = async () => {
        setLoading(true);

        try {
            const res = await fetch(`/api/env`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    groupToken: token,
                    envs: group.envs,
                }),
            });

            if (!res.ok) {
                console.log('Failed to save changes:', res.statusText);
                return;
            }

            const data = await res.json();
            console.log("Saved changes:", data);
        } catch (err) {
            console.log('Error saving changes:', err);
        } finally {
            setLoading(false);
        }
    }



    if (loading) {
        return <LoadingPage />;
    }

    console.log(group.envs)


    return (
        <>
            <div className='bg-[#F0F0F0] h-screen p-6 grid sm:grid-cols-5 xl:grid-cols-12 gap-6'>
                <SidebarComp />
                <div className='sm:col-span-4 xl:col-span-10 p-4 h-full rounded-2xl flex flex-col gap-6 overflow-hidden'>
                    <div className=''>
                        <h1 className='font-bold text-2xl'>{group?.name}</h1>
                    </div>
                    <div className='grid grid-cols-5 grid-rows-6 gap- h-full'>
                        {!group && (
                            <div className="col-span-4 text-center text-gray-500">
                                No groups found with this token.
                            </div>
                        )}
                        <div className="col-span-3 rounded-lg border-2 border-[#00916C] hover:rounded-xl transition-all duration-300 row-span-5 h-full flex flex-col">
                            <div className="flex justify-start items-center gap-4 p-4">
                                <Button
                                    onClick={handleAddEnv}
                                    className='w-full flex items-center justify-center'
                                >
                                    <Plus />
                                </Button>
                                <Button
                                    onClick={handleCopyEnvs}
                                    className='w-full flex items-center justify-center'
                                >
                                    <Copy />
                                </Button>
                                <Button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className='w-full flex items-center justify-center'
                                >
                                    <Pencil />
                                </Button>
                                {isEditing && (
                                    <Button
                                        onClick={handleSaveChanges}
                                        className='w-full flex items-center justify-center'
                                        disabled={!isEditing}
                                    >
                                        <Save />
                                    </Button>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                {group.envs.map((env: any, index: number) => (
                                    <div key={index} className="font-pt-mono flex items-center gap-2 mb-2">
                                        <input
                                            className="w-full h-10 bg-white p-2 rounded-md focus:outline-none"
                                            type="text"
                                            placeholder="Key"
                                            value={env.key}
                                            readOnly={!isEditing}
                                            onChange={(e) => handleEnvChange(index, 'key', e.target.value)}
                                        />
                                        :
                                        <input
                                            className="w-full h-10 bg-white p-2 rounded-md focus:outline-none"
                                            type="text"
                                            placeholder="Value"
                                            value={env.value}
                                            readOnly={!isEditing}
                                            onChange={(e) => handleEnvChange(index, 'value', e.target.value)}
                                        />
                                        {isEditing && (
                                            <Button
                                                onClick={() => handleRemoveEnv(index)}
                                            >
                                                <Trash2 />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div >
        </>
    )
}

export default GroupPage