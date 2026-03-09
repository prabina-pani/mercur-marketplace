import { PROMOTION_EXTENDED_MODULE } from "../../../modules/promotion-extended"
import { PromotionExtendedCreateError } from "../../../modules/promotion-extended/errors"
import {
  createPromotionExtendedHandler,
  createPromotionExtendedCompensation,
} from "../steps/create-promotion-extended"

const mockLogger = {
  info: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}

const mockService = {
  createPromotionExtendeds: jest.fn(),
  deletePromotionExtendeds: jest.fn(),
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

describe("createPromotionExtendedHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should skip creation when no data is provided", async () => {
    const container = createMockContainer()
    const result = await createPromotionExtendedHandler(
      { start_date: null, end_date: null, order_count: undefined },
      container
    )

    expect(result.output).toBeUndefined()
    expect(result.compensateInput).toBeUndefined()
    expect(mockService.createPromotionExtendeds).not.toHaveBeenCalled()
    expect(mockLogger.debug).toHaveBeenCalled()
  })

  it("should create promotion extended with start_date only", async () => {
    const container = createMockContainer()
    const created = {
      id: "pe-1",
      start_date: new Date("2026-01-01"),
      end_date: null,
      order_count: 0,
    }
    mockService.createPromotionExtendeds.mockResolvedValue(created)

    const result = await createPromotionExtendedHandler(
      { start_date: "2026-01-01T00:00:00Z", end_date: null },
      container
    )

    expect(result.output).toEqual(created)
    expect(mockService.createPromotionExtendeds).toHaveBeenCalledWith({
      start_date: expect.any(Date),
      end_date: null,
      order_count: 0,
    })
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining("pe-1")
    )
  })

  it("should create promotion extended with all fields", async () => {
    const container = createMockContainer()
    const created = {
      id: "pe-2",
      start_date: new Date("2026-01-01"),
      end_date: new Date("2026-12-31"),
      order_count: 5,
    }
    mockService.createPromotionExtendeds.mockResolvedValue(created)

    const result = await createPromotionExtendedHandler(
      {
        start_date: "2026-01-01T00:00:00Z",
        end_date: "2026-12-31T23:59:59Z",
        order_count: 5,
      },
      container
    )

    expect(result.output).toEqual(created)
    expect(mockService.createPromotionExtendeds).toHaveBeenCalledWith({
      start_date: expect.any(Date),
      end_date: expect.any(Date),
      order_count: 5,
    })
  })

  it("should handle array response from service", async () => {
    const container = createMockContainer()
    const created = {
      id: "pe-3",
      start_date: null,
      end_date: null,
      order_count: 10,
    }
    mockService.createPromotionExtendeds.mockResolvedValue([created])

    const result = await createPromotionExtendedHandler(
      { order_count: 10 },
      container
    )

    expect(result.output).toEqual(created)
  })

  it("should throw PromotionExtendedCreateError on service failure", async () => {
    const container = createMockContainer()
    mockService.createPromotionExtendeds.mockRejectedValue(
      new Error("DB error")
    )

    await expect(
      createPromotionExtendedHandler(
        { start_date: "2026-01-01T00:00:00Z" },
        container
      )
    ).rejects.toThrow(PromotionExtendedCreateError)

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining("DB error")
    )
  })

  it("should not treat zero order_count as empty data", async () => {
    const container = createMockContainer()
    const created = {
      id: "pe-4",
      start_date: null,
      end_date: null,
      order_count: 0,
    }
    mockService.createPromotionExtendeds.mockResolvedValue(created)

    const result = await createPromotionExtendedHandler(
      { start_date: null, end_date: null, order_count: 0 },
      container
    )

    expect(result.output).toEqual(created)
    expect(mockService.createPromotionExtendeds).toHaveBeenCalled()
  })
})

describe("createPromotionExtendedCompensation", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should skip compensation when created is falsy", async () => {
    const container = createMockContainer()
    await createPromotionExtendedCompensation(null, container)
    expect(mockService.deletePromotionExtendeds).not.toHaveBeenCalled()
  })

  it("should skip compensation when created is undefined", async () => {
    const container = createMockContainer()
    await createPromotionExtendedCompensation(undefined, container)
    expect(mockService.deletePromotionExtendeds).not.toHaveBeenCalled()
  })

  it("should delete the created record on compensation", async () => {
    const container = createMockContainer()
    await createPromotionExtendedCompensation({ id: "pe-4" }, container)

    expect(mockService.deletePromotionExtendeds).toHaveBeenCalledWith("pe-4")
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining("compensated")
    )
  })

  it("should log error when compensation fails", async () => {
    const container = createMockContainer()
    mockService.deletePromotionExtendeds.mockRejectedValue(
      new Error("Delete failed")
    )

    await createPromotionExtendedCompensation({ id: "pe-5" }, container)

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining("compensation failed")
    )
  })
})
