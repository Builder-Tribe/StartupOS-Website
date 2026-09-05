# Contributing to BusinessPay

Thank you for contributing to BusinessPay! To maintain engineering quality, reliability, and security across the codebase, please adhere to these guidelines.

---

## 1. Branch Strategy & Commit Messages

- **Branch naming convention:**
  - `feat/<short-description>` for new features.
  - `fix/<short-description>` for bug fixes.
  - `docs/<short-description>` for documentation updates.

- **Commit message format:**
  Follow Conventional Commits:
  - `feat(ar): add promise to pay status filter`
  - `fix(offers): recalculate discount expiry on dispute`
  - `docs(api): document stats endpoint response schema`

---

## 2. Coding Standards

- **React / Frontend:** Use clean functional components, CSS design tokens, and defensive error handling.
- **Node.js / Express:** Keep routes modular in `server/`, use parameterized SQL queries with `better-sqlite3`, and enforce input validation.
- **Database Migrations:** All schema updates must be additive (`CREATE TABLE IF NOT EXISTS`). Never run destructive migrations without explicit consent.

---

## 3. Pre-Commit Verification Checklist

Before submitting a pull request or pushing to `main`:
1. Run syntax verification on JavaScript files.
2. Verify API endpoints return valid JSON responses.
3. Test the full user flow in a live browser session.
4. Update `ROADMAP.md` and relevant `docs/` files to reflect your changes.
