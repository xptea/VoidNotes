import React from 'react';

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({ onClick, active = false, disabled = false, title, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-1.5 rounded-md transition-colors ${
      active ? 'bg-white/30 text-white' : 'text-white/70 hover:bg-white/20 hover:text-white'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    title={title}
    type="button"
  >
    {children}
  </button>
);