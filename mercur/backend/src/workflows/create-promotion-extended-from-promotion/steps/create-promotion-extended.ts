import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"
import { PROMOTION_EXTENDED_MODULE } from "../../../modules/promotion-extended"
import PromotionExtendedModuleService from "../../../modules/promotion-extended/service"
import { STEP_NAMES } from "../../../modules/promotion-extended/constants"
import {
  PromotionExtendedCreateError,
} from "../../../modules/promotion-extended/errors"

export type CreatePromotionExtendedStepInput = {
  start_date?: string | null
  end_date?: string | null
  order_count?: number
}

export async function createPromotionExtendedHandler(
  data: CreatePromotionExtendedStepInput,
  container: { resolve: (key: string) => any }
) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER) as Logger

  const hasData =
    data.start_date != null ||
    data.end_date != null ||
    data.order_count != null

  if (!hasData) {
    logger.debug("No promotion extended data provided, skipping creation")
    return { output: undefined, compensateInput: undefined }
  }

  const service: PromotionExtendedModuleService = container.resolve(
    PROMOTION_EXTENDED_MODULE
  )

  try {
    const promotionExtended = await service.createPromotionExtendeds({
      start_date: data.start_date ? new Date(data.start_date) : null,
      end_date: data.end_date ? new Date(data.end_date) : null,
      order_count: data.order_count ?? 0,
    })

    const created = Array.isArray(promotionExtended)
      ? promotionExtended[0]
      : promotionExtended

    logger.info(`PromotionExtended created: ${created.id}`)

    return { output: created, compensateInput: created }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error(`PromotionExtended creation failed: ${message}`)
    throw new PromotionExtendedCreateError(message)
  }
}

export async function createPromotionExtendedCompensation(
  created: any,
  container: { resolve: (key: string) => any }
) {
  if (!created) {
    return
  }

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER) as Logger
  const service: PromotionExtendedModuleService = container.resolve(
    PROMOTION_EXTENDED_MODULE
  )

  try {
    await service.deletePromotionExtendeds(created.id)
    logger.info(`PromotionExtended creation compensated: ${created.id}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error(
      `PromotionExtended creation compensation failed for ${created.id}: ${message}`
    )
  }
}

export const createPromotionExtendedStep = createStep(
  STEP_NAMES.CREATE_PROMOTION_EXTENDED,
  async (data: CreatePromotionExtendedStepInput, { container }) => {
    const result = await createPromotionExtendedHandler(data, container)
    return new StepResponse(result.output, result.compensateInput)
  },
  async (created, { container }) => {
    await createPromotionExtendedCompensation(created, container)
  }
)
