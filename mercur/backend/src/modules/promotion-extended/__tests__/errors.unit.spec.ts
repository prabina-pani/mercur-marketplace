import { ERROR_MESSAGES } from "../constants"
import {
  PromotionExtendedError,
  PromotionExtendedNotFoundError,
  PromotionExtendedCreateError,
  PromotionExtendedUpdateError,
  PromotionExtendedDeleteError,
} from "../errors"

describe("promotion-extended errors", () => {
  describe("PromotionExtendedError", () => {
    it("should create error with message and correct name", () => {
      const error = new PromotionExtendedError("test message")
      expect(error.message).toBe("test message")
      expect(error.name).toBe("PromotionExtendedError")
      expect(error).toBeInstanceOf(Error)
    })
  })

  describe("PromotionExtendedNotFoundError", () => {
    it("should create error with default message when no id is provided", () => {
      const error = new PromotionExtendedNotFoundError()
      expect(error.message).toBe(ERROR_MESSAGES.PROMOTION_EXTENDED_NOT_FOUND)
      expect(error.name).toBe("PromotionExtendedNotFoundError")
    })

    it("should create error with id in message when provided", () => {
      const error = new PromotionExtendedNotFoundError("promo-ext-123")
      expect(error.message).toBe(
        `${ERROR_MESSAGES.PROMOTION_EXTENDED_NOT_FOUND}: promo-ext-123`
      )
    })

    it("should be instance of PromotionExtendedError", () => {
      const error = new PromotionExtendedNotFoundError()
      expect(error).toBeInstanceOf(PromotionExtendedError)
      expect(error).toBeInstanceOf(Error)
    })
  })

  describe("PromotionExtendedCreateError", () => {
    it("should create error with default message when no detail provided", () => {
      const error = new PromotionExtendedCreateError()
      expect(error.message).toBe(
        ERROR_MESSAGES.PROMOTION_EXTENDED_CREATE_FAILED
      )
      expect(error.name).toBe("PromotionExtendedCreateError")
    })

    it("should create error with detail in message when provided", () => {
      const error = new PromotionExtendedCreateError("db connection failed")
      expect(error.message).toBe(
        `${ERROR_MESSAGES.PROMOTION_EXTENDED_CREATE_FAILED}: db connection failed`
      )
    })

    it("should be instance of PromotionExtendedError", () => {
      const error = new PromotionExtendedCreateError()
      expect(error).toBeInstanceOf(PromotionExtendedError)
    })
  })

  describe("PromotionExtendedUpdateError", () => {
    it("should create error with default message when no detail provided", () => {
      const error = new PromotionExtendedUpdateError()
      expect(error.message).toBe(
        ERROR_MESSAGES.PROMOTION_EXTENDED_UPDATE_FAILED
      )
      expect(error.name).toBe("PromotionExtendedUpdateError")
    })

    it("should create error with detail in message when provided", () => {
      const error = new PromotionExtendedUpdateError("invalid date")
      expect(error.message).toBe(
        `${ERROR_MESSAGES.PROMOTION_EXTENDED_UPDATE_FAILED}: invalid date`
      )
    })

    it("should be instance of PromotionExtendedError", () => {
      const error = new PromotionExtendedUpdateError()
      expect(error).toBeInstanceOf(PromotionExtendedError)
    })
  })

  describe("PromotionExtendedDeleteError", () => {
    it("should create error with default message when no detail provided", () => {
      const error = new PromotionExtendedDeleteError()
      expect(error.message).toBe(
        ERROR_MESSAGES.PROMOTION_EXTENDED_DELETE_FAILED
      )
      expect(error.name).toBe("PromotionExtendedDeleteError")
    })

    it("should create error with detail in message when provided", () => {
      const error = new PromotionExtendedDeleteError("record locked")
      expect(error.message).toBe(
        `${ERROR_MESSAGES.PROMOTION_EXTENDED_DELETE_FAILED}: record locked`
      )
    })

    it("should be instance of PromotionExtendedError", () => {
      const error = new PromotionExtendedDeleteError()
      expect(error).toBeInstanceOf(PromotionExtendedError)
    })
  })
})
