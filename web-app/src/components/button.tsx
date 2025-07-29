import React from "react";
import clsx from "clsx";

// Extend from standard button props to allow any valid button attribute (e.g., aria-label)
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger" | "modern";
};

const Button = ({
  children,
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonProps) => {
  const base =
    "cursor-pointer inline-flex items-center justify-center px-4 py-2 rounded-md font-semibold transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-[#00916C] text-white hover:bg-[#007a5a] focus-visible:ring-[#00916C] dark:bg-[#027a5d] dark:hover:bg-[#02614b]",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 focus-visible:ring-gray-400 dark:bg-[#2a2a2a] dark:text-gray-100 dark:hover:bg-[#383838] dark:focus-visible:ring-gray-500",
    outline:
      "border border-[#00916C] text-[#00916C] bg-transparent hover:bg-[#00916C] hover:text-white focus-visible:ring-[#00916C] dark:border-[#00916C] dark:text-[#5fc9a9] dark:hover:bg-[#00916C]",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800",
    modern:
      "p-2 rounded-lg text-[#00916C] hover:bg-[#00916C]/10 active:bg-[#00916C]/20 dark:hover:bg-[#00916C]/20 dark:active:bg-[#00916C]/30 transition-colors",
  };

  return (
    <button
      type={type}
      className={clsx(base, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
