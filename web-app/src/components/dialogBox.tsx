"use client"

import React, { useEffect, useId } from "react";
import Button from "./button";
import { X } from "lucide-react";

interface DialogBoxProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    onAction: () => void;
    loading?: boolean;
    actionLabel?: string;
    children?: React.ReactNode;
    variant?: "primary" | "danger";
    isActionDisabled?: boolean;
}

const DialogBox: React.FC<DialogBoxProps> = ({
    title,
    isOpen,
    onClose,
    onAction,
    loading = false,
    actionLabel = "Submit",
    children,
    variant = "primary",
    isActionDisabled = false,
}) => {
    const titleId = useId();

    useEffect(() => {
        const handleKeydown = (event: KeyboardEvent) => {
            if (!isOpen) return;

            if (event.key === 'Escape') {
                onClose();
            }

            if (event.key === 'Enter') {
                if (!isActionDisabled && !loading) {
                    onAction();
                }
            }
        };
        window.addEventListener('keydown', handleKeydown);

        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    }, [isOpen, onClose, onAction, isActionDisabled, loading]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
        >
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8">

                <div className="flex items-start justify-between mb-4">
                    <h2 id={titleId} className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:text-gray-500 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Close dialog"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-300 my-6">
                    {children}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="flex flex-col-reverse sm:flex-row gap-3">
                        <Button
                            onClick={onClose}
                            disabled={loading}
                            variant="modern"
                            className="w-full"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={onAction}
                            disabled={isActionDisabled || loading}
                            variant={variant}
                            className="w-full"
                        >
                            {loading ? "Processing..." : actionLabel}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DialogBox;
