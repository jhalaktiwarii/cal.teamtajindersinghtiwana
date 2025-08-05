export interface Birthday {
  id: string;
  fullName: string;
  address?: string;
  phone?: string;
  ward?: string;
  day: number; // Day of month (1-31)
  month: number; // Month (1-12)
  year?: number; // Birth year (optional)
  reminder: string; // ISO time string
} 