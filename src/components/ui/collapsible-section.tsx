"use client"

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";


interface CollapsibleSectionProps {
  title: string;
  badge?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({ 
  title, 
  badge, 
  defaultOpen = false,
  children 
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="relative rounded-2xl bg-white shadow-sm overflow-visible">
      {/* Header */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left"
        aria-expanded={isOpen}
        animate={{ backgroundColor: isOpen ? "rgb(248 250 252)" : "white" }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-2">
          <motion.div
            initial={false}
            animate={{ rotate: isOpen ? 0 : -90 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </motion.div>
          <span className="font-medium text-slate-800">{title}</span>
          {badge != null && badge > 0 && (
            <span className="ml-1.5 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {badge}
            </span>
          )}
        </div>
        <motion.span 
          className="text-xs text-slate-400"
          animate={{ opacity: isOpen ? 1 : 0.6 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? "Hide" : "Show"}
        </motion.span>
      </motion.button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: "auto", 
              opacity: 1,
              transition: {
                height: { duration: 0.3, ease: "easeOut" },
                opacity: { duration: 0.2, delay: 0.1 }
              }
            }}
            exit={{ 
              height: 0, 
              opacity: 0,
              transition: {
                height: { duration: 0.3, ease: "easeIn" },
                opacity: { duration: 0.2 }
              }
            }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              exit={{ y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4 pt-2"
            >
              {/* Add spacing for nested cards */}
              <div className="space-y-2">
                {children}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Border Animation */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        initial={false}
        animate={{ 
          boxShadow: isOpen 
            ? "inset 0 0 0 1px rgb(226 232 240)" 
            : "inset 0 0 0 1px rgb(241 245 249)"
        }}
        transition={{ duration: 0.2 }}
      />
    </div>
  );
}