import { Migration } from "@medusajs/framework/mikro-orm/migrations"

/**
 * Initial seller registration tables (Story 1.1).
 * Prefer `npx medusa db:generate seller_registration` for future model changes;
 * this migration was hand-authored when CLI generation had no DB snapshot output.
 */
export class Migration20260320121500 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "seller_registration_request" (
        "id" text NOT NULL,
        "status" text CHECK ("status" IN ('pending', 'approved', 'rejected')) NOT NULL,
        "payload" jsonb NOT NULL,
        "resolved_at" timestamptz NULL,
        "seller_id" text NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz NULL,
        CONSTRAINT "seller_registration_request_pkey" PRIMARY KEY ("id")
      );
    `)

    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_seller_registration_request_status"
      ON "seller_registration_request" ("status");
    `)

    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_seller_registration_request_status_created"
      ON "seller_registration_request" ("status", "created_at");
    `)

    this.addSql(`
      CREATE TABLE IF NOT EXISTS "seller_registration_document" (
        "id" text NOT NULL,
        "registration_request_id" text NOT NULL,
        "document_type" text CHECK ("document_type" IN ('vat_registration_certificate', 'updated_company_affidavit')) NOT NULL,
        "original_filename" text NOT NULL,
        "mime_type" text NOT NULL,
        "size_bytes" integer NULL,
        "storage_key" text NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz NULL,
        CONSTRAINT "seller_registration_document_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "seller_registration_document_request_fk"
          FOREIGN KEY ("registration_request_id")
          REFERENCES "seller_registration_request" ("id")
          ON UPDATE CASCADE ON DELETE CASCADE
      );
    `)
  }

  override async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS "seller_registration_document" CASCADE;`)
    this.addSql(`DROP TABLE IF EXISTS "seller_registration_request" CASCADE;`)
  }
}
