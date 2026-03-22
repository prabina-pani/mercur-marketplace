import { MedusaService } from "@medusajs/framework/utils"
import { SellerRegistrationDocument, SellerRegistrationRequest } from "./models/seller-registration"

export default class SellerRegistrationModuleService extends MedusaService({
  SellerRegistrationRequest,
  SellerRegistrationDocument,
}) {}
