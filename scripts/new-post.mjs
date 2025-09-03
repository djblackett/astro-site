#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const titleArg = process.argv.slice(2).join(" ").trim();
if (!titleArg) {
  console.error('Usage: npm run new:post -- "Post Title"');
  process.exit(1);
}

const slug = titleArg
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, "")
  .trim()
  .replace(/\s+/g, "-");

const now = new Date();
const yyyy = now.getFullYear();
const mm = String(now.getMonth() + 1).padStart(2, "0");
const dd = String(now.getDate()).padStart(2, "0");
const pubDate = `${yyyy}-${mm}-${dd}`;

const fileDir = path.resolve("src/content/blog");
await fs.mkdir(fileDir, { recursive: true });
const filePath = path.join(fileDir, `${slug}.md`);

const content = `---
layout: ../../layouts/Layout.astro
title: ${titleArg}
pubDate: ${pubDate}
description: TODO: one sentence summary
tags: []
draft: true
---

Write your post here.\n\n\`\`\`ts\n// code samples look great\n\`\`\`
`;

await fs.writeFile(filePath, content, "utf8");
console.log(`Created ${filePath}`);
