# Volume 2: Collector Workqueue & Buyer Portal PRD — BusinessPay

## 1. AR Collector Workqueue Interface
- **Top KPI Cards**: Total Open AR, Overdue Amount, Active Discount Offers, Accelerated Cash Flow, Average Days Past Due (DPD), Open Disputes Count, Days Sales Outstanding (DSO).
- **Dynamic Discount Suggestion Engine**: Automatically recommends discount rates based on invoice age:
  - Current (0-30 DPD): 0.5% – 1.0% early payment discount.
  - Overdue (31-60 DPD): 1.5% discount.
  - Critical (>60 DPD): 2.5% discount to unlock immediate liquidity.
- **Interactive Invoices Data Table**: Columns for Invoice #, Customer, Issue Date, Due Date, Total Amount, Status (Open, Overdue, Paid), Active Offer status, and Quick Action buttons.

## 2. Invoice Deep-Dive Side Drawer
- **Customer Intelligence Card**: Name, GSTIN, Risk Rating (Easy, Moderate, High Risk, Risky), Average Days to Pay, Preferred Payment Window.
- **Active Offer Manager**: View, issue, or withdraw early payment discount offers. Shows original amount, discount percentage, net payable, and offer expiration timer.
- **Promises to Pay (PTP)**: Log promised payment dates, commitment amounts, and notes. Automatically tracks status (`kept`, `broken`).
- **Dispute Resolution SLA**: Log new disputes, set SLA resolution dates, categorize dispute reason (*Price*, *Quantity*, *Damaged Goods*), and track resolution progress.

## 3. Buyer Portal Simulation
- **End-Customer View**: Accessible via secure magic link or portal login.
- **Pending Discount Offers Feed**: Shows active early payment discount offers with dynamic savings breakdown (e.g. "Pay today and save ₹12,500").
- **One-Click Settlement**: Accept offer via integrated Razorpay B2B gateway (UPI, NetBanking, Virtual Account), automatically updating invoice status to `Paid`.
