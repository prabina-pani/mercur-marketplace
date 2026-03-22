# Security Review: Seller Registration API

## Overview

This document outlines the security measures implemented for the seller registration endpoint and recommendations for production deployment.

## Implemented Security Controls

### 1. Input Validation

#### File Uploads
- **MIME Type Allowlist**: Only `application/pdf`, `image/jpeg`, `image/png` accepted
- **File Size Limits**: 10 MB maximum per file (enforced at multer and validation layers)
- **File Count Limit**: Maximum 2 files total
- **Filename Sanitization**: 
  - Path traversal prevention via `path.basename()`
  - Alphanumeric + dots/underscores/hyphens only
  - Hidden files (starting with `.`) rejected
  - Long filenames truncated to 100 characters
  - Random UUID suffix added to prevent collisions

#### Text Fields
- **Required Field Validation**: All mandatory fields checked for presence and non-empty strings
- **Email Validation**: RFC 5322 subset regex + 254 character limit
- **URL Validation**: `company_website` validated with URL constructor, restricted to http/https protocols
- **Length Limits**: 500 character maximum per field (DoS prevention)
- **Unknown Keys**: Stripped from payload to enforce contract

### 2. Data Integrity

#### Atomicity
- **DB-First Approach**: Database records created before files written to disk
- **Fail-Fast**: If DB operations fail, no files are written
- **Cleanup on Error**: Files removed if written but subsequent operations fail
- **Order of Operations**:
  1. Create `seller_registration_request` row
  2. Create `seller_registration_document` rows
  3. Write files to disk

#### Storage
- **Isolated Directories**: Each request gets unique UUID-based directory
- **Relative Paths**: `storage_key` stored as relative path for portability
- **Configurable Root**: `SELLER_REGISTRATION_UPLOAD_ROOT` environment variable

### 3. Error Handling

- **Generic Error Messages**: Internal errors not exposed to clients
- **Server-Side Logging**: Detailed errors logged with `console.error`
- **Structured Validation Errors**: Client receives specific field-level errors for validation failures
- **No Stack Traces**: Production errors sanitized

### 4. Access Control

- **Public Endpoint**: No authentication required (intentional for registration)
- **No Publishable Key**: Route outside `/store` to avoid Medusa key requirement
- **No Authorization**: Anyone can submit (rate limiting recommended for production)

## Attack Vectors Mitigated

| Attack | Mitigation |
|--------|-----------|
| **Path Traversal** | `path.basename()` + filename sanitization + UUID directories |
| **File Bomb** | 10 MB size limit enforced at multer level |
| **MIME Spoofing** | Allowlist validation (note: content-based detection not implemented in PoC) |
| **DoS via Large Payloads** | 500 char field limits + multer file limits |
| **SQL Injection** | Medusa ORM parameterization (MedusaService) |
| **XSS** | No HTML rendering; JSON API only |
| **Directory Listing** | Files stored in non-public directory |
| **Filename Collision** | Random UUID suffix on all filenames |

## Remaining Risks (PoC Limitations)

### High Priority for Production

1. **Rate Limiting**
   - **Risk**: Unlimited registration attempts enable spam/abuse
   - **Recommendation**: Implement rate limiting (e.g., 5 requests/hour per IP)
   - **Implementation**: Use Redis-backed rate limiter middleware

2. **Bot Prevention**
   - **Risk**: Automated bot submissions
   - **Recommendation**: Add CAPTCHA (e.g., reCAPTCHA v3) or honeypot fields
   - **Implementation**: Client-side CAPTCHA token validation

3. **Virus Scanning**
   - **Risk**: Malicious file uploads
   - **Recommendation**: Integrate ClamAV or cloud-based scanner
   - **Implementation**: Scan files before writing to disk

4. **Content-Based MIME Detection**
   - **Risk**: MIME type spoofing (e.g., executable disguised as PDF)
   - **Recommendation**: Use `file-type` npm package for magic number detection
   - **Implementation**: Validate file content matches declared MIME type

### Medium Priority for Production

5. **Idempotency**
   - **Risk**: Duplicate submissions if user retries
   - **Recommendation**: Idempotency keys or email-based deduplication
   - **Implementation**: Check for existing pending request with same email

6. **CORS Configuration**
   - **Risk**: Unrestricted cross-origin access
   - **Recommendation**: Configure CORS for specific allowed origins
   - **Implementation**: Add CORS middleware for `/seller-registrations` route

7. **Audit Logging**
   - **Risk**: No compliance trail for registrations
   - **Recommendation**: Log all registration attempts (success/failure)
   - **Implementation**: Structured logging with request metadata

8. **PII Encryption**
   - **Risk**: Sensitive data stored in plaintext
   - **Recommendation**: Encrypt `payload` JSON at rest
   - **Implementation**: Database-level encryption or application-level field encryption

### Low Priority (Nice-to-Have)

9. **Email Verification**
   - **Risk**: Fake email addresses
   - **Recommendation**: Send verification email before admin review
   - **Implementation**: Temporary token + verification link

10. **Phone Number Validation**
    - **Risk**: Invalid phone numbers
    - **Recommendation**: Use libphonenumber for validation
    - **Implementation**: Validate `mobile_number` format and country code

## Testing Recommendations

### Security Testing

```bash
# Test path traversal
curl -X POST "http://localhost:9000/seller-registrations" \
  -F 'data={"first_name":"Test","last_name":"User","mobile_number":"+1234567890","email":"test@example.com","company_legal_name":"Test","company_tax_id":"TAX123","company_address":"123 St","company_website":"https://test.com"}' \
  -F "vat_registration_certificate=@../../../etc/passwd" \
  -F "updated_company_affidavit=@test.pdf"

# Test oversized file (should fail at multer)
dd if=/dev/zero of=/tmp/large.pdf bs=1M count=11
curl -X POST "http://localhost:9000/seller-registrations" \
  -F 'data={...}' \
  -F "vat_registration_certificate=@/tmp/large.pdf" \
  -F "updated_company_affidavit=@test.pdf"

# Test invalid MIME type
curl -X POST "http://localhost:9000/seller-registrations" \
  -F 'data={...}' \
  -F "vat_registration_certificate=@malicious.exe" \
  -F "updated_company_affidavit=@test.pdf"

# Test long strings (DoS attempt)
curl -X POST "http://localhost:9000/seller-registrations" \
  -F 'data={"first_name":"'$(python3 -c 'print("A"*1000)')'","last_name":"User",...}' \
  -F "vat_registration_certificate=@test.pdf" \
  -F "updated_company_affidavit=@test.pdf"

# Test SQL injection (should be safe via ORM)
curl -X POST "http://localhost:9000/seller-registrations" \
  -F 'data={"first_name":"Robert\"; DROP TABLE seller_registration_request;--","last_name":"User",...}' \
  -F "vat_registration_certificate=@test.pdf" \
  -F "updated_company_affidavit=@test.pdf"
```

### Load Testing

```bash
# Test concurrent requests (check for race conditions)
for i in {1..10}; do
  curl -X POST "http://localhost:9000/seller-registrations" \
    -F 'data={...}' \
    -F "vat_registration_certificate=@test.pdf" \
    -F "updated_company_affidavit=@test.pdf" &
done
wait
```

## Compliance Considerations

### GDPR (if applicable)
- ✅ Data minimization: Only required fields collected
- ⚠️ Right to erasure: Admin delete endpoint needed (Epic 2)
- ⚠️ Data retention: Retention policy not defined
- ⚠️ Consent: No explicit consent mechanism

### PCI DSS (if payment data added)
- ✅ No payment data in registration
- ✅ Files stored outside web root

### SOC 2 (if required)
- ⚠️ Audit logging needed
- ⚠️ Access controls for admin endpoints (Epic 2)
- ⚠️ Encryption at rest recommended

## Monitoring Recommendations

### Metrics to Track
- Registration submission rate (per hour/day)
- Validation failure rate by field
- File upload failures
- Average file sizes
- Storage disk usage

### Alerts to Configure
- Spike in registration rate (>100/hour)
- High validation failure rate (>50%)
- Disk space low (<10% free)
- Repeated failures from same IP

## Production Deployment Checklist

- [ ] Enable rate limiting (5 req/hour per IP)
- [ ] Add CAPTCHA or honeypot
- [ ] Configure CORS for allowed origins
- [ ] Integrate virus scanning
- [ ] Set up audit logging
- [ ] Configure monitoring/alerts
- [ ] Review and set `SELLER_REGISTRATION_UPLOAD_ROOT`
- [ ] Ensure upload directory has correct permissions
- [ ] Test backup/restore of upload directory
- [ ] Document retention policy
- [ ] Add idempotency key support
- [ ] Implement email verification (optional)

## References

- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [RFC 5322 (Email)](https://tools.ietf.org/html/rfc5322)
- [Medusa Security Best Practices](https://docs.medusajs.com/)
