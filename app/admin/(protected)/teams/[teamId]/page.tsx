import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "@/app/admin/admin.module.css";
import { prisma } from "@/lib/db";
import CopyLinkButton from "@/app/admin/teams/CopyLinkButton";
import {
  getCurrentCycle,
  summarizeAllCycles,
  computeSeniorityDrift,
  computeDemandsResourcesTrend,
  type PulseResponseInput,
} from "@/data/pulseScoring";
import { workloadLabels, type WorkloadTypeValue } from "@/data/pulseQuestions";

export default async function TeamDetailPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { responses: { orderBy: { createdAt: "asc" } } },
  });
  if (!team) notFound();

  const responses: PulseResponseInput[] = team.responses.map((r) => ({
    cycle: r.cycle,
    seniorityBand: r.seniorityBand,
    dominantWorkload: r.dominantWorkload,
    demandsLevel: r.demandsLevel,
    resourcesLevel: r.resourcesLevel,
    trustSignal: r.trustSignal,
  }));

  const cycles = summarizeAllCycles(responses).reverse(); // newest first for the table
  const currentCycle = getCurrentCycle();
  const currentSummary = cycles.find((c) => c.cycle === currentCycle);
  const drift = computeSeniorityDrift(responses);
  const trend = computeDemandsResourcesTrend(responses);

  const workloadOrder: WorkloadTypeValue[] = ["GENERATIVE", "AI_VERIFICATION", "MEETINGS", "EXCEPTIONS"];

  return (
    <div>
      <Link className={styles["back-link"]} href="/admin/teams">
        &larr; All teams
      </Link>
      <h1 style={{ marginTop: 16, fontSize: 26 }}>{team.name}</h1>
      <div style={{ marginTop: 16 }}>
        <CopyLinkButton path={`/pulse/${team.slug}`} />
      </div>

      <div className={styles["pulse-stats"]}>
        <div className={styles["pulse-stat"]}>
          <div className={styles.n}>{responses.length}</div>
          <div className={styles.l}>Total responses</div>
        </div>
        <div className={styles["pulse-stat"]}>
          <div className={styles.n}>{currentSummary?.respondentCount ?? 0}</div>
          <div className={styles.l}>This cycle ({currentCycle})</div>
        </div>
        <div className={styles["pulse-stat"]}>
          <div className={styles.n}>{cycles.length}</div>
          <div className={styles.l}>Cycles observed</div>
        </div>
      </div>

      {currentSummary && !currentSummary.suppressed ? (
        <div className={styles["meter-row"]}>
          {workloadOrder.map((w) => {
            const count = currentSummary.workloadCounts[w];
            const pct = currentSummary.respondentCount ? (count / currentSummary.respondentCount) * 100 : 0;
            return (
              <div key={w} className={styles["meter-item"]}>
                <span className={styles.ml}>{workloadLabels[w]}</span>
                <span className={styles["meter-track"]}>
                  <span className={styles["meter-fill"]} style={{ width: `${pct}%` }} />
                </span>
                <span className={styles.mn}>{count}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <p style={{ marginTop: 16, fontSize: 14, color: "var(--text-faint)" }}>
          Not enough responses this cycle yet to show a breakdown (minimum 2, to avoid showing what's effectively one
          person's answer).
        </p>
      )}

      <div className={styles["drift-box"]}>
        <div className={styles.verdict}>Seniority-load drift</div>
        <h3>
          {drift.verdict === "concentrating_senior"
            ? "Exceptions are concentrating toward seniors"
            : drift.verdict === "distributed"
              ? "No clear drift toward seniors"
              : "Not enough data yet"}
        </h3>
        <p>{drift.guidance}</p>
      </div>

      <div className={styles["drift-box"]}>
        <div className={styles.verdict}>Demands vs. resources</div>
        <h3>
          {trend.verdict === "worsening"
            ? "Pressure is outpacing resources"
            : trend.verdict === "improving"
              ? "The gap is narrowing"
              : trend.verdict === "stable"
                ? "Holding steady"
                : "Not enough data yet"}
        </h3>
        <p>{trend.guidance}</p>
      </div>

      <h2 style={{ marginTop: 40, fontSize: 20 }}>Cycle history</h2>
      <div className={styles["table-wrap"]} style={{ marginTop: 16 }}>
        {cycles.length === 0 ? (
          <div className={styles.empty}>No responses yet. Share the link to start collecting this team&apos;s first cycle.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Cycle</th>
                <th>Respondents</th>
                <th>Dominant workload</th>
                <th>Demands</th>
                <th>Resources</th>
              </tr>
            </thead>
            <tbody>
              {cycles.map((c) => {
                const topWorkload = workloadOrder.reduce((best, w) =>
                  c.workloadCounts[w] > c.workloadCounts[best] ? w : best
                );
                return (
                  <tr key={c.cycle}>
                    <td>{c.cycle}</td>
                    <td>{c.respondentCount}</td>
                    <td>{c.suppressed ? "—" : workloadLabels[topWorkload]}</td>
                    <td>
                      {c.suppressed || c.demandsAvg === null ? (
                        "—"
                      ) : (
                        <span className={styles["cell-meter"]}>
                          <span className={styles.track}>
                            <span
                              className={`${styles.fill} ${c.demandsAvg >= 3 ? styles.accent : ""}`}
                              style={{ width: `${(c.demandsAvg / 4) * 100}%` }}
                            />
                          </span>
                          <span className={styles.n}>{c.demandsAvg.toFixed(1)}/4</span>
                        </span>
                      )}
                    </td>
                    <td>
                      {c.suppressed || c.resourcesAvg === null ? (
                        "—"
                      ) : (
                        <span className={styles["cell-meter"]}>
                          <span className={styles.track}>
                            <span className={styles.fill} style={{ width: `${(c.resourcesAvg / 3) * 100}%` }} />
                          </span>
                          <span className={styles.n}>{c.resourcesAvg.toFixed(1)}/3</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
