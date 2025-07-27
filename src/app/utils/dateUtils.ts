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