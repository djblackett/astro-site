// @ts-ignore - types available after deps install
import { Hono } from "hono";
// @ts-ignore - types available after deps install
import { cors } from "hono/cors";

// Types for environment bindings
interface Env {
  RATE_LIMIT: KVNamespace;
  POSTMARK_TOKEN?: string;
  RESEND_TOKEN?: string;
  RATE_LIMIT_MAX: string; // provided as string via vars
  RATE_LIMIT_WINDOW: string; // seconds
}

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors({ origin: "*", allowMethods: ["POST", "OPTIONS"] }));

// Basic health check
app.get("/api/health", (c) => c.json({ ok: true, ts: Date.now() }));

// Helper: simple email send via Postmark or Resend
async function sendEmail(
  env: Env,
  {
    from,
    to,
    subject,
    text,
  }: { from: string; to: string; subject: string; text: string }
) {
  const body = { From: from, To: to, Subject: subject, TextBody: text };
  if (env.POSTMARK_TOKEN) {
    const r = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "X-Postmark-Server-Token": env.POSTMARK_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error("Postmark send failed");
    return;
  }
  if (env.RESEND_TOKEN) {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, text }),
    });
    if (!r.ok) throw new Error("Resend send failed");
    return;
  }
  throw new Error("No email provider configured");
}

// Rate limit using KV (per IP)
async function rateLimit(env: Env, key: string) {
  const max = parseInt(env.RATE_LIMIT_MAX || "5", 10);
  const windowSeconds = parseInt(env.RATE_LIMIT_WINDOW || "300", 10);
  const now = Date.now();
  const bucketRaw = (await env.RATE_LIMIT.get(key, "json")) as {
    count: number;
    reset: number;
  } | null;
  if (bucketRaw && bucketRaw.count >= max && bucketRaw.reset > now) {
    return {
      allowed: false,
      retryAfter: Math.ceil((bucketRaw.reset - now) / 1000),
    };
  }
  let bucket = bucketRaw;
  if (!bucket || bucket.reset < now) {
    bucket = { count: 0, reset: now + windowSeconds * 1000 };
  }
  bucket.count += 1;
  await env.RATE_LIMIT.put(key, JSON.stringify(bucket), {
    expiration: Math.ceil(bucket.reset / 1000),
  });
  return { allowed: true };
}

// Basic Turnstile verification
async function verifyTurnstile(
  token: string,
  ip: string | null,
  secret: string
) {
  const form = new FormData();
  form.append("response", token);
  form.append("secret", secret);
  if (ip) form.append("remoteip", ip);
  const resp = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: form,
    }
  );
  const data = await resp.json();
  return data.success === true;
}

app.post("/api/contact", async (c) => {
  try {
    const ct = c.req.header("content-type") || "";
    if (!ct.includes("application/json"))
      return c.json({ error: "Invalid content-type" }, 400);
    const body = await c.req.json();
    const { name, email, message, turnstileToken } = body || {};

    if (!name || !email || !message)
      return c.json({ error: "Missing fields" }, 400);
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof message !== "string"
    )
      return c.json({ error: "Invalid field types" }, 400);
    if (message.length > 5000)
      return c.json({ error: "Message too long" }, 400);

    // Basic email format check
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      return c.json({ error: "Invalid email" }, 400);

    const ip =
      c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "";
    const rl = await rateLimit(c.env, `ip:${ip}`);
    if (!rl.allowed)
      return c.json({ error: "Rate limited", retryAfter: rl.retryAfter }, 429);

    // Optional: Turnstile secret must be configured as TURNSTILE_SECRET
    const turnstileSecret = (c.env as any).TURNSTILE_SECRET as
      | string
      | undefined;
    if (turnstileSecret) {
      if (!turnstileToken)
        return c.json({ error: "Missing captcha token" }, 400);
      const ok = await verifyTurnstile(turnstileToken, ip, turnstileSecret);
      if (!ok) return c.json({ error: "Captcha failed" }, 400);
    }

    await sendEmail(c.env, {
      from: "contact@your-domain.com",
      to: "you@example.com", // change to your real inbox
      subject: `Contact form: ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });

    return c.json({ ok: true });
  } catch (err: any) {
    return c.json({ error: "Internal error", detail: err.message }, 500);
  }
});

export default app;
