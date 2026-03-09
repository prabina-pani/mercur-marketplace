import { PROMOTION_EXTENDED_MODULE } from "../../../modules/promotion-extended"
import {
  PromotionExtendedNotFoundError,
  PromotionExtendedUpdateError,
} from "../../../modules/promotion-extended/errors"
import {
  updatePromotionExtendedHandler,
  updatePromotionExtendedCompensation,
} from "../steps/update-promotion-extended"

const mockLogger = {
  info: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}

const mockService = {
  retrievePromotionExtended: jest.fn(),
  updatePromotionExtendeds: jest.fn(),
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

describe("updatePromotionExtendedHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should update promotion extended with new values", async () => {
    const container = createMockContainer()
    const prev = {
      id: "pe-1",
      start_date: null,
      end_date: null,
      order_count: 0,
    }
    const updated = {
      id: "pe-1",
      start_date: new Date("2026-06-01"),
      end_date: null,
      order_count: 5,
    }

    mockService.retrievePromotionExtended.mockResolvedValue(prev)
    mockService.updatePromotionExtendeds.mockResolvedValue(updated)

    const result = await updatePromotionExtendedHandler(
      { id: "pe-1", start_date: "2026-06-01T00:00:00Z", order_count: 5 },
      container
    )

    expect(result.output).toEqual(updated)
    expect(result.compensateInput).toEqual(prev)
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining("pe-1")
    )
  })

  it("should handle array response from service", async () => {
    const container = createMockContainer()
    const prev = {
      id: "pe-2",
      start_date: null,
      end_date: null,
      order_count: 0,
    }
    const updated = {
      id: "pe-2",
      start_date: null,
      end_date: null,
      order_count: 10,
    }

    mockService.retrievePromotionExtended.mockResolvedValue(prev)
    mockService.updatePromotionExtendeds.mockResolvedValue([updated])

    const result = await updatePromotionExtendedHandler(
      { id: "pe-2", order_count: 10 },
      container
    )

    expect(result.output).toEqual(updated)
  })

  it("should set null dates when date is explicitly set to null", async () => {
    const container = createMockContainer()
    const prev = {
      id: "pe-3",
      start_date: new Date(),
      end_date: new Date(),
      order_count: 0,
    }
    const updated = {
      id: "pe-3",
      start_date: null,
      end_date: null,
      order_count: 0,
    }

    mockService.retrievePromotionExtended.mockResolvedValue(prev)
    mockService.updatePromotionExtendeds.mockResolvedValue(updated)

    const result = await updatePromotionExtendedHandler(
      { id: "pe-3", start_date: null, end_date: null },
      container
    )

    expect(result.output).toEqual(updated)
    expect(mockService.updatePromotionExtendeds).toHaveBeenCalledWith(
      expect.objectContaining({ start_date: null, end_date: null })
    )
  })

  it("should not update fields that are undefined", async () => {
    const container = createMockContainer()
    const prev = { id: "pe-6", start_date: new Date(), end_date: new Date(), order_count: 2 }
    const updated = { id: "pe-6", start_date: new Date(), end_date: new Date(), order_count: 5 }

    mockService.retrievePromotionExtended.mockResolvedValue(prev)
    mockService.updatePromotionExtendeds.mockResolvedValue(updated)

    const result = await updatePromotionExtendedHandler(
      { id: "pe-6", order_count: 5 },
      container
    )

    expect(result.output).toEqual(updated)
    expect(mockService.updatePromotionExtendeds).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "pe-6",
        start_date: undefined,
        end_date: undefined,
        order_count: 5,
      })
    )
  })

  it("should throw PromotionExtendedNotFoundError when record does not exist", async () => {
    const container = createMockContainer()
    mockService.retrievePromotionExtended.mockResolvedValue(null)

    await expect(
      updatePromotionExtendedHandler({ id: "pe-missing" }, container)
    ).rejects.toThrow(PromotionExtendedNotFoundError)
  })

  it("should throw PromotionExtendedUpdateError on service failure", async () => {
    const container = createMockContainer()
    mockService.retrievePromotionExtended.mockResolvedValue({ id: "pe-4" })
    mockService.updatePromotionExtendeds.mockRejectedValue(
      new Error("DB error")
    )

    await expect(
      updatePromotionExtendedHandler(
        { id: "pe-4", order_count: 1 },
        container
      )
    ).rejects.toThrow(PromotionExtendedUpdateError)

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining("DB error")
    )
  })

  it("should re-throw PromotionExtendedNotFoundError without wrapping", async () => {
    const container = createMockContainer()
    mockService.retrievePromotionExtended.mockResolvedValue(null)

    try {
      await updatePromotionExtendedHandler({ id: "pe-x" }, container)
    } catch (error) {
      expect(error).toBeInstanceOf(PromotionExtendedNotFoundError)
      expect(error).not.toBeInstanceOf(PromotionExtendedUpdateError)
    }
  })
})

describe("updatePromotionExtendedCompensation", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should skip compensation when prevData is null", async () => {
    const container = createMockContainer()
    await updatePromotionExtendedCompensation(null, container)
    expect(mockService.updatePromotionExtendeds).not.toHaveBeenCalled()
  })

  it("should skip compensation when prevData is undefined", async () => {
    const container = createMockContainer()
    await updatePromotionExtendedCompensation(undefined, container)
    expect(mockService.updatePromotionExtendeds).not.toHaveBeenCalled()
  })

  it("should restore previous data on compensation", async () => {
    const container = createMockContainer()
    const prev = {
      id: "pe-5",
      start_date: null,
      end_date: null,
      order_count: 0,
    }
    mockService.updatePromotionExtendeds.mockResolvedValue(prev)
    await updatePromotionExtendedCompensation(prev, container)

    expect(mockService.updatePromotionExtendeds).toHaveBeenCalledWith(prev)
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining("compensated")
    )
  })

  it("should log error when compensation fails", async () => {
    const container = createMockContainer()
    mockService.updatePromotionExtendeds.mockRejectedValue(
      new Error("Rollback failed")
    )

    await updatePromotionExtendedCompensation({ id: "pe-6" }, container)

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining("compensation failed")
    )
  })
})
