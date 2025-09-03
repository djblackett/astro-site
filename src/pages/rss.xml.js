import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function get() {
  const posts = (await getCollection("blog"))
    .filter((p) => !p.data.draft)
    .sort((a, b) => +new Date(b.data.pubDate) - +new Date(a.data.pubDate));

  return rss({
    title: "Astro Blog RSS",
    description: "Latest posts from the Astro blog",
    site: "https://your-site-url.com", // TODO: update to your real site
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: `/blog/${post.slug}`,
      pubDate: post.data.pubDate,
    })),
  });
}
