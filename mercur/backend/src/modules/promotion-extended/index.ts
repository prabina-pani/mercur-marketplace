import PromotionExtendedModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const PROMOTION_EXTENDED_MODULE = "promotionExtendedModule"

export default Module(PROMOTION_EXTENDED_MODULE, {
  service: PromotionExtendedModuleService,
})
