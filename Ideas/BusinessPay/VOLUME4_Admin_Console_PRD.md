# Volume 4: Admin Console & Governance PRD — BusinessPay

## 1. Finance Admin Dashboard
- Executive overview of platform cash velocity, portfolio risk distribution, discount margin expense, and dunning activity volume.

## 2. Trust, Safety & Immutable Audit Logging
- **Activity Log (`activity_log`)**: Every administrative action, offer creation, dispute logging, PTP status update, or payment receipt generates an immutable audit log entry.
- **Audit Columns**: `id`, `invoice_id`, `actor_id`, `action_type`, `description`, `timestamp`, `ip_address`.
- **Immutability Guarantee**: No UPDATE or DELETE API paths exist for `activity_log`.

## 3. Risk Overrides & Compliance Gates
- Manual credit risk rating overrides by Finance Leadership with mandatory reason documentation.
- Automated offer withdrawal on dispute creation to prevent improper discount claims.
