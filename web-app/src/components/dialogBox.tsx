import React from "react";
import Button from "./button";

interface DialogBoxProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    onAction: () => void;
    loading?: boolean;
    actionLabel?: string;
    children?: React.ReactNode;
}

const DialogBox: React.FC<DialogBoxProps> = ({
    title,
    isOpen,
    onClose,
    onAction,
    loading = false,
    actionLabel = "Submit",
    children,
}) => {
    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black opacity-70 dark:opacity-80 transition-all duration-300" />
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <div className="bg-[#FAFAFA] dark:bg-[#1e1e1e] rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 md:p-10">
                    <h1 className="text-xl md:text-2xl font-black text-center text-black dark:text-white mb-6">
                        {title}
                    </h1>

                    <div className="flex flex-col gap-4">
                        {children}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 mt-6 w-full">
                        <Button
                            onClick={onAction}
                            disabled={loading}
                            variant="primary"
                            className="w-full"
                        >
                            {loading ? "Processing..." : actionLabel}
                        </Button>
                        <Button
                            onClick={onClose}
                            disabled={loading}
                            variant="outline"
                            className="w-full"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>

        </>
    );
};

export default DialogBox;
