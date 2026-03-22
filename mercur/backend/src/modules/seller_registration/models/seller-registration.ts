import { model } from "@medusajs/framework/utils"

/**
 * Order: document model first (belongsTo uses lazy ref to request),
 * then request (hasMany refs document, already defined).
 */
const SellerRegistrationDocument = model.define(
  { name: "SellerRegistrationDocument", tableName: "seller_registration_document" },
  {
    id: model.id().primaryKey(),
    registration_request: model.belongsTo(() => SellerRegistrationRequest, {
      mappedBy: "documents",
    }),
    document_type: model.enum([
      "vat_registration_certificate",
      "updated_company_affidavit",
    ]),
    original_filename: model.text(),
    mime_type: model.text(),
    size_bytes: model.number().nullable(),
    storage_key: model.text(),
  }
)

const SellerRegistrationRequest = model
  .define(
    { name: "SellerRegistrationRequest", tableName: "seller_registration_request" },
    {
      id: model.id().primaryKey(),
      status: model.enum(["pending", "approved", "rejected"]),
      payload: model.json(),
      resolved_at: model.dateTime().nullable(),
      seller_id: model.text().nullable(),
      // `mappedBy` must match the belongsTo property name on the child model (not the default
      // camelToSnakeCase("SellerRegistrationRequest") → seller_registration_request).
      documents: model.hasMany(() => SellerRegistrationDocument, {
        mappedBy: "registration_request",
      }),
    }
  )
  .indexes([{ on: ["status"] }, { on: ["status", "created_at"] }])
  .cascades({
    delete: ["documents"],
  })

export { SellerRegistrationRequest, SellerRegistrationDocument }
