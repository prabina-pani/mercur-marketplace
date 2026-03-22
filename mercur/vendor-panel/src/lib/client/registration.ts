// API client for seller registration submission
import { backendUrl, publishableApiKey } from './client';
import { REGISTRATION_CONSTANTS } from '../../routes/register/constants';

export interface RegistrationResponse {
  id: string;
  status: 'pending';
}

export interface RegistrationError {
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Submit seller registration to backend API
 * Reusable API client for registration submission
 */
export async function submitRegistration(data: {
  first_name: string;
  middle_name?: string;
  last_name: string;
  mobile_number: string;
  email: string;
  company_legal_name: string;
  company_tax_id: string;
  company_address: string;
  company_website: string;
  vat_registration_certificate: File;
  updated_company_affidavit: File;
}): Promise<RegistrationResponse> {
  const formData = new FormData();
  
  // Extract file fields
  const { vat_registration_certificate, updated_company_affidavit, ...textFields } = data;
  
  // Add seller info as JSON string in 'data' field
  const sellerData = {
    ...textFields,
    middle_name: textFields.middle_name || undefined, // Remove empty string
  };
  formData.append('data', JSON.stringify(sellerData));
  
  // Add files with correct field names (use constants to avoid hardcoding)
  const { FIELD_NAMES } = REGISTRATION_CONSTANTS;
  formData.append(FIELD_NAMES.VAT_CERT, vat_registration_certificate);
  formData.append(FIELD_NAMES.AFFIDAVIT, updated_company_affidavit);
  
  const response = await fetch(`${backendUrl}/seller-registrations`, {
    method: 'POST',
    headers: {
      'x-publishable-api-key': publishableApiKey,
    },
    body: formData,
  });
  
  if (!response.ok) {
    const error: RegistrationError = await response.json();
    throw error;
  }
  
  return response.json();
}
