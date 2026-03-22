/** PoC registration lifecycle — matches DB enum on `seller_registration_request.status` */
export const REGISTRATION_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const

export type RegistrationStatus =
  (typeof REGISTRATION_STATUS)[keyof typeof REGISTRATION_STATUS]

/** Machine values for `seller_registration_document.document_type` */
export const DOCUMENT_TYPE = {
  VAT_REGISTRATION_CERTIFICATE: "vat_registration_certificate",
  UPDATED_COMPANY_AFFIDAVIT: "updated_company_affidavit",
} as const

export type DocumentType = (typeof DOCUMENT_TYPE)[keyof typeof DOCUMENT_TYPE]

/** Canonical JSON keys for `seller_registration_request.payload` (Story 1.1) */
export const PAYLOAD_KEYS = [
  "first_name",
  "middle_name",
  "last_name",
  "mobile_number",
  "email",
  "company_legal_name",
  "company_tax_id",
  "company_address",
  "company_website",
] as const

export type PayloadKey = (typeof PAYLOAD_KEYS)[number]
