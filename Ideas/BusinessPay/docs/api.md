# API Reference — BusinessPay

Base URL: `/api`

### Core Endpoints

#### 1. `GET /api/stats`
Retrieves top-level AR summary metrics.
**Response:**
```json
{
  "totalOpenAR": 1450000,
  "overdueAmount": 420000,
  "activeOffersCount": 12,
  "acceleratedCash": 850000,
  "avgDPD": 14.2,
  "openDisputesCount": 3,
  "dso": 38.5
}
```

#### 2. `GET /api/invoices`
Fetches all invoices with customer details and active discount offers.

#### 3. `POST /api/offers`
Creates an early payment discount offer for an invoice.
**Payload:**
```json
{
  "invoiceId": "INV-1002",
  "discountPct": 1.5,
  "expiresInDays": 7
}
```

#### 4. `POST /api/disputes`
Logs a customer dispute and automatically suspends active discount offers.
