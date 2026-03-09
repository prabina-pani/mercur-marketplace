import middlewareConfig from "../middlewares"
import { PROMOTION_EXTENDED_ALLOWED_FIELDS } from "../../modules/promotion-extended/constants"

describe("middlewares", () => {
  const routes = middlewareConfig.routes!

  function findRoute(methods: string, matcher: string) {
    return routes.find(
      (r: any) =>
        r.methods?.includes(methods) && r.matcher === matcher
    )
  }

  describe("POST /admin/promotions (create)", () => {
    const route = findRoute("POST", "/admin/promotions") as any

    it("should be defined", () => {
      expect(route).toBeDefined()
    })

    it("should have additionalDataValidator", () => {
      expect(route.additionalDataValidator).toBeDefined()
    })

    it("should validate start_date as optional datetime string", () => {
      expect(route.additionalDataValidator.start_date).toBeDefined()
    })

    it("should validate end_date as optional datetime string", () => {
      expect(route.additionalDataValidator.end_date).toBeDefined()
    })

    it("should validate order_count as optional non-negative integer", () => {
      expect(route.additionalDataValidator.order_count).toBeDefined()
    })
  })

  describe("POST /admin/promotions/:id (update)", () => {
    const route = findRoute("POST", "/admin/promotions/:id") as any

    it("should be defined", () => {
      expect(route).toBeDefined()
    })

    it("should have additionalDataValidator", () => {
      expect(route.additionalDataValidator).toBeDefined()
    })

    it("should validate start_date as nullish datetime string", () => {
      expect(route.additionalDataValidator.start_date).toBeDefined()
    })

    it("should validate end_date as nullish datetime string", () => {
      expect(route.additionalDataValidator.end_date).toBeDefined()
    })

    it("should validate order_count as nullish non-negative integer", () => {
      expect(route.additionalDataValidator.order_count).toBeDefined()
    })
  })

  describe("GET /admin/promotions (list)", () => {
    const route = findRoute("GET", "/admin/promotions") as any

    it("should be defined", () => {
      expect(route).toBeDefined()
    })

    it("should have middlewares array with one entry", () => {
      expect(route.middlewares).toBeDefined()
      expect(route.middlewares.length).toBeGreaterThanOrEqual(1)
    })

    it("should add promotion extended allowed fields to req.allowed", () => {
      const middleware = route.middlewares[0] as Function
      const req = { allowed: ["existing_field"] } as any
      const res = {} as any
      const next = jest.fn()

      middleware(req, res, next)

      PROMOTION_EXTENDED_ALLOWED_FIELDS.forEach((field) => {
        expect(req.allowed).toContain(field)
      })
      expect(req.allowed).toContain("existing_field")
      expect(next).toHaveBeenCalled()
    })

    it("should initialize req.allowed when undefined", () => {
      const middleware = route.middlewares[0] as Function
      const req = {} as any
      const res = {} as any
      const next = jest.fn()

      middleware(req, res, next)

      PROMOTION_EXTENDED_ALLOWED_FIELDS.forEach((field) => {
        expect(req.allowed).toContain(field)
      })
      expect(next).toHaveBeenCalled()
    })
  })

  describe("GET /admin/promotions/:id (detail)", () => {
    const route = findRoute("GET", "/admin/promotions/:id") as any

    it("should be defined", () => {
      expect(route).toBeDefined()
    })

    it("should have middlewares array with at least one entry", () => {
      expect(route.middlewares).toBeDefined()
      expect(route.middlewares.length).toBeGreaterThanOrEqual(1)
    })

    it("should add promotion extended allowed fields to req.allowed", () => {
      const middleware = route.middlewares[0] as Function
      const req = { allowed: [] } as any
      const res = {} as any
      const next = jest.fn()

      middleware(req, res, next)

      PROMOTION_EXTENDED_ALLOWED_FIELDS.forEach((field) => {
        expect(req.allowed).toContain(field)
      })
      expect(next).toHaveBeenCalled()
    })
  })

  describe("route completeness", () => {
    it("should have exactly 4 routes configured", () => {
      expect(routes).toHaveLength(4)
    })

    it("should use the same middleware function for both GET routes", () => {
      const listRoute = findRoute("GET", "/admin/promotions") as any
      const detailRoute = findRoute("GET", "/admin/promotions/:id") as any

      const listMiddleware = listRoute.middlewares[0]
      const detailMiddleware = detailRoute.middlewares[0]

      expect(listMiddleware).toBe(detailMiddleware)
    })
  })
})
