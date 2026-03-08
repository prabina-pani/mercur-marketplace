import { updatePromotionsWorkflow } from "@medusajs/medusa/core-flows"
import {
  updatePromotionExtendedFromPromotionWorkflow,
  UpdatePromotionExtendedFromPromotionInput,
} from "../update-promotion-extended-from-promotion"

updatePromotionsWorkflow.hooks.promotionsUpdated(
  async ({ promotions, additional_data }, { container }) => {
    const workflow = updatePromotionExtendedFromPromotionWorkflow(container)

    for (const promotion of promotions) {
      await workflow.run({
        input: {
          promotion,
          additional_data,
        } as UpdatePromotionExtendedFromPromotionInput,
      })
    }
  }
)
