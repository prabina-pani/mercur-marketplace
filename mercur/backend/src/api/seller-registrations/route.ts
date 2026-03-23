import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { createSellerCreationRequestWorkflow } from "@mercurjs/requests/workflows"
import {
  SELLER_REGISTRATION_MODULE,
  type SellerRegistrationModuleService,
} from "../../modules/seller_registration"
import {
  DOCUMENT_TYPE,
  PAYLOAD_KEYS,
  REGISTRATION_STATUS,
} from "../../modules/seller_registration/constants"
import { getSellerRegistrationAbsoluteUploadRoot } from "../../modules/seller_registration/upload-root"
import { promises as fs } from "fs"
import path from "path"
import { randomUUID } from "crypto"

const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"]
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

interface ValidationError {
  field: string
  message: string
}

function sanitizeFilename(originalName: string): string {
  // Extract basename to prevent path traversal
  const basename = path.basename(originalName)
  
  // Remove all non-alphanumeric except dots, underscores, and hyphens
  const sanitized = basename.replace(/[^a-zA-Z0-9._-]/g, "_")
  
  // Prevent empty filenames or files starting with dots (hidden files)
  if (!sanitized || sanitized.startsWith(".")) {
    return `file-${randomUUID().slice(0, 8)}.bin`
  }
  
  const ext = path.extname(sanitized)
  const nameWithoutExt = path.basename(sanitized, ext)
  
  // Truncate long filenames (max 100 chars before extension)
  const truncatedName = nameWithoutExt.slice(0, 100)
  const randomSuffix = randomUUID().slice(0, 8)
  
  return `${truncatedName}-${randomSuffix}${ext}`
}

function validateTextField(
  field: string,
  value: any,
  required: boolean = true
): ValidationError | null {
  if (required && (!value || typeof value !== "string" || value.trim() === "")) {
    return { field, message: `${field} is required` }
  }
  return null
}

function validateEmail(email: string): ValidationError | null {
  // More comprehensive email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  
  if (!emailRegex.test(email) || email.length > 254) {
    return { field: "email", message: "Invalid email format" }
  }
  return null
}

function validateUrl(url: string): ValidationError | null {
  try {
    const parsed = new URL(url)
    // Only allow http and https protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { field: "company_website", message: "Website must use http or https protocol" }
    }
    return null
  } catch {
    return { field: "company_website", message: "Invalid website URL format" }
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const errors: ValidationError[] = []

  // Parse multipart files
  const files = (req as any).files as {
    [fieldname: string]: Express.Multer.File[]
  }

  if (!files) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "No files were uploaded"
    )
  }

  // Validate both document types are present
  const vatCertFile = files["vat_registration_certificate"]?.[0]
  const affidavitFile = files["updated_company_affidavit"]?.[0]

  if (!vatCertFile) {
    errors.push({
      field: "vat_registration_certificate",
      message: "Missing required document: vat_registration_certificate",
    })
  }

  if (!affidavitFile) {
    errors.push({
      field: "updated_company_affidavit",
      message: "Missing required document: updated_company_affidavit",
    })
  }

  // Validate file MIME types and sizes
  const validateFile = (
    file: Express.Multer.File | undefined,
    fieldName: string
  ) => {
    if (!file) return

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      errors.push({
        field: fieldName,
        message: `Invalid MIME type for ${fieldName}. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`,
      })
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      errors.push({
        field: fieldName,
        message: `File size exceeds ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB for ${fieldName}`,
      })
    }
  }

  validateFile(vatCertFile, "vat_registration_certificate")
  validateFile(affidavitFile, "updated_company_affidavit")

  // Parse JSON data from body field
  let data: Record<string, any>
  try {
    const bodyData = (req.body as any).data
    if (!bodyData) {
      return res.status(400).json({
        message: "Validation failed",
        errors: [{ field: "data", message: "Request body 'data' field is required" }],
      })
    }
    data = typeof bodyData === "string" ? JSON.parse(bodyData) : bodyData
  } catch (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: [{ field: "data", message: "Invalid JSON in 'data' field" }],
    })
  }

  // Validate text fields from data object
  const textFieldErrors = [
    validateTextField("first_name", data.first_name),
    validateTextField("middle_name", data.middle_name, false), // optional
    validateTextField("last_name", data.last_name),
    validateTextField("mobile_number", data.mobile_number),
    validateTextField("email", data.email),
    validateTextField("company_legal_name", data.company_legal_name),
    validateTextField("company_tax_id", data.company_tax_id),
    validateTextField("company_address", data.company_address),
    validateTextField("company_website", data.company_website),
  ].filter((err): err is ValidationError => err !== null)

  errors.push(...textFieldErrors)

  // Validate email format
  if (data.email && typeof data.email === "string") {
    const emailError = validateEmail(data.email)
    if (emailError) {
      errors.push(emailError)
    }
  }

  // Validate website URL format
  if (data.company_website && typeof data.company_website === "string") {
    const urlError = validateUrl(data.company_website)
    if (urlError) {
      errors.push(urlError)
    }
  }

  // Additional security: check for excessively long strings (potential DoS)
  const maxFieldLength = 500
  for (const key of Object.keys(data)) {
    if (typeof data[key] === "string" && data[key].length > maxFieldLength) {
      errors.push({
        field: key,
        message: `${key} exceeds maximum length of ${maxFieldLength} characters`,
      })
    }
  }

  // Return validation errors if any
  if (errors.length > 0) {
    return res.status(400).json({
      message: "Validation failed",
      errors,
    })
  }

  // Build payload with only allowed keys
  const payload: Record<string, any> = {}
  for (const key of PAYLOAD_KEYS) {
    if (data[key] !== undefined) {
      payload[key] = data[key]
    }
  }

  const absoluteUploadRoot = getSellerRegistrationAbsoluteUploadRoot()

  const requestId = randomUUID()
  const requestUploadDir = path.join(absoluteUploadRoot, requestId)

  // Prepare filenames before any I/O
  const vatCertFilename = sanitizeFilename(vatCertFile!.originalname)
  const affidavitFilename = sanitizeFilename(affidavitFile!.originalname)
  const vatCertPath = path.join(requestUploadDir, vatCertFilename)
  const affidavitPath = path.join(requestUploadDir, affidavitFilename)

  const sellerRegistrationService =
    req.scope.resolve<SellerRegistrationModuleService>(
      SELLER_REGISTRATION_MODULE
    )

  let filesWritten = false

  try {
    // Step 1: Create DB records first (fail fast if DB issues)
    const registrationRequest =
      await sellerRegistrationService.createSellerRegistrationRequests({
        id: requestId,
        status: REGISTRATION_STATUS.PENDING,
        payload,
      })

    // Step 2: Create document metadata rows
    await sellerRegistrationService.createSellerRegistrationDocuments([
      {
        registration_request_id: requestId,
        document_type: DOCUMENT_TYPE.VAT_REGISTRATION_CERTIFICATE,
        original_filename: vatCertFile!.originalname,
        mime_type: vatCertFile!.mimetype,
        size_bytes: vatCertFile!.size,
        storage_key: path.join(requestId, vatCertFilename),
      },
      {
        registration_request_id: requestId,
        document_type: DOCUMENT_TYPE.UPDATED_COMPANY_AFFIDAVIT,
        original_filename: affidavitFile!.originalname,
        mime_type: affidavitFile!.mimetype,
        size_bytes: affidavitFile!.size,
        storage_key: path.join(requestId, affidavitFilename),
      },
    ])

    // Step 3: Write files to disk (after DB success)
    await fs.mkdir(requestUploadDir, { recursive: true })
    filesWritten = true

    await Promise.all([
      fs.writeFile(vatCertPath, vatCertFile!.buffer),
      fs.writeFile(affidavitPath, affidavitFile!.buffer),
    ])

    const memberDisplayName = [
      payload.first_name,
      payload.middle_name,
      payload.last_name,
    ]
      .filter((p) => p && String(p).trim())
      .map((p) => String(p).trim())
      .join(" ")

    await createSellerCreationRequestWorkflow.run({
      container: req.scope,
      input: {
        type: "seller",
        data: {
          seller: { name: String(payload.company_legal_name ?? "").trim() },
          member: {
            name: memberDisplayName,
            email: String(payload.email ?? "").trim(),
          },
          provider_identity_id: String(payload.email ?? "").trim(),
          seller_registration_id: requestId,
          seller_registration_payload: payload,
        },
        submitter_id: `seller_registration:${requestId}`,
      },
    })

    return res.status(201).json({
      id: registrationRequest.id,
      status: registrationRequest.status,
    })
  } catch (error) {
    // Clean up files only if they were written
    if (filesWritten) {
      try {
        await fs.rm(requestUploadDir, { recursive: true, force: true })
      } catch (cleanupError) {
        console.error("Failed to clean up upload directory:", cleanupError)
      }
    }

    // Return user-friendly error without exposing internals
    console.error("Seller registration error:", error)
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Failed to create seller registration. Please try again."
    )
  }
}
