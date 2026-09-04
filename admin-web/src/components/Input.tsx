import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full min-w-0">
      {label && <label className="block text-xs font-semibold text-[#111111] mb-1 sm:mb-1.5 truncate">{label}</label>}
      <input
        className={`w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-sm text-[#111111] placeholder:text-gray-400 focus:outline-none focus:border-[#F4C542] focus:bg-white transition-all ${
          error ? 'border-rose-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-rose-500 mt-1 block break-words">{error}</span>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { label: string; value: string | number }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => {
  return (
    <div className="w-full min-w-0">
      {label && <label className="block text-xs font-semibold text-[#111111] mb-1 sm:mb-1.5 truncate">{label}</label>}
      <select
        className={`w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#F4C542] focus:bg-white transition-all ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
