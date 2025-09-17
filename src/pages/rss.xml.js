import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { withBase } from "../utils/url";

export async function get(context) {
  const posts = (await getCollection("blog"))
    .filter((p) => !p.data.draft)
    .sort((a, b) => +new Date(b.data.pubDate) - +new Date(a.data.pubDate));

  const siteUrl = context.site ?? "";

  return rss({
    title: "Astro Blog RSS",
    description: "Latest posts from the Astro blog",
    site: siteUrl || undefined,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: withBase(`blog/${post.slug}`),
      pubDate: post.data.pubDate,
    })),
  });
}
