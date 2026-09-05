# Architecture Overview — BusinessPay

BusinessPay follows a lightweight, high-performance monorepo architecture combining a React 19 SPA frontend with an Express 5 REST API and an embedded SQLite database using `better-sqlite3`.

```
                  ┌────────────────────────┐
                  │   React 19 Frontend    │
                  │ (Single Page App SPA)  │
                  └───────────┬────────────┘
                              │ HTTP / REST
                              ▼
                  ┌────────────────────────┐
                  │  Node.js Express 5     │
                  │       API Server       │
                  └───────────┬────────────┘
                              │ Parameterized SQL
                              ▼
                  ┌────────────────────────┐
                  │ SQLite (better-sqlite3)│
                  │   data/businesspay.db  │
                  └────────────────────────┘
```
