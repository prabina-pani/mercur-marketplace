import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { createReadStream } from "fs"
import { access } from "fs/promises"
import path from "path"
import {
  SELLER_REGISTRATION_MODULE,
  type SellerRegistrationModuleService,
} from "../../../../../../../modules/seller_registration"
import { getSellerRegistrationAbsoluteUploadRoot } from "../../../../../../../modules/seller_registration/upload-root"

/**
 * PoC: stream one uploaded file; only for admins, only if it belongs to this registration.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const registrationId = req.params.id as string
  const documentId = req.params.document_id as string

  const sellerRegistrationService =
    req.scope.resolve<SellerRegistrationModuleService>(
      SELLER_REGISTRATION_MODULE
    )

  const doc =
    await sellerRegistrationService.retrieveSellerRegistrationDocument(
      documentId
    )

  const docRegistrationId =
    (doc as { registration_request_id?: string }).registration_request_id ??
    (doc as { registration_request?: { id?: string } }).registration_request
      ?.id

  if (docRegistrationId !== registrationId) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Document not found for this registration"
    )
  }

  const root = path.resolve(getSellerRegistrationAbsoluteUploadRoot())
  const fullPath = path.resolve(root, doc.storage_key)
  const relativeToRoot = path.relative(root, fullPath)
  if (
    relativeToRoot.startsWith("..") ||
    path.isAbsolute(relativeToRoot) ||
    relativeToRoot === ""
  ) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Invalid storage path"
    )
  }

  try {
    await access(fullPath)
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "File not found on disk"
    )
  }

  res.setHeader(
    "Content-Type",
    doc.mime_type || "application/octet-stream"
  )
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${encodeURIComponent(doc.original_filename)}"`
  )

  createReadStream(fullPath).pipe(res)
}
