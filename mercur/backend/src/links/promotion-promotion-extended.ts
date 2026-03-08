import { defineLink } from "@medusajs/framework/utils"
import PromotionModule from "@medusajs/medusa/promotion"
import PromotionExtendedModule from "../modules/promotion-extended"

export default defineLink(
  PromotionModule.linkable.promotion,
  PromotionExtendedModule.linkable.promotionExtended
)
