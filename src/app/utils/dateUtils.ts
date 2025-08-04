import { format } from 'date-fns';

export function getDaysInMonth(date: Date): (Date | null)[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const days: (Date | null)[] = [];
  
  // Add empty slots for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  
  // Add the actual days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    // Create date with year, month, day only - no time components
    const dayDate = new Date(year, month, i);
    dayDate.setHours(0, 0, 0, 0);
    days.push(dayDate);
  }
  
  return days;
}

/**
 * Formats time consistently in 12-hour format with AM/PM
 * @param date - Date object or ISO string
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export function formatTime12Hour(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'h:mm a');
}

/**
 * Formats time for display in calendar components
 * @param date - Date object or ISO string
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export function formatTimeForDisplay(date: Date | string): string {
  return formatTime12Hour(date);
}

/**
 * Formats time for API/backend use (24-hour format)
 * @param date - Date object or ISO string
 * @returns Formatted time string (e.g., "14:30")
 */
export function formatTimeForAPI(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'HH:mm');
}

/**
 * Converts numbers to Marathi digits
 * @param input - Number or string to convert
 * @returns String with Marathi digits
 */
export function toMarathiDigits(input: string | number): string {
  const marathiDigits = ['०','१','२','३','४','५','६','७','८','९'];
  return String(input).replace(/\d/g, d => marathiDigits[Number(d)]);
}

/**
 * Converts time to Marathi format with proper time-of-day indicators
 * @param timeString - ISO time string
 * @returns Formatted Marathi time string (e.g., "सकाळी ९.३० वा")
 */
export function toMarathiTime(timeString: string): string {
  const date = new Date(timeString);
  const hour = date.getHours();
  const minute = date.getMinutes();
  
  let timePrefix = '';
  let marathiHour = hour;
  
  // Determine time of day and convert to 12-hour format
  if (hour >= 5 && hour < 12) {
    timePrefix = 'सकाळी';
    marathiHour = hour; // Morning hours (5-11)
  } else if (hour >= 12 && hour < 17) {
    timePrefix = 'दुपारी';
    marathiHour = hour === 12 ? 12 : hour - 12; // Afternoon hours (12-4 PM)
  } else if (hour >= 17 && hour < 20) {
    timePrefix = 'सायंकाळी';
    marathiHour = hour - 12; // Evening hours (5-7 PM)
  } else if (hour >= 20 && hour < 24) {
    timePrefix = 'रात्री';
    marathiHour = hour - 12; // Night hours (8-11 PM)
  } else {
    timePrefix = 'रात्री';
    marathiHour = hour === 0 ? 12 : hour; // Late night/early morning (12-4 AM)
  }
  
  const marathiHourStr = toMarathiDigits(marathiHour);
  const marathiMinute = toMarathiDigits(minute.toString().padStart(2, '0'));
  
  return `${timePrefix} ${marathiHourStr}.${marathiMinute} वा`;
}

/**
 * Gets Marathi day name
 * @param date - Date object
 * @returns Marathi day name
 */
export function getMarathiDay(date: Date): string {
  const days = ['रविवार', 'सोमवार', 'मंगळवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
  return days[date.getDay()];
}