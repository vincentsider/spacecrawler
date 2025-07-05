import { parse, parseISO, isValid } from 'date-fns';

export function parseDate(dateString: string): Date {
  if (!dateString) {
    return new Date();
  }

  // Try ISO format first
  try {
    const isoDate = parseISO(dateString);
    if (isValid(isoDate)) {
      return isoDate;
    }
  } catch {}

  // Try common date formats
  const formats = [
    'MM/dd/yyyy',
    'dd/MM/yyyy',
    'yyyy-MM-dd',
    'MMM dd, yyyy',
    'MMMM dd, yyyy',
    'dd MMM yyyy',
    'dd MMMM yyyy',
    'EEE, MMM dd',
    'EEEE, MMMM dd',
    'MMM dd',
    'MMMM dd'
  ];

  for (const format of formats) {
    try {
      const parsedDate = parse(dateString, format, new Date());
      if (isValid(parsedDate)) {
        return parsedDate;
      }
    } catch {}
  }

  // If all parsing fails, return current date
  console.warn(`Could not parse date: ${dateString}`);
  return new Date();
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0] || '';
}