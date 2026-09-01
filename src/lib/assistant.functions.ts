import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

const inputSchema = z.object({
  messages: z.array(messageSchema).min(1).max(20),
});

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { reply: "The assistant isn't configured right now. Please try again later." };

    const supabase = createClient(
      process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"]!,
      process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"]!,
      { auth: { persistSession: false } },
    );

    const { data: careers } = await supabase
      .from("careers")
      .select("name, slug, short_description")
      .order("name");

    const catalogue = (careers ?? [])
      .map((c) => `- ${c.name} (/careers/${c.slug}): ${c.short_description ?? ""}`)
      .join("\n");

    const systemPrompt = `You are the Career compass assistant, a friendly guide on a free website of computer science career roadmaps.

What the site offers:
- /careers — browse all roadmaps; each roadmap has 4 stages with skills, demand tags and free resources.
- /quiz — a short interest quiz that suggests careers.
- /onboarding — pick your stage: exploring, studying or working.
- /plan — your personal plan; /profile — your settings.
- /guides/computer-science-career-paths and /guides/entry-level-tech-jobs — long-form guides.

Available career roadmaps:
${catalogue}

Rules:
- Answer in sentence case, short and practical (under 120 words unless asked for more).
- Always point users to a concrete page path when relevant, e.g. "/careers/frontend-developer".
- Only discuss careers, skills, learning and how to use this site. Politely decline anything else.
- Never invent careers or URLs that aren't listed above.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...data.messages],
      }),
    });

    if (response.status === 429) {
      return { reply: "Too many requests right now — please wait a moment and try again." };
    }
    if (response.status === 402) {
      return { reply: "The assistant is temporarily unavailable. Please try again later." };
    }
    if (!response.ok) {
      console.error("AI gateway error", response.status, await response.text());
      return { reply: "Something went wrong reaching the assistant. Please try again." };
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return {
      reply: json.choices?.[0]?.message?.content?.trim() || "Sorry, I didn't catch that. Could you rephrase?",
    };
  });
