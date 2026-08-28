import Link from "next/link";
import styles from "@/app/admin/admin.module.css";
import { prisma } from "@/lib/db";
import { startZendeskConnect } from "@/app/admin/backstop/actions";

export default async function BackstopPage() {
  const accounts = await prisma.zendeskAccount.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { tickets: true } } },
  });

  return (
    <div>
      <p className={styles.kicker}>Backstop</p>
      <h1 style={{ marginTop: 12, fontSize: 26 }}>Connected Zendesk accounts</h1>

      <form action={startZendeskConnect} className={styles.filters} style={{ marginTop: 24 }}>
        <input type="text" name="subdomain" placeholder="Zendesk subdomain (e.g. none-18808)" required style={{ minWidth: 260 }} />
        <button className="btn btn-primary" type="submit">
          Connect account
        </button>
      </form>

      <div className={styles["table-wrap"]} style={{ marginTop: 24 }}>
        {accounts.length === 0 ? (
          <div className={styles.empty}>No accounts connected yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Account</th>
                <th>Synced tickets</th>
                <th>Last synced</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td>
                    <Link href={`/admin/backstop/${account.id}`}>{account.displayName ?? account.subdomain}</Link>
                  </td>
                  <td>{account._count.tickets}</td>
                  <td>{account.lastSyncedAt ? account.lastSyncedAt.toLocaleString() : "Never"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
