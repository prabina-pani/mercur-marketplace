import { MedusaService } from "@medusajs/framework/utils"
import ProductExtended from "./models/product-extended"

class ProductExtendedModuleService extends MedusaService({
  ProductExtended,
}) {}

export default ProductExtendedModuleService
