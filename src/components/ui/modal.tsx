'use client';

import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSave?: () => void;
  saveText?: string;
}

export function Modal({ isOpen, onClose, title, children, onSave, saveText = 'Save' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[#2c2825]/45 z-[500] flex items-center justify-center backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-[#e8e1d7] rounded-[20px] p-7 w-[92%] max-w-[480px] max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-up">
        <div className="font-serif-playfair text-[18px] font-medium text-[#2c2825] mb-5 flex justify-between items-center">
          <span>{title}</span>
          <button
            onClick={onClose}
            className="text-[#b5a898] hover:text-[#2c2825] transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>{children}</div>
        <div className="flex gap-2.5 mt-5">
          <button
            onClick={onClose}
            className="flex-1 justify-center inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[9px] text-[12.5px] font-medium cursor-pointer border border-[#e8e1d7] bg-white text-[#4a4440] hover:bg-[#f0ebe3] transition-all"
          >
            Cancel
          </button>
          {onSave && (
            <button
              onClick={onSave}
              className="flex-1 justify-center inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[9px] text-[12.5px] font-medium cursor-pointer bg-[#2c2825] text-[#f7f4ef] hover:bg-[#4a4440] transition-all"
            >
              {saveText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
