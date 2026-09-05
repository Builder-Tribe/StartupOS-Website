import { mkdirSync, rmSync } from "node:fs";

process.env.DATABASE_PATH = "data/collabkaro.test.db";
mkdirSync("data", { recursive: true });
rmSync(process.env.DATABASE_PATH, { force: true });