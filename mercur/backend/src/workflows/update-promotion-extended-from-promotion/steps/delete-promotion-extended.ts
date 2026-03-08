import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PROMOTION_EXTENDED_MODULE } from "../../../modules/promotion-extended"
import PromotionExtendedModuleService from "../../../modules/promotion-extended/service"

type DeletePromotionExtendedStepInput = {
  promotion_extended: {
    id: string
    start_date?: Date | null
    end_date?: Date | null
    order_count?: number
  }
}

export const deletePromotionExtendedStep = createStep(
  "delete-promotion-extended",
  async (input: DeletePromotionExtendedStepInput, { container }) => {
    const service: PromotionExtendedModuleService = container.resolve(
      PROMOTION_EXTENDED_MODULE
    )

    await service.deletePromotionExtendeds(input.promotion_extended.id)

    return new StepResponse(
      input.promotion_extended,
      input.promotion_extended
    )
  },
  async (deleted, { container }) => {
    if (!deleted) return

    const service: PromotionExtendedModuleService = container.resolve(
      PROMOTION_EXTENDED_MODULE
    )

    await service.createPromotionExtendeds({
      id: deleted.id,
      start_date: deleted.start_date ?? null,
      end_date: deleted.end_date ?? null,
      order_count: deleted.order_count ?? 0,
    })
  }
)
