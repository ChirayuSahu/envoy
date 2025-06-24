import React from 'react'
import Image from 'next/image'
import Button from './button'

const FeatureSection = () => {
    return (
        <>
            <div className='relative bg-[#F5F7FA]'>
            </div>

            <div className='w-full flex justify-center items-center gap-10 p-20 bg-[#00916C]'>
                <div className='flex items-center justify-center min-w-[40vw]'>
                    <Image
                        src="/assets/feature.svg"
                        alt="Feature Image"
                        width={500}
                        height={500}
                        className='w-100'
                        draggable={false}
                    />
                </div>
                <div className='flex items-center justify-start'>
                    <div className='flex flex-col'>
                        <h1 className='text-white text-2xl lg:text-4xl xl:text-5xl font-bold text-wrap '>Sharing environmental variables securely</h1>
                        <p className='text-sm text-white mt-8'>Donec a eros justo. Fusce egestas tristique ultrices. Nam tempor, augue nec tincidunt molestie, massa nunc varius arcu, at scelerisque elit erat a magna. Donec quis erat at libero ultrices mollis. In hac habitasse platea dictumst. Vivamus vehicula leo dui, at porta nisi facilisis finibus. In euismod augue vitae nisi ultricies, non aliquet urna tincidunt. Integer in nisi eget nulla commodo faucibus efficitur quis massa. Praesent felis est, finibus et nisi ac, hendrerit venenatis libero. Donec consectetur faucibus ipsum id gravida.</p>
                        <div className='flex gap-2 mt-6'>
                            <Button variant='secondary' className='text-black rounded-xl py-3 text-lg font-bold'>Sign Up</Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default FeatureSection