"use client"
import React, { useState, useEffect, ReactNode } from 'react'
import SidebarComp from '@/components/dashboard/sidebar'
import { toast } from 'sonner'
import { User, Mail, Briefcase, Users, Calendar, KeyRound, ShieldCheck } from 'lucide-react'
import Button from '@/components/button'

interface UserProfile {
    _id: string;
    name: string;
    email: string;
    provider: 'google' | 'credentials' | string;
    workspaces: string[];
    otherGroups: string[];
    createdAt: string;
    updatedAt: string;
}

interface InfoRowProps {
    icon: ReactNode;
    label: string;
    value: string | number;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => (
    <div className="flex items-center gap-4">
        <div className="bg-gray-100 dark:bg-gray-800 p-2.5 rounded-md flex-shrink-0">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="font-semibold text-gray-800 dark:text-gray-200">{value}</p>
        </div>
    </div>
);

const InfoRowSkeleton: React.FC = () => (
    <div className="flex items-center gap-4">
        <div className="bg-gray-200 dark:bg-gray-700 p-2.5 rounded-md w-10 h-10 animate-pulse"></div>
        <div className="flex-grow">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2 animate-pulse"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
        </div>
    </div>
);

const AccountPageSkeleton: React.FC = () => (
    <div className="flex-grow space-y-6 animate-pulse">
        <div className="bg-white dark:bg-[#1f1f1f] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="grid md:grid-cols-2 gap-6">
                <InfoRowSkeleton />
                <InfoRowSkeleton />
            </div>
        </div>

        <div className="bg-white dark:bg-[#1f1f1f] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoRowSkeleton />
                <InfoRowSkeleton />
                <InfoRowSkeleton />
            </div>
        </div>
        <div className="bg-white dark:bg-[#1f1f1f] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
    </div>
);

const MyAccountPage = () => {

    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/me');
                const data = await res.json();
                if (!res.ok) {
                    toast.error(data.message || 'Failed to fetch user data');
                }
                setUser(data.user);
            } catch (error) {
                console.error('Error fetching user data:', error);
                toast.error('An error occurred while fetching your account information.');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [])

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <>
            <div className="bg-[#F0F0F0] dark:bg-[#121212] min-h-screen pb-18 sm:pb-6 p-6 grid grid-cols-1 sm:grid-cols-5 xl:grid-cols-12 gap-6">
                <SidebarComp />
                <div className="col-span-1 sm:col-span-4 xl:col-span-10 p-4 h-full rounded-2xl flex flex-col gap-6">
                    <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                            <User className="w-6 h-6 text-[#00916C]" />
                        </div>
                        <div>
                            <h1 className="font-bold text-xl text-black dark:text-white">Account Information</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Manage your profile, workspace, and security settings.
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <AccountPageSkeleton />
                    ) : user && (
                        <div className="flex-grow space-y-6">
                            <div className="bg-white dark:bg-[#1f1f1f] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto">
                                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Profile Details</h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <InfoRow icon={<User className="w-5 h-5 text-[#00916C]" />} label="Name" value={user.name} />
                                    <InfoRow icon={<Mail className="w-5 h-5 text-[#00916C]" />} label="Email" value={user.email} />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-[#1f1f1f] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Usage & History</h2>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <InfoRow icon={<Briefcase className="w-5 h-5 text-[#00916C]" />} label="Your Workspaces" value={`${user.workspaces.length} Created`} />
                                    <InfoRow icon={<Users className="w-5 h-5 text-[#00916C]" />} label="Shared Groups" value={`${user.otherGroups.length} Joined`} />
                                    <InfoRow icon={<Calendar className="w-5 h-5 text-[#00916C]" />} label="Account Created" value={formatDate(user.createdAt)} />
                                </div>
                            </div>

                            <div className="bg-white mb-12 sm:mb-0 dark:bg-[#1f1f1f] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Security</h2>
                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <div className="bg-gray-100 dark:bg-gray-800 p-2.5 rounded-md flex-shrink-0">
                                        <ShieldCheck className="w-5 h-5 text-[#00916C]" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Authentication Provider</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Your account is securely managed by{" "}
                                            <span className="capitalize font-medium text-gray-700 dark:text-gray-300">{user.provider}</span>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </>
    )
}

export default MyAccountPage