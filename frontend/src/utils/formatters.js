// Date formatters
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-BD', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

export const formatYear = (date) => new Date(date).getFullYear();

// Phone formatter (BD)
export const formatPhone = (phone) => {
  const cleaned = phone?.replace(/\D/g, '') || '';
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

// Name abbreviation
export const getInitials = (name) => {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
};

// File size
export const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// GPA grade label
export const getGradeLabel = (gpa) => {
  if (gpa >= 5.0) return 'A+';
  if (gpa >= 4.0) return 'A';
  if (gpa >= 3.5) return 'A-';
  if (gpa >= 3.0) return 'B+';
  if (gpa >= 2.5) return 'B';
  return 'C';
};

// Completion % color
export const getCompletionColor = (pct) => {
  if (pct >= 80) return '#10B981';
  if (pct >= 50) return '#F59E0B';
  return '#F43F5E';
};

// Truncate text
export const truncate = (str, max = 80) =>
  str?.length > max ? str.slice(0, max) + '...' : str || '';
