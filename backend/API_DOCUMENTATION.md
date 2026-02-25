# DentalMarket Backend API Documentation

The backend connects the Vercel Frontend to the Supabase Database securely via a `SERVICE_ROLE_KEY`.

## Authentication

Every protected request MUST include an Authorization header with a valid Supabase JWT token:
`Authorization: Bearer <your_supabase_jwt>`

---

## 1. Products

### `GET /api/products` (Public)

Fetches all active and approved products along with their variations and store metadata.

- **Returns**: `{ count: integer, data: [ProductObjects] }`

### `POST /api/products` (Store, Admin, Owner)

Creates a new product tied to the requesting logic along with mandatory initial variations.

- **Body**:

```json
{
  "name": "Composite Resin",
  "description": "High quality restorative material",
  "category_id": "uuid",
  "price": 25.0,
  "variations": [
    { "attribute_name": "Shade", "attribute_value": "A2", "stock": 50 }
  ]
}
```

### `DELETE /api/products/:id` (Store, Admin, Owner)

Soft-deletes a product by marking `is_active = false`.

---

## 2. Orders & Escrow

### `POST /api/orders` (Buyer, Professional)

Submits a cart checkout. Fetches the live BCV rate from `global_settings` and creates the immutable order with `total_ves` calculated. It also captures the active `platform_fee` and records `commission_rate_at_purchase` and commission amounts immutably. Delivery status is initiated as `pending`.

- **Body**:

```json
{
  "items": [
    {
      "product_id": "uuid",
      "variation_id": "uuid",
      "store_id": "uuid",
      "quantity": 2,
      "unit_price": 25.0
    }
  ]
}
```

### `GET /api/orders` (Authenticated)

For generic buyers, gets full order history. For stores, returns flat `order_items` that belong to them.

### `PUT /api/orders/:item_id/ship` (Store, Owner)

Flags a singular order item as `shipped` and fires the Postgres DB trigger `decrement_stock_on_order` to update quantities safely.

- **Body**:

```json
{
  "tracking_code": "MRW-1234",
  "shipping_carrier": "MRW"
}
```

---

## 3. Wallets

### `GET /api/store/wallet` (Store)

Gets the current un-tampered raw wallet sum tracked by the escrow layer.

- **Returns**: `{ data: { balance_available: 45.00, balance_pending: 100.00 } }`

### `POST /api/store/payout` (Store)

Request an outbound transfer. Automatically subtracts from `balance_available` over RPC and pushes a ticket to `payout_requests` for admins to manually fulfill.

- **Body**:

```json
{ "amount": 25.0 }
```

---

## 4. Settings

### `PUT /api/admin/settings/bcv-rate` (Owner)

Updates the official conversion rating dynamically applying it to next transactions.

- **Body**:

```json
{ "rate": 36.5 }
```

---

## 5. Bulk Product Import

### `GET /api/products/bulk-import/template` (Store, Owner, Admin)

Downloads the CSV template for bulk imports.

### `POST /api/products/bulk-import` (Store, Owner, Admin)

Processes a CSV file to bulk create products and variations simultaneously.

- **Body**: `multipart/form-data` with a `file` field containing the CSV.

---

## 6. Wishlist (Favorites)

### `GET /api/wishlist` (Authenticated)

Retrieves the favorite products attached to the current user.

### `GET /api/wishlist/check/:product_id` (Authenticated)

Checks if a specific product is favorited by the current user.

### `POST /api/wishlist/:product_id` (Authenticated)

Adds a product to the user's wishlist permanently.

### `DELETE /api/wishlist/:product_id` (Authenticated)

Removes a product from the user's wishlist.

---

## 7. Professional Licenses

### `POST /api/professional/license-upload` (Professional)

Uploads a license document (PDF/JPG/PNG) to the private Supabase Storage Bucket (`licenses`) and marks the profile as pending verification.

- **Body**: `multipart/form-data` with a `file` field.

### `GET /api/professional/status` (Professional)

Checks the current verification status of the professional profile.

### `GET /api/admin/professional-licenses` (Admin, Owner)

Retrieves all pending professional profiles with dynamically generated signed URLs to securely view the uploaded licenses.

### `PUT /api/admin/professionals/:id/verify` (Admin, Owner)

Approves or rejects a professional's verification status, unlocking store abilities if approved.

- **Body**:

```json
{
  "is_verified": true,
  "notes": "Valid medical certificate verified."
}
```
