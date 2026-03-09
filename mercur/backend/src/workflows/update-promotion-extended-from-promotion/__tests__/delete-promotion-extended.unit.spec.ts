import { PROMOTION_EXTENDED_MODULE } from "../../../modules/promotion-extended"
import { PromotionExtendedDeleteError } from "../../../modules/promotion-extended/errors"
import {
  deletePromotionExtendedHandler,
  deletePromotionExtendedCompensation,
} from "../steps/delete-promotion-extended"

const mockLogger = {
  info: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}

const mockService = {
  deletePromotionExtendeds: jest.fn(),
  createPromotionExtendeds: jest.fn(),
}

function createMockContainer() {
  return {
    resolve: jest.fn((key: string) => {
      if (key === "logger") return mockLogger
      if (key === PROMOTION_EXTENDED_MODULE) return mockService
      return undefined
    }),
  }
}

describe("deletePromotionExtendedHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should delete promotion extended record", async () => {
    const container = createMockContainer()
    const pe = {
      id: "pe-1",
      start_date: new Date("2026-01-01"),
      end_date: null,
      order_count: 3,
    }
    mockService.deletePromotionExtendeds.mockResolvedValue(undefined)

    const result = await deletePromotionExtendedHandler(
      { promotion_extended: pe },
      container
    )

    expect(result.output).toEqual(pe)
    expect(result.compensateInput).toEqual(pe)
    expect(mockService.deletePromotionExtendeds).toHaveBeenCalledWith("pe-1")
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining("pe-1")
    )
  })

  it("should throw PromotionExtendedDeleteError on service failure", async () => {
    const container = createMockContainer()
    const pe = {
      id: "pe-2",
      start_date: null,
      end_date: null,
      order_count: 0,
    }
    mockService.deletePromotionExtendeds.mockRejectedValue(
      new Error("Foreign key constraint")
    )

    await expect(
      deletePromotionExtendedHandler(
        { promotion_extended: pe },
        container
      )
    ).rejects.toThrow(PromotionExtendedDeleteError)

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining("Foreign key constraint")
    )
  })

  it("should include the original record data in the error context log", async () => {
    const container = createMockContainer()
    const pe = { id: "pe-10", start_date: null, end_date: null, order_count: 0 }
    mockService.deletePromotionExtendeds.mockRejectedValue(
      new Error("timeout")
    )

    await expect(
      deletePromotionExtendedHandler(
        { promotion_extended: pe },
        container
      )
    ).rejects.toThrow(PromotionExtendedDeleteError)

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining("pe-10")
    )
  })
})

describe("deletePromotionExtendedCompensation", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should skip compensation when deleted is null", async () => {
    const container = createMockContainer()
    await deletePromotionExtendedCompensation(null, container)
    expect(mockService.createPromotionExtendeds).not.toHaveBeenCalled()
  })

  it("should skip compensation when deleted is undefined", async () => {
    const container = createMockContainer()
    await deletePromotionExtendedCompensation(undefined, container)
    expect(mockService.createPromotionExtendeds).not.toHaveBeenCalled()
  })

  it("should re-create the deleted record on compensation", async () => {
    const container = createMockContainer()
    const deleted = {
      id: "pe-3",
      start_date: new Date("2026-01-01"),
      end_date: new Date("2026-12-31"),
      order_count: 5,
    }

    await deletePromotionExtendedCompensation(deleted, container)

    expect(mockService.createPromotionExtendeds).toHaveBeenCalledWith({
      id: "pe-3",
      start_date: deleted.start_date,
      end_date: deleted.end_date,
      order_count: 5,
    })
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining("compensated")
    )
  })

  it("should handle null dates in compensation", async () => {
    const container = createMockContainer()
    const deleted = {
      id: "pe-4",
      start_date: null,
      end_date: null,
      order_count: undefined,
    }

    await deletePromotionExtendedCompensation(deleted, container)

    expect(mockService.createPromotionExtendeds).toHaveBeenCalledWith({
      id: "pe-4",
      start_date: null,
      end_date: null,
      order_count: 0,
    })
  })

  it("should log error when compensation fails", async () => {
    const container = createMockContainer()
    mockService.createPromotionExtendeds.mockRejectedValue(
      new Error("Recreation failed")
    )

    await deletePromotionExtendedCompensation(
      { id: "pe-5" },
      container
    )

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining("compensation failed")
    )
  })
})
