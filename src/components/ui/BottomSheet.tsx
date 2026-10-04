import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BottomSheet = ({ isOpen, onClose, title, children }: BottomSheetProps) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />
      <div className={clsx(
        "fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-xl transform transition-transform duration-300 ease-out max-h-[90vh] flex flex-col",
        isOpen ? "translate-y-0" : "translate-y-full"
      )}>
        <div className="flex justify-center p-3 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>
        
        <div className="flex items-center justify-between px-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[var(--deep-navy)]">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-6 safe-pb">
          {children}
        </div>
      </div>
    </>
  );
};
