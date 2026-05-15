export const GENDERS = ['Male', 'Female', 'Other'];
export const RELIGIONS = ['Islam', 'Hinduism', 'Christianity', 'Buddhism', 'Other'];
export const MARITAL_STATUS = ['Single', 'Married', 'Divorced', 'Widowed'];
export const NATIONALITIES = ['Bangladeshi', 'Other'];

export const EDUCATION_TYPES = ['SSC', 'HSC', 'Diploma', 'BSc', 'MSc', 'PhD', 'Other'];
export const BOARDS = [
  'Dhaka Board', 'Chittagong Board', 'Rajshahi Board',
  'Sylhet Board', 'Barisal Board', 'Comilla Board',
  'Jessore Board', 'Dinajpur Board', 'Mymensingh Board',
  'BUET', 'DU', 'BUET', 'KUET', 'RUET', 'CUET', 'Other University',
];

export const LANGUAGE_LEVELS = ['Basic', 'Intermediate', 'Good', 'Fluent', 'Native'];

export const DOC_TYPES = [
  { id: 'nid', label: 'National ID Card', icon: 'shield' },
  { id: 'passport', label: 'Passport', icon: 'globe' },
  { id: 'ssc_cert', label: 'SSC Certificate', icon: 'award' },
  { id: 'hsc_cert', label: 'HSC Certificate', icon: 'award' },
  { id: 'bsc_cert', label: 'BSc Certificate', icon: 'award' },
  { id: 'transcript', label: 'Academic Transcript', icon: 'file-text' },
  { id: 'experience_letter', label: 'Experience Letter', icon: 'briefcase' },
  { id: 'signature', label: 'Signature', icon: 'pen' },
  { id: 'other', label: 'Other Document', icon: 'file' },
];

export const CV_TEMPLATES = [
  { id: 'student-vibrant', name: 'Student Vibrant', tag: 'BEST FOR STUDENTS', color: '#14b8a6', desc: 'Colorful & energetic layout with education timeline.' },
  { id: 'smart-pro', name: 'Smart Pro Master', tag: 'RECOMMENDED', color: '#6366F1', desc: 'Premium 2-column layout for Corporate & IT jobs.' },
  { id: 'classic-centered', name: 'Classic Centered', tag: 'ACADEMIC / NO PHOTO', color: '#1e293b', desc: 'Clean centered layout without photo (Mehedi Hasan style).' },
  { id: 'classic-minimal', name: 'Classic Minimalist', tag: 'ACADEMIC / CLEAN', color: '#334155', desc: 'Clean single-column academic format (Mehedi Hasan style).' },
  { id: 'modern-tech', name: 'Modern Tech Premium', tag: 'NEW / PIXEL PERFECT', color: '#3b82f6', desc: 'Modern layout with overlapping photo & capsule dates.' },
  { id: 'bengali-pro', name: 'Bengali Pro Professional', tag: 'BEST FOR BD', color: '#0F2044', desc: '100% Identical to professional Bengali Biodata format.' },
  { id: 'govt', name: 'Bangladesh Govt', tag: 'GOVT / LOCAL', color: '#10B981', desc: 'Standard format for BD Govt & Local Bank jobs.' },
  { id: 'corporate', name: 'Executive Corporate', tag: 'ATS FRIENDLY', color: '#1E293B', desc: 'Minimalist layout optimized for ATS scanners.' },
  { id: 'tech', name: 'Software Developer', tag: 'IT / TECH', color: '#F43F5E', desc: 'Terminal-inspired design for developers & IT pros.' },
  { id: 'creative', name: 'Creative Portfolio', tag: 'CREATIVE', color: '#F59E0B', desc: 'Stylish design for Designers, Media & Arts.' },
  { id: 'europass', name: 'Europass Standard', tag: 'EUROPE', color: '#003399', desc: 'Official European Union standard format.' },
  { id: 'academic', name: 'Academic CV', tag: 'RESEARCH', color: '#06B6D4', desc: 'Detailed format for PhD, MSc & Research roles.' },
];

export const STEP_NAMES = [
  'Personal Info', 'Contact', 'Objective', 'Education',
  'Experience', 'Projects', 'Skills', 'Languages',
  'Certifications', 'Achievements', 'References',
];

export const PLANS = {
  free: { name: 'Free', color: '#64748B', cvLimit: 1, templateLimit: 2 },
  premium: { name: 'Pro', color: '#3B82F6', cvLimit: -1, templateLimit: -1 },
};
