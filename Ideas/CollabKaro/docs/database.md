# Database Schema — CollabKaro

SQLite database (`data/collabkaro.db`) schema:
- `users`: id, name, email, role, avatar
- `creators`: id, user_id, niche, bio, instagram_handle, followers, engagement_rate, rate_per_reel, city
- `campaigns`: id, brand_id, title, category, budget, deliverable_type, status
- `proposals`: id, campaign_id, creator_id, pitch, price_quote, status
- `milestones`: id, proposal_id, title, amount, status
- `audit_logs`: id, actor_id, action, details, timestamp
