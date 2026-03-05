import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { defineMiddlewares } from "@medusajs/framework/http"
import { z } from "zod"

/** Allow product_extended relation so GET product APIs can return it via ?fields=+product_extended.* */
function allowProductExtended(
  req: MedusaRequest,
  _res: MedusaResponse,
  next: MedusaNextFunction
): void {
  ;(req.allowed ??= []).push("product_extended")
  next()
}

export default defineMiddlewares({
  routes: [
    {
      method: "POST",
      matcher: "/admin/products",
      additionalDataValidator: {
        logisticClass: z.string().optional(),
        brand: z.string().optional(),
      },
    },
    {
      method: "POST",
      matcher: "/admin/products/:id",
      additionalDataValidator: {
        logisticClass: z.string().nullish(),
        brand: z.string().nullish(),
      },
    },
    {
      method: "GET",
      matcher: "/admin/products",
      middlewares: [allowProductExtended],
    },
    {
      method: "GET",
      matcher: "/admin/products/:id",
      middlewares: [allowProductExtended],
    },
  ],
})
