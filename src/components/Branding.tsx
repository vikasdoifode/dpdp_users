import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    showText?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
    onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ className, showText = true, size = "md", onClick }) => {
    const sizeMap = {
        sm: "h-8",
        md: "h-10",
        lg: "h-16",
        xl: "h-24",
    };

    return (
        <div
            className={cn("flex items-center gap-3", onClick && "cursor-pointer select-none", className)}
            onClick={onClick}
        >
            <div className={cn("relative flex-shrink-0 overflow-hidden rounded-xl bg-slate-900 border border-white/10 shadow-lg transition-transform hover:scale-105 duration-300", sizeMap[size], "aspect-square")}>
                <img
                    src="/logo.png"
                    alt="DataKavatch Logo"
                    className="h-full w-full object-contain p-1.5"
                />
            </div>
            {showText && (
                <div className="flex flex-col text-left">
                    <span className={cn("font-black tracking-tight text-slate-800 leading-none",
                        size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg")}>
                        Data<span className="text-primary">Kavatch</span>
                    </span>
                    <span className={cn("font-bold text-slate-400 uppercase tracking-widest mt-0.5",
                        size === "sm" ? "text-[8px]" : "text-[10px]")}>
                        Privacy Compliance
                    </span>
                </div>
            )}
        </div>
    );
};
