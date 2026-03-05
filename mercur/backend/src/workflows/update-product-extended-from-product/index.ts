import { ProductDTO } from "@medusajs/framework/types"
import {
  createWorkflow,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createRemoteLinkStep,
  dismissRemoteLinkStep,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { PRODUCT_EXTENDED_MODULE } from "../../modules/product-extended"
import { createProductExtendedStep } from "../create-product-extended-from-product/steps/create-product-extended"
import { deleteProductExtendedStep } from "./steps/delete-product-extended"
import { updateProductExtendedStep } from "./steps/update-product-extended"

export type UpdateProductExtendedFromProductStepInput = {
  product: ProductDTO
  additional_data?: {
    logisticClass?: string | null
    brand?: string | null
  }
}

export const updateProductExtendedFromProductWorkflow = createWorkflow(
  "update-product-extended-from-product",
  (input: UpdateProductExtendedFromProductStepInput) => {
    const { data: products } = useQueryGraphStep({
      entity: "product",
      fields: ["product_extended.*"],
      filters: {
        id: input.product.id,
      },
    })

    const created = when(
      "create-product-extended-link",
      { input, products },
      (data) =>
        !data.products[0]?.product_extended &&
        (data.input.additional_data?.logisticClass != null ||
          data.input.additional_data?.brand != null)
    ).then(() => {
      const productExtended = createProductExtendedStep({
        logistic_class: input.additional_data?.logisticClass ?? "",
        brand: input.additional_data?.brand ?? "",
      })

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

      return productExtended
    })

    const deleted = when(
      "delete-product-extended-link",
      { input, products },
      (data) =>
        data.products[0]?.product_extended &&
        (data.input.additional_data?.logisticClass === null ||
          data.input.additional_data?.logisticClass === "") &&
        (data.input.additional_data?.brand === null ||
          data.input.additional_data?.brand === "")
    ).then(() => {
      deleteProductExtendedStep({
        productExtended: products[0].product_extended,
      })

      dismissRemoteLinkStep({
        [PRODUCT_EXTENDED_MODULE]: {
          product_extended_id: products[0].product_extended.id,
        },
      })

      return products[0].product_extended.id
    })

    const updated = when(
      { input, products },
      (data) =>
        data.products[0]?.product_extended &&
        (data.input.additional_data?.logisticClass != null ||
          data.input.additional_data?.brand != null)
    ).then(() => {
      const current = products[0].product_extended
      return updateProductExtendedStep({
        id: current.id,
        logistic_class:
          input.additional_data?.logisticClass ?? current.logistic_class ?? "",
        brand: input.additional_data?.brand ?? current.brand ?? "",
      })
    })

    return new WorkflowResponse({
      created,
      updated,
      deleted,
    })
  }
)
