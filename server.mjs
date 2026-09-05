import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { extname, join, normalize } from "node:path";

const port = Number(process.env.PORT || 3000);
const root = process.cwd();
const dataDirectory = join(root, "data");
const databaseFile = join(dataDirectory, "ideas.json");
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };
const json = (res, status, body) => { res.writeHead(status, { "content-type": "application/json; charset=utf-8" }); res.end(JSON.stringify(body)); };

async function initializeDatabase() {
  await mkdir(dataDirectory, { recursive: true });
  try { await readFile(databaseFile, "utf8"); } catch { await writeFile(databaseFile, "[]\n", "utf8"); }
}
async function readIdeas() { return JSON.parse(await readFile(databaseFile, "utf8")); }
async function writeIdeas(ideas) { await writeFile(databaseFile, `${JSON.stringify(ideas, null, 2)}\n`, "utf8"); }
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
    buildPrompt: `Build a full-stack MVP for: ${input.idea}\n\nFirst customer: ${input.audience}\nProblem: ${input.problem}\nExisting alternatives: ${input.alternatives || "not yet researched"}\nDifferentiator: ${input.advantage || "to be validated"}\nTest budget: ${input.budget || "bootstrapped"}\n\nUse a persistent database, authenticated workspaces, server-side validation, responsive UI, and clear empty/error states. Do not create a front-end-only mockup.`
  };
}

async function body(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 20_000) throw new Error("Request is too large.");
  }
  return JSON.parse(raw || "{}");
}
function routeId(pathname) { return pathname.match(/^\/api\/ideas\/([a-f0-9-]+)$/i)?.[1]; }

await initializeDatabase();
async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (req.method === "GET" && url.pathname === "/api/health") return json(res, 200, { status: "ok" });
    if (req.method === "GET" && url.pathname === "/api/ideas") {
      const ideas = await readIdeas();
      return json(res, 200, ideas);
    }
    const id = routeId(url.pathname);
    if (req.method === "GET" && id) {
      const idea = (await readIdeas()).find((item) => item.id === id);
      return idea ? json(res, 200, idea) : json(res, 404, { error: "Idea not found." });
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
    if (req.method === "GET" && url.pathname.startsWith("/ideas/resume-builder")) {
      const resumeDir = join(root, "Ideas", "Resume Builder");
      let subPath = url.pathname.replace(/^\/ideas\/resume-builder\/?/, "");
      if (!subPath || subPath === "/") subPath = "index.html";
      const targetFile = normalize(join(resumeDir, subPath));
      if (targetFile.startsWith(resumeDir)) {
        try {
          const content = await readFile(targetFile);
          res.writeHead(200, { "content-type": types[extname(targetFile)] || "application/octet-stream" });
          return res.end(content);
        } catch {}
      }
    }
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
    return json(res, error instanceof SyntaxError ? 400 : 500, { error: error.message || "Unexpected server error." });
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
    console.log(`StartupOS Incubator is running at http://localhost:${p}`);
  });
}

startServer(port);
