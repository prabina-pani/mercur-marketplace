import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"
import { PROMOTION_EXTENDED_MODULE } from "../../../modules/promotion-extended"
import PromotionExtendedModuleService from "../../../modules/promotion-extended/service"
import { STEP_NAMES } from "../../../modules/promotion-extended/constants"
import {
  PromotionExtendedDeleteError,
} from "../../../modules/promotion-extended/errors"

export type DeletePromotionExtendedStepInput = {
  promotion_extended: {
    id: string
    start_date?: Date | null
    end_date?: Date | null
    order_count?: number
  }
}

export async function deletePromotionExtendedHandler(
  input: DeletePromotionExtendedStepInput,
  container: { resolve: (key: string) => any }
) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER) as Logger
  const service: PromotionExtendedModuleService = container.resolve(
    PROMOTION_EXTENDED_MODULE
  )

  try {
    await service.deletePromotionExtendeds(input.promotion_extended.id)

    logger.info(`PromotionExtended deleted: ${input.promotion_extended.id}`)

    return {
      output: input.promotion_extended,
      compensateInput: input.promotion_extended,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error(
      `PromotionExtended deletion failed for ${input.promotion_extended.id}: ${message}`
    )
    throw new PromotionExtendedDeleteError(message)
  }
}

export async function deletePromotionExtendedCompensation(
  deleted: any,
  container: { resolve: (key: string) => any }
) {
  if (!deleted) return

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER) as Logger
  const service: PromotionExtendedModuleService = container.resolve(
    PROMOTION_EXTENDED_MODULE
  )

  try {
    await service.createPromotionExtendeds({
      id: deleted.id,
      start_date: deleted.start_date ?? null,
      end_date: deleted.end_date ?? null,
      order_count: deleted.order_count ?? 0,
    })
    logger.info(`PromotionExtended deletion compensated: ${deleted.id}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error(
      `PromotionExtended deletion compensation failed for ${deleted.id}: ${message}`
    )
  }
}

export const deletePromotionExtendedStep = createStep(
  STEP_NAMES.DELETE_PROMOTION_EXTENDED,
  async (input: DeletePromotionExtendedStepInput, { container }) => {
    const result = await deletePromotionExtendedHandler(input, container)
    return new StepResponse(result.output, result.compensateInput)
  },
  async (deleted, { container }) => {
    await deletePromotionExtendedCompensation(deleted, container)
  }
)
