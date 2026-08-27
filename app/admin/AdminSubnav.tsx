"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./admin.module.css";

export default function AdminSubnav() {
  const pathname = usePathname();
  const onTeams = pathname.startsWith("/admin/teams");

  return (
    <nav className={styles.subnav}>
      <Link href="/admin" className={onTeams ? "" : styles.active}>
        Submissions
      </Link>
      <Link href="/admin/teams" className={onTeams ? styles.active : ""}>
        Teams
      </Link>
    </nav>
  );
}
