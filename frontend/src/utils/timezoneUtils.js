import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

/**
 * Get user's timezone from localStorage or user object
 */
export const getUserTimezone = () => {
  return localStorage.getItem('userTimezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Convert UTC time to user's timezone for display
 * @param {string|Date} utcTime - UTC time from database
 * @param {string} userTimezone - User's timezone (optional, will use stored timezone if not provided)
 * @returns {dayjs.Dayjs} - Time in user's timezone
 */
export const convertUTCToUserTimezone = (utcTime, userTimezone = null) => {
  const tz = userTimezone || getUserTimezone();
  const result = dayjs.utc(utcTime).tz(tz);
  console.log('convertUTCToUserTimezone:', { utcTime, tz, result: result.format() });
  return result;
};

/**
 * Convert user's timezone to UTC for saving to database
 * @param {string|Date|dayjs.Dayjs} userTime - Time in user's timezone
 * @param {string} userTimezone - User's timezone (optional, will use stored timezone if not provided)
 * @returns {string} - ISO string in UTC
 */
export const convertUserTimezoneToUTC = (userTime, userTimezone = null) => {
  const tz = userTimezone || getUserTimezone();
  
  // If it's already a dayjs object in the correct timezone, just convert to UTC
  if (dayjs.isDayjs(userTime)) {
    console.log('Converting dayjs object:', userTime.format(), 'TZ:', tz);
    // The userTime is already in the user's timezone context from the DatePicker
    return userTime.utc().toISOString();
  }
  
  // Otherwise, parse it with the timezone
  const result = dayjs.tz(userTime, tz).utc().toISOString();
  console.log('Converting time:', userTime, 'TZ:', tz, 'Result:', result);
  return result;
};

/**
 * Format time for display in user's timezone
 * @param {string|Date} utcTime - UTC time from database
 * @param {string} format - dayjs format string (default: 'MMM D, h:mm A')
 * @param {string} userTimezone - User's timezone (optional)
 * @returns {string} - Formatted time string
 */
export const formatTimeInUserTimezone = (utcTime, format = 'MMM D, h:mm A', userTimezone = null) => {
  if (!utcTime) return '';
  const tz = userTimezone || getUserTimezone();
  return dayjs.utc(utcTime).tz(tz).format(format);
};

/**
 * Format time using native JS for locale-aware formatting
 * @param {string|Date} utcTime - UTC time from database
 * @param {string} userTimezone - User's timezone (optional)
 * @returns {string} - Locale formatted time string
 */
export const formatTimeLocale = (utcTime, userTimezone = null) => {
  if (!utcTime) return '';
  const tz = userTimezone || getUserTimezone();
  const formatted = new Date(utcTime).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: tz
  });
  console.log('formatTimeLocale:', { utcTime, tz, formatted });
  return formatted;
};

/**
 * Get current time in user's timezone
 * @param {string} userTimezone - User's timezone (optional)
 * @returns {dayjs.Dayjs} - Current time in user's timezone
 */
export const getCurrentTimeInUserTimezone = (userTimezone = null) => {
  const tz = userTimezone || getUserTimezone();
  return dayjs().tz(tz);
};

export default dayjs;

