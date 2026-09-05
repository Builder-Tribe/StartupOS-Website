# Volume 3: AR Finance & Vendor Management System — BusinessPay

## 1. Customer Intelligence & Risk Profiling
- **Risk Score Algorithm**: Classifies customer accounts into 4 risk tiers based on historical payment performance, dispute frequency, and PTP compliance:
  - **Tier 1 (Easy / Low Risk)**: On-time payment rate > 90%, DPD < 5 days.
  - **Tier 2 (Moderate Risk)**: On-time payment rate 70–90%, DPD 5–20 days.
  - **Tier 3 (High Risk)**: On-time payment rate 50–70%, recurring disputes.
  - **Tier 4 (Risky / Critical)**: On-time payment rate < 50%, broken PTPs > 3.

## 2. Customer Behavioral Analytics
- **Preferred Payment Window**: Identifies monthly payment patterns (*Beginning of Month*, *Mid-Month*, *End of Month*, *Irregular*).
- **Average Days to Pay (ADTP)**: Real-time calculation of historical invoice payment velocity.
- **Lifetime Value & Paid Metrics**: Total paid volume, total discounts claimed, net margin contribution.

## 3. Targeted Liquidity Campaigns
- **Bulk Liquidity Offer Creation**: Select accounts by risk tier or overdue age and deploy batch early payment discount offers (5% – 20%).
- **Campaign Expiry & Guardrails**: Set strict expiration dates and budget caps to prevent excessive margin erosion.
- **Conversion Tracking**: Monitor real-time campaign acceptance, total cash accelerated, and net yield.
