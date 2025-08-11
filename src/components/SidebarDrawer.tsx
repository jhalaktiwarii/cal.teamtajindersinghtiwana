import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function SidebarDrawer({
  open,
  onClose,
  children,
  width = 340,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}) {
  // lock body scroll
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // close on Esc
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-250 ease-out ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Sidebar"
        className="absolute inset-y-0 left-0 will-change-transform"
        style={{ width }}
      >
        <div
          className={`h-full bg-white shadow-2xl ring-1 ring-black/10 transition-transform duration-250 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ width }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="text-sm font-medium text-gray-900"></div>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="h-[calc(100%-52px)] overflow-y-auto">{children}</div>
        </div>
      </aside>
    </div>,
    document.body
  );
} 