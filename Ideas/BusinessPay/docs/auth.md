# Auth & Security Specifications — BusinessPay

- **Auth Realms:**
  1. `Collector Realm`: Full access to workqueue, offer creation, dispute management.
  2. `Buyer Realm`: Scoped access to review and accept active discount offers for specific GSTIN/customer accounts.
  3. `Admin Realm`: Access to risk overrides, liquidity campaign creation, and audit log inspection.
- **Security Boundary:** All backend routes validate user identity on the server side. Sensitive fields (`password_hash`, audit raw logs) are excluded from API payloads.
