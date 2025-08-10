import React from 'react';

interface ActionButtonsProps {
  onDelete: () => void;
  onCancel: () => void;
  deleteText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  onDelete, 
  onCancel, 
  deleteText = "Delete",
  cancelText = "Exit",
  isLoading = false
}) => {
  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!isLoading) {
      onDelete();
    }
  };

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!isLoading) {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isLoading) {
        action();
      }
    }
  };

  return (
    <div className="flex flex-col items-start gap-3 self-stretch relative px-3 py-4 max-md:px-2 max-md:py-3 max-sm:gap-2 max-sm:px-1 max-sm:py-2">
      <button
        type="button"
        onClick={handleDelete}
        onKeyDown={(e) => handleKeyDown(e, onDelete)}
        disabled={isLoading}
        className="flex h-[52px] justify-center items-center gap-2 self-stretch border relative cursor-pointer transition-all duration-200 ease-[ease-in-out] bg-[#D92D20] px-[18px] py-2.5 rounded-lg border-solid border-[#EFEFF4] max-md:h-12 max-md:px-4 max-md:py-2 max-sm:h-11 max-sm:px-3.5 max-sm:py-1.5 hover:bg-[#B91C1C] focus:outline-none focus:ring-2 focus:ring-[#D92D20] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={`${deleteText} template permanently`}
      >
        <span className="text-white text-base font-normal leading-6 relative max-md:text-[15px] max-md:leading-[22px] max-sm:text-sm max-sm:leading-5">
          {isLoading ? 'Deleting...' : deleteText}
        </span>
      </button>
      
      <button
        type="button"
        onClick={handleCancel}
        onKeyDown={(e) => handleKeyDown(e, onCancel)}
        disabled={isLoading}
        className="flex h-[52px] justify-center items-center gap-2 self-stretch border relative cursor-pointer transition-all duration-200 ease-[ease-in-out] bg-[#F9F9FB] px-[18px] py-2.5 rounded-lg border-solid border-[#EFEFF4] max-md:h-12 max-md:px-4 max-md:py-2 max-sm:h-11 max-sm:px-3.5 max-sm:py-1.5 hover:bg-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#6B7280] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Cancel deletion and close modal"
      >
        <span className="text-[#252525] text-base font-normal leading-6 relative max-md:text-[15px] max-md:leading-[22px] max-sm:text-sm max-sm:leading-5">
          {cancelText}
        </span>
      </button>
    </div>
  );
}; 