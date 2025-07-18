import React from 'react'
import { Loader2 } from 'lucide-react'

const LoadingPage = () => {
  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-gray-100 dark:bg-[#121212] text-[#00916C] transition-all">
      <Loader2 className="animate-spin w-12 h-12 mb-4" />
      <p className="text-xl font-semibold dark:text-[#00916C]">Loading, please wait...</p>
    </div>
  )
}

export default LoadingPage
