"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import SidebarComp from '@/components/dashboard/sidebar';
import LoadingPage from '@/components/misc/loadingPage';
import Button from '@/components/button';
import { Copy, Plus, Trash2, Pencil, Save, PlusCircle, Clipboard, PencilOff, Lock, LockOpen, Link } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import DialogBox from '@/components/dialogBox';
import { decrypt } from '@/utils/encryption';
import getEnvVarsFromClipboard from '@/utils/getEnvFromClipbaord';

const GroupPage = () => {

    const { token } = useParams();
    const [group, setGroup] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const prevIsEditingRef = useRef(isEditing);
    const [originalEnvs, setOriginalEnvs] = useState<any[]>([]);


    const { data: session, status } = useSession();

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

                const data = await res.json();

                if (!res.ok) {
                    throw Error(data.message || 'Failed to fetch group data.');
                }


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
                setOriginalEnvs(decryptedEnvs);

            } catch (err: any) {
                toast.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchGroup();
    }, [token, status]);

    const haveEnvsChanged = (envs: any[], original: any[]) => {
        if (envs.length !== original.length) return true;
        for (let i = 0; i < envs.length; i++) {
            if (envs[i].key !== original[i].key || envs[i].value !== original[i].value) {
                return true;
            }
        }
        return false;
    };


    const handleChangeVisibility = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/group/visibility`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    groupToken: group?.token
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || 'Failed to change visibility.');
                return;
            }

            setGroup((prevGroup: any) => ({
                ...prevGroup,
                isPublic: !prevGroup.isPublic,
            }));

            toast.success(data.message || 'Visibility updated successfully.');
        } catch (err) {
            toast.error('Something went wrong while changing visibility.');
        } finally {
            setLoading(false);
        }
    }

    const handlePasteEnvs = async () => {
        const newEnvs = await getEnvVarsFromClipboard();

        if (newEnvs.length === 0) {
            toast.error("No valid envs found in clipboard.");
            return;
        }

        toast("Paste envs?", {
            description: `${newEnvs.length} variable${newEnvs.length > 1 ? 's' : ''} detected.`,
            action: {
                label: "Yes",
                onClick: () => {
                    const merged = [...(group.envs ?? []), ...newEnvs];

                    // Deduplicate by key (last one wins)
                    const deduped = Array.from(
                        new Map(merged.map((env) => [env.key, env])).values()
                    );

                    setGroup({ ...group, envs: deduped });

                    toast.success("Variables updated.");
                },
            },
        });
    };


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
            updatedEnvs.splice(index, 1);
            return { ...prevGroup, envs: updatedEnvs };
        });
    };

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

    const handleSaveChanges = async () => {
        const envsChanged = haveEnvsChanged(group.envs, originalEnvs);
        if (!envsChanged) {
            setIsEditing(false);
            return;
        }

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

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || 'Failed to save changes.');
                window.location.reload();
                return;
            }

            toast.success(data.message || 'Changes saved successfully.');
            setOriginalEnvs(group.envs);
        } catch (err) {
            console.log('Error saving changes:', err);
            toast.error('Something went wrong while saving.');
        } finally {
            setLoading(false);
            setIsEditing(false);
        }
    };



    useEffect(() => {
        if (prevIsEditingRef.current && !isEditing) {
            handleSaveChanges();
        }
        prevIsEditingRef.current = isEditing;
    }, [isEditing]);


    const getMembers = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/group/member/get?token=${token}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!res.ok) {
                toast.error('Failed to fetch members.');
                return;
            }

            const data = await res.json();
            setGroup((prevGroup: any) => ({
                ...prevGroup,
                members: data.members || [],
            }));
        } catch (err) {
            toast.error('Error fetching members.');
        } finally {
            setLoading(false);
        }
    }

    const handleAddMember = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/group/member/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    groupId: group._id,
                    memberEmail: newMemberEmail,
                }),
            })

            if (!res.ok) {
                const data = await res.json();
                toast.error(data.message || 'Failed to add member.');
                return;
            }

            const updatedGroup = await res.json();
            toast.success(updatedGroup.message || 'Member added successfully.');

            getMembers();

        } catch (err) {
            toast.error('Error adding member.');
        } finally {
            setLoading(false);
            setDialogOpen(false);
            setNewMemberEmail('');
        }
    }

    const handleRemoveMember = async (memberEmail: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/group/member/remove`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    groupId: group._id,
                    memberEmail,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                toast.error(data.message || 'Failed to remove member.');
                return;
            }

            const updatedGroup = await res.json();
            toast.success(updatedGroup.message || 'Member removed successfully.');
            getMembers();

        } catch (err) {
            toast.error('Error removing member.');
        } finally {
            setLoading(false);
        }
    }

    console.log("Group Data:", group);

    const handleCopyLink = () => {
        if (!group?.token) return;

        const link = `${window.location.origin}/group?token=${group.token}`;
        navigator.clipboard.writeText(link)
            .then(() => {
                toast.success("Link copied to clipboard!");
            })
            .catch((err) => {
                toast.error("Failed to copy link:", err);
            });
    };



    if (loading || !session) {
        return <LoadingPage />;
    }


    return (
        <>
            <div className='bg-[#F0F0F0] dark:bg-[#121212] h-screen p-6 grid sm:grid-cols-5 xl:grid-cols-12 gap-6'>
                <SidebarComp />

                <div className='sm:col-span-4 xl:col-span-10 p-4 h-full rounded-2xl flex flex-col gap-6 overflow-hidden'>
                    {group && (
                        <div className='flex items-center justify-between w-full'>
                            <h1 className='font-bold text-2xl text-[#00916C] dark:text-white'>
                                {group?.name} - {new Date(group?.createdAt).toLocaleDateString()}
                            </h1>
                            <div className='flex items-center gap-3'>
                                {group?.isPublic && (
                                    <Button variant='outline' onClick={handleCopyLink} className='flex gap-3 items-center justify-center'>
                                        <Link className='w-5 h-5' />
                                    </Button>
                                )}
                                <Button variant='outline' onClick={handleChangeVisibility} className={`flex gap-3 items-center justify-center ${group.isPublic ? 'dark:bg-[#00916C] dark:text-white' : 'light:bg-gray-500 text-[#00916C]'}`}>
                                    {group?.isPublic ? 'Public' : 'Private'}
                                    {!group?.isPublic ? <Lock className='w-4 h-4' /> : <LockOpen className='w-4 h-4' />}
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className='grid grid-cols-1 sm:grid-cols-4 xl:grid-cols-5 sm:grid-rows-4 xl:grid-rows-6 gap-4 h-full overflow-y-auto'>

                        {!group && (
                            <div className="col-span-4 text-center text-gray-500 dark:text-gray-400">
                                No groups found with this token.
                            </div>
                        )}

                        {group && (
                            <>
                                {/* ENV EDITOR CARD */}
                                <div className="col-span-1 sm:col-span-3 md:col-span-4 lg:col-span-2 xl:col-span-3 rounded-lg border-2 border-[#00916C] dark:border-[#00916C] hover:rounded-xl transition-all duration-300 row-span-5 h-full flex flex-col">
                                    <div className="flex justify-end items-center gap-4 p-4 border-b-2 border-[#00916C] dark:border-[#00916C]">
                                        {isEditing && (
                                            <>
                                                <Button onClick={handlePasteEnvs} className='flex items-center justify-center'>
                                                    <Clipboard />
                                                </Button>
                                                <Button onClick={handleAddEnv} className='flex items-center justify-center'>
                                                    <Plus />
                                                </Button>
                                            </>
                                        )}
                                        {!isEditing && (
                                            <Button onClick={handleCopyEnvs} className='flex items-center justify-center'>
                                                <Copy />
                                            </Button>
                                        )}
                                        <Button onClick={() => setIsEditing(!isEditing)} className='flex items-center justify-center'>
                                            {isEditing ? <Save /> : <Pencil />}
                                        </Button>
                                    </div>

                                    <div className={`flex-1 overflow-y-auto p-4 custom-scrollbar ${isEditing ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {group.envs.map((env: any, index: number) => (
                                            <div key={index} className="font-pt-mono flex items-center gap-2 mb-2">
                                                <input
                                                    className="w-full h-10 bg-white dark:bg-[#1e1e1e] text-black dark:text-white p-2 rounded-md focus:outline-none"
                                                    type="text"
                                                    placeholder="Key"
                                                    value={env.key ?? ""}
                                                    readOnly={!isEditing}
                                                    onChange={(e) => handleEnvChange(index, 'key', e.target.value)}
                                                />
                                                :
                                                <input
                                                    className="w-full h-10 bg-white dark:bg-[#1e1e1e] text-black dark:text-white p-2 rounded-md focus:outline-none"
                                                    type="text"
                                                    placeholder="Value"
                                                    value={isEditing ? env.value : '********'}
                                                    readOnly={!isEditing}
                                                    onChange={(e) => handleEnvChange(index, 'value', e.target.value)}
                                                />
                                                {isEditing && (
                                                    <Button onClick={() => handleRemoveEnv(index)}>
                                                        <Trash2 />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* MEMBERS CARD */}
                                <div className='col-span-1 sm:col-span-1 md:col-span-4 lg:col-span-2 xl:col-span-3 rounded-lg hover:rounded-xl border-2 border-[#00916C] dark:border-[#00916C] transition-all duration-300 row-span-5 h-full flex flex-col p-4 gap-3 overflow-y-auto custom-scrollbar'>
                                    <h2 className="text-lg font-semibold text-[#00916C] dark:text-white mb-2">Members</h2>

                                    <div
                                        onClick={() => setDialogOpen(true)}
                                        className="flex items-center justify-center gap-3 bg-white dark:bg-[#007a5a] hover:bg-[#00916C] dark:hover:bg-[#02614b] cursor-pointer text-[#00916C] dark:text-white hover:text-white p-3 rounded-lg hover:rounded-xl shadow-sm transition-all duration-300"
                                    >
                                        <PlusCircle />
                                    </div>

                                    {group.members.map((member: any, index: number) => (
                                        <div
                                            key={index}
                                            className="overflow-x-auto flex items-center justify-between gap-3 bg-white dark:bg-[#1e1e1e] p-3 rounded-lg hover:rounded-xl shadow-sm transition-all duration-300 cursor-default"
                                        >
                                            <div className="flex flex-col text-sm">
                                                <span className="font-medium text-gray-800 dark:text-gray-200">{member.name}</span>
                                                <span className="text-gray-500 dark:text-gray-400">{member.email}</span>
                                            </div>
                                            {isEditing && (
                                                <div
                                                    onClick={() => handleRemoveMember(member.email)}
                                                    className="p-1 cursor-pointer hover:bg-red-600 text-red-600 hover:text-white rounded-sm transition-all duration-200"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* PLACEHOLDER CARD */}
                                <div className='col-span-1 sm:col-span-4 xl:col-span-6 rounded-lg border-2 border-[#00916C] dark:border-[#00916C] hover:rounded-xl transition-all duration-300 row-span-5 h-full flex flex-col'>
                                    {/* Reserved for future content */}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>


            <DialogBox
                isOpen={dialogOpen}
                title="Add New Member"
                onClose={() => setDialogOpen(false)}
                onAction={() => { handleAddMember() }}
                loading={loading}
            >
                <div className="flex flex-col gap-4">
                    <input
                        placeholder="Member Email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        className="p-3 border-2 border-[#00916C] dark:border-[#00916C] rounded-xl bg-white dark:bg-[#1e1e1e] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00916C] dark:focus:ring-[#00916C] transition"
                        required
                    />
                </div>

            </DialogBox>

        </>
    )
}

export default GroupPage