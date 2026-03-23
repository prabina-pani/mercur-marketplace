export type SellerRegistrationPayload = {
  first_name?: string
  middle_name?: string
  last_name?: string
  mobile_number?: string
  email?: string
  company_legal_name?: string
  company_tax_id?: string
  company_address?: string
  company_website?: string
}

export type SellerRegistrationDocument = {
  id: string
  document_type: string
  original_filename: string
  mime_type: string
  size_bytes: number | null
  download_path: string
}

export type SellerRegistrationDetail = {
  id: string
  status: string
  payload: SellerRegistrationPayload
  created_at?: string
  updated_at?: string
  resolved_at?: string | null
  seller_id?: string | null
  documents: SellerRegistrationDocument[]
}
