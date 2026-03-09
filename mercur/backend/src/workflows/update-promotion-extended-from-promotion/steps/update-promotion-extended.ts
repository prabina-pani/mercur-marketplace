import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"
import { PROMOTION_EXTENDED_MODULE } from "../../../modules/promotion-extended"
import PromotionExtendedModuleService from "../../../modules/promotion-extended/service"
import { STEP_NAMES } from "../../../modules/promotion-extended/constants"
import {
  PromotionExtendedNotFoundError,
  PromotionExtendedUpdateError,
} from "../../../modules/promotion-extended/errors"

export type UpdatePromotionExtendedStepInput = {
  id: string
  start_date?: string | null
  end_date?: string | null
  order_count?: number | null
}

export async function updatePromotionExtendedHandler(
  input: UpdatePromotionExtendedStepInput,
  container: { resolve: (key: string) => any }
) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER) as Logger
  const service: PromotionExtendedModuleService = container.resolve(
    PROMOTION_EXTENDED_MODULE
  )

  try {
    const prev = await service.retrievePromotionExtended(input.id)
    if (!prev) {
      throw new PromotionExtendedNotFoundError(input.id)
    }

    const updated = await service.updatePromotionExtendeds({
      id: input.id,
      start_date:
        input.start_date !== undefined
          ? input.start_date
            ? new Date(input.start_date)
            : null
          : undefined,
      end_date:
        input.end_date !== undefined
          ? input.end_date
            ? new Date(input.end_date)
            : null
          : undefined,
      order_count:
        input.order_count !== undefined
          ? input.order_count ?? 0
          : undefined,
    })

    const result = Array.isArray(updated) ? updated[0] : updated

    logger.info(`PromotionExtended updated: ${input.id}`)

    return { output: result, compensateInput: prev }
  } catch (error) {
    if (
      error instanceof PromotionExtendedNotFoundError ||
      error instanceof PromotionExtendedUpdateError
    ) {
      throw error
    }
    const message = error instanceof Error ? error.message : String(error)
    logger.error(`PromotionExtended update failed for ${input.id}: ${message}`)
    throw new PromotionExtendedUpdateError(message)
  }
}

export async function updatePromotionExtendedCompensation(
  prevData: any,
  container: { resolve: (key: string) => any }
) {
  if (!prevData) return

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER) as Logger
  const service: PromotionExtendedModuleService = container.resolve(
    PROMOTION_EXTENDED_MODULE
  )

  try {
    await service.updatePromotionExtendeds(prevData)
    logger.info(`PromotionExtended update compensated: ${prevData.id}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error(
      `PromotionExtended update compensation failed for ${prevData.id}: ${message}`
    )
  }
}

export const updatePromotionExtendedStep = createStep(
  STEP_NAMES.UPDATE_PROMOTION_EXTENDED,
  async (input: UpdatePromotionExtendedStepInput, { container }) => {
    const result = await updatePromotionExtendedHandler(input, container)
    return new StepResponse(result.output, result.compensateInput)
  },
  async (prevData, { container }) => {
    await updatePromotionExtendedCompensation(prevData, container)
  }
)
