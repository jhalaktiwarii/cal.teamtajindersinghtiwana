import { useState, useEffect, useCallback } from 'react';
import type { Birthday } from '@/app/types/birthday';

const LOCAL_STORAGE_KEY = 'local_birthdays';

export function useLocalBirthdays() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load birthdays from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setBirthdays(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('Error loading birthdays from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save birthdays to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(birthdays));
      } catch (error) {
        console.error('Error saving birthdays to localStorage:', error);
      }
    }
  }, [birthdays, isLoading]);

  // Create a new birthday
  const createBirthday = useCallback(async (birthdayData: Omit<Birthday, 'id'>) => {
    const newBirthday: Birthday = {
      ...birthdayData,
      id: `local_bday_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    setBirthdays(prev => [...prev, newBirthday]);
    return newBirthday;
  }, []);

  // Update an existing birthday
  const updateBirthday = useCallback(async (id: string, updates: Partial<Birthday>) => {
    setBirthdays(prev => 
      prev.map(bday => 
        bday.id === id ? { ...bday, ...updates } : bday
      )
    );
  }, []);

  // Delete a birthday
  const deleteBirthday = useCallback(async (id: string) => {
    setBirthdays(prev => prev.filter(bday => bday.id !== id));
  }, []);



  // Clear all local birthdays
  const clearAllBirthdays = useCallback(() => {
    setBirthdays([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, []);

  // Export birthdays to JSON
  const exportBirthdays = useCallback(() => {
    const dataStr = JSON.stringify(birthdays, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `birthdays_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [birthdays]);

  // Import birthdays from JSON
  const importBirthdays = useCallback((file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const imported = JSON.parse(content);
          
          if (Array.isArray(imported)) {
            // Validate that each item has required fields
            const validBirthdays = imported.filter(item => 
              item.id && 
              item.fullName && 
              typeof item.day === 'number' && 
              typeof item.month === 'number' && 
              typeof item.year === 'number'
            );
            
            if (validBirthdays.length !== imported.length) {
              throw new Error('Some birthday records are invalid');
            }
            
            setBirthdays(validBirthdays);
            resolve();
          } else {
            reject(new Error('Invalid file format'));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, []);

  return {
    birthdays,
    isLoading,
    createBirthday,
    updateBirthday,
    deleteBirthday,
    clearAllBirthdays,
    exportBirthdays,
    importBirthdays
  };
} 