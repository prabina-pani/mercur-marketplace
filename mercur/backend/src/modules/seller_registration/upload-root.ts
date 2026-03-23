import path from "path"

export function getSellerRegistrationAbsoluteUploadRoot(): string {
  const uploadRoot =
    process.env.SELLER_REGISTRATION_UPLOAD_ROOT ||
    "uploads/seller-registrations"
  return path.isAbsolute(uploadRoot)
    ? uploadRoot
    : path.join(process.cwd(), uploadRoot)
}
