import { createServer } from "node:http";
import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { extname, join, normalize } from "node:path";

const port = Number(process.env.PORT || 8081);
const root = process.cwd();
const dataDirectory = join(root, "data");
const databaseFile = join(dataDirectory, "ideas.json");
const launchesFile = join(dataDirectory, "launches.json");
const usersFile = join(dataDirectory, "users.json");
const auditsFile = join(dataDirectory, "audits.json");

const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };
const json = (res, status, body) => { res.writeHead(status, { "content-type": "application/json; charset=utf-8" }); res.end(JSON.stringify(body)); };

const INITIAL_USERS = [
  {
    id: "user-harshita",
    name: "Harshita G",
    email: "harshita@vibe-coding.io",
    role: "user",
    persona: "founder",
    workspaceName: "Harshita's Studio",
    avatar: "👩‍💻",
    badge: "Pro Builder",
    token: "token-harshita-12345",
    createdAt: new Date().toISOString()
  },
  {
    id: "user-admin",
    name: "Platform Admin Ops",
    email: "admin@startupos.io",
    role: "admin",
    persona: "admin",
    workspaceName: "StartupOS Ops",
    avatar: "👑",
    badge: "Super Admin",
    token: "token-admin-99999",
    createdAt: new Date().toISOString()
  }
];

const INITIAL_LAUNCHES = [
  {
    id: "launch-dupescout",
    title: "DupeScout",
    tagline: "Shop the Look. Not the Markup. AI Visual Similarity & Dupes Engine.",
    description: "Upload any photo or paste a link — AI finds visually similar fashion products across the internet ranked by similarity score with price-quality explanations.",
    category: "AI Vision",
    status: "approved",
    isFeatured: true,
    upvotes: 342,
    upvotedBy: ["user-harshita"],
    maker: { name: "Harshita G", avatar: "👩‍💻", title: "Founder" },
    demoUrl: "https://github.com/1997agarwal/StartupOS/tree/main/Ideas/DupeScout",
    tags: ["CLIP Vision", "FastAPI", "Next.js 14", "pgvector"],
    comments: [
      { id: "c1", author: "Aman Gupta", avatar: "👨‍💼", text: "Incredible visual search accuracy! Perfect for Gen Z shoppers.", timestamp: "2 hours ago" },
      { id: "c2", author: "Priya Sharma", avatar: "👩‍🎨", text: "Love the honest similarity percentage scores.", timestamp: "5 hours ago" }
    ],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: "launch-trippy",
    title: "Trippy",
    tagline: "AI Solo-Travel Group Matching & Community Trip Host Platform.",
    description: "Connect with compatible solo travelers on overlapping dates, build group itineraries, and book hosted trips directly from travel communities.",
    category: "Solo Travel AI",
    status: "approved",
    isFeatured: false,
    upvotes: 289,
    upvotedBy: [],
    maker: { name: "Harshita G", avatar: "👩‍💻", title: "Founder" },
    demoUrl: "https://github.com/1997agarwal/StartupOS/tree/main/Ideas/Trippy",
    tags: ["React 18", "Express", "SQLite", "Node 22"],
    comments: [
      { id: "c3", author: "Rohan V", avatar: "🎒", text: "Finally an app that makes solo travel group matching safe and easy!", timestamp: "1 day ago" }
    ],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: "launch-businesspay",
    title: "BusinessPay",
    tagline: "B2B Accounts Receivable Collections & Early Payment Cash Accelerator.",
    description: "Reduce DSO and accelerate cash flow with dynamic discounting, collector workqueues, buyer portal simulation, and dispute SLA tracking.",
    category: "B2B Fintech",
    status: "approved",
    isFeatured: false,
    upvotes: 215,
    upvotedBy: [],
    maker: { name: "Harshita G", avatar: "👩‍💻", title: "Founder" },
    demoUrl: "https://github.com/1997agarwal/StartupOS/tree/main/Ideas/BusinessPay",
    tags: ["React 19", "Express 5", "Dynamic Discounts", "SQLite"],
    comments: [],
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: "launch-collabkaro",
    title: "CollabKaro",
    tagline: "India-First Creator Marketplace & Escrow Milestone Operating System.",
    description: "Connect brands with influencers and UGC creators using secure milestone escrow funding, campaign briefs, and proof-of-delivery payouts.",
    category: "Creator Marketplace",
    status: "approved",
    isFeatured: false,
    upvotes: 198,
    upvotedBy: [],
    maker: { name: "Harshita G", avatar: "👩‍💻", title: "Founder" },
    demoUrl: "https://github.com/1997agarwal/StartupOS/tree/main/Ideas/CollabKaro",
    tags: ["React TS", "Escrow API", "UGC Media Kit", "SQLite"],
    comments: [],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

const INITIAL_AUDITS = [
  {
    id: "audit-dupescout",
    projectName: "DupeScout",
    builderName: "Harshita G",
    persona: "founder",
    githubUrl: "https://github.com/1997agarwal/StartupOS/tree/main/Ideas/DupeScout",
    hasAgents: true,
    hasRoadmap: true,
    hasClaude: true,
    hasContributing: true,
    score: 98,
    status: "verified",
    examinerFeedback: "100% 4-File Parity score achieved. Clean modular FastAPI/Next.js visual similarity architecture.",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: "audit-trippy",
    projectName: "Trippy",
    builderName: "Harshita G",
    persona: "founder",
    githubUrl: "https://github.com/1997agarwal/StartupOS/tree/main/Ideas/Trippy",
    hasAgents: true,
    hasRoadmap: true,
    hasClaude: true,
    hasContributing: true,
    score: 95,
    status: "verified",
    examinerFeedback: "Full 4-File Parity compliance. Great solo-travel group matching schema.",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: "audit-businesspay",
    projectName: "BusinessPay",
    builderName: "Harshita G",
    persona: "founder",
    githubUrl: "https://github.com/1997agarwal/StartupOS/tree/main/Ideas/BusinessPay",
    hasAgents: true,
    hasRoadmap: true,
    hasClaude: true,
    hasContributing: true,
    score: 94,
    status: "pending",
    examinerFeedback: "Audit requested by founder. Pending final code quality & dynamic discounting SLA verification.",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

const backupFile = join(dataDirectory, "backup_sync.json");

async function writeAutoBackup() {
  try {
    const ideas = await readIdeas().catch(() => []);
    const launches = await readLaunches().catch(() => []);
    const users = await readUsers().catch(() => []);
    const audits = await readAudits().catch(() => []);
    const backupData = {
      lastSyncedAt: new Date().toISOString(),
      counts: { ideas: ideas.length, launches: launches.length, users: users.length, audits: audits.length },
      ideas, launches, users, audits
    };
    await writeFile(backupFile, `${JSON.stringify(backupData, null, 2)}\n`, "utf8");
  } catch (err) {
    console.error("Auto backup update failed:", err);
  }
}

async function initializeDatabase() {
  await mkdir(dataDirectory, { recursive: true });
  try { await readFile(databaseFile, "utf8"); } catch { await writeFile(databaseFile, "[]\n", "utf8"); }
  try { await readFile(launchesFile, "utf8"); } catch { await writeFile(launchesFile, `${JSON.stringify(INITIAL_LAUNCHES, null, 2)}\n`, "utf8"); }
  try { await readFile(usersFile, "utf8"); } catch { await writeFile(usersFile, `${JSON.stringify(INITIAL_USERS, null, 2)}\n`, "utf8"); }
  try { await readFile(auditsFile, "utf8"); } catch { await writeFile(auditsFile, `${JSON.stringify(INITIAL_AUDITS, null, 2)}\n`, "utf8"); }
  await writeAutoBackup();
}

async function readIdeas() { return JSON.parse(await readFile(databaseFile, "utf8")); }
async function writeIdeas(ideas) { 
  await writeFile(databaseFile, `${JSON.stringify(ideas, null, 2)}\n`, "utf8");
  await writeAutoBackup();
}

async function readLaunches() { return JSON.parse(await readFile(launchesFile, "utf8")); }
async function writeLaunches(launches) { 
  await writeFile(launchesFile, `${JSON.stringify(launches, null, 2)}\n`, "utf8");
  await writeAutoBackup();
}

async function readUsers() { return JSON.parse(await readFile(usersFile, "utf8")); }
async function writeUsers(users) { 
  await writeFile(usersFile, `${JSON.stringify(users, null, 2)}\n`, "utf8");
  await writeAutoBackup();
}

async function readAudits() { return JSON.parse(await readFile(auditsFile, "utf8")); }
async function writeAudits(audits) { 
  await writeFile(auditsFile, `${JSON.stringify(audits, null, 2)}\n`, "utf8");
  await writeAutoBackup();
}

const clean = (value, limit = 1200) => String(value || "").trim().slice(0, limit);

async function checkProjectHealth(projName) {
  const projPath = join(root, "Ideas", projName);
  try {
    await stat(projPath);
    const files = ["AGENTS.md", "ROADMAP.md", "CLAUDE.md", "CONTRIBUTING.md"];
    const checkFile = async (f) => {
      try { await stat(join(projPath, f)); return true; } catch { return false; }
    };
    const results = await Promise.all(files.map(checkFile));
    const presentCount = results.filter(Boolean).length;
    const score = Math.round((presentCount / 4) * 100);
    return {
      name: projName,
      path: projPath,
      healthScore: score,
      hasAgents: results[0],
      hasRoadmap: results[1],
      hasClaude: results[2],
      hasContributing: results[3]
    };
  } catch {
    return { name: projName, path: projPath, healthScore: 0, error: "Directory not found" };
  }
}

async function body(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 50_000) throw new Error("Request is too large.");
  }
  return JSON.parse(raw || "{}");
}

await initializeDatabase();

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (req.method === "GET" && url.pathname === "/api/health") return json(res, 200, { status: "ok" });

    // AUTH APIs
    if (req.method === "POST" && url.pathname === "/api/auth/login") {
      const { email, role = "user" } = await body(req);
      const users = await readUsers();
      let user = users.find(u => u.email.toLowerCase() === (email || "").toLowerCase());
      if (!user && role) {
        user = users.find(u => u.role === role);
      }
      if (!user) {
        user = {
          id: "user-" + randomUUID().slice(0, 8),
          name: email ? email.split("@")[0] : "Builder User",
          email: email || "builder@startupos.io",
          role: role,
          persona: "founder",
          workspaceName: "My AI Workspace",
          avatar: role === 'admin' ? "👑" : "👩‍💻",
          badge: role === 'admin' ? "Super Admin" : "Pro Builder",
          token: "token-" + randomUUID().slice(0, 10),
          createdAt: new Date().toISOString()
        };
        users.push(user);
        await writeUsers(users);
      }
      return json(res, 200, user);
    }

    if (req.method === "POST" && url.pathname === "/api/auth/register") {
      const { name, email, persona = "founder", workspaceName = "My Studio" } = await body(req);
      if (!name || !email) return json(res, 400, { error: "Name and email are required." });
      
      const users = await readUsers();
      const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) return json(res, 400, { error: "An account with this email already exists." });

      const personaAvatars = { student: "🎓", founder: "🚀", developer: "💻", admin: "👑" };
      const personaBadges = { student: "Student Builder", founder: "Startup Founder", developer: "Full-Stack Dev", admin: "Super Admin" };

      const newUser = {
        id: "user-" + randomUUID().slice(0, 8),
        name: clean(name),
        email: clean(email).toLowerCase(),
        role: persona === "admin" ? "admin" : "user",
        persona: persona,
        workspaceName: clean(workspaceName),
        avatar: personaAvatars[persona] || "👩‍💻",
        badge: personaBadges[persona] || "Pro Builder",
        token: "token-" + randomUUID().slice(0, 10),
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      await writeUsers(users);
      return json(res, 201, newUser);
    }

    if (req.method === "GET" && url.pathname === "/api/auth/users") {
      const users = await readUsers();
      return json(res, 200, users);
    }
    
    // IDEAS API
    if (req.method === "GET" && url.pathname === "/api/ideas") {
      const ideas = await readIdeas();
      return json(res, 200, ideas);
    }
    if (req.method === "POST" && url.pathname === "/api/ideas") {
      const input = await body(req);
      const now = new Date().toISOString();
      const record = { id: randomUUID(), ...input, createdAt: now, updatedAt: now };
      const ideas = await readIdeas();
      ideas.unshift(record);
      await writeIdeas(ideas);
      return json(res, 201, record);
    }

    // LAUNCHES API (Product Hunt Feed)
    if (req.method === "GET" && url.pathname === "/api/launches") {
      const launches = await readLaunches();
      launches.sort((a, b) => b.upvotes - a.upvotes);
      return json(res, 200, launches);
    }

    if (req.method === "POST" && url.pathname === "/api/launches") {
      const input = await body(req);
      if (!input.title || !input.tagline) return json(res, 400, { error: "Title and tagline are required." });
      const launches = await readLaunches();
      const newLaunch = {
        id: "launch-" + randomUUID().slice(0, 8),
        title: clean(input.title),
        tagline: clean(input.tagline),
        description: clean(input.description || input.tagline),
        category: input.category || "AI Startup",
        status: "approved",
        isFeatured: false,
        upvotes: 1,
        upvotedBy: [input.userId || "user-harshita"],
        maker: input.maker || { name: "Harshita G", avatar: "👩‍💻", title: "Maker" },
        demoUrl: input.demoUrl || "",
        tags: input.tags || ["AI", "StartupOS"],
        comments: [],
        createdAt: new Date().toISOString()
      };
      launches.unshift(newLaunch);
      await writeLaunches(launches);
      return json(res, 201, newLaunch);
    }

    const upvoteMatch = url.pathname.match(/^\/api\/launches\/([a-z0-9-]+)\/upvote$/i);
    if (req.method === "POST" && upvoteMatch) {
      const launchId = upvoteMatch[1];
      const { userId = "user-harshita" } = await body(req);
      const launches = await readLaunches();
      const launch = launches.find(l => l.id === launchId);
      if (!launch) return json(res, 404, { error: "Launch not found." });
      
      const idx = launch.upvotedBy.indexOf(userId);
      if (idx >= 0) {
        launch.upvotedBy.splice(idx, 1);
        launch.upvotes = Math.max(0, launch.upvotes - 1);
      } else {
        launch.upvotedBy.push(userId);
        launch.upvotes += 1;
      }
      await writeLaunches(launches);
      return json(res, 200, launch);
    }

    const commentMatch = url.pathname.match(/^\/api\/launches\/([a-z0-9-]+)\/comment$/i);
    if (req.method === "POST" && commentMatch) {
      const launchId = commentMatch[1];
      const { text, author = "Harshita G", avatar = "👩‍💻" } = await body(req);
      if (!text) return json(res, 400, { error: "Comment text required." });
      const launches = await readLaunches();
      const launch = launches.find(l => l.id === launchId);
      if (!launch) return json(res, 404, { error: "Launch not found." });

      const newComment = { id: "c-" + Date.now(), author, avatar, text: clean(text), timestamp: "Just now" };
      launch.comments.push(newComment);
      await writeLaunches(launches);
      return json(res, 201, launch);
    }

    // ADMIN CONSOLE APIs
    const adminActionMatch = url.pathname.match(/^\/api\/admin\/launches\/([a-z0-9-]+)\/(feature|delete|approve)$/i);
    if (req.method === "POST" && adminActionMatch) {
      const launchId = adminActionMatch[1];
      const action = adminActionMatch[2];
      let launches = await readLaunches();
      
      if (action === "delete") {
        launches = launches.filter(l => l.id !== launchId);
      } else if (action === "feature") {
        launches.forEach(l => l.isFeatured = (l.id === launchId ? !l.isFeatured : false));
      } else if (action === "approve") {
        const l = launches.find(item => item.id === launchId);
        if (l) l.status = "approved";
      }
      await writeLaunches(launches);
      return json(res, 200, { success: true, launches });
    }

    const roleMatch = url.pathname.match(/^\/api\/admin\/users\/([a-z0-9-]+)\/role$/i);
    if (req.method === "POST" && roleMatch) {
      const targetUserId = roleMatch[1];
      const { role, badge } = await body(req);
      const users = await readUsers();
      const targetUser = users.find(u => u.id === targetUserId);
      if (!targetUser) return json(res, 404, { error: "User not found." });

      targetUser.role = role || targetUser.role;
      targetUser.badge = badge || (role === 'admin' ? 'Super Admin' : 'Pro Builder');
      await writeUsers(users);
      return json(res, 200, { success: true, user: targetUser });
    }

    // ADMIN AUDITS API
    if (req.method === "GET" && url.pathname === "/api/admin/audits") {
      const audits = await readAudits();
      return json(res, 200, audits);
    }

    const auditReviewMatch = url.pathname.match(/^\/api\/admin\/audits\/([a-z0-9-]+)\/review$/i);
    if (req.method === "POST" && auditReviewMatch) {
      const auditId = auditReviewMatch[1];
      const { score, status = "verified", examinerFeedback } = await body(req);
      const audits = await readAudits();
      const audit = audits.find(a => a.id === auditId);
      if (!audit) return json(res, 404, { error: "Audit record not found." });

      audit.score = Number(score || audit.score);
      audit.status = status;
      audit.examinerFeedback = clean(examinerFeedback || audit.examinerFeedback);
      await writeAudits(audits);
      return json(res, 200, { success: true, audit });
    }

    // PROJECTS HEALTH API
    if (req.method === "GET" && url.pathname === "/api/projects/health") {
      const projects = ["Trippy", "DupeScout", "BusinessPay", "CollabKaro"];
      const healthData = await Promise.all(projects.map(checkProjectHealth));
      return json(res, 200, healthData);
    }

    // STATIC FILE SERVING
    if (req.method === "GET" || req.method === "HEAD") {
      const distDir = join(root, "dist");
      let file = url.pathname === "/" ? join(distDir, "index.html") : normalize(join(distDir, url.pathname));
      if (!file.startsWith(distDir)) file = join(distDir, "index.html");
      try {
        const content = await readFile(file);
        res.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream" });
        return res.end(content);
      } catch {
        const fallback = await readFile(join(root, "index.html"));
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        return res.end(fallback);
      }
    }

    return json(res, 404, { error: "Not found." });
  } catch (error) {
    console.error(error);
    return json(res, 404, { error: error.message || "Unexpected server error." });
  }
}

function startServer(p) {
  const server = createServer(handleRequest);
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`Port ${p} in use, trying ${p + 1}...`);
      startServer(p + 1);
    } else {
      console.error(err);
    }
  });
  server.listen(p, "0.0.0.0", () => {
    console.log(`StartupOS Hub running on http://localhost:${p}`);
  });
}

startServer(port);
