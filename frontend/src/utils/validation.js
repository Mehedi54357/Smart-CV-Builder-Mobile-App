import * as Yup from 'yup';

// BD Phone regex
const bdPhone = /^01[3-9]\d{8}$/;

export const registerSchema = Yup.object({
  fullName: Yup.string().min(2, 'Min 2 chars').max(60).required('Full name required'),
  email: Yup.string().email('Invalid email').required('Email required'),
  phone: Yup.string().matches(bdPhone, 'Enter valid BD number (01XXXXXXXXX)').required('Phone required'),
  password: Yup.string()
    .min(6, 'Min 6 characters')
    .matches(/[A-Z]/, 'Must have at least 1 uppercase')
    .matches(/[0-9]/, 'Must have at least 1 number')
    .required('Password required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
    .required('Confirm your password'),
});

export const loginSchema = Yup.object({
  emailOrPhone: Yup.string().required('Email or phone required'),
  password: Yup.string().required('Password required'),
});

export const otpSchema = Yup.object({
  otp: Yup.string().length(6, 'OTP must be 6 digits').matches(/^\d+$/, 'Digits only').required(),
});

export const personalSchema = Yup.object({
  fullName: Yup.string().min(2).max(60).required('Full name required'),
  fatherName: Yup.string().nullable().notRequired(),
  motherName: Yup.string().nullable().notRequired(),
  dob: Yup.string().required('Date of birth required'),
  gender: Yup.string().oneOf(['Male', 'Female', 'Other']).required('Gender required'),
  nationality: Yup.string().nullable().notRequired(),
  nid: Yup.string().nullable().notRequired(),
  presentAddress: Yup.string().min(10).required('Present address required'),
  permanentAddress: Yup.string().nullable().notRequired(),
});

export const educationSchema = Yup.object({
  type: Yup.string().oneOf(['SSC', 'HSC', 'Diploma', 'BSc', 'MSc', 'Other']).required(),
  degree: Yup.string().required('Degree name required'),
  institution: Yup.string().required('Institution required'),
  gpa: Yup.number().min(0).max(5).required('GPA/CGPA required'),
  passingYear: Yup.number()
    .min(1970)
    .max(new Date().getFullYear())
    .required('Passing year required'),
});

export const experienceSchema = Yup.object({
  company: Yup.string().required('Company name required'),
  title: Yup.string().required('Job title required'),
  fromDate: Yup.date().required('Start date required'),
  description: Yup.string().min(20, 'Describe your role (min 20 chars)'),
});

export const fileSchema = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  validate: (file) => {
    if (!file) return 'File required';
    if (file.size > 5 * 1024 * 1024) return 'File must be under 5MB';
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type))
      return 'Only JPG, PNG, PDF allowed';
    return null;
  },
};
