import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRODUCT_EXTENDED_MODULE } from "../../../modules/product-extended"
import ProductExtendedModuleService from "../../../modules/product-extended/service"

type UpdateProductExtendedStepInput = {
  id: string
  logistic_class: string
  brand: string
}

export const updateProductExtendedStep = createStep(
  "update-product-extended",
  async (
    { id, logistic_class, brand }: UpdateProductExtendedStepInput,
    { container }
  ) => {
    const productExtendedModuleService: ProductExtendedModuleService =
      container.resolve(PRODUCT_EXTENDED_MODULE)

    const prevData =
      await productExtendedModuleService.retrieveProductExtended(id)

    const productExtended =
      await productExtendedModuleService.updateProductExtendeds({
        id,
        logistic_class,
        brand,
      })

    return new StepResponse(productExtended, prevData)
  },
  async (prevData, { container }) => {
    const productExtendedModuleService: ProductExtendedModuleService =
      container.resolve(PRODUCT_EXTENDED_MODULE)
    await productExtendedModuleService.updateProductExtendeds(prevData)
  }
)
