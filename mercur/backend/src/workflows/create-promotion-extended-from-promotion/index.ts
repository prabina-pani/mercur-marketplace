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
import { WORKFLOW_NAMES } from "../../modules/promotion-extended/constants"
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
  WORKFLOW_NAMES.CREATE_PROMOTION_EXTENDED_FROM_PROMOTION,
  (input: CreatePromotionExtendedFromPromotionInput) => {
    const extendedInput = transform({ input }, (data) => ({
      start_date: data.input.additional_data?.start_date ?? null,
      end_date: data.input.additional_data?.end_date ?? null,
      order_count: data.input.additional_data?.order_count ?? 0,
    }))

    const promotionExtended = createPromotionExtendedStep(extendedInput)

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
