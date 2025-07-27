'use client'

import { useSession } from "next-auth/react";

export const useAuth = () => {
  const { data: session } = useSession();
  
  const userRole = session?.user?.role || null;
  const isMLA = userRole === 'mla';
  const isPA = userRole === 'pa';

  return {
    user: session?.user,
    role: userRole,
    isMLA,
    isPA,
  };
};
