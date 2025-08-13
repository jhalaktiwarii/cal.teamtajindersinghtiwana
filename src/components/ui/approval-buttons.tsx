import React from "react";
import { CheckCircle2, XCircle, Check, X, CheckCircle, XCircle as XCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApprovalButtonProps {
  type: "approve" | "decline";
  onClick: () => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ApprovalButton({ 
  type, 
  onClick, 
  disabled = false, 
  size = "md",
  className 
}: ApprovalButtonProps) {
  const isApprove = type === "approve";
  
  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-sm gap-1.5",
    lg: "px-4 py-2 text-base gap-2"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  const baseClasses = cn(
    "inline-flex items-center font-bold rounded-lg border-2 transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "transform hover:scale-105 active:scale-95",
    sizeClasses[size],
    className
  );

  const approveClasses = cn(
    baseClasses,
    "bg-gradient-to-r from-orange-500 to-amber-500",
    "border-orange-600 text-white shadow-lg",
    "hover:from-orange-400 hover:to-amber-400",
    "hover:shadow-orange-500/25 hover:shadow-xl",
    "focus:ring-orange-500",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
  );

  const declineClasses = cn(
    baseClasses,
    "bg-gradient-to-r from-red-600 to-red-700", 
    "border-red-700 text-white shadow-lg",
    "hover:from-red-500 hover:to-red-600",
    "hover:shadow-red-500/25 hover:shadow-xl",
    "focus:ring-red-500",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
  );

  const saffronClasses = cn(
    baseClasses,
    "bg-gradient-to-r from-orange-500 to-amber-500",
    "border-orange-600 text-white shadow-lg",
    "hover:from-orange-400 hover:to-amber-400", 
    "hover:shadow-orange-500/25 hover:shadow-xl",
    "focus:ring-orange-500",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
  );

  const buttonClasses = isApprove ? approveClasses : declineClasses;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
      title={isApprove ? "Approve Appointment" : "Decline Appointment"}
    >
      {isApprove ? (
        <>
          <CheckCircle className={iconSizes[size]} strokeWidth={2.5} />
          <span>Approve</span>
        </>
      ) : (
        <>
          <XCircleIcon className={iconSizes[size]} strokeWidth={2.5} />
          <span>Reject</span>
        </>
      )}
    </button>
  );
}

// BJP-inspired stamp-style buttons
export function StampButton({ 
  type, 
  onClick, 
  disabled = false,
  size = "md",
  className 
}: ApprovalButtonProps) {
  const isApprove = type === "approve";
  
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base"
  };

  const baseClasses = cn(
    "inline-flex items-center justify-center font-bold rounded-full border-2",
    "transition-all duration-300 transform",
    "hover:scale-110 hover:rotate-2",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "shadow-lg hover:shadow-2xl",
    sizeClasses[size],
    className
  );

  const approveStampClasses = cn(
    baseClasses,
    "bg-gradient-to-br from-orange-400 via-orange-500 to-amber-600",
    "border-orange-700 text-white",
    "hover:from-orange-300 hover:via-orange-400 hover:to-amber-500",
    "hover:shadow-orange-500/50",
    "focus:ring-orange-500",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
  );

  const declineStampClasses = cn(
    baseClasses,
    "bg-gradient-to-br from-red-500 via-red-600 to-red-700",
    "border-red-800 text-white", 
    "hover:from-red-400 hover:via-red-500 hover:to-red-600",
    "hover:shadow-red-500/50",
    "focus:ring-red-500",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
  );

  const buttonClasses = isApprove ? approveStampClasses : declineStampClasses;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
      title={isApprove ? "APPROVED" : " REJECTED"}
    >
      {isApprove ? " APPROVED" : " REJECTED"}
    </button>
  );
}

// Professional compact version for admin panels with status-based logic
export function CompactApprovalButtons({ 
  onApprove, 
  onDecline, 
  disabled = false,
  className,
  currentStatus = 'scheduled'
}: {
  onApprove: () => void;
  onDecline: () => void;
  disabled?: boolean;
  className?: string;
  currentStatus?: 'scheduled' | 'going' | 'not-going';
}) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      {/* Approve Button - Show for scheduled and not-going, hide for going */}
      {(currentStatus === 'scheduled' || currentStatus === 'not-going') && (
        <button
          onClick={onApprove}
          disabled={disabled}
          className={cn(
            "inline-flex items-center gap-2 px-3.5 py-2 rounded-md font-bold text-white text-xs",
            "bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 border border-orange-600",
            "shadow-sm hover:shadow-lg transition-all duration-200",
            "hover:from-orange-400 hover:via-orange-300 hover:to-amber-400 hover:border-orange-500",
            "hover:shadow-orange-500/25",
            "focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:hover:scale-100",
            "transform hover:scale-[1.03] active:scale-[0.97]"
          )}
          title="Approve Appointment"
        >
          <CheckCircle className="h-4 w-4" strokeWidth={2.5} />
          <span>Approve</span>
        </button>
      )}

      {/* Approved State - Show when status is going */}
      {currentStatus === 'going' && (
        <div className={cn(
          "inline-flex items-center gap-2 px-3.5 py-2 rounded-md font-bold text-xs",
          "bg-gradient-to-r from-green-500 to-emerald-600 border border-green-600",
          "text-white shadow-sm opacity-90 cursor-not-allowed"
        )}>
          <CheckCircle className="h-4 w-4" strokeWidth={2.5} />
          <span> Approved – Going</span>
        </div>
      )}
      
      {/* Reject Button - Show for scheduled and going, hide for not-going */}
      {(currentStatus === 'scheduled' || currentStatus === 'going') && (
        <button
          onClick={onDecline}
          disabled={disabled}
          className={cn(
            "inline-flex items-center gap-2 px-3.5 py-2 rounded-md font-bold text-white text-xs",
            "bg-gradient-to-r from-red-600 via-red-500 to-red-700 border border-red-700",
            "shadow-md hover:shadow-lg transition-all duration-200",
            "hover:from-red-500 hover:via-red-400 hover:to-red-600 hover:border-red-600",
            "hover:shadow-red-500/30",
            "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:hover:scale-100",
            "transform hover:scale-[1.03] active:scale-[0.97]"
          )}
          title="Reject Appointment"
        >
          <XCircleIcon className="h-4 w-4" strokeWidth={2.5} />
          <span>Reject</span>
        </button>
      )}

      {/* Rejected State - Show when status is not-going */}
      {currentStatus === 'not-going' && (
        <div className={cn(
          "inline-flex items-center gap-2 px-3.5 py-2 rounded-md font-bold text-xs",
          "bg-gradient-to-r from-red-500 to-red-600 border border-red-600",
          "text-white shadow-sm opacity-90 cursor-not-allowed"
        )}>
          <XCircleIcon className="h-4 w-4" strokeWidth={2.5} />
          <span>Rejected – Not Going</span>
        </div>
      )}
    </div>
  );
}

// Professional large version for prominent actions with status-based logic
export function LargeApprovalButtons({ 
  onApprove, 
  onDecline, 
  disabled = false,
  className,
  currentStatus = 'scheduled'
}: {
  onApprove: () => void;
  onDecline: () => void;
  disabled?: boolean;
  className?: string;
  currentStatus?: 'scheduled' | 'going' | 'not-going';
}) {
  return (
    <div className={cn("flex items-center gap-5", className)}>
      {/* Approve Button - Show for scheduled and not-going, hide for going */}
      {(currentStatus === 'scheduled' || currentStatus === 'not-going') && (
        <button
          onClick={onApprove}
          disabled={disabled}
          className={cn(
            "inline-flex items-center gap-2.5 px-6 py-3 rounded-lg font-bold text-white text-sm",
            "bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 border border-orange-600",
            "shadow-md hover:shadow-xl transition-all duration-200",
            "hover:from-orange-400 hover:via-orange-300 hover:to-amber-400 hover:border-orange-500",
            "hover:shadow-orange-500/30",
            "focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:hover:scale-100",
            "transform hover:scale-[1.03] active:scale-[0.97]"
          )}
          title="Approve Appointment"
        >
          <CheckCircle className="h-5 w-5" strokeWidth={2.5} />
          <span>Approve</span>
        </button>
      )}

      {/* Approved State - Show when status is going */}
      {currentStatus === 'going' && (
        <div className={cn(
          "inline-flex items-center px-6 py-3 rounded-lg font-bold text-sm",
          "bg-gradient-to-r from-green-500 to-emerald-600 border border-green-600",
          "text-white shadow-md opacity-90 cursor-not-allowed"
        )}>
          <CheckCircle className="h-5 w-5" strokeWidth={2.5} />
          <span> Approved – Going</span>
        </div>
      )}
      
      {/* Reject Button - Show for scheduled and going, hide for not-going */}
      {(currentStatus === 'scheduled' || currentStatus === 'going') && (
        <button
          onClick={onDecline}
          disabled={disabled}
          className={cn(
            "inline-flex items-center gap-2.5 px-6 py-3 rounded-lg font-bold text-white text-sm",
            "bg-gradient-to-r from-red-600 via-red-500 to-red-700 border border-red-700",
            "shadow-lg hover:shadow-xl transition-all duration-200",
            "hover:from-red-500 hover:via-red-400 hover:to-red-600 hover:border-red-600",
            "hover:shadow-red-500/40",
            "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:hover:scale-100",
            "transform hover:scale-[1.03] active:scale-[0.97]"
          )}
          title="Reject Appointment"
        >
          <XCircleIcon className="h-5 w-5" strokeWidth={2.5} />
          <span> Reject</span>
        </button>
      )}

      {/* Rejected State - Show when status is not-going */}
      {currentStatus === 'not-going' && (
        <div className={cn(
          "inline-flex items-center gap-2.5 px-6 py-3 rounded-lg font-bold text-sm",
          "bg-gradient-to-r from-red-500 to-red-600 border border-red-600",
          "text-white shadow-md opacity-90 cursor-not-allowed"
        )}>
          <XCircleIcon className="h-5 w-5" strokeWidth={2.5} />
          <span> Rejected – Not Going</span>
        </div>
      )}
    </div>
  );
}

// Official BJP stamp-style buttons for formal decisions
export function BJPApprovalButtons({ 
  onApprove, 
  onDecline, 
  disabled = false,
  className 
}: {
  onApprove: () => void;
  onDecline: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <button
        onClick={onApprove}
        disabled={disabled}
        className={cn(
          "inline-flex items-center gap-2.5 px-5 py-3 rounded-lg font-bold text-white text-sm",
          "bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600",
          "border-2 border-orange-700 shadow-lg",
          "hover:from-orange-400 hover:via-amber-400 hover:to-orange-500",
          "hover:shadow-orange-500/40 hover:shadow-xl",
          "hover:scale-[1.03] transform transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
          "relative overflow-hidden"
        )}
        title="Official Approval - BJYM"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/15 to-amber-400/15 opacity-0 hover:opacity-100 transition-opacity duration-200" />
        <CheckCircle className="h-5 w-5 relative z-10" strokeWidth={2.5} />
        <span className="relative z-10"> APPROVED</span>
      </button>
      
      <button
        onClick={onDecline}
        disabled={disabled}
        className={cn(
          "inline-flex items-center gap-2.5 px-5 py-3 rounded-lg font-bold text-white text-sm",
          "bg-gradient-to-br from-red-600 via-red-700 to-red-800",
          "border-2 border-red-800 shadow-lg",
          "hover:from-red-500 hover:via-red-600 hover:to-red-700",
          "hover:shadow-red-500/40 hover:shadow-xl",
          "hover:scale-[1.03] transform transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
          "relative overflow-hidden"
        )}
        title="Official Rejection"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/15 to-red-600/15 opacity-0 hover:opacity-100 transition-opacity duration-200" />
        <XCircleIcon className="h-5 w-5 relative z-10" strokeWidth={2.5} />
        <span className="relative z-10"> REJECTED</span>
      </button>
    </div>
  );
}