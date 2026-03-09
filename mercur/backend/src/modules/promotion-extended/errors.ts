import { ERROR_MESSAGES } from "./constants"

export class PromotionExtendedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "PromotionExtendedError"
  }
}

export class PromotionExtendedNotFoundError extends PromotionExtendedError {
  constructor(id?: string) {
    const msg = id
      ? `${ERROR_MESSAGES.PROMOTION_EXTENDED_NOT_FOUND}: ${id}`
      : ERROR_MESSAGES.PROMOTION_EXTENDED_NOT_FOUND
    super(msg)
    this.name = "PromotionExtendedNotFoundError"
  }
}

export class PromotionExtendedCreateError extends PromotionExtendedError {
  constructor(detail?: string) {
    const msg = detail
      ? `${ERROR_MESSAGES.PROMOTION_EXTENDED_CREATE_FAILED}: ${detail}`
      : ERROR_MESSAGES.PROMOTION_EXTENDED_CREATE_FAILED
    super(msg)
    this.name = "PromotionExtendedCreateError"
  }
}

export class PromotionExtendedUpdateError extends PromotionExtendedError {
  constructor(detail?: string) {
    const msg = detail
      ? `${ERROR_MESSAGES.PROMOTION_EXTENDED_UPDATE_FAILED}: ${detail}`
      : ERROR_MESSAGES.PROMOTION_EXTENDED_UPDATE_FAILED
    super(msg)
    this.name = "PromotionExtendedUpdateError"
  }
}

export class PromotionExtendedDeleteError extends PromotionExtendedError {
  constructor(detail?: string) {
    const msg = detail
      ? `${ERROR_MESSAGES.PROMOTION_EXTENDED_DELETE_FAILED}: ${detail}`
      : ERROR_MESSAGES.PROMOTION_EXTENDED_DELETE_FAILED
    super(msg)
    this.name = "PromotionExtendedDeleteError"
  }
}
