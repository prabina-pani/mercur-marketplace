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
  "update-promotion-extended-from-promotion",
  (input: UpdatePromotionExtendedFromPromotionInput) => {
    const queryResult = useQueryGraphStep({
      entity: "promotion",
      fields: ["id", "promotion_extended.*"],
      filters: {
        id: input.promotion.id,
      },
    })

    const promotions = queryResult.data

    const createBranch = when(
      "create-promotion-extended-link",
      { input, promotions },
      (data) => {
        const p = data.promotions[0] || {} as any
        return (
          !p.promotion_extended &&
          (data.input.additional_data?.start_date != null ||
            data.input.additional_data?.end_date != null ||
            data.input.additional_data?.order_count != null)
        )
      }
    ).then(() => {
      const promotionExtended = createPromotionExtendedStep({
        start_date: input.additional_data?.start_date ?? "",
        end_date: input.additional_data?.end_date ?? "",
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
        const p = data.promotions[0] || {} as any
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
        ({ promotions }) => (promotions[0] as any).promotion_extended
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
        const p = data.promotions[0] || {} as any
        return (
          !!p.promotion_extended &&
          (data.input.additional_data?.start_date !== undefined ||
            data.input.additional_data?.end_date !== undefined ||
            data.input.additional_data?.order_count !== undefined) &&
          !(
            data.input.additional_data?.start_date === null &&
            data.input.additional_data?.end_date === null &&
            data.input.additional_data?.order_count === null
          )
        )
      }
    ).then(() => {
      const promotionExtended = transform(
        { promotions },
        ({ promotions }) => (promotions[0] as any).promotion_extended
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
