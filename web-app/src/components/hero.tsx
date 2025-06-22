import React from 'react'
import Image from 'next/image'

const HeroSection = () => {
    return (
        <>
            <div className='flex justify-center items-center gap-30 m-20'>
                <div className='flex items-center justify-start max-w-[40vw]'>
                    <div className='flex flex-col items-center justify-center'>
                        <h1 className='text-5xl font-bold text-wrap '>A Platform for Managing and Sharing Environment Variables Securely.</h1>
                        <p className='text-lg text-gray-500 mt-4'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam, atque omnis. Ducimus dolorum ipsa molestiae rerum eum expedita fuga possimus tenetur est voluptates consequatur voluptatem quos excepturi error incidunt culpa exercitationem quia, facilis quasi aliquid? Laborum quas corporis commodi eligendi nulla obcaecati quam dolore vel!</p>
                    </div>
                </div>
                <div className='flex items-center justify-center min-w-[30vw]'>
                    <Image
                        src="/assets/hero-img.svg"
                        alt="Hero Image"
                        width={400}
                        height={400}
                        className=''
                    />
                </div>
            </div>
        </>
    )
}

export default HeroSection