import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Initialize SQLite Database
const dbPath = path.join(__dirname, '../data/collabkaro.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Create Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS creators (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    niche TEXT NOT NULL,
    bio TEXT,
    instagram_handle TEXT,
    followers INTEGER,
    engagement_rate REAL,
    rate_per_reel INTEGER,
    city TEXT,
    verified INTEGER DEFAULT 0,
    avatar TEXT
  );

  CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    brand_name TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    budget INTEGER NOT NULL,
    deliverable_type TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS proposals (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    creator_id TEXT NOT NULL,
    pitch TEXT NOT NULL,
    price_quote INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(campaign_id) REFERENCES campaigns(id),
    FOREIGN KEY(creator_id) REFERENCES creators(id)
  );

  CREATE TABLE IF NOT EXISTS milestones (
    id TEXT PRIMARY KEY,
    proposal_id TEXT NOT NULL,
    title TEXT NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY(proposal_id) REFERENCES proposals(id)
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed Initial Data if empty
const creatorCount = db.prepare('SELECT COUNT(*) as count FROM creators').get().count;
if (creatorCount === 0) {
  const insertCreator = db.prepare(`
    INSERT INTO creators (id, name, niche, bio, instagram_handle, followers, engagement_rate, rate_per_reel, city, verified, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertCreator.run('c1', 'Rohan Sharma', 'Tech & Gadgets', 'Simplifying tech & AI gadgets for India', '@rohan_tech', 245000, 4.8, 25000, 'Bengaluru', 1, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
  insertCreator.run('c2', 'Ananya Verma', 'Fashion & Beauty', 'GRWM, Sustainable Fashion & Daily Drip', '@ananya_style', 410000, 5.2, 40000, 'Mumbai', 1, 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150');
  insertCreator.run('c3', 'Vikramaditya', 'Fitness & Wellness', 'Clean Indian Meals & Calisthenics Routine', '@vikram_fit', 180000, 6.1, 20000, 'Delhi NCR', 1, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150');
  insertCreator.run('c4', 'Priya Deshmukh', 'Food & Travel', 'Exploring Hidden Gems across India', '@priya_eats', 320000, 4.2, 30000, 'Pune', 1, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150');

  const insertCampaign = db.prepare(`
    INSERT INTO campaigns (id, brand_name, title, category, budget, deliverable_type, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertCampaign.run('cmp1', 'Minimalist Skincare', 'Summer Hydration Reel Campaign', 'Beauty', 150000, 'Instagram Reel + Story', 'active');
  insertCampaign.run('cmp2', 'Boat Audio', 'Noise Cancelling Headphones Unboxing', 'Tech', 200000, 'YouTube Integration + Reel', 'active');
  insertCampaign.run('cmp3', 'MuscleBlaze', 'Whey Protein Fitness Challenge', 'Fitness', 100000, 'UGC Video Asset', 'active');

  const insertProposal = db.prepare(`
    INSERT INTO proposals (id, campaign_id, creator_id, pitch, price_quote, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertProposal.run('prop1', 'cmp1', 'c2', 'I can create a 45-sec aesthetic GRWM reel showing skin hydration after workout.', 35000, 'accepted');
  insertProposal.run('prop2', 'cmp2', 'c1', 'Unboxing with binaural audio test & active noise cancelling demo.', 45000, 'pending');

  const insertMilestone = db.prepare(`
    INSERT INTO milestones (id, proposal_id, title, amount, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertMilestone.run('m1', 'prop1', 'Script & Concept Approval', 10000, 'approved');
  insertMilestone.run('m2', 'prop1', 'Draft Reel Video Upload', 15000, 'funded');
  insertMilestone.run('m3', 'prop1', 'Live Post & Analytics Proof', 10000, 'pending');

  db.prepare('INSERT INTO audit_logs (action, details) VALUES (?, ?)').run('INITIALIZE_PLATFORM', 'CollabKaro seed data successfully populated.');
}

// API Routes
app.get('/api/stats', (req, res) => {
  const totalCampaigns = db.prepare('SELECT COUNT(*) as c FROM campaigns').get().c;
  const totalCreators = db.prepare('SELECT COUNT(*) as c FROM creators').get().c;
  const totalEscrow = db.prepare('SELECT SUM(amount) as s FROM milestones WHERE status IN ("funded", "approved")').get().s || 0;
  const releasedEscrow = db.prepare('SELECT SUM(amount) as s FROM milestones WHERE status = "paid"').get().s || 0;

  res.json({ totalCampaigns, totalCreators, totalEscrow, releasedEscrow });
});

app.get('/api/creators', (req, res) => {
  const creators = db.prepare('SELECT * FROM creators ORDER BY followers DESC').all();
  res.json(creators);
});

app.get('/api/campaigns', (req, res) => {
  const campaigns = db.prepare('SELECT * FROM campaigns ORDER BY created_at DESC').all();
  res.json(campaigns);
});

app.post('/api/campaigns', (req, res) => {
  const { brand_name, title, category, budget, deliverable_type } = req.body;
  const id = 'cmp_' + Date.now();
  db.prepare('INSERT INTO campaigns (id, brand_name, title, category, budget, deliverable_type) VALUES (?, ?, ?, ?, ?, ?)').run(id, brand_name, title, category, budget, deliverable_type);
  db.prepare('INSERT INTO audit_logs (action, details) VALUES (?, ?)').run('CAMPAIGN_CREATED', `New campaign '${title}' created by ${brand_name}`);
  res.json({ success: true, id });
});

app.get('/api/proposals', (req, res) => {
  const proposals = db.prepare(`
    SELECT p.*, c.title as campaign_title, cr.name as creator_name, cr.instagram_handle, cr.avatar
    FROM proposals p
    JOIN campaigns c ON p.campaign_id = c.id
    JOIN creators cr ON p.creator_id = cr.id
  `).all();
  res.json(proposals);
});

app.get('/api/milestones/:proposalId', (req, res) => {
  const milestones = db.prepare('SELECT * FROM milestones WHERE proposal_id = ?').all(req.params.proposalId);
  res.json(milestones);
});

app.post('/api/milestones/:id/fund', (req, res) => {
  db.prepare('UPDATE milestones SET status = "funded" WHERE id = ?').run(req.params.id);
  db.prepare('INSERT INTO audit_logs (action, details) VALUES (?, ?)').run('ESCROW_FUNDED', `Milestone ${req.params.id} funded into escrow.`);
  res.json({ success: true });
});

app.post('/api/milestones/:id/release', (req, res) => {
  db.prepare('UPDATE milestones SET status = "paid" WHERE id = ?').run(req.params.id);
  db.prepare('INSERT INTO audit_logs (action, details) VALUES (?, ?)').run('ESCROW_RELEASED', `Escrow payment released for milestone ${req.params.id}.`);
  res.json({ success: true });
});

app.get('/api/audit', (req, res) => {
  const logs = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 20').all();
  res.json(logs);
});

app.listen(PORT, () => {
  console.log(`CollabKaro API Server running on http://localhost:${PORT}`);
});
