import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { withBase } from "../utils/url";

export const GET = async (context) => {
  const posts = (await getCollection("blog"))
    .filter((p) => !p.data.draft)
    .sort((a, b) => +new Date(b.data.pubDate) - +new Date(a.data.pubDate));

  const siteUrl = context.site ?? context.url?.origin ?? "";
  if (!siteUrl) {
    throw new Error("RSS feed requires the 'site' option in astro.config.mjs or a request origin.");
  }

  return rss({
    title: "Astro Blog RSS",
    description: "Latest posts from the Astro blog",
    site: siteUrl,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description ?? "",
      link: new URL(withBase(`blog/${post.slug}`), siteUrl).toString(),
      pubDate: post.data.pubDate,
    })),
  });
};
