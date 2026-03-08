import { createPromotionsWorkflow } from "@medusajs/medusa/core-flows"
import {
  createPromotionExtendedFromPromotionWorkflow,
  CreatePromotionExtendedFromPromotionInput,
} from "../create-promotion-extended-from-promotion"

createPromotionsWorkflow.hooks.promotionsCreated(
  async ({ promotions, additional_data }, { container }) => {
    const workflow = createPromotionExtendedFromPromotionWorkflow(container)

    for (const promotion of promotions) {
      await workflow.run({
        input: {
          promotion,
          additional_data,
        } as CreatePromotionExtendedFromPromotionInput,
      })
    }
  }
)
