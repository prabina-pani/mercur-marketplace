import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260307110731 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "promotion_extended" ("id" text not null, "start_date" timestamptz null, "end_date" timestamptz null, "order_count" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "promotion_extended_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_promotion_extended_deleted_at" ON "promotion_extended" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "promotion_extended" cascade;`);
  }

}
