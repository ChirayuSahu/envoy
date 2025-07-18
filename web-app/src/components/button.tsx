import React from "react";
import clsx from "clsx";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
};

const Button = ({ children, variant = "primary", className, onClick, disabled }: ButtonProps) => {
  const base = "py-2 px-4 rounded font-medium transition-all cursor-pointer";

  const variants = {
    primary:
      "bg-[#00916C] text-white hover:bg-[#007a5a] focus:outline-none text-sm md:text-md lg:px-6 dark:bg-[#027a5d] dark:hover:bg-[#02614b]",

    secondary:
      "bg-white text-[#00916C] hover:bg-gray-100 focus:ring-1 focus:outline-[#00916C] text-sm md:text-md lg:px-6 dark:bg-[#2a2a2a] dark:text-[#7bdcb5] dark:hover:bg-[#383838]",

    outline:
      "border border-[#00916C] text-[#00916C] hover:bg-[#00916C] hover:text-white text-sm md:text-md lg:px-6 dark:border-[#5fc9a9] dark:text-[#5fc9a9] dark:hover:bg-[#5fc9a9] dark:hover:text-black",

    danger:
      "bg-red-600 text-white hover:bg-red-700 dark:bg-[#a92525] dark:hover:bg-[#911d1d]",
  };



  return (
    <button className={clsx(base, variants[variant], className)} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;
