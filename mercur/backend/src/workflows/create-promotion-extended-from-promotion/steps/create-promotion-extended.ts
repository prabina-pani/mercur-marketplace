import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PROMOTION_EXTENDED_MODULE } from "../../../modules/promotion-extended"
import PromotionExtendedModuleService from "../../../modules/promotion-extended/service"

type CreatePromotionExtendedStepInput = {
  start_date?: string
  end_date?: string
  order_count?: number
}

export const createPromotionExtendedStep = createStep(
  "create-promotion-extended",
  async (data: CreatePromotionExtendedStepInput, { container }) => {
    const hasData =
      data.start_date != null ||
      data.end_date != null ||
      data.order_count != null

    if (!hasData) {
      return new StepResponse(undefined, undefined)
    }

    const service: PromotionExtendedModuleService = container.resolve(
      PROMOTION_EXTENDED_MODULE
    )

    const promotionExtended = await service.createPromotionExtendeds({
      start_date: data.start_date ? new Date(data.start_date) : null,
      end_date: data.end_date ? new Date(data.end_date) : null,
      order_count: data.order_count ?? 0,
    })

    const created = Array.isArray(promotionExtended)
      ? promotionExtended[0]
      : promotionExtended

    return new StepResponse(created, created)
  },
  async (created, { container }) => {
    if (!created) {
      return
    }

    const service: PromotionExtendedModuleService = container.resolve(
      PROMOTION_EXTENDED_MODULE
    )

    await service.deletePromotionExtendeds(created.id)
  }
)
