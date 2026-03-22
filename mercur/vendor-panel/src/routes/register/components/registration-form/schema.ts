// Zod validation schema for registration form
import { z } from 'zod';
import { REGISTRATION_CONSTANTS } from '../../constants';

const { MAX_FILE_SIZE, ACCEPTED_MIME_TYPES, MAX_STRING_LENGTH, EMAIL_MAX_LENGTH, EMAIL_REGEX, URL_REGEX } = REGISTRATION_CONSTANTS;

export const registrationSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(MAX_STRING_LENGTH, `First name must be ${MAX_STRING_LENGTH} characters or less`),
  
  middle_name: z
    .string()
    .max(MAX_STRING_LENGTH, `Middle name must be ${MAX_STRING_LENGTH} characters or less`)
    .optional()
    .or(z.literal('')),
  
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(MAX_STRING_LENGTH, `Last name must be ${MAX_STRING_LENGTH} characters or less`),
  
  mobile_number: z
    .string()
    .min(1, 'Mobile number is required')
    .max(MAX_STRING_LENGTH, `Mobile number must be ${MAX_STRING_LENGTH} characters or less`),
  
  email: z
    .string()
    .min(1, 'Email is required')
    .max(EMAIL_MAX_LENGTH, `Email must be ${EMAIL_MAX_LENGTH} characters or less`)
    .regex(EMAIL_REGEX, 'Invalid email format'),
  
  company_legal_name: z
    .string()
    .min(1, 'Company legal name is required')
    .max(MAX_STRING_LENGTH, `Company legal name must be ${MAX_STRING_LENGTH} characters or less`),
  
  company_tax_id: z
    .string()
    .min(1, 'Company tax ID is required')
    .max(MAX_STRING_LENGTH, `Company tax ID must be ${MAX_STRING_LENGTH} characters or less`),
  
  company_address: z
    .string()
    .min(1, 'Company address is required')
    .max(MAX_STRING_LENGTH, `Company address must be ${MAX_STRING_LENGTH} characters or less`),
  
  company_website: z
    .string()
    .min(1, 'Company website is required')
    .max(MAX_STRING_LENGTH, `Company website must be ${MAX_STRING_LENGTH} characters or less`)
    .regex(URL_REGEX, 'Website must start with http:// or https://'),
  
  vat_registration_certificate: z
    .instanceof(File, { message: 'VAT registration certificate is required' })
    .refine((file) => file.size <= MAX_FILE_SIZE, 'File size must be less than 10MB')
    .refine(
      (file) => ACCEPTED_MIME_TYPES.includes(file.type),
      'File must be PDF, JPEG, or PNG'
    ),
  
  updated_company_affidavit: z
    .instanceof(File, { message: 'Updated company affidavit is required' })
    .refine((file) => file.size <= MAX_FILE_SIZE, 'File size must be less than 10MB')
    .refine(
      (file) => ACCEPTED_MIME_TYPES.includes(file.type),
      'File must be PDF, JPEG, or PNG'
    ),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
