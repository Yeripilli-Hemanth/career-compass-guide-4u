import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { careersQuery } from "@/lib/career-data";
import { useAuth } from "@/hooks/useAuth";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Interest quiz — find a tech career that fits | Career Compass" },
      {
        name: "description",
        content: "Six quick questions about how you like to work, and three computer science careers worth reading about.",
      },
      { property: "og:title", content: "Interest quiz — find a tech career that fits | Career Compass" },
      { property: "og:description", content: "Answer six questions and get three career directions to explore." },
    ],
  }),
  component: QuizPage,
});

type Option = { label: string; slugs: string[] };
type Question = { id: string; question: string; options: Option[] };

const questions: Question[] = [
  {
    id: "output",
    question: "What would you most enjoy making?",
    options: [
      { label: "Something people can see and click", slugs: ["frontend-developer", "ui-ux-designer", "mobile-app-developer"] },
      { label: "Something that works quietly behind the scenes", slugs: ["backend-developer", "data-engineer", "devops-engineer"] },
      { label: "Something that finds patterns or predicts", slugs: ["data-scientist", "machine-learning-engineer", "data-analyst"] },
      { label: "Something that runs on real hardware or in a game", slugs: ["embedded-systems-engineer", "game-developer", "ar-vr-developer"] },
    ],
  },
  {
    id: "work_style",
    question: "How do you like to work?",
    options: [
      { label: "Deep focus on one hard problem", slugs: ["machine-learning-engineer", "embedded-systems-engineer", "backend-developer"] },
      { label: "Lots of small pieces coming together", slugs: ["full-stack-developer", "product-manager", "qa-test-engineer"] },
      { label: "Talking to people and organising work", slugs: ["product-manager", "business-analyst", "ui-ux-designer"] },
      { label: "Investigating and breaking things", slugs: ["penetration-tester", "cybersecurity-analyst", "qa-test-engineer"] },
    ],
  },
  {
    id: "subject",
    question: "Which school subject felt easiest?",
    options: [
      { label: "Maths and statistics", slugs: ["data-scientist", "data-analyst", "machine-learning-engineer"] },
      { label: "Art and design", slugs: ["ui-ux-designer", "frontend-developer", "game-developer"] },
      { label: "Physics and electronics", slugs: ["embedded-systems-engineer", "ar-vr-developer", "site-reliability-engineer"] },
      { label: "Business studies or economics", slugs: ["business-analyst", "product-manager", "data-analyst"] },
    ],
  },
  {
    id: "risk",
    question: "How do you feel about pressure and unpredictability?",
    options: [
      { label: "I like being the one who fixes emergencies", slugs: ["site-reliability-engineer", "devops-engineer", "cybersecurity-analyst"] },
      { label: "I prefer steady, planned work", slugs: ["qa-test-engineer", "database-administrator", "business-analyst"] },
      { label: "I want to build new things fast", slugs: ["full-stack-developer", "ai-engineer", "mobile-app-developer"] },
      { label: "I enjoy experimenting even if it fails", slugs: ["blockchain-developer", "ai-engineer", "game-developer"] },
    ],
  },
  {
    id: "curiosity",
    question: "Which of these would you read about for fun?",
    options: [
      { label: "How an app is designed", slugs: ["ui-ux-designer", "frontend-developer", "product-manager"] },
      { label: "How AI models actually work", slugs: ["ai-engineer", "machine-learning-engineer", "data-scientist"] },
      { label: "How a company got hacked", slugs: ["cybersecurity-analyst", "penetration-tester", "cloud-engineer"] },
      { label: "How huge websites stay online", slugs: ["site-reliability-engineer", "cloud-engineer", "backend-developer"] },
    ],
  },
  {
    id: "reward",
    question: "What would make a workday feel good?",
    options: [
      { label: "A screen I built looks exactly right", slugs: ["frontend-developer", "mobile-app-developer", "ui-ux-designer"] },
      { label: "A messy dataset finally makes sense", slugs: ["data-analyst", "data-engineer", "data-scientist"] },
      { label: "A system I set up runs without me", slugs: ["devops-engineer", "cloud-engineer", "database-administrator"] },
      { label: "A team shipped something because I unblocked it", slugs: ["product-manager", "business-analyst", "full-stack-developer"] },
    ],
  },
];

function QuizPage() {
  const { user } = useAuth();
  const { data: careers = [] } = useQuery(careersQuery);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);

  const question = questions[index]!;

  function choose(optionIndex: number) {
    const next = { ...answers, [question.id]: optionIndex };
    setAnswers(next);
    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      setDone(true);
      void save(next);
    }
  }

  function scores(current: Record<string, number>) {
    const tally: Record<string, number> = {};
    questions.forEach((q) => {
      const chosen = current[q.id];
      if (chosen === undefined) return;
      q.options[chosen]?.slugs.forEach((slug, rank) => {
        tally[slug] = (tally[slug] ?? 0) + (3 - rank);
      });
    });
    return Object.entries(tally)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([slug]) => slug);
  }

  async function save(current: Record<string, number>) {
    if (!user) return;
    const slugs = scores(current);
    const ids = careers.filter((c) => slugs.includes(c.slug)).map((c) => c.id);
    await supabase.from("quiz_responses").insert({
      user_id: user.id,
      responses: current,
      recommended_career_ids: ids,
    });
  }

  if (done) {
    const slugs = scores(answers);
    const recommended = slugs
      .map((slug) => careers.find((c) => c.slug === slug))
      .filter((c): c is NonNullable<typeof c> => !!c);

    return (
      <PageShell>
        <h1 className="text-2xl font-semibold">Three directions worth a look</h1>
        <p className="mt-2 text-muted-foreground">
          These match how you said you like to work. Nothing is locked in — read them and see.
        </p>
        <div className="mt-6 grid gap-3">
          {recommended.map((career) => (
            <Link
              key={career.id}
              to="/careers/$slug"
              params={{ slug: career.slug }}
              className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary"
            >
              <h2 className="text-sm font-medium">{career.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{career.short_description}</p>
            </Link>
          ))}
        </div>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setAnswers({});
            setIndex(0);
            setDone(false);
          }}
        >
          Retake the quiz
        </Button>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-lg">
        <p className="text-sm text-muted-foreground">
          Question {index + 1} of {questions.length}
        </p>
        <div className="mt-2 h-1 w-full rounded-full bg-secondary">
          <div
            className="h-1 rounded-full bg-primary"
            style={{ width: `${((index + 1) / questions.length) * 100}%` }}
          />
        </div>
        <h1 className="mt-6 text-xl font-semibold">{question.question}</h1>
        <div className="mt-4 space-y-2">
          {question.options.map((option, i) => (
            <button
              key={option.label}
              type="button"
              onClick={() => choose(i)}
              className="w-full rounded-lg border border-border bg-card p-4 text-left text-sm transition-colors hover:border-primary"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
