import { createPromotionsWorkflow } from "@medusajs/medusa/core-flows"
import {
  createPromotionExtendedFromPromotionWorkflow,
  CreatePromotionExtendedFromPromotionInput,
} from "../create-promotion-extended-from-promotion"

createPromotionsWorkflow.hooks.promotionsCreated(
  async ({ promotions, additional_data }, { container }) => {
    const workflow = createPromotionExtendedFromPromotionWorkflow(container)

    await Promise.all(
      promotions.map((promotion) =>
        workflow.run({
          input: {
            promotion,
            additional_data,
          } as CreatePromotionExtendedFromPromotionInput,
        })
      )
    )
  }
)
