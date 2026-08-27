"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./pulse.module.css";
import { pulseFields } from "@/data/pulseQuestions";

type SubmitState = "idle" | "submitting" | "done" | "error";

export default function PulseApp({ slug, teamName }: { slug: string; teamName: string }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  const total = pulseFields.length;
  const field = pulseFields[current];
  const isAnswered = Boolean(answers[field?.key]);

  function select(value: string) {
    setAnswers((prev) => ({ ...prev, [field.key]: value }));
  }

  async function goNext() {
    if (!isAnswered) return;
    if (current < total - 1) {
      setCurrent((c) => c + 1);
      return;
    }
    setSubmitState("submitting");
    try {
      const res = await fetch("/api/pulse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, ...answers }),
      });
      if (!res.ok) throw new Error("submit failed");
      setSubmitState("done");
    } catch {
      setSubmitState("error");
    }
  }

  function goBack() {
    if (current > 0) setCurrent((c) => c - 1);
  }

  if (submitState === "done") {
    return (
      <div className="container">
        <div className={styles.view}>
          <div className={styles.thanks}>
            <h1>Logged.</h1>
            <p>
              Thanks for the check-in on {teamName}. This cycle&apos;s response is recorded. Come back next cycle to
              keep the trend going, one response doesn&apos;t show much, the pattern over a few cycles is the point.
            </p>
            <Link href="/" className="btn btn-ghost" style={{ marginTop: 24 }}>
              Back to IIO
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={styles.view}>
        <div className={`${styles.head} head`}>
          <h1>Team pulse: {teamName}</h1>
          <p className="lede">
            Five quick questions about this cycle. Answers are grouped by role level only, never by name, and only
            ever shown back as a team-level trend.
          </p>
        </div>

        <div className={styles["progress-row"]}>
          <span className={styles["progress-label"]}>
            Question {current + 1} of {total}
          </span>
          <div className={styles["progress-track"]}>
            <div className={styles["progress-fill"]} style={{ width: `${((current + 1) / total) * 100}%` }} />
          </div>
        </div>

        <div className={styles["q-card"]}>
          <div className={styles["q-legend"]}>{field.prompt}</div>
          <div className={styles["q-options"]}>
            {field.options.map((opt) => {
              const selected = answers[field.key] === opt.value;
              return (
                <label key={opt.value} className={`${styles.opt} ${selected ? styles.selected : ""}`}>
                  <input type="radio" name={field.key} checked={selected} onChange={() => select(opt.value)} />
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>
          <div className={styles["q-nav"]}>
            <button className="btn btn-ghost" type="button" onClick={goBack} disabled={current === 0}>
              Back
            </button>
            <button
              className="btn btn-primary"
              type="button"
              onClick={goNext}
              disabled={!isAnswered || submitState === "submitting"}
            >
              {submitState === "submitting" ? "Saving..." : current === total - 1 ? "Submit" : "Next"}
            </button>
          </div>
          {submitState === "error" && (
            <p style={{ marginTop: 16, fontSize: 14, color: "var(--copper)" }}>
              Something went wrong saving that. Try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
