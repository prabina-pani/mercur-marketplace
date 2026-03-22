import SellerRegistrationModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

/** Must match `npx medusa db:generate seller_registration` */
export const SELLER_REGISTRATION_MODULE = "seller_registration"

export type { default as SellerRegistrationModuleService } from "./service"

export default Module(SELLER_REGISTRATION_MODULE, {
  service: SellerRegistrationModuleService,
})
