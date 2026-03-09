import {
  createWorkflow,
  when,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  dismissRemoteLinkStep,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { PROMOTION_EXTENDED_MODULE } from "../../modules/promotion-extended"
import { WORKFLOW_NAMES } from "../../modules/promotion-extended/constants"
import { PromotionWithExtended } from "../../modules/promotion-extended/types"
import { deletePromotionExtendedStep } from "../update-promotion-extended-from-promotion/steps/delete-promotion-extended"

export type DeletePromotionExtendedFromPromotionInput = {
  promotion_id: string
}

export const deletePromotionExtendedFromPromotionWorkflow = createWorkflow(
  WORKFLOW_NAMES.DELETE_PROMOTION_EXTENDED_FROM_PROMOTION,
  (input: DeletePromotionExtendedFromPromotionInput) => {
    const queryResult = useQueryGraphStep({
      entity: "promotion",
      fields: ["id", "promotion_extended.*"],
      filters: {
        id: input.promotion_id,
      },
    })

    const promotions = queryResult.data as PromotionWithExtended[]

    when(
      "cleanup-promotion-extended",
      { promotions },
      (data) => {
        const p = data.promotions[0]
        return !!p?.promotion_extended
      }
    ).then(() => {
      const promotionExtended = transform(
        { promotions },
        ({ promotions }) => {
          const p = promotions[0] as PromotionWithExtended
          return p.promotion_extended!
        }
      )

      deletePromotionExtendedStep({
        promotion_extended: promotionExtended,
      })

      dismissRemoteLinkStep([
        {
          [Modules.PROMOTION]: {
            promotion_id: input.promotion_id,
          },
          [PROMOTION_EXTENDED_MODULE]: {
            promotion_extended_id: promotionExtended.id,
          },
        },
      ])
    })

    return new WorkflowResponse({ promotion_id: input.promotion_id })
  }
)
