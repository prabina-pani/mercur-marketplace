import { model } from "@medusajs/framework/utils"

export const ProductExtended = model.define("product_extended", {
  id: model.id().primaryKey(),
  logistic_class: model.text(),
  brand: model.text(),
})

export default ProductExtended
