"use client";

import { forwardRef, InputHTMLAttributes, SelectHTMLAttributes } from "react";

interface BaseProps {
    label: string;
    error?: string;
    required?: boolean;
}

interface InputProps
    extends BaseProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, "required"> {
    as?: "input";
}

interface SelectProps
    extends BaseProps,
    Omit<SelectHTMLAttributes<HTMLSelectElement>, "required"> {
    as: "select";
    children: React.ReactNode;
}

type Props = InputProps | SelectProps;

const Input = forwardRef<HTMLInputElement | HTMLSelectElement, Props>(
    function Input(props, ref) {
        const { label, error, required, as = "input", ...rest } = props;

        const baseClass = `
      w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-white/30
      transition-all duration-300 outline-none text-sm font-light tracking-wide
      focus:ring-2 focus:ring-yellow-400/60 focus:border-yellow-400/60 focus:bg-white/8
      hover:border-white/30
      ${error ? "border-red-400/70 focus:ring-red-400/40" : "border-white/10"}
    `;

        return (
            <div className="flex flex-col gap-1.5 w-full">
                <label className="text-white/70 text-xs font-medium tracking-widest uppercase">
                    {label}
                    {required && <span className="text-yellow-400 ml-1">*</span>}
                </label>

                {as === "select" ? (
                    <select
                        ref={ref as React.Ref<HTMLSelectElement>}
                        required={required}
                        {...(rest as SelectHTMLAttributes<HTMLSelectElement>)}
                        className={`${baseClass} appearance-none cursor-pointer`}
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23facc15'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 12px center",
                            backgroundSize: "16px",
                        }}
                    >
                        {(props as SelectProps).children}
                    </select>
                ) : (
                    <input
                        ref={ref as React.Ref<HTMLInputElement>}
                        required={required}
                        {...(rest as InputHTMLAttributes<HTMLInputElement>)}
                        className={baseClass}
                    />
                )}

                {error && (
                    <p className="text-red-400 text-xs mt-0.5 flex items-center gap-1">
                        <svg
                            className="w-3 h-3 shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

export default Input;