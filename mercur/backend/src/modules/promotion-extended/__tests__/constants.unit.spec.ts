import {
  STEP_NAMES,
  WORKFLOW_NAMES,
  PROMOTION_EXTENDED_ALLOWED_FIELDS,
  ERROR_MESSAGES,
} from "../constants"

describe("promotion-extended constants", () => {
  describe("STEP_NAMES", () => {
    it("should have all required step name keys", () => {
      expect(STEP_NAMES.CREATE_PROMOTION_EXTENDED).toBe(
        "create-promotion-extended"
      )
      expect(STEP_NAMES.UPDATE_PROMOTION_EXTENDED).toBe(
        "update-promotion-extended"
      )
      expect(STEP_NAMES.DELETE_PROMOTION_EXTENDED).toBe(
        "delete-promotion-extended"
      )
    })

    it("should have unique step names", () => {
      const values = Object.values(STEP_NAMES)
      expect(new Set(values).size).toBe(values.length)
    })
  })

  describe("WORKFLOW_NAMES", () => {
    it("should have all required workflow name keys", () => {
      expect(WORKFLOW_NAMES.CREATE_PROMOTION_EXTENDED_FROM_PROMOTION).toBe(
        "create-promotion-extended-from-promotion"
      )
      expect(WORKFLOW_NAMES.UPDATE_PROMOTION_EXTENDED_FROM_PROMOTION).toBe(
        "update-promotion-extended-from-promotion"
      )
      expect(WORKFLOW_NAMES.DELETE_PROMOTION_EXTENDED_FROM_PROMOTION).toBe(
        "delete-promotion-extended-from-promotion"
      )
    })

    it("should have unique workflow names", () => {
      const values = Object.values(WORKFLOW_NAMES)
      expect(new Set(values).size).toBe(values.length)
    })
  })

  describe("PROMOTION_EXTENDED_ALLOWED_FIELDS", () => {
    it("should contain the expected allowed field patterns", () => {
      expect(PROMOTION_EXTENDED_ALLOWED_FIELDS).toContain("promotionExtended")
      expect(PROMOTION_EXTENDED_ALLOWED_FIELDS).toContain(
        "promotionExtended.*"
      )
      expect(PROMOTION_EXTENDED_ALLOWED_FIELDS).toContain(
        "*promotionExtended"
      )
    })

    it("should have exactly 3 entries", () => {
      expect(PROMOTION_EXTENDED_ALLOWED_FIELDS).toHaveLength(3)
    })
  })

  describe("ERROR_MESSAGES", () => {
    it("should have all required error message keys", () => {
      expect(ERROR_MESSAGES.PROMOTION_EXTENDED_NOT_FOUND).toBeDefined()
      expect(ERROR_MESSAGES.PROMOTION_EXTENDED_CREATE_FAILED).toBeDefined()
      expect(ERROR_MESSAGES.PROMOTION_EXTENDED_UPDATE_FAILED).toBeDefined()
      expect(ERROR_MESSAGES.PROMOTION_EXTENDED_DELETE_FAILED).toBeDefined()
      expect(ERROR_MESSAGES.PROMOTION_NOT_FOUND).toBeDefined()
    })

    it("should have non-empty string values", () => {
      Object.values(ERROR_MESSAGES).forEach((msg) => {
        expect(typeof msg).toBe("string")
        expect(msg.length).toBeGreaterThan(0)
      })
    })
  })
})
