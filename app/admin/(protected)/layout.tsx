import Link from "next/link";
import styles from "@/app/admin/admin.module.css";
import { requireAdminSession } from "@/lib/session";
import { logout } from "@/app/admin/actions";
import AdminSubnav from "@/app/admin/AdminSubnav";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminSession();

  return (
    <div className={styles.shell}>
      <div className={styles.bar}>
        <div>
          <Link href="/admin" className={styles.mark}>
            Backstop
          </Link>
          <span className={styles.sub}>ADMIN</span>
        </div>
        <form action={logout}>
          <button className="btn btn-ghost" type="submit">
            Log out
          </button>
        </form>
      </div>
      <div className={styles.wrap}>
        <AdminSubnav />
        <div style={{ marginTop: 24 }}>{children}</div>
      </div>
    </div>
  );
}
