import { updatePromotionsWorkflow } from "@medusajs/medusa/core-flows"
import {
  updatePromotionExtendedFromPromotionWorkflow,
  UpdatePromotionExtendedFromPromotionInput,
} from "../update-promotion-extended-from-promotion"

updatePromotionsWorkflow.hooks.promotionsUpdated(
  async ({ promotions, additional_data }, { container }) => {
    const workflow = updatePromotionExtendedFromPromotionWorkflow(container)

    await Promise.all(
      promotions.map((promotion) =>
        workflow.run({
          input: {
            promotion,
            additional_data,
          } as UpdatePromotionExtendedFromPromotionInput,
        })
      )
    )
  }
)
