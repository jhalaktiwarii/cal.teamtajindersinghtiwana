'use client'

import React from 'react'

export function LoadingSpinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-primary animate-spin"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-4 border-primary opacity-25"></div>
        </div>
        <div className="text-xl font-semibold text-gray-700 dark:text-gray-200">
          Loading...
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Please wait while we prepare your calendar
        </div>
      </div>
    </div>
  )
}
