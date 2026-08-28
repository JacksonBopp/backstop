import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import styles from "@/app/admin/admin.module.css";
import { prisma } from "@/lib/db";
import { syncOneAccount } from "@/lib/backstopSync";
import {
  summarizeAllCycles,
  computeConcentration,
  type TicketSnapshotInput,
} from "@/data/backstopScoring";

export default async function BackstopAccountPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  const account = await prisma.zendeskAccount.findUnique({
    where: { id: accountId },
    include: { tickets: { orderBy: { createdAt: "asc" } } },
  });
  if (!account) notFound();

  const snapshots: TicketSnapshotInput[] = account.tickets.map((t) => ({
    cycle: t.cycle,
    groupId: t.groupId !== null ? Number(t.groupId) : null,
    groupName: t.groupName,
    aiAssisted: t.aiAssisted,
  }));

  const cycles = summarizeAllCycles(snapshots).reverse(); // newest first
  const concentration = computeConcentration(snapshots);
  const latestCycle = cycles[0];

  async function sync() {
    "use server";
    await syncOneAccount(accountId);
    revalidatePath(`/admin/backstop/${accountId}`);
  }

  return (
    <div>
      <Link className={styles["back-link"]} href="/admin/backstop">
        &larr; All accounts
      </Link>
      <h1 style={{ marginTop: 16, fontSize: 26 }}>{account.displayName ?? account.subdomain}</h1>
      <p style={{ color: "var(--text-faint)", fontSize: 14 }}>
        Last synced: {account.lastSyncedAt ? account.lastSyncedAt.toLocaleString() : "Never"}
      </p>

      <form action={sync} style={{ marginTop: 16 }}>
        <button className="btn btn-ghost" type="submit">
          Sync now
        </button>
      </form>

      <div className={styles["pulse-stats"]}>
        <div className={styles["pulse-stat"]}>
          <div className={styles.n}>{snapshots.length}</div>
          <div className={styles.l}>Total synced tickets</div>
        </div>
        <div className={styles["pulse-stat"]}>
          <div className={styles.n}>{latestCycle?.aiAssistedCount ?? 0}</div>
          <div className={styles.l}>AI-assisted this cycle ({latestCycle?.cycle ?? "none yet"})</div>
        </div>
        <div className={styles["pulse-stat"]}>
          <div className={styles.n}>{cycles.length}</div>
          <div className={styles.l}>Cycles observed</div>
        </div>
      </div>

      {latestCycle && !latestCycle.suppressed ? (
        <div className={styles["meter-row"]}>
          {latestCycle.groups.map((g) => (
            <div key={g.key} className={styles["meter-item"]}>
              <span className={styles.ml}>{g.label}</span>
              <span className={styles["meter-track"]}>
                <span
                  className={styles["meter-fill"]}
                  style={{ width: g.suppressed ? "0%" : `${(g.rate ?? 0) * 100}%` }}
                />
              </span>
              <span className={styles.mn}>{g.suppressed ? "—" : `${Math.round((g.rate ?? 0) * 100)}%`}</span>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ marginTop: 16, fontSize: 14, color: "var(--text-faint)" }}>
          Not enough tickets this cycle yet to show a group breakdown.
        </p>
      )}

      <div className={styles["drift-box"]}>
        <div className={styles.verdict}>AI-assisted load concentration</div>
        <h3>
          {concentration.verdict === "concentrating"
            ? "Load is concentrating in specific groups"
            : concentration.verdict === "distributed"
              ? "Load looks evenly distributed"
              : "Not enough data yet"}
        </h3>
        <p>{concentration.guidance}</p>
      </div>

      <h2 style={{ marginTop: 40, fontSize: 20 }}>Cycle history</h2>
      <div className={styles["table-wrap"]} style={{ marginTop: 16 }}>
        {cycles.length === 0 ? (
          <div className={styles.empty}>No tickets synced yet. Click "Sync now" once the account is connected.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Cycle</th>
                <th>Tickets</th>
                <th>AI-assisted</th>
                <th>Top group</th>
              </tr>
            </thead>
            <tbody>
              {cycles.map((c) => {
                const topGroup = c.groups.reduce(
                  (best, g) => ((g.rate ?? 0) > (best?.rate ?? -1) ? g : best),
                  c.groups[0]
                );
                return (
                  <tr key={c.cycle}>
                    <td>{c.cycle}</td>
                    <td>{c.ticketCount}</td>
                    <td>{c.suppressed ? "—" : c.aiAssistedCount}</td>
                    <td>{c.suppressed || !topGroup || topGroup.suppressed ? "—" : topGroup.label}</td>
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
