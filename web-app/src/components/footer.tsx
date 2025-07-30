import React from "react";
import { Facebook, Twitter, Linkedin, Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="font-inter bg-gray-800 dark:bg-[#0A0A0A] py-12 md:py-16 text-white">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start text-center md:text-left">
          {/* Company Info */}
          <div className="mb-8 md:mb-0">
            <h3 className="text-2xl font-bold text-green-400 mb-2">.envShare</h3>
            <p className="text-gray-300 text-sm max-w-xs">
              Securely manage and synchronize your environment variables.
              End the chaos of scattered secrets.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 md:flex md:space-x-12 mb-8 md:mb-0">
            <div>
              <h4 className="font-semibold text-lg mb-3">Product</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li><a href="#" className="hover:text-green-400 transition-colors duration-200">Features</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors duration-200">Pricing</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors duration-200">Integrations</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors duration-200">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Company</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li><a href="#" className="hover:text-green-400 transition-colors duration-200">About Us</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors duration-200">Careers</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors duration-200">Blog</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors duration-200">Contact</a></li>
              </ul>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="flex space-x-4">
            <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-green-400 transition-colors duration-200">
              <Facebook className="w-6 h-6" />
            </a>
            <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-green-400 transition-colors duration-200">
              <Twitter className="w-6 h-6" />
            </a>
            <a href="#" aria-label="LinkedIn" className="text-gray-400 hover:text-green-400 transition-colors duration-200">
              <Linkedin className="w-6 h-6" />
            </a>
            <a href="#" aria-label="GitHub" className="text-gray-400 hover:text-green-400 transition-colors duration-200">
              <Github className="w-6 h-6" />
            </a>
          </div>
        </div>

        <div className="border-t border-gray-700 dark:border-gray-900 mt-12 pt-8 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} .envShare. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
