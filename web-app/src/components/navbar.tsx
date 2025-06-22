import React from 'react'
import Button from './button'

const Navbar = () => {
    return (
        <>
            <div className='bg-[#00916C] flex items-center justify-between p-4 px-6 m-4 rounded-xl'>
                <div className='text-white text-md lg:text-xl font-bold font-inter'>.envShare</div>
                <div className='flex items-center justify-between gap-2'>
                    <Button variant="outline" className='text-white text-sm'>Home</Button>
                    <Button variant="outline" className='text-white text-sm'>Features</Button>
                    <Button variant="outline" className='text-white text-sm'>FAQs</Button>
                </div>
                <div className='flex items-center justify-center gap-4'>
                    <Button variant="secondary" className='text-sm'>Login</Button>
                    <Button variant="primary" className='text-sm'>Sign Up</Button>
                </div>
            </div>
        </>
    )
}

export default Navbar