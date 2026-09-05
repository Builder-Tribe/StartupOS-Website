# Volume 5: AI Architecture & Technical Design — BusinessPay

## 1. System Architecture
```
[ React 19 Frontend SPA ]
          │ (REST API via /api)
          ▼
[ Node.js Express 5 API Server ]
   ├── Dynamic Discount Engine
   ├── Risk Score Calculator
   ├── Dispute & PTP Lifecycle Service
   └── Audit Logging Middleware
          │ (Parameterized SQL)
          ▼
[ SQLite Database (data/businesspay.db) ]
```

## 2. Database Schema Overview
- **`customers`**: `id`, `name`, `gstin`, `email`, `risk_rating`, `avg_days_to_pay`, `payment_cycle`.
- **`invoices`**: `id`, `customer_id`, `invoice_number`, `amount`, `issue_date`, `due_date`, `status`.
- **`discount_offers`**: `id`, `invoice_id`, `discount_pct`, `discount_amount`, `net_payable`, `expires_at`, `status`.
- **`disputes`**: `id`, `invoice_id`, `reason`, `sla_date`, `status`.
- **`promises_to_pay`**: `id`, `invoice_id`, `promised_date`, `amount`, `status`, `notes`.
- **`activity_log`**: `id`, `invoice_id`, `action`, `details`, `timestamp`.

## 3. Core API Endpoints
- `GET /api/stats` - Overall AR & liquidity metrics.
- `GET /api/invoices` - Invoices list with active discount offers.
- `GET /api/invoices/:id` - Full invoice details drawer data.
- `POST /api/offers` - Issue early payment discount offer.
- `POST /api/offers/:id/accept` - Buyer accepts discount offer & triggers payment.
- `POST /api/disputes` - Log invoice dispute (auto-withdraws active offers).
- `POST /api/promises` - Log promise to pay.
