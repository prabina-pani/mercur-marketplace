import {
  createWorkflow,
  when,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createRemoteLinkStep,
  dismissRemoteLinkStep,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows"
import { PromotionDTO } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { PROMOTION_EXTENDED_MODULE } from "../../modules/promotion-extended"
import { WORKFLOW_NAMES } from "../../modules/promotion-extended/constants"
import { PromotionWithExtended } from "../../modules/promotion-extended/types"
import { createPromotionExtendedStep } from "../create-promotion-extended-from-promotion/steps/create-promotion-extended"
import { deletePromotionExtendedStep } from "./steps/delete-promotion-extended"
import { updatePromotionExtendedStep } from "./steps/update-promotion-extended"

export type UpdatePromotionExtendedFromPromotionInput = {
  promotion: PromotionDTO
  additional_data?: {
    start_date?: string | null
    end_date?: string | null
    order_count?: number | null
  }
}

export const updatePromotionExtendedFromPromotionWorkflow = createWorkflow(
  WORKFLOW_NAMES.UPDATE_PROMOTION_EXTENDED_FROM_PROMOTION,
  (input: UpdatePromotionExtendedFromPromotionInput) => {
    const queryResult = useQueryGraphStep({
      entity: "promotion",
      fields: ["id", "promotion_extended.*"],
      filters: {
        id: input.promotion.id,
      },
    })

    const promotions = queryResult.data as PromotionWithExtended[]

    const createBranch = when(
      "create-promotion-extended-link",
      { input, promotions },
      (data) => {
        const p = data.promotions[0]
        if (!p) return false
        return (
          !p.promotion_extended &&
          (data.input.additional_data?.start_date != null ||
            data.input.additional_data?.end_date != null ||
            data.input.additional_data?.order_count != null)
        )
      }
    ).then(() => {
      const promotionExtended = createPromotionExtendedStep({
        start_date: input.additional_data?.start_date ?? null,
        end_date: input.additional_data?.end_date ?? null,
        order_count: input.additional_data?.order_count ?? 0,
      })

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

      return promotionExtended
    })

    const deleteBranch = when(
      "delete-promotion-extended-link",
      { input, promotions },
      (data) => {
        const p = data.promotions[0]
        if (!p) return false
        return (
          !!p.promotion_extended &&
          data.input.additional_data?.start_date === null &&
          data.input.additional_data?.end_date === null &&
          data.input.additional_data?.order_count === null
        )
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
            promotion_id: input.promotion.id,
          },
          [PROMOTION_EXTENDED_MODULE]: {
            promotion_extended_id: promotionExtended.id,
          },
        },
      ])

      return promotionExtended.id
    })

    const updateBranch = when(
      "update-promotion-extended",
      { input, promotions },
      (data) => {
        const p = data.promotions[0]
        if (!p) return false

        const hasUpdate =
          data.input.additional_data?.start_date !== undefined ||
          data.input.additional_data?.end_date !== undefined ||
          data.input.additional_data?.order_count !== undefined

        const isFullDelete =
          data.input.additional_data?.start_date === null &&
          data.input.additional_data?.end_date === null &&
          data.input.additional_data?.order_count === null

        return !!p.promotion_extended && hasUpdate && !isFullDelete
      }
    ).then(() => {
      const promotionExtended = transform(
        { promotions },
        ({ promotions }) => {
          const p = promotions[0] as PromotionWithExtended
          return p.promotion_extended!
        }
      )

      return updatePromotionExtendedStep({
        id: promotionExtended.id,
        start_date: input.additional_data?.start_date,
        end_date: input.additional_data?.end_date,
        order_count: input.additional_data?.order_count,
      })
    })

    const result = {
      created: createBranch,
      updated: updateBranch,
      deleted: deleteBranch,
    }

    return new WorkflowResponse(result)
  }
)
