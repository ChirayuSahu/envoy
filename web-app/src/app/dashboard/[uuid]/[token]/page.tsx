"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import SidebarComp from '@/components/dashboard/sidebar';
import LoadingPage from '@/components/misc/loadingPage';
import Button from '@/components/button';
import { Copy, Plus, Trash2, Pencil, Save, PlusCircle, Clipboard, Lock, LockOpen, Users, LinkIcon } from 'lucide-react';
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
                const res = await fetch(`/api/group?token=${token}&edit=true`, {
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
                toast.error(err.message);
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
                setTimeout(() => { window.location.reload() }, 500);
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

    const getInitials = (name: string = '') =>
        name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();


    if (loading || !session) {
        return <LoadingPage />;
    }


    return (
        <>
            <div className='bg-[#F0F0F0] dark:bg-[#121212] h-screen pb-16 lg:pb-6 p-6 grid sm:grid-cols-5 xl:grid-cols-12 gap-6'>
                <SidebarComp />

                <div className='sm:col-span-5 lg:col-span-4 xl:col-span-10 p-4 h-full rounded-2xl flex flex-col gap-6 overflow-hidden'>
                    {group && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-4">
                                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg flex-shrink-0">
                                    <Users className="w-6 h-6 text-[#00916C]" />
                                </div>
                                <div>
                                    <h1 className="font-bold text-xl text-black dark:text-white">{group.name}</h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Created on {new Date(group.createdAt).toLocaleDateString("en-GB", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Right Side: Action Buttons */}
                            <div className="flex items-center gap-2 mt-4 sm:mt-0 flex-shrink-0">
                                {group.isPublic && (
                                    <button
                                        onClick={handleCopyLink}
                                        title="Copy public link"
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                                    >
                                        <LinkIcon className="w-5 h-5" />
                                    </button>
                                )}
                                <button
                                    onClick={handleChangeVisibility}
                                    title={group.isPublic ? "Change to Private" : "Change to Public"}
                                    className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 active:scale-95 ${group.isPublic
                                        ? 'bg-[#00916C]/10 text-[#00916C] hover:bg-[#00916C]/20'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {group.isPublic ? <LockOpen className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                    <span className="hidden md:inline">{group.isPublic ? 'Public' : 'Private'}</span>
                                </button>
                            </div>
                        </div>
                    )}

                    <div className='grid grid-cols-1 grid-rows-2 sm:grid-cols-4 xl:grid-cols-5 sm:grid-rows-4 xl:grid-rows-6 gap-4 h-full overflow-y-auto'>

                        {!group?.envs && (
                            <div className="col-span-4 text-center text-gray-500 dark:text-gray-400">
                                No groups found with this token.
                            </div>
                        )}

                        {group?.envs && (
                            <>
                                <div className="col-span-1 sm:col-span-3 md:col-span-4 lg:col-span-4 xl:col-span-3 row-span-1 sm:row-span-2 lg:row-span-6 rounded-lg border-2 border-[#00916C] dark:border-[#00916C] bg-white dark:bg-[#1e1e1e] hover:rounded-xl transition-all duration-300 h-full flex flex-col">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-4 border-b-2 border-[#00916C] dark:border-[#00916C]">
                                        <h3 className="font-semibold text-base text-black dark:text-white shrink-0">
                                            Environment Variables
                                        </h3>
                                        <div className="flex items-center gap-2 self-end sm:self-center">
                                            {isEditing && (
                                                <>
                                                    <button title="Paste from Clipboard" onClick={handlePasteEnvs} className="p-2 rounded-lg text-[#00916C] hover:bg-[#00916C]/10 active:bg-[#00916C]/20 dark:hover:bg-[#00916C]/20 dark:active:bg-[#00916C]/30 transition-colors">
                                                        <Clipboard size={20} />
                                                    </button>
                                                    <button title="Add Variable" onClick={handleAddEnv} className="p-2 rounded-lg text-[#00916C] hover:bg-[#00916C]/10 active:bg-[#00916C]/20 dark:hover:bg-[#00916C]/20 dark:active:bg-[#00916C]/30 transition-colors">
                                                        <Plus size={20} />
                                                    </button>
                                                </>
                                            )}
                                            {!isEditing && (
                                                <button title="Copy All" onClick={handleCopyEnvs} className="p-2 rounded-lg text-[#00916C] hover:bg-[#00916C]/10 active:bg-[#00916C]/20 dark:hover:bg-[#00916C]/20 dark:active:bg-[#00916C]/30 transition-colors">
                                                    <Copy size={20} />
                                                </button>
                                            )}

                                            <button
                                                title={isEditing ? "Save Changes" : "Edit Variables"}
                                                onClick={() => setIsEditing(!isEditing)}
                                                className="flex items-center gap-2 py-2 px-3 sm:px-4 rounded-lg font-semibold text-[#00916C] hover:bg-[#00916C]/10 dark:hover:bg-[#007356]/20 active:scale-95 transition-all duration-200"
                                            >
                                                {isEditing ? <Save size={16} /> : <Pencil size={16} />}
                                                <span>{isEditing ? 'Save' : 'Edit'}</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className={`flex-1 overflow-y-auto p-4 custom-scrollbar`}>
                                        {group.envs?.length > 0 ? (
                                            <div className="space-y-4 font-pt-mono text-xs sm:text-sm">
                                                {group.envs.map((env: any, index: number) => (
                                                    <div key={env.id || index} className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                        <input className="w-full h-10 bg-[#F0F0F0] dark:bg-[#2b2b2b] text-black dark:text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00916C] transition" type="text" placeholder="Key" value={env?.key ?? ""} readOnly={!isEditing} onChange={(e) => handleEnvChange(index, 'key', e.target.value)} />
                                                        <span className="hidden sm:block text-black dark:text-white font-semibold text-lg">=</span>

                                                        <input className="w-full h-10 bg-[#F0F0F0] dark:bg-[#2b2b2b] text-black dark:text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00916C] transition" type={isEditing ? 'text' : 'password'} placeholder="Value" value={env?.value ?? ""} readOnly={!isEditing} onChange={(e) => handleEnvChange(index, 'value', e.target.value)} />
                                                        {isEditing && (
                                                            <div className="self-end sm:self-center">
                                                                <button title="Remove Variable" onClick={() => handleRemoveEnv(index)} className="p-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-100 dark:hover:text-red-500 dark:hover:bg-red-900/40 transition-colors">
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-center"><svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 text-[#00916C]"><path d="M4 7V4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v4" /><path d="M4 10v4a2 2 0 0 0 2 2h2" /><path d="M11 16H6a2 2 0 0 1-2-2v-4" /><path d="M13.4 22H6a2 2 0 0 1-2-2V7" /><path d="M18 16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-1" /><path d="m22 17-4.5 4.5" /><path d="m17.5 17 4.5 4.5" /></svg><h4 className="font-semibold text-lg text-black dark:text-white">No Variables Yet</h4><p className="text-sm mt-1 text-black/70 dark:text-white/70">Click 'Edit' then the 'Add' button to create your first variable.</p></div>
                                        )}
                                    </div>
                                </div>

                                <div className='col-span-1 bg-white dark:bg-[#1e1e1e] sm:col-span-1 md:col-span-4 lg:col-span-4 lg:row-span-6 xl:col-span-2 rounded-lg hover:rounded-xl border-2 border-[#00916C] dark:border-[#00916C] transition-all duration-300 row-span-2 h-full flex flex-col p-4 gap-3 overflow-y-auto custom-scrollbar'>
                                    <h2 className="text-lg font-semibold text-[#00916C] dark:text-white mb-2">Members</h2>

                                    <button
                                        onClick={() => setDialogOpen(true)}
                                        type="button"
                                        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-3 text-gray-500 transition-colors duration-200 hover:border-[#00916C] hover:bg-[#00916C]/10 hover:text-[#00916C] dark:border-gray-600 dark:text-gray-400 dark:hover:border-[#00916C] dark:hover:bg-[#00916C]/20 dark:hover:text-[#5fc9a9]"
                                    >
                                        <PlusCircle size={20} />
                                        <span className="font-semibold">Add Member</span>
                                    </button>

                                    {group.members.map((member: any) => (
                                        <div
                                            key={member.email}
                                            className="flex items-center justify-between p-2.5 rounded-xl transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#00916C] text-white font-semibold text-sm select-none">
                                                    {getInitials(member.name)}
                                                </div>

                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-800 dark:text-gray-100">{member.name}</span>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">{member.email}</span>
                                                </div>
                                            </div>

                                            {isEditing && (
                                                <button
                                                    onClick={() => handleRemoveMember(member.email)}
                                                    aria-label={`Remove ${member.name}`}
                                                    title={`Remove ${member.name}`}
                                                    className="p-2 text-gray-500 rounded-full transition-colors duration-200 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-500"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
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
                        className="p-3 border-1 border-[#00916C] dark:border-[#00916C] rounded-xl bg-white dark:bg-[#1e1e1e] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00916C] dark:focus:ring-[#00916C] transition"
                        required
                    />
                </div>

            </DialogBox>

        </>
    )
}

export default GroupPage