// Centralized form helpers for reusable error/success handling
import { UseFormSetError } from 'react-hook-form';
import { REGISTRATION_CONSTANTS } from '../constants';

export interface ApiError {
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Centralized API error handler
 * Maps API validation errors to form fields
 */
export function handleApiError<T>(
  error: ApiError,
  setError: UseFormSetError<T>
): string {
  console.error('Registration error:', error);
  
  // Map field-level errors from API to form fields
  if (error.errors && Array.isArray(error.errors)) {
    error.errors.forEach(({ field, message }) => {
      setError(field as any, { message });
    });
  }
  
  // Return generic error message for display
  return error.message || REGISTRATION_CONSTANTS.MESSAGES.ERROR_GENERIC;
}

/**
 * Centralized success message formatter
 */
export function formatSuccessMessage(
  registrationId: string,
  email: string
): string {
  return (
    `${REGISTRATION_CONSTANTS.MESSAGES.SUCCESS} Your application ID is ${registrationId}. ` +
    `We'll review your application within ${REGISTRATION_CONSTANTS.MESSAGES.REVIEW_TIME}. ` +
    `You'll receive an email at ${email} once your application is processed.`
  );
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate file before upload (reusable)
 */
export function validateFile(file: File): string | null {
  const { MAX_FILE_SIZE, ACCEPTED_MIME_TYPES } = REGISTRATION_CONSTANTS;
  
  if (file.size > MAX_FILE_SIZE) {
    return `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`;
  }
  
  if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
    return 'File must be PDF, JPEG, or PNG';
  }
  
  return null;
}
