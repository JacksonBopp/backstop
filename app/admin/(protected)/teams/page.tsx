import Link from "next/link";
import styles from "@/app/admin/admin.module.css";
import { prisma } from "@/lib/db";
import { createTeam } from "@/app/admin/teams/actions";
import CopyLinkButton from "@/app/admin/teams/CopyLinkButton";

export default async function TeamsPage() {
  const teams = await prisma.team.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { responses: true } } },
  });

  return (
    <div>
      <p className={styles.kicker}>Teams</p>
      <h1 style={{ marginTop: 12, fontSize: 26 }}>Team pulse</h1>

      <form action={createTeam} className={styles.filters} style={{ marginTop: 24 }}>
        <input type="text" name="name" placeholder="New team name" required style={{ minWidth: 220 }} />
        <button className="btn btn-primary" type="submit">
          Create team
        </button>
      </form>

      <div className={styles["table-wrap"]} style={{ marginTop: 24 }}>
        {teams.length === 0 ? (
          <div className={styles.empty}>No teams yet. Create one to get a shareable pulse link.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Team</th>
                <th>Responses</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id}>
                  <td>
                    <Link href={`/admin/teams/${team.id}`}>{team.name}</Link>
                  </td>
                  <td>{team._count.responses}</td>
                  <td>
                    <CopyLinkButton path={`/pulse/${team.slug}`} />
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
