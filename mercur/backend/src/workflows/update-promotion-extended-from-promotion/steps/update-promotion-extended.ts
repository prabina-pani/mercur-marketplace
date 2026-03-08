import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PROMOTION_EXTENDED_MODULE } from "../../../modules/promotion-extended"
import PromotionExtendedModuleService from "../../../modules/promotion-extended/service"

type UpdatePromotionExtendedStepInput = {
  id: string
  start_date?: string | null
  end_date?: string | null
  order_count?: number | null
}

export const updatePromotionExtendedStep = createStep(
  "update-promotion-extended",
  async (input: UpdatePromotionExtendedStepInput, { container }) => {
    const service: PromotionExtendedModuleService = container.resolve(
      PROMOTION_EXTENDED_MODULE
    )

    const prev = await service.retrievePromotionExtended(input.id)

    const updated = await service.updatePromotionExtendeds({
      id: input.id,
      start_date: input.start_date !== undefined
        ? (input.start_date ? new Date(input.start_date) : null)
        : undefined,
      end_date: input.end_date !== undefined
        ? (input.end_date ? new Date(input.end_date) : null)
        : undefined,
      order_count: input.order_count !== undefined
        ? (input.order_count ?? 0)
        : undefined,
    })

    const result = Array.isArray(updated) ? updated[0] : updated

    return new StepResponse(result, prev)
  },
  async (prevData, { container }) => {
    if (!prevData) return

    const service: PromotionExtendedModuleService = container.resolve(
      PROMOTION_EXTENDED_MODULE
    )

    await service.updatePromotionExtendeds(prevData)
  }
)
