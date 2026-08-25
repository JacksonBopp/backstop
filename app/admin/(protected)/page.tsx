import Link from "next/link";
import styles from "@/app/admin/admin.module.css";
import { prisma } from "@/lib/db";
import { topologyLabel, readinessLabel, surveillanceLabel } from "@/lib/labels";
import type { DeploymentTopology, ChangeReadiness, SurveillanceSensitivity, SubmissionStatus, Prisma } from "@/generated/prisma/client";

interface SearchParams {
  status?: string;
  topology?: string;
  readiness?: string;
  surveillance?: string;
  sort?: string;
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const where: Prisma.SubmissionWhereInput = {};
  if (sp.status) where.status = sp.status as SubmissionStatus;
  if (sp.topology) where.deploymentTopology = sp.topology as DeploymentTopology;
  if (sp.readiness) where.changeReadiness = sp.readiness as ChangeReadiness;
  if (sp.surveillance) where.surveillanceSensitivity = sp.surveillance as SurveillanceSensitivity;

  const submissions = await prisma.submission.findMany({
    where,
    orderBy: { createdAt: sp.sort === "oldest" ? "asc" : "desc" },
  });

  return (
    <div>
      <p className={styles.kicker}>Submissions</p>
      <h1 style={{ marginTop: 12, fontSize: 26 }}>Diagnostic submissions</h1>

      <form className={styles.filters} method="get">
        <select name="status" defaultValue={sp.status ?? ""}>
          <option value="">All statuses</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="NOT_YET">Not yet</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select name="topology" defaultValue={sp.topology ?? ""}>
          <option value="">All topologies</option>
          <option value="AUGMENTATION">Augmentation</option>
          <option value="AUTOMATION">Automation</option>
          <option value="DECISION_SUPPORT">Decision support</option>
          <option value="MIXED">Mixed</option>
        </select>
        <select name="readiness" defaultValue={sp.readiness ?? ""}>
          <option value="">All readiness</option>
          <option value="BURNED">Burned</option>
          <option value="NEUTRAL">Neutral</option>
          <option value="ENTHUSIASTIC">Enthusiastic</option>
        </select>
        <select name="surveillance" defaultValue={sp.surveillance ?? ""}>
          <option value="">All surveillance</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
        <select name="sort" defaultValue={sp.sort ?? "newest"}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
        <button className="btn btn-ghost" type="submit">
          Apply
        </button>
      </form>

      <div className={styles["table-wrap"]}>
        {submissions.length === 0 ? (
          <div className={styles.empty}>No submissions match these filters yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Contact</th>
                <th>Topology</th>
                <th>Readiness</th>
                <th>Surveillance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id}>
                  <td>{s.createdAt.toLocaleDateString()}</td>
                  <td>
                    <Link href={`/admin/submissions/${s.id}`}>
                      {s.contactName || s.contactOrg || s.contactEmail || "Anonymous"}
                    </Link>
                  </td>
                  <td>
                    <span className={styles.badge}>{topologyLabel[s.deploymentTopology]}</span>
                  </td>
                  <td>
                    <span className={styles.badge}>{readinessLabel[s.changeReadiness]}</span>
                  </td>
                  <td>
                    <span className={styles.badge}>{surveillanceLabel[s.surveillanceSensitivity]}</span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles["status-" + s.status] ?? ""}`}>{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
