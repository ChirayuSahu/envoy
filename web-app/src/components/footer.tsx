import React from "react";
import { Github } from "lucide-react";
import Image from "next/image";

const Footer = () => {
    return (
        <footer className="font-inter bg-gray-800 dark:bg-[#0A0A0A] py-12 md:py-16 text-white">
            <div className="max-w-5xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start text-center md:text-left">

                    <div className="mb-8 md:mb-0">
                        <h3 className="flex items-center text-2xl font-bold mb-2">
                            <Image
                                src="/assets/envoy-logo.svg"
                                alt="Envoy Logo"
                                width={100}
                                height={100}
                                className='w-6 h-6 mr-2'
                                draggable={false}
                            />
                            {process.env.NEXT_PUBLIC_APP_NAME}
                        </h3>
                        <p className="text-gray-300 text-sm max-w-xs">
                            Securely manage and synchronize your environment variables.
                            End the chaos of scattered secrets.
                        </p>
                    </div>

                    <div className="flex space-x-4">
                        <a href="#" aria-label="GitHub" className="text-gray-400 hover:text-green-400 transition-colors duration-200">
                            <Github className="w-6 h-6" />
                        </a>
                    </div>
                </div>
                <div className="border-t border-gray-300 dark:border-gray-700 mt-12 pt-8 text-center text-gray-300 dark:text-gray-400 text-sm group relative">
                    Made with
                    <span className="inline-flex items-center text-red-500 align-middle">
                        <Image
                            src="/assets/heart.svg"
                            alt="Love"
                            width={16}
                            height={16}
                            className="mx-2 text-red-500 group-hover:scale-200 group-hover:mx-4 transition-all duration-700"
                        />
                    </span>
                    by{" "}
                    <a
                        href="https://www.dscvit.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium relative inline-block"
                    >
                        GDSC-VIT
                        <span className="absolute left-0 -bottom-[1px] w-0 h-[1px] bg-current transition-all duration-300 group-hover:w-full"></span>
                    </a>
                </div>
            </div>
        </footer >
    );
};

export default Footer;
