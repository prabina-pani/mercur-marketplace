export const STEP_NAMES = {
  CREATE_PROMOTION_EXTENDED: "create-promotion-extended",
  UPDATE_PROMOTION_EXTENDED: "update-promotion-extended",
  DELETE_PROMOTION_EXTENDED: "delete-promotion-extended",
} as const

export const WORKFLOW_NAMES = {
  CREATE_PROMOTION_EXTENDED_FROM_PROMOTION:
    "create-promotion-extended-from-promotion",
  UPDATE_PROMOTION_EXTENDED_FROM_PROMOTION:
    "update-promotion-extended-from-promotion",
  DELETE_PROMOTION_EXTENDED_FROM_PROMOTION:
    "delete-promotion-extended-from-promotion",
} as const

export const PROMOTION_EXTENDED_ALLOWED_FIELDS = [
  "promotionExtended",
  "promotionExtended.*",
  "*promotionExtended",
] as const

export const ERROR_MESSAGES = {
  PROMOTION_EXTENDED_NOT_FOUND: "Promotion extended record not found",
  PROMOTION_EXTENDED_CREATE_FAILED:
    "Failed to create promotion extended record",
  PROMOTION_EXTENDED_UPDATE_FAILED:
    "Failed to update promotion extended record",
  PROMOTION_EXTENDED_DELETE_FAILED:
    "Failed to delete promotion extended record",
  PROMOTION_NOT_FOUND: "Promotion not found for extended data lookup",
} as const
