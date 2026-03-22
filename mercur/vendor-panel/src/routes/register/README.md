# Vendor Registration Feature

## Overview

This feature allows prospective sellers to register their business through a web form in the vendor-panel.

## Files Created

### Core Components
- `register.tsx` - Main registration route/page
- `components/registration-form/registration-form.tsx` - Form component with all fields
- `components/registration-form/schema.ts` - Zod validation schema
- `components/file-upload/file-upload.tsx` - Reusable file upload component

### Utilities & Configuration
- `constants.ts` - Centralized constants (file sizes, MIME types, messages, regex)
- `utils/form-helpers.ts` - Reusable error/success handlers
- `styles/register.css` - Centralized CSS styles
- `../../lib/client/registration.ts` - API client for registration submission

## Features

### Form Fields
- **Personal Information**: first_name, middle_name (optional), last_name, mobile_number, email
- **Company Information**: company_legal_name, company_tax_id, company_address, company_website
- **Documents**: VAT Registration Certificate, Updated Company Affidavit

### Validation
- Client-side validation using Zod
- Email format validation (RFC 5322 subset)
- URL format validation (http/https only)
- File type validation (PDF, JPEG, PNG)
- File size validation (10MB max per file)
- String length validation (500 chars max per field)

### Error Handling
- Centralized error handling with `handleApiError()`
- Field-level error mapping from API responses
- Generic error messages for network/server errors
- Form state preserved on error

### Success Handling
- Success message with registration ID
- Form cleared after successful submission
- Next steps information displayed

## Usage

### Accessing the Registration Page

The registration route needs to be added to the vendor-panel router configuration. Check existing route patterns in the vendor-panel to add the `/register` route.

### Environment Variables

Required in `.env.local`:
```bash
VITE_MEDUSA_BACKEND_URL=http://localhost:9000
VITE_PUBLISHABLE_API_KEY=pk_a10a3a26209b7eaae6a69ee33c9eea7e
```

## Testing

### Manual Testing Steps

1. **Start the backend server**:
   ```bash
   cd mercur/backend
   npm run dev
   ```

2. **Start the vendor-panel**:
   ```bash
   cd mercur/vendor-panel
   npm run dev
   ```

3. **Navigate to the registration page** (route needs to be configured)

4. **Test scenarios**:
   - Fill all fields with valid data and submit
   - Try submitting with empty required fields
   - Try invalid email format
   - Try invalid URL format (missing http://)
   - Upload files larger than 10MB
   - Upload unsupported file types (.txt, .doc)
   - Test with valid PDF, JPEG, PNG files
   - Test file removal functionality
   - Test form reset after successful submission

### Expected Behavior

**Valid Submission:**
- Form submits successfully
- Success message displayed with registration ID
- Form fields cleared
- Email confirmation message shown

**Validation Errors:**
- Inline error messages appear below fields
- Error messages are clear and actionable
- Form state preserved (no data loss)
- Submit button remains enabled for retry

**File Upload:**
- File preview shows filename and size
- Remove button clears selected file
- Only PDF, JPEG, PNG files accepted
- Files larger than 10MB rejected

## Architecture

### Design Principles
1. **NO NEW DEPENDENCIES** - Uses existing packages only
2. **Centralized Styling** - All styles in `register.css`
3. **Avoid Hardcoding** - Constants file for all magic values
4. **Reusable Code** - Utility functions for common operations
5. **Keep it Simple** - No drag-and-drop, no progress bars

### Code Organization
```
routes/register/
├── register.tsx                    # Main route
├── constants.ts                    # Centralized constants
├── components/
│   ├── registration-form/
│   │   ├── registration-form.tsx   # Form component
│   │   └── schema.ts               # Validation schema
│   └── file-upload/
│       └── file-upload.tsx         # File upload component
├── utils/
│   └── form-helpers.ts             # Reusable utilities
└── styles/
    └── register.css                # Centralized styles
```

## API Integration

### Endpoint
`POST /seller-registrations`

### Request Format
- Content-Type: `multipart/form-data`
- Headers: `x-publishable-api-key`
- Body:
  - `data`: JSON string with seller information
  - `vat_registration_certificate`: File
  - `updated_company_affidavit`: File

### Response Format

**Success (201):**
```json
{
  "id": "01JEXAMPLE123456789",
  "status": "pending"
}
```

**Error (400):**
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Next Steps

1. Add `/register` route to vendor-panel router configuration
2. Test registration flow end-to-end
3. Verify file uploads work correctly
4. Test error handling with various scenarios
5. Verify responsive design on mobile devices
6. Test accessibility with keyboard navigation
