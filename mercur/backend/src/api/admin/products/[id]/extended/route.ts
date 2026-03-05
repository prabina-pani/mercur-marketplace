import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { refetchEntity } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { PRODUCT_EXTENDED_MODULE } from "../../../../../modules/product-extended"
import ProductExtendedModuleService from "../../../../../modules/product-extended/service"

/**
 * GET /admin/products/:id/extended - Get product with product_extended (brand, logistic_class)
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  const product = await refetchEntity({
    entity: "product",
    idOrFilter: id,
    scope: req.scope,
    fields: ["id", "title", "product_extended.*"],
  })
  if (!product) {
    return res.status(404).json({ message: "Product not found" })
  }
  return res.status(200).json({ product })
}

/**
 * POST /admin/products/:id/extended - Set brand and logisticClass for a product.
 * Body: { "brand": string?, "logisticClass": string? }
 * Creates or updates the linked product_extended record.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const id = req.params.id
    const { brand = "", logisticClass = "" } = req.body as {
      brand?: string
      logisticClass?: string
    }

    const product = await refetchEntity({
      entity: "product",
      idOrFilter: id,
      scope: req.scope,
      fields: ["id", "product_extended.*"],
    })
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    const service: ProductExtendedModuleService = req.scope.resolve(
      PRODUCT_EXTENDED_MODULE
    )
    const link = req.scope.resolve(ContainerRegistrationKeys.LINK)

    const existing = (product as { product_extended?: { id: string } })
      .product_extended

    if (existing) {
      await service.updateProductExtendeds({
        id: existing.id,
        brand: brand ?? "",
        logistic_class: logisticClass ?? "",
      })
    } else {
      const created = await service.createProductExtendeds({
        brand: brand ?? "",
        logistic_class: logisticClass ?? "",
      })
      const createdRecord = Array.isArray(created) ? created[0] : created
      if (createdRecord) {
        await link.create([
          {
            [Modules.PRODUCT]: { product_id: id },
            [PRODUCT_EXTENDED_MODULE]: { product_extended_id: createdRecord.id },
          },
        ])
      }
    }

    const updated = await refetchEntity({
      entity: "product",
      idOrFilter: id,
      scope: req.scope,
      fields: ["id", "title", "product_extended.*"],
    })
    return res.status(200).json({ product: updated })
  } catch (err: any) {
    return res.status(500).json({
      message: err?.message ?? "Unknown error",
      name: err?.name,
      stack: err?.stack?.split("\n").slice(0, 8),
    })
  }
}
