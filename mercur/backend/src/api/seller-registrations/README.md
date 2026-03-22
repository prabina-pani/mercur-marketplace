# Seller Registration API

## Endpoint

`POST /seller-registrations`

Public endpoint for submitting seller registration requests with document uploads.

## Request Format

**Content-Type:** `multipart/form-data`

### Request Body

The request must include:
1. A `data` field containing JSON with seller information
2. Two file fields for document uploads

### Data Field (JSON)

The `data` field must contain a JSON object with the following properties:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `first_name` | string | Yes | Seller's first name |
| `middle_name` | string | No | Seller's middle name (optional) |
| `last_name` | string | Yes | Seller's last name |
| `mobile_number` | string | Yes | Contact mobile number |
| `email` | string | Yes | Contact email (must be valid format) |
| `company_legal_name` | string | Yes | Legal name of the company |
| `company_tax_id` | string | Yes | Tax identification number |
| `company_address` | string | Yes | Company address |
| `company_website` | string | Yes | Company website URL |

### File Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `vat_registration_certificate` | file | Yes | VAT registration certificate (PDF, JPEG, or PNG, max 10MB) |
| `updated_company_affidavit` | file | Yes | Updated company affidavit (PDF, JPEG, or PNG, max 10MB) |

## Example Request

### Using cURL

```bash
curl -X POST "http://localhost:9000/seller-registrations" \
  -F 'data={"first_name":"John","middle_name":"Michael","last_name":"Doe","mobile_number":"+1234567890","email":"john.doe@example.com","company_legal_name":"Acme Corporation","company_tax_id":"TAX123456789","company_address":"123 Main Street, New York, NY 10001","company_website":"https://acme.example.com"}' \
  -F "vat_registration_certificate=@/path/to/vat-cert.pdf" \
  -F "updated_company_affidavit=@/path/to/affidavit.pdf"
```

### Using JavaScript (FormData)

```javascript
const formData = new FormData();

// Add seller data as JSON
const sellerData = {
  first_name: 'John',
  middle_name: 'Michael',
  last_name: 'Doe',
  mobile_number: '+1234567890',
  email: 'john.doe@example.com',
  company_legal_name: 'Acme Corporation',
  company_tax_id: 'TAX123456789',
  company_address: '123 Main Street, New York, NY 10001',
  company_website: 'https://acme.example.com'
};

formData.append('data', JSON.stringify(sellerData));

// Add files
formData.append('vat_registration_certificate', vatCertFile);
formData.append('updated_company_affidavit', affidavitFile);

// Send request
const response = await fetch('http://localhost:9000/seller-registrations', {
  method: 'POST',
  body: formData,
});
```

## Response

### Success (201 Created)

```json
{
  "id": "01JEXAMPLE123456789",
  "status": "pending"
}
```

### Validation Error (400 Bad Request)

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "vat_registration_certificate",
      "message": "Missing required document: vat_registration_certificate"
    }
  ]
}
```

## Validation Rules

### Text Fields
- All required fields must be non-empty strings
- Email must be in valid format (contains @ and domain)
- Unknown fields are stripped from the payload

### Files
- **Allowed MIME types:** `application/pdf`, `image/jpeg`, `image/png`
- **Max file size:** 10 MB per file
- **Both documents required:** Both `vat_registration_certificate` and `updated_company_affidavit` must be uploaded

## Storage

- Files are stored locally in `uploads/seller-registrations/{requestId}/`
- Filenames are sanitized and appended with random suffix to avoid collisions
- Original filename, MIME type, and size are stored in the database

## Database Records

### seller_registration_request
- `id`: UUID
- `status`: "pending"
- `payload`: JSON with all text fields
- `created_at`: Timestamp

### seller_registration_document (2 rows)
- `registration_request_id`: FK to request
- `document_type`: "vat_registration_certificate" or "updated_company_affidavit"
- `original_filename`: Original file name
- `mime_type`: File MIME type
- `size_bytes`: File size
- `storage_key`: Relative path to file

## Notes

- No seller account or authentication is created at this stage (deferred to approval workflow)
- This is a public endpoint (no authentication required)
- Endpoint is outside `/store` path to avoid publishable key requirement
