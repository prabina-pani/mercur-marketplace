# Verify Product Extended API

Run the backend first (`npx medusa develop`), then use these steps to verify the extended product fields (`brand`, `logistic_class`) in the API.

## 1. Get admin JWT

```bash
curl -s -X POST 'http://localhost:9000/auth/user/emailpass' \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@mercurjs.com","password":"supersecret"}'
```

Copy the `token` value from the response.

## 2. List products with extended fields

Replace `{token}` with your JWT. Use the relation name **`product_extended`** (snake_case); `productExtended` is not valid for the `fields` query.

```bash
curl -s 'http://localhost:9000/admin/products?limit=2&fields=+product_extended.*' \
  -H 'Authorization: Bearer {token}'
```

## 3. Get one product with extended fields

Use a product `id` from the list response.

```bash
curl -s 'http://localhost:9000/admin/products/{product_id}?fields=+product_extended.*' \
  -H 'Authorization: Bearer {token}'
```

## 4. Get product via extended route (always includes product_extended)

```bash
curl -s 'http://localhost:9000/admin/products/{product_id}/extended' \
  -H 'Authorization: Bearer {token}'
```

Expected: `{ "product": { "id", "title", "product_extended": { "id", "logistic_class", "brand", ... } } }` (or `productExtended` in response).

## 5. Set brand and logisticClass (POST extended)

```bash
curl -s -X POST 'http://localhost:9000/admin/products/{product_id}/extended' \
  -H 'Authorization: Bearer {token}' \
  -H 'Content-Type: application/json' \
  -d '{"brand":"TestBrand","logisticClass":"ClassA"}'
```

## 6. Verify response includes new fields

```bash
curl -s 'http://localhost:9000/admin/products/{product_id}/extended' \
  -H 'Authorization: Bearer {token}'
```

Expected: `product_extended` (or `productExtended`) with `brand: "TestBrand"` and `logistic_class: "ClassA"`.

---

## One-liner script

From `mercur/backend`:

```bash
./scripts/verify-product-extended-api.sh http://localhost:9000
```

Requires backend running and DB seeded (admin user and at least one product).
