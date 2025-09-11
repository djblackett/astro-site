export const siteLinks = {
  email: "you@example.com",
  github: "https://github.com/djblackett",
  linkedin: "https://www.linkedin.com/in/david-andrea-2833a579",
  twitter: "https://twitter.com/djblackett",
};

export const socialArray = [
  {
    name: "Email",
    href: `mailto:${siteLinks.email}`,
    style: "btn-primary",
    icon: "email",
  },
  {
    name: "GitHub",
    href: siteLinks.github,
    style: "btn-ghost",
    icon: "github",
  },
  {
    name: "LinkedIn",
    href: siteLinks.linkedin,
    style: "btn-outline",
    icon: "linkedin",
  },
  { name: "X/Twitter", href: siteLinks.twitter, style: "btn", icon: "twitter" },
];

export type SocialItem = (typeof socialArray)[number];
