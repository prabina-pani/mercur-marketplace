#!/usr/bin/env bash
# Verify Product API returns extended fields (product_extended: brand, logistic_class)
# Usage: ./scripts/verify-product-extended-api.sh [BASE_URL]
# Requires: backend running, DB seeded (admin@mercurjs.com / supersecret)

set -e
BASE_URL="${1:-http://localhost:9000}"
ADMIN_EMAIL="admin@mercurjs.com"
ADMIN_PASSWORD="supersecret"

echo "=== 1. Get admin JWT ==="
LOGIN_RESP=$(curl -s -X POST "${BASE_URL}/auth/user/emailpass" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}")
TOKEN=$(echo "$LOGIN_RESP" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
  echo "Login failed. Response: $LOGIN_RESP"
  exit 1
fi
echo "Token obtained (length ${#TOKEN})"

echo ""
echo "=== 2. List products with extended fields (?fields=+product_extended.*) ==="
# Use product_extended (snake_case); productExtended is not valid for fields query
PRODUCTS=$(curl -s "${BASE_URL}/admin/products?limit=1&fields=+product_extended.*" \
  -H "Authorization: Bearer ${TOKEN}")
echo "$PRODUCTS" | head -c 500
echo ""
if echo "$PRODUCTS" | grep -q '"products"'; then
  PRODUCT_ID=$(echo "$PRODUCTS" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
else
  PRODUCT_ID=""
fi

if [ -n "$PRODUCT_ID" ]; then
  echo ""
  echo "=== 3. Get single product with extended (?fields=+product_extended.*) ==="
  curl -s "${BASE_URL}/admin/products/${PRODUCT_ID}?fields=+product_extended.*" \
    -H "Authorization: Bearer ${TOKEN}" | head -c 600
  echo ""

  echo ""
  echo "=== 4. GET /admin/products/:id/extended ==="
  curl -s "${BASE_URL}/admin/products/${PRODUCT_ID}/extended" \
    -H "Authorization: Bearer ${TOKEN}"
  echo ""

  echo ""
  echo "=== 5. POST /admin/products/:id/extended (set brand & logisticClass) ==="
  curl -s -X POST "${BASE_URL}/admin/products/${PRODUCT_ID}/extended" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"brand":"TestBrand","logisticClass":"ClassA"}'
  echo ""

  echo ""
  echo "=== 6. GET /admin/products/:id/extended (verify response) ==="
  curl -s "${BASE_URL}/admin/products/${PRODUCT_ID}/extended" \
    -H "Authorization: Bearer ${TOKEN}"
  echo ""
else
  echo "No product id found in list response, skipping single-product and extended checks."
fi

echo ""
echo "=== Done ==="
