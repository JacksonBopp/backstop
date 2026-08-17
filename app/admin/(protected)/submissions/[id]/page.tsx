import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import styles from "@/app/admin/admin.module.css";
import { prisma } from "@/lib/db";
import { updateSubmission } from "@/app/admin/actions";
import { questions } from "@/data/questions";
import { topologyLabel, readinessLabel, surveillanceLabel } from "@/lib/labels";
import type { SubmissionStatus } from "@/generated/prisma/client";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const submission = await prisma.submission.findUnique({ where: { id } });
  if (!submission) notFound();

  const answers = submission.answers as Record<string, string>;

  async function save(formData: FormData) {
    "use server";
    const status = String(formData.get("status")) as SubmissionStatus;
    const notes = String(formData.get("notes") ?? "");
    await updateSubmission(id, status, notes);
    revalidatePath(`/admin/submissions/${id}`);
  }

  return (
    <div>
      <Link className={styles["back-link"]} href="/admin">
        &larr; All submissions
      </Link>
      <h1 style={{ marginTop: 14, fontSize: 26 }}>
        {submission.contactName || submission.contactOrg || submission.contactEmail || "Anonymous submission"}
      </h1>
      <p style={{ color: "var(--text-faint)", fontSize: 13.5, fontFamily: "var(--font-mono)" }}>
        {submission.createdAt.toLocaleString()}
      </p>

      <div className={styles["detail-grid"]}>
        <div>
          {questions.map((q, i) => {
            const chosenCat = answers["q" + i];
            const chosenOption = q.options.find((o) => o.cat === chosenCat);
            return (
              <div key={i} className={styles["qa-item"]}>
                <div className={styles.prompt}>{q.prompt}</div>
                <div className={styles.answer}>{chosenOption?.text ?? "No answer"}</div>
              </div>
            );
          })}
        </div>

        <div>
          <div className={styles["side-card"]}>
            <div className={styles.k}>Deployment topology</div>
            <div className={styles.v}>{topologyLabel[submission.deploymentTopology]}</div>
          </div>
          <div className={styles["side-card"]}>
            <div className={styles.k}>Change-readiness baseline</div>
            <div className={styles.v}>{readinessLabel[submission.changeReadiness]}</div>
          </div>
          <div className={styles["side-card"]}>
            <div className={styles.k}>Surveillance sensitivity</div>
            <div className={styles.v}>{surveillanceLabel[submission.surveillanceSensitivity]}</div>
          </div>
          <div className={styles["side-card"]}>
            <div className={styles.k}>Contact</div>
            <div className={styles.v}>
              {submission.contactName || "—"}
              <br />
              {submission.contactEmail || "—"}
              <br />
              {submission.contactOrg || "—"}
            </div>
          </div>

          <form action={save} className={styles["side-card"]}>
            <div className={styles.k}>Follow-up</div>
            <select name="status" defaultValue={submission.status}>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="NOT_YET">Not yet</option>
              <option value="CLOSED">Closed</option>
            </select>
            <textarea name="notes" placeholder="Notes" defaultValue={submission.notes ?? ""} />
            <button className="btn btn-primary" type="submit" style={{ marginTop: 12 }}>
              Save
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
