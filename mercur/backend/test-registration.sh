#!/bin/bash

# Test script for Story 1.2: Create pending registration via multipart API
# Usage: ./test-registration.sh

BACKEND_URL="http://localhost:9000"
ENDPOINT="$BACKEND_URL/seller-registrations"
# Use the publishable key from .env.local
PUBLISHABLE_KEY="pk_a10a3a26209b7eaae6a69ee33c9eea7e"

echo "=== Testing Seller Registration API ==="
echo ""

# Create test files (minimal valid PDF files)
echo "Creating test files..."

# Create a minimal valid PDF for VAT certificate
cat > /tmp/vat-cert.pdf << 'EOF'
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(VAT Certificate) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000317 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
410
%%EOF
EOF

# Create a minimal valid PDF for company affidavit
cat > /tmp/affidavit.pdf << 'EOF'
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 47
>>
stream
BT
/F1 12 Tf
100 700 Td
(Company Affidavit) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000317 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
413
%%EOF
EOF

# Test 1: Valid submission
echo "Test 1: Valid submission with all required fields"
curl -X POST "$ENDPOINT" \
  -H "x-publishable-api-key: $PUBLISHABLE_KEY" \
  -F 'data={"first_name":"John","middle_name":"Michael","last_name":"Doe","mobile_number":"+1234567890","email":"john.doe@example.com","company_legal_name":"Acme Corp","company_tax_id":"TAX123456","company_address":"123 Main St, City, Country","company_website":"https://acme.example.com"}' \
  -F "vat_registration_certificate=@/tmp/vat-cert.pdf" \
  -F "updated_company_affidavit=@/tmp/affidavit.pdf" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'

echo ""
echo "---"
echo ""

# Test 2: Missing required document
echo "Test 2: Missing required document (vat_registration_certificate)"
curl -X POST "$ENDPOINT" \
  -H "x-publishable-api-key: $PUBLISHABLE_KEY" \
  -F 'data={"first_name":"Jane","last_name":"Smith","mobile_number":"+1234567890","email":"jane@example.com","company_legal_name":"Test Corp","company_tax_id":"TAX789","company_address":"456 Oak Ave","company_website":"https://test.com"}' \
  -F "updated_company_affidavit=@/tmp/affidavit.pdf" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'

echo ""
echo "---"
echo ""

# Test 3: Missing required text field
echo "Test 3: Missing required text field (email)"
curl -X POST "$ENDPOINT" \
  -H "x-publishable-api-key: $PUBLISHABLE_KEY" \
  -F 'data={"first_name":"Bob","last_name":"Johnson","mobile_number":"+1234567890","company_legal_name":"Bob Corp","company_tax_id":"TAX999","company_address":"789 Pine Rd","company_website":"https://bob.com"}' \
  -F "vat_registration_certificate=@/tmp/vat-cert.pdf" \
  -F "updated_company_affidavit=@/tmp/affidavit.pdf" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'

echo ""
echo "---"
echo ""

# Test 4: Invalid email format
echo "Test 4: Invalid email format"
curl -X POST "$ENDPOINT" \
  -H "x-publishable-api-key: $PUBLISHABLE_KEY" \
  -F 'data={"first_name":"Alice","last_name":"Williams","mobile_number":"+1234567890","email":"not-an-email","company_legal_name":"Alice Inc","company_tax_id":"TAX111","company_address":"321 Elm St","company_website":"https://alice.com"}' \
  -F "vat_registration_certificate=@/tmp/vat-cert.pdf" \
  -F "updated_company_affidavit=@/tmp/affidavit.pdf" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'

echo ""
echo "=== Tests Complete ==="
echo ""
echo "To verify database records, run:"
echo "  SELECT * FROM seller_registration_request;"
echo "  SELECT * FROM seller_registration_document;"
echo ""
echo "To check uploaded files:"
echo "  ls -la uploads/seller-registrations/*/"
