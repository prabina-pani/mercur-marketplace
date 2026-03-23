import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  SELLER_REGISTRATION_MODULE,
  type SellerRegistrationModuleService,
} from "../../../../modules/seller_registration"

/**
 * PoC: one registration with document metadata + relative download paths for admin UI.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id as string

  const sellerRegistrationService =
    req.scope.resolve<SellerRegistrationModuleService>(
      SELLER_REGISTRATION_MODULE
    )

  const registration =
    await sellerRegistrationService.retrieveSellerRegistrationRequest(id)

  let documents =
    await sellerRegistrationService.listSellerRegistrationDocuments(
      { registration_request_id: id },
      { order: { created_at: "ASC" } },
    )
  if (!documents.length) {
    documents =
      await sellerRegistrationService.listSellerRegistrationDocuments(
        { registration_request: id },
        { order: { created_at: "ASC" } },
      )
  }

  res.status(200).json({
    seller_registration: {
      id: registration.id,
      status: registration.status,
      payload: registration.payload,
      created_at: registration.created_at,
      updated_at: registration.updated_at,
      resolved_at: registration.resolved_at,
      seller_id: registration.seller_id,
      documents: documents.map((d) => ({
        id: d.id,
        document_type: d.document_type,
        original_filename: d.original_filename,
        mime_type: d.mime_type,
        size_bytes: d.size_bytes,
        download_path: `/admin/seller-registrations/${id}/documents/${d.id}/download`,
      })),
    },
  })
}
