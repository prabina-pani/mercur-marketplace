// Registration form component with all fields
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Label, Text, Heading, Alert, Textarea } from '@medusajs/ui';
import { registrationSchema, type RegistrationFormData } from './schema';
import { submitRegistration } from '../../../../lib/client/registration';
import { FileUpload } from '../file-upload/file-upload';
import { handleApiError, formatSuccessMessage } from '../../utils/form-helpers';
import { REGISTRATION_CONSTANTS } from '../../constants';
import '../../styles/register.css';

export const RegistrationForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    setError,
    reset,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onBlur', // Validate on blur for better UX
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      setSubmitError(null);
      const response = await submitRegistration(data);
      
      // Use centralized success message formatter
      setSuccessMessage(formatSuccessMessage(response.id, data.email));
      
      reset(); // Clear form
    } catch (error: any) {
      // Use centralized error handler
      const errorMessage = handleApiError(error, setError);
      setSubmitError(errorMessage);
    }
  };

  return (
    <div className="registration-container">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Success message */}
        {successMessage && (
          <Alert variant="success" className="registration-section">
            <Text>{successMessage}</Text>
          </Alert>
        )}

        {/* Error message */}
        {submitError && (
          <Alert variant="error" className="registration-section">
            <Text>{submitError}</Text>
          </Alert>
        )}

        {/* Personal Information Section */}
        <div className="registration-section">
          <Heading level="h2">Personal Information</Heading>
          
          <div className="registration-field-grid">
            <div>
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                {...register('first_name')}
                placeholder="John"
                disabled={isSubmitting}
              />
              {errors.first_name && (
                <Text className="registration-error">
                  {errors.first_name.message}
                </Text>
              )}
            </div>

            <div>
              <Label htmlFor="middle_name">Middle Name</Label>
              <Input
                id="middle_name"
                {...register('middle_name')}
                placeholder="Michael (optional)"
                disabled={isSubmitting}
              />
              {errors.middle_name && (
                <Text className="registration-error">
                  {errors.middle_name.message}
                </Text>
              )}
            </div>

            <div>
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                {...register('last_name')}
                placeholder="Doe"
                disabled={isSubmitting}
              />
              {errors.last_name && (
                <Text className="registration-error">
                  {errors.last_name.message}
                </Text>
              )}
            </div>

            <div>
              <Label htmlFor="mobile_number">Mobile Number *</Label>
              <Input
                id="mobile_number"
                {...register('mobile_number')}
                placeholder="+1234567890"
                disabled={isSubmitting}
              />
              {errors.mobile_number && (
                <Text className="registration-error">
                  {errors.mobile_number.message}
                </Text>
              )}
            </div>

            <div className="registration-field-full">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="john.doe@example.com"
                disabled={isSubmitting}
              />
              {errors.email && (
                <Text className="registration-error">
                  {errors.email.message}
                </Text>
              )}
            </div>
          </div>
        </div>

        {/* Company Information Section */}
        <div className="registration-section">
          <Heading level="h2">Company Information</Heading>
          
          <div className="registration-field-grid">
            <div className="registration-field-full">
              <Label htmlFor="company_legal_name">Company Legal Name *</Label>
              <Input
                id="company_legal_name"
                {...register('company_legal_name')}
                placeholder="Acme Corporation"
                disabled={isSubmitting}
              />
              <Text className="registration-hint">
                Enter your registered company name as it appears on official documents
              </Text>
              {errors.company_legal_name && (
                <Text className="registration-error">
                  {errors.company_legal_name.message}
                </Text>
              )}
            </div>

            <div>
              <Label htmlFor="company_tax_id">Company Tax ID *</Label>
              <Input
                id="company_tax_id"
                {...register('company_tax_id')}
                placeholder="TAX123456789"
                disabled={isSubmitting}
              />
              {errors.company_tax_id && (
                <Text className="registration-error">
                  {errors.company_tax_id.message}
                </Text>
              )}
            </div>

            <div>
              <Label htmlFor="company_website">Company Website *</Label>
              <Input
                id="company_website"
                type="url"
                {...register('company_website')}
                placeholder="https://example.com"
                disabled={isSubmitting}
              />
              {errors.company_website && (
                <Text className="registration-error">
                  {errors.company_website.message}
                </Text>
              )}
            </div>

            <div className="registration-field-full">
              <Label htmlFor="company_address">Company Address *</Label>
              <Textarea
                id="company_address"
                {...register('company_address')}
                placeholder="123 Main Street, New York, NY 10001"
                disabled={isSubmitting}
                rows={3}
              />
              {errors.company_address && (
                <Text className="registration-error">
                  {errors.company_address.message}
                </Text>
              )}
            </div>
          </div>
        </div>

        {/* Document Upload Section */}
        <div className="registration-section">
          <Heading level="h2">Required Documents</Heading>
          <Text className="registration-hint mb-4">
            Please upload PDF, JPEG, or PNG files (max 10MB each)
          </Text>
          
          <FileUpload
            label="VAT Registration Certificate *"
            name={REGISTRATION_CONSTANTS.FIELD_NAMES.VAT_CERT}
            accept={REGISTRATION_CONSTANTS.ACCEPTED_MIME_TYPES.join(',')}
            onChange={(file) => setValue('vat_registration_certificate', file as any)}
            error={errors.vat_registration_certificate?.message}
            disabled={isSubmitting}
            hint="Upload your official VAT registration certificate"
          />

          <FileUpload
            label="Updated Company Affidavit *"
            name={REGISTRATION_CONSTANTS.FIELD_NAMES.AFFIDAVIT}
            accept={REGISTRATION_CONSTANTS.ACCEPTED_MIME_TYPES.join(',')}
            onChange={(file) => setValue('updated_company_affidavit', file as any)}
            error={errors.updated_company_affidavit?.message}
            disabled={isSubmitting}
            hint="Upload your company's updated affidavit document"
          />
        </div>

        {/* Submit Button */}
        <div className="registration-section">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Registration'}
          </Button>
        </div>
      </form>
    </div>
  );
};
