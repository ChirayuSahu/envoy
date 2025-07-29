"use client"
import React from 'react'
import Image from 'next/image'
import Button from './button'
import Link from 'next/link'

const FeatureSection = () => {
    return (
        <>
            <div className='relative bg-[#F5F7FA]'>
            </div>

            <div className='font-inter w-full flex flex-col lg:flex-row justify-center items-center gap-12 lg:gap-10 p-8 md:p-12 lg:p-20 bg-[#00916C]'>

                <div className='flex items-center justify-center w-full lg:w-1/2'>
                    <Image
                        src="/assets/feature.svg"
                        alt="Feature illustration showing secure collaboration"
                        width={500}
                        height={500}
                        className='w-100 h-100 max-w-xs md:max-w-sm lg:max-w-full'
                        draggable={false}
                    />
                </div>

                <div className='flex flex-col w-full lg:w-1/2 text-center lg:text-left items-center lg:items-start'>
                    <h1 className='text-white text-3xl lg:text-4xl xl:text-5xl font-bold text-wrap'>
                        Sharing environment variables securely
                    </h1>
                    <p className='text-base text-gray-200 mt-6 max-w-xl'>
                        Stop sending sensitive API keys and database credentials through insecure channels like Slack or email. Our platform provides an encrypted, centralized vault for all your environment variables, ensuring your team is always in sync. Streamline your workflow, eliminate configuration errors, and keep your secrets safe.
                    </p>
                    <div className='flex gap-2 mt-8'>
                        <Link href="/login">
                            <Button variant='secondary' className='text-black rounded-lg py-3 px-8 text-lg font-semibold'>
                                Try Now
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default FeatureSection
