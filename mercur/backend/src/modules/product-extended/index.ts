import ProductExtendedModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const PRODUCT_EXTENDED_MODULE = "productExtendedModuleService"

export default Module(PRODUCT_EXTENDED_MODULE, {
  service: ProductExtendedModuleService,
})
