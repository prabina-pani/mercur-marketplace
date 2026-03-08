import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { PromotionDTO } from "@medusajs/framework/types"
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { PROMOTION_EXTENDED_MODULE } from "../../modules/promotion-extended"
import { createPromotionExtendedStep } from "./steps/create-promotion-extended"

export type CreatePromotionExtendedFromPromotionInput = {
  promotion: PromotionDTO
  additional_data?: {
    start_date?: string
    end_date?: string
    order_count?: number
  }
}

export const createPromotionExtendedFromPromotionWorkflow = createWorkflow(
  "create-promotion-extended-from-promotion",
  (input: CreatePromotionExtendedFromPromotionInput) => {
    const startDate = transform(
      { input },
      (data) => data.input.additional_data?.start_date || ""
    )

    const endDate = transform(
      { input },
      (data) => data.input.additional_data?.end_date || ""
    )

    const orderCount = transform(
      { input },
      (data) => data.input.additional_data?.order_count ?? 0
    )

    const promotionExtended = createPromotionExtendedStep({
      start_date: startDate,
      end_date: endDate,
      order_count: orderCount,
    })

    when(
      { promotionExtended },
      ({ promotionExtended }) => promotionExtended !== undefined
    ).then(() => {
      createRemoteLinkStep([
        {
          [Modules.PROMOTION]: {
            promotion_id: input.promotion.id,
          },
          [PROMOTION_EXTENDED_MODULE]: {
            promotion_extended_id: promotionExtended.id,
          },
        },
      ])
    })

    return new WorkflowResponse({
      promotionExtended,
    })
  }
)
