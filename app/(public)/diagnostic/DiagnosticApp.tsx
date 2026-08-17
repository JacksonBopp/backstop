"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "./diagnostic.module.css";
import { questions, type Cat } from "@/data/questions";
import {
  axisCatLabels,
  topologyTemplates,
  readinessTemplates,
  surveillanceTemplates,
  tallyAnswers,
  computeWinners,
  questionCountForAxis,
  type AnswerMap,
} from "@/data/scoring";
import { layers } from "@/data/layers";

type View = "diagnostic" | "explorer";
type SaveState = "idle" | "saving" | "saved" | "error";

export default function DiagnosticApp() {
  const [view, setView] = useState<View>("diagnostic");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [showResults, setShowResults] = useState(false);
  const [contact, setContact] = useState({ contactName: "", contactEmail: "", contactOrg: "" });
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [openLayer, setOpenLayer] = useState<string | null>(layers[0]?.id ?? null);

  const total = questions.length;
  const isAnswered = (i: number) => Boolean(answers["q" + i]);

  function selectAnswer(i: number, cat: Cat) {
    setAnswers((prev) => ({ ...prev, ["q" + i]: cat }));
  }

  function goNext() {
    if (!isAnswered(current)) return;
    if (current < total - 1) {
      setCurrent((c) => c + 1);
    } else {
      setShowResults(true);
    }
  }

  function goBack() {
    if (current > 0) setCurrent((c) => c - 1);
  }

  function retake() {
    setAnswers({});
    setCurrent(0);
    setShowResults(false);
    setSaveState("idle");
    setContact({ contactName: "", contactEmail: "", contactOrg: "" });
  }

  const scores = useMemo(() => tallyAnswers(answers), [answers]);
  const winners = useMemo(() => computeWinners(scores), [scores]);

  async function saveResults() {
    setSaveState("saving");
    try {
      const res = await fetch("/api/diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          contactName: contact.contactName || undefined,
          contactEmail: contact.contactEmail || undefined,
          contactOrg: contact.contactOrg || undefined,
        }),
      });
      if (!res.ok) throw new Error("save failed");
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  const q = questions[current];

  return (
    <div className="container">
      <div className={styles.tabs} role="tablist" aria-label="View" style={{ display: "inline-flex", marginTop: 24 }}>
        <button
          className={styles["tab-btn"]}
          role="tab"
          aria-selected={view === "diagnostic"}
          onClick={() => setView("diagnostic")}
        >
          Diagnostic
        </button>
        <button
          className={styles["tab-btn"]}
          role="tab"
          aria-selected={view === "explorer"}
          onClick={() => setView("explorer")}
        >
          Explorer
        </button>
      </div>

      {view === "diagnostic" && (
        <section className={styles.view}>
          <div className={`${styles.head} head`}>
            <span className="eyebrow">Layer 0, live</span>
            <h1>Run the intake IIO uses to open every engagement.</h1>
            <p className="lede">
              Nine questions across the three axes that route a client into a specific configuration of the framework:
              deployment topology, change-readiness baseline, and surveillance sensitivity. Answer as your organization,
              not as an individual.
            </p>
          </div>

          {!showResults && (
            <div className={styles.quiz}>
              <div className={styles["progress-row"]}>
                <span className={styles["progress-label"]}>
                  Question {current + 1} of {total}
                </span>
                <div className={styles["progress-track"]}>
                  <div
                    className={styles["progress-fill"]}
                    style={{ width: `${((current + 1) / total) * 100}%` }}
                  />
                </div>
              </div>

              <div className={styles["q-card"]}>
                <div className={styles["q-axis"]}>{q.label ?? q.axis}</div>
                <div className={styles["q-legend"]}>{q.prompt}</div>
                <div className={styles["q-options"]}>
                  {q.options.map((opt) => {
                    const selected = answers["q" + current] === opt.cat;
                    return (
                      <label key={opt.text} className={`${styles.opt} ${selected ? styles.selected : ""}`}>
                        <input
                          type="radio"
                          name={"q" + current}
                          checked={selected}
                          onChange={() => selectAnswer(current, opt.cat)}
                        />
                        <span>{opt.text}</span>
                      </label>
                    );
                  })}
                </div>
                <div className={styles["q-nav"]}>
                  <button className="btn btn-ghost" type="button" onClick={goBack} disabled={current === 0}>
                    Back
                  </button>
                  <button className="btn btn-primary" type="button" onClick={goNext} disabled={!isAnswered(current)}>
                    {current === total - 1 ? "See your profile" : "Next"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showResults && (
            <div className={styles.results}>
              <AxisResultCard
                label="Deployment topology"
                winner={winners.topology}
                scores={scores.topology}
                total={questionCountForAxis("topology")}
                template={topologyTemplates[winners.topology]}
              />
              <AxisResultCard
                label="Change-readiness baseline"
                winner={winners.readiness}
                scores={scores.readiness}
                total={questionCountForAxis("readiness")}
                template={readinessTemplates[winners.readiness]}
              />
              <AxisResultCard
                label="Surveillance sensitivity"
                winner={winners.surveillance}
                scores={scores.surveillance}
                total={questionCountForAxis("surveillance")}
                template={surveillanceTemplates[winners.surveillance]}
              />

              <div className={styles.synthesis}>
                <span className="eyebrow">Configuration</span>
                <h3>Where an IIO engagement would start</h3>
                <ul>
                  <li>{topologyTemplates[winners.topology]}</li>
                  <li>{readinessTemplates[winners.readiness]}</li>
                  <li>{surveillanceTemplates[winners.surveillance]}</li>
                </ul>
              </div>

              <div className={styles["contact-block"]}>
                {saveState !== "saved" ? (
                  <>
                    <p className="lede" style={{ margin: 0 }}>
                      Want us to follow up, or just want a record of this? Leave contact info, or save anonymously.
                    </p>
                    <div className={styles["field-row"]}>
                      <input
                        type="text"
                        placeholder="Name (optional)"
                        value={contact.contactName}
                        onChange={(e) => setContact((c) => ({ ...c, contactName: e.target.value }))}
                      />
                      <input
                        type="email"
                        placeholder="Email (optional)"
                        value={contact.contactEmail}
                        onChange={(e) => setContact((c) => ({ ...c, contactEmail: e.target.value }))}
                      />
                      <input
                        type="text"
                        placeholder="Organization (optional)"
                        value={contact.contactOrg}
                        onChange={(e) => setContact((c) => ({ ...c, contactOrg: e.target.value }))}
                      />
                    </div>
                    {saveState === "error" && (
                      <p className="hint">Something went wrong saving that. Try again.</p>
                    )}
                  </>
                ) : (
                  <p className="lede" style={{ margin: 0 }}>Saved. Thanks for running the diagnostic.</p>
                )}
              </div>

              <div className={styles["result-actions"]}>
                <button className="btn btn-ghost" type="button" onClick={retake}>
                  Retake diagnostic
                </button>
                {saveState !== "saved" && (
                  <button className="btn btn-primary" type="button" onClick={saveResults} disabled={saveState === "saving"}>
                    {saveState === "saving" ? "Saving..." : "Save my results"}
                  </button>
                )}
                <button className="btn btn-primary" type="button" onClick={() => setView("explorer")}>
                  Explore the full framework
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {view === "explorer" && (
        <section className={styles.view}>
          <div className={`${styles.head} head`}>
            <span className="eyebrow">The architecture, in depth</span>
            <h1>Five layers. Each with a method, a set of tools, and what it actually measures.</h1>
            <p className="lede">
              This is the same architecture from the diagnostic, expanded. Click a layer to see how it runs in an
              engagement.
            </p>
          </div>
          <div className={styles.accordion}>
            {layers.map((layer) => {
              const open = openLayer === layer.id;
              return (
                <div key={layer.id} className={`${styles["acc-item"]} ${styles[layer.id]} ${open ? styles.open : ""}`}>
                  <button
                    type="button"
                    className={styles["acc-head"]}
                    aria-expanded={open}
                    onClick={() => setOpenLayer(open ? null : layer.id)}
                  >
                    <span className={styles.idx}>{layer.idx}</span>
                    <span>
                      <span className={styles.role}>{layer.role}</span>
                      <h3>{layer.title}</h3>
                      <span className={styles["one-line"]}>{layer.oneLine}</span>
                    </span>
                    <span className={styles.chev}>+</span>
                  </button>
                  {open && (
                    <div className={styles["acc-body"]}>
                      <div className={styles["acc-grid"]}>
                        <div>
                          <div className={styles["g-h"]}>Method</div>
                          <div className={styles["g-b"]}>{layer.method}</div>
                        </div>
                        <div>
                          <div className={styles["g-h"]}>Tools</div>
                          <div className={styles["g-b"]}>{layer.tools}</div>
                        </div>
                        <div>
                          <div className={styles["g-h"]}>What it measures</div>
                          <div className={styles["g-b"]}>{layer.metrics}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div style={{ paddingBottom: 40 }}>
        <Link href="/" style={{ fontSize: 13, color: "var(--text-faint)" }}>
          Back to the IIO overview
        </Link>
      </div>
    </div>
  );
}

function AxisResultCard({
  label,
  winner,
  scores,
  total,
  template,
}: {
  label: string;
  winner: string;
  scores: Record<string, number>;
  total: number;
  template: string;
}) {
  const cats = Object.keys(scores);
  return (
    <div className={styles["result-card"]}>
      <div className={styles.rk}>{label}</div>
      <div className={styles.rv}>{axisCatLabels[winner as keyof typeof axisCatLabels]}</div>
      <div className={styles["meter-row"]}>
        {cats.map((c) => {
          const count = scores[c];
          const pct = total ? (count / total) * 100 : 0;
          const isWinner = c === winner;
          return (
            <div key={c} className={`${styles["meter-item"]} ${isWinner ? styles.winner : ""}`}>
              <span className={styles.ml}>{axisCatLabels[c as keyof typeof axisCatLabels]}</span>
              <span className={styles["meter-track"]}>
                <span className={styles["meter-fill"]} style={{ width: `${pct}%` }} />
              </span>
              <span className={styles.mn}>
                {count}/{total}
              </span>
            </div>
          );
        })}
      </div>
      <p className={styles.rt}>{template}</p>
    </div>
  );
}
