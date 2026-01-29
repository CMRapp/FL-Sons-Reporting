/**
 * Calculates the current service year based on July 1 cutoff
 * Service year runs from July 1 to June 30
 * 
 * @returns {string} Service year in format "YYYY-YYYY" (e.g., "2024-2025")
 * 
 * @example
 * // If current date is June 30, 2024
 * getServiceYear() // Returns "2023-2024"
 * 
 * // If current date is July 1, 2024
 * getServiceYear() // Returns "2024-2025"
 */
export function getServiceYear(): string {
  const now = new Date();
  const currentYear = now.getFullYear();
  const month = now.getMonth(); // 0-indexed (0 = January, 6 = July)
  
  // If we're in July (month 6) or later, the service year starts this year
  // Otherwise, it started last year
  const serviceYearStart = month >= 6 ? currentYear : currentYear - 1;
  const serviceYearEnd = serviceYearStart + 1;
  
  return `${serviceYearStart}-${serviceYearEnd}`;
}

/**
 * Gets the start date of the current service year (July 1)
 * 
 * @returns {Date} Start date of the service year
 */
export function getServiceYearStartDate(): Date {
  const now = new Date();
  const currentYear = now.getFullYear();
  const month = now.getMonth();
  
  // If we're before July, service year started last year
  const serviceYearStart = month >= 6 ? currentYear : currentYear - 1;
  
  return new Date(serviceYearStart, 6, 1); // July 1
}

/**
 * Gets the end date of the current service year (June 30)
 * 
 * @returns {Date} End date of the service year
 */
export function getServiceYearEndDate(): Date {
  const now = new Date();
  const currentYear = now.getFullYear();
  const month = now.getMonth();
  
  // If we're in July or later, service year ends next year
  const serviceYearEnd = month >= 6 ? currentYear + 1 : currentYear;
  
  return new Date(serviceYearEnd, 5, 30); // June 30
}
