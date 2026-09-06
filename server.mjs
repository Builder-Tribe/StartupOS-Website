import { createServer } from "node:http";
import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { extname, join, normalize } from "node:path";

const port = Number(process.env.PORT || 8081);
const root = process.cwd();
const dataDirectory = join(root, "data");
const databaseFile = join(dataDirectory, "ideas.json");
const launchesFile = join(dataDirectory, "launches.json");

const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };
const json = (res, status, body) => { res.writeHead(status, { "content-type": "application/json; charset=utf-8" }); res.end(JSON.stringify(body)); };

const INITIAL_LAUNCHES = [
  {
    id: "launch-dupescout",
    title: "DupeScout",
    tagline: "Shop the Look. Not the Markup. AI Visual Similarity & Dupes Engine.",
    description: "Upload any photo or paste a link — AI finds visually similar fashion products across the internet ranked by similarity score with price-quality explanations.",
    category: "AI Vision",
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
    upvotes: 198,
    upvotedBy: [],
    maker: { name: "Harshita G", avatar: "👩‍💻", title: "Founder" },
    demoUrl: "https://github.com/1997agarwal/StartupOS/tree/main/Ideas/CollabKaro",
    tags: ["React TS", "Escrow API", "UGC Media Kit", "SQLite"],
    comments: [],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

async function initializeDatabase() {
  await mkdir(dataDirectory, { recursive: true });
  try { await readFile(databaseFile, "utf8"); } catch { await writeFile(databaseFile, "[]\n", "utf8"); }
  try { await readFile(launchesFile, "utf8"); } catch { await writeFile(launchesFile, `${JSON.stringify(INITIAL_LAUNCHES, null, 2)}\n`, "utf8"); }
}

async function readIdeas() { return JSON.parse(await readFile(databaseFile, "utf8")); }
async function writeIdeas(ideas) { await writeFile(databaseFile, `${JSON.stringify(ideas, null, 2)}\n`, "utf8"); }

async function readLaunches() { return JSON.parse(await readFile(launchesFile, "utf8")); }
async function writeLaunches(launches) { await writeFile(launchesFile, `${JSON.stringify(launches, null, 2)}\n`, "utf8"); }

const clean = (value, limit = 1200) => String(value || "").trim().slice(0, limit);
const titleCase = (value) => value.split(/\s+/).slice(0, 5).map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" ");

function assess(input) {
  const hasProblem = input.problem.length > 20;
  const hasAudience = input.audience.length > 4;
  const hasAlternatives = input.alternatives.length > 4;
  const hasAdvantage = input.advantage.length > 8;
  const scoreBreakdown = [
    { label: "Problem clarity", score: hasProblem ? 16 : 8, reason: hasProblem ? "You named a concrete pain worth testing." : "Describe the costly or frustrating problem more specifically." },
    { label: "Customer focus", score: hasAudience ? 16 : 9, reason: hasAudience ? `The first customer is defined as ${input.audience}.` : "Choose one narrow first customer, not everyone." },
    { label: "Differentiation", score: hasAdvantage ? 15 : 8, reason: hasAdvantage ? "You identified a starting point for differentiation." : "Explain why this is better than current options." },
    { label: "Market awareness", score: hasAlternatives ? 14 : 7, reason: hasAlternatives ? "You recognize the alternatives people already use." : "List the manual workaround or competitor." },
    { label: "Build feasibility", score: input.budget ? 14 : 11, reason: input.budget ? `A test budget (${input.budget}) creates a practical constraint.` : "Set a time or spending limit for validation." }
  ];
  const score = scoreBreakdown.reduce((total, item) => total + item.score, 0);
  const verdict = score >= 70 ? "Promising — validate before scaling" : score >= 55 ? "Worth testing — tighten the first use case" : "Early signal — clarify before building";
  const name = titleCase(input.idea.replace(/^(a|an|the)\s+/i, "").split(/[,.]/)[0]) || "Untitled idea";
  return {
    name, score, verdict, scoreBreakdown,
    summary: `${input.idea} is aimed at ${input.audience}. Its key assumption is that ${input.problem.toLowerCase()}.`,
    nextSteps: [
      `Interview five ${input.audience} and ask how they solve this problem today.`,
      `Test the smallest useful promise: ${input.advantage || "a clearly better outcome than the existing workaround"}.`,
      `Set a validation boundary of ${input.budget || "a small fixed time and spending limit"} before building more.`,
      "Turn repeated customer language into a narrow MVP workflow."
    ],
    buildPrompt: `Build a full-stack MVP for: ${input.idea}\n\nFirst customer: ${input.audience}\nProblem: ${input.problem}\nExisting alternatives: ${input.alternatives || "not yet researched"}\nDifferentiator: ${input.advantage || "to be validated"}\nTest budget: ${input.budget || "bootstrapped"}\n\nUse a persistent database, authenticated workspaces, server-side validation, responsive UI, and clear empty/error states.`
  };
}

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
    
    // IDEAS API
    if (req.method === "GET" && url.pathname === "/api/ideas") {
      const ideas = await readIdeas();
      return json(res, 200, ideas);
    }
    if (req.method === "POST" && url.pathname === "/api/ideas") {
      const rawInput = await body(req);
      const fields = ["idea", "audience", "budget", "problem", "alternatives", "advantage"];
      const input = Object.fromEntries(fields.map((field) => [field, clean(rawInput[field])]));
      if (!input.idea || !input.audience || !input.problem) return json(res, 400, { error: "Please describe the idea, first customer, and problem." });
      const now = new Date().toISOString();
      const record = { id: randomUUID(), ...input, ...assess(input), createdAt: now, updatedAt: now };
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

    // PROJECTS HEALTH API
    if (req.method === "GET" && url.pathname === "/api/projects/health") {
      const projects = ["Trippy", "DupeScout", "BusinessPay", "CollabKaro"];
      const healthData = await Promise.all(projects.map(checkProjectHealth));
      return json(res, 200, healthData);
    }

    // STATIC FILE SERVING
    if (req.method === "GET") {
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
