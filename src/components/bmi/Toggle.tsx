import React from 'react';

interface ToggleProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string;
  onChange: (value: string) => void;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  options,
  selected,
  onChange,
}) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">
        {label}
      </label>
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`flex-1 py-3 px-4 font-bold text-sm uppercase tracking-wide transition-all ${
              selected === option.value
                ? 'bg-black text-yellow-400'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
