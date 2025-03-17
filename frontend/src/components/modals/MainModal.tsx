import React, { useState } from 'react';

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  placeholder?: string;
  confirmText?: string;
  initialValue?: string;
  inputType?: 'text' | 'url';
}

const InputModal: React.FC<InputModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  placeholder = '',
  confirmText = 'Confirm',
  initialValue = '',
  inputType = 'text'
}) => {
  const [value, setValue] = useState(initialValue);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onConfirm(value.trim());
      setValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md rounded-lg w-full max-w-sm p-6 text-white shadow-lg border border-white/20">
        <h3 className="text-lg font-medium mb-4">{title}</h3>
        <input
          type={inputType}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-white/15 border border-white/20 rounded-md px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white/50 mb-6"
          placeholder={placeholder}
          autoFocus
        />
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputModal;