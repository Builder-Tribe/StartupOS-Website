# Database Schema & Migrations — BusinessPay

BusinessPay uses SQLite (`data/businesspay.db`) managed via `better-sqlite3` in WAL mode for high concurrency.

### Core Tables
- `customers` (id, name, gstin, email, risk_rating, avg_days_to_pay, payment_cycle)
- `invoices` (id, customer_id, invoice_number, amount, issue_date, due_date, status)
- `discount_offers` (id, invoice_id, discount_pct, discount_amount, net_payable, expires_at, status)
- `disputes` (id, invoice_id, reason, sla_date, status)
- `promises_to_pay` (id, invoice_id, promised_date, amount, status, notes)
- `activity_log` (id, invoice_id, action, details, timestamp)
