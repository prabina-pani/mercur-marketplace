/**
 * Workflow hooks directory.
 * productCreated/productsUpdated are already registered by @mercurjs/b2c-core;
 * Medusa allows only one handler per hook, so product-extended create/update
 * is done via POST /admin/products/:id/extended instead.
 */
