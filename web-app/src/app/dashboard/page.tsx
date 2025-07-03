import React from 'react'
import SidebarComp from '@/components/dashboard/sidebar'
import WorkspacesSection from '@/components/dashboard/workspaces'

const DashboardPage = () => {
  return (
    <>
    <div className='bg-[#F0F0F0] h-screen p-6 grid sm:grid-cols-5 xl:grid-cols-12 gap-6'>
        <SidebarComp/>
        <WorkspacesSection/>
    </div>
    </>
  )
}

export default DashboardPage