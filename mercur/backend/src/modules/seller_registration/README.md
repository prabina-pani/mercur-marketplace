# Seller registration (PoC module)

Custom Medusa module for **pending** seller applications and uploaded document metadata (Story 1.1).

## Module key

- **String:** `seller_registration` (`SELLER_REGISTRATION_MODULE` in `index.ts`)

## Tables

| Model | Table name |
|-------|------------|
| `SellerRegistrationRequest` | `seller_registration_request` |
| `SellerRegistrationDocument` | `seller_registration_document` |

## Payload JSON (`seller_registration_request.payload`)

Canonical keys are listed in `constants.ts` (`PAYLOAD_KEYS`) and in `docs/architecture/seller-registration-approval-approach.md` (Story 1.1).

## Document types

See `DOCUMENT_TYPE` in `constants.ts` (`vat_registration_certificate`, `updated_company_affidavit`).

## Migrations

From `mercur/backend`:

```bash
npx medusa db:generate seller_registration   # when DB + metadata snapshot works
npx medusa db:migrate
```

Initial schema is in `migrations/Migration20260320121500.ts` (hand-authored when CLI generate did not emit files). After changing models, prefer regenerating a diff with `db:generate`, or extend the migration SQL carefully.

**Note:** `db:migrate` may continue to an interactive “Syncing links…” step unrelated to this module; seller migrations run in the `MODULE: seller_registration` block before that.

## Next stories

- **1.2:** Multipart API to create pending registration + files.
- **2.x:** Admin list/detail/download.
- **3.x:** Approve → `auth.register` + seller workflow.
