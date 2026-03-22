// Registration form constants - centralized to avoid hardcoding
export const REGISTRATION_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_MIME_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
  MAX_STRING_LENGTH: 500,
  EMAIL_MAX_LENGTH: 254,
  
  // Regex patterns
  EMAIL_REGEX: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  URL_REGEX: /^https?:\/\/.+/,
  
  // Field names (for reusability)
  FIELD_NAMES: {
    VAT_CERT: 'vat_registration_certificate',
    AFFIDAVIT: 'updated_company_affidavit',
  },
  
  // Messages
  MESSAGES: {
    SUCCESS: 'Registration submitted successfully!',
    ERROR_GENERIC: 'Failed to submit registration. Please try again.',
    REVIEW_TIME: '2-3 business days',
  },
} as const;

export const FILE_TYPE_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
};
