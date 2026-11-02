/**
 * Formatting Utilities
 */

/**
 * Formats a number or string amount into Indian Rupee currency (₹).
 */
export function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '₹0';
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount).replace(/[^0-9.-]+/g, ''));
  if (isNaN(num)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

/**
 * Formats an ISO string or date into a readable date string.
 */
export function formatDate(dateInput, options = {}) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options
  });
}

/**
 * Returns initials from a full name (e.g. "Zawad Adnan" -> "ZA").
 */
export function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Truncates text with an ellipsis if it exceeds maxLength.
 */
export function truncateText(text, maxLength = 100) {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Formats a 24-hour time or time range string into a clean 12-hour AM/PM format.
 * Examples:
 *   "06:00" -> "6:00 AM"
 *   "14:00" -> "2:00 PM"
 *   "00:00" -> "12:00 AM"
 *   "18:00 - 19:00" -> "6:00 PM – 7:00 PM"
 *   "6:00 PM - 7:00 PM" -> "6:00 PM – 7:00 PM"
 */
export function formatTime12Hour(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return timeStr || '';

  const formatSingle = (t) => {
    const clean = t.trim();
    // Already in 12-hour format?
    if (/am|pm/i.test(clean)) return clean;
    const match = clean.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return clean;
    let hour = parseInt(match[1], 10);
    const minute = match[2];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minute} ${ampm}`;
  };

  if (timeStr.includes('-') || timeStr.includes('–')) {
    const parts = timeStr.split(/[-–]/);
    return parts.map(formatSingle).join(' – ');
  }

  return formatSingle(timeStr);
}

