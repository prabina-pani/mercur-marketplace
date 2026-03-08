import { model } from "@medusajs/framework/utils"

export const PromotionExtended = model.define("promotion_extended", {
  id: model.id().primaryKey(),
  start_date: model.dateTime().nullable(),
  end_date: model.dateTime().nullable(),
  order_count: model.number().default(0),
})

export default PromotionExtended
