import { MedusaService } from "@medusajs/framework/utils"
import PromotionExtended from "./models/promotion-extended"

class PromotionExtendedModuleService extends MedusaService({
  PromotionExtended,
}) {}

export default PromotionExtendedModuleService
