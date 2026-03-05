import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import ProductExtendedModuleService from "../../../modules/product-extended/service"
import { PRODUCT_EXTENDED_MODULE } from "../../../modules/product-extended"

type CreateProductExtendedStepInput = {
  logistic_class?: string
  brand?: string
}

export const createProductExtendedStep = createStep(
  "create-product-extended",
  async (data: CreateProductExtendedStepInput, { container }) => {
    const hasData =
      (data.logistic_class != null && data.logistic_class !== "") ||
      (data.brand != null && data.brand !== "")
    if (!hasData) {
      return new StepResponse(undefined, undefined)
    }

    const productExtendedModuleService: ProductExtendedModuleService =
      container.resolve(PRODUCT_EXTENDED_MODULE)

    const productExtended =
      await productExtendedModuleService.createProductExtendeds({
        logistic_class: data.logistic_class ?? "",
        brand: data.brand ?? "",
      })

    return new StepResponse(productExtended, productExtended)
  },
  async (productExtended, { container }) => {
    if (!productExtended) {
      return
    }
    const productExtendedModuleService: ProductExtendedModuleService =
      container.resolve(PRODUCT_EXTENDED_MODULE)
    await productExtendedModuleService.deleteProductExtendeds(
      productExtended.id
    )
  }
)
