'use client'

import { useSession } from "next-auth/react";

export const useAuth = () => {
  const { data: session } = useSession();
  
  const userRole = session?.user?.role || null;
  const isBJYM = userRole === 'BJYM';
  const isPA = userRole === 'pa';

  return {
    user: session?.user,
    role: userRole,
    isBJYM,
    isPA,
  };
};
