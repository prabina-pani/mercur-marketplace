import { deletePromotionsWorkflow } from "@medusajs/medusa/core-flows"
import { deletePromotionExtendedFromPromotionWorkflow } from "../delete-promotion-extended-from-promotion"

deletePromotionsWorkflow.hooks.promotionsDeleted(
  async ({ ids }, { container }) => {
    const workflow = deletePromotionExtendedFromPromotionWorkflow(container)

    await Promise.all(
      ids.map((id) =>
        workflow.run({
          input: { promotion_id: id },
        })
      )
    )
  }
)
