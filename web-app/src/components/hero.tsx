import React from 'react'
import Image from 'next/image'

const HeroSection = () => {
    return (
        <>
            <div className='flex justify-center items-center gap-30 m-20'>
                <div className='flex items-center justify-start max-w-[40vw]'>
                    <div className='flex flex-col items-center justify-center'>
                        <h1 className='text-2xl lg:text-4xl font-bold text-wrap '>A Platform for Managing and Sharing Environment Variables Securely.</h1>
                        <p className='text-sm text-gray-500 mt-4'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam, atque omnis. Ducimus dolorum ipsa molestiae rerum eum expedita fug</p>
                    </div>
                </div>
                <div className='flex items-center justify-center min-w-[30vw]'>
                    <Image
                        src="/assets/hero-img.svg"
                        alt="Hero Image"
                        width={400}
                        height={400}
                        className='lg:w-75'
                    />
                </div>
            </div>
        </>
    )
}

export default HeroSection