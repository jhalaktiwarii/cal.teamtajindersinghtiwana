export interface Birthday {
  id: string;
  fullName: string;
  designation: string;
  address: string;
  phone: string;
  birthday: string; // ISO date string (recurring annually)
  going: boolean;
  reminder: string; // ISO time string
} 