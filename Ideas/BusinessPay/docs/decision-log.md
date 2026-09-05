# Decision Log (ADRs) — BusinessPay

### ADR-001: Selection of SQLite (better-sqlite3) for Single-Instance B2B Deployment
- **Status:** Accepted.
- **Context:** BusinessPay requires fast local development, instant data persistence, zero external DB installation setup, and sub-millisecond query performance.
- **Decision:** Use `better-sqlite3` in WAL mode.
