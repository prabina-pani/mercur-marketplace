import { defineMiddlewares } from "@medusajs/framework/http"
import { z } from "zod"

export default defineMiddlewares({
  routes: [
    {
      method: "POST",
      matcher: "/admin/promotions",
      additionalDataValidator: {
        start_date: z.string().datetime({ offset: true }).optional(),
        end_date: z.string().datetime({ offset: true }).optional(),
        order_count: z.number().int().min(0).optional(),
      },
    },
    {
      method: "POST",
      matcher: "/admin/promotions/:id",
      additionalDataValidator: {
        start_date: z.string().datetime({ offset: true }).nullish(),
        end_date: z.string().datetime({ offset: true }).nullish(),
        order_count: z.number().int().min(0).nullish(),
      },
    },
    {
      method: "GET",
      matcher: "/admin/promotions",
      middlewares: [
        (req, _res, next) => {
          req.allowed = [
            ...(req.allowed ?? []),
            "promotionExtended",
            "promotionExtended.*",
            "*promotionExtended",
          ]
          next()
        },
      ],
    },
    {
      method: "GET",
      matcher: "/admin/promotions/:id",
      middlewares: [
        (req, _res, next) => {
          req.allowed = [
            ...(req.allowed ?? []),
            "promotionExtended",
            "promotionExtended.*",
            "*promotionExtended",
          ]
          next()
        },
      ],
    },
  ],
})
