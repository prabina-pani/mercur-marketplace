import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ProductDTO } from "@medusajs/framework/types"
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { PRODUCT_EXTENDED_MODULE } from "../../modules/product-extended"
import { createProductExtendedStep } from "./steps/create-product-extended"

export type CreateProductExtendedFromProductWorkflowInput = {
  product: ProductDTO
  additional_data?: {
    logisticClass?: string
    brand?: string
  }
}

export const createProductExtendedFromProductWorkflow = createWorkflow(
  "create-product-extended-from-product",
  (input: CreateProductExtendedFromProductWorkflowInput) => {
    const logisticClass = transform(
      { input },
      (data) => data.input.additional_data?.logisticClass ?? ""
    )
    const brand = transform(
      { input },
      (data) => data.input.additional_data?.brand ?? ""
    )

    const productExtended = createProductExtendedStep({
      logistic_class: logisticClass,
      brand,
    })

    when({ productExtended }, ({ productExtended }) => productExtended !== undefined).then(
      () => {
        createRemoteLinkStep([
          {
            [Modules.PRODUCT]: {
              product_id: input.product.id,
            },
            [PRODUCT_EXTENDED_MODULE]: {
              product_extended_id: productExtended.id,
            },
          },
        ])
      }
    )

    return new WorkflowResponse({
      productExtended,
    })
  }
)
