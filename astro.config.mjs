// @ts-check
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";

import tailwindcss from "@tailwindcss/vite";

const githubRepo = process.env.GITHUB_REPOSITORY ?? "";
const [githubOwner, repoName] = githubRepo.split("/");
const isUserOrgPage = Boolean(repoName) && repoName.endsWith(".github.io");
const normalizeBase = (value) => {
  if (!value) return "/";
  return value.endsWith("/") ? value : `${value}/`;
};
const inferredBase = repoName && !isUserOrgPage ? `/${repoName}/` : "/";
const base = normalizeBase(process.env.ASTRO_BASE ?? inferredBase);
const site = process.env.ASTRO_SITE ?? (
  githubOwner
    ? `https://${githubOwner}.github.io${isUserOrgPage ? "/" : repoName ? `/${repoName}/` : "/"}`
    : undefined
);

// https://astro.build/config
export default defineConfig({
  site,
  base,
  integrations: [mdx()],
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      wrap: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
