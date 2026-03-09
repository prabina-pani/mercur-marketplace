import {
  defineMiddlewares,
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { z } from "zod"
import { PROMOTION_EXTENDED_ALLOWED_FIELDS } from "../modules/promotion-extended/constants"

function allowPromotionExtendedFields(
  req: MedusaRequest,
  _res: MedusaResponse,
  next: MedusaNextFunction
) {
  req.allowed = [
    ...(req.allowed ?? []),
    ...PROMOTION_EXTENDED_ALLOWED_FIELDS,
  ]
  next()
}

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
      middlewares: [allowPromotionExtendedFields],
    },
    {
      method: "GET",
      matcher: "/admin/promotions/:id",
      middlewares: [allowPromotionExtendedFields],
    },
  ],
})
