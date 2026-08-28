"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./admin.module.css";

export default function AdminSubnav() {
  const pathname = usePathname();
  const onTeams = pathname.startsWith("/admin/teams");
  const onBackstop = pathname.startsWith("/admin/backstop");
  const onSubmissions = !onTeams && !onBackstop;

  return (
    <nav className={styles.subnav}>
      <Link href="/admin" className={onSubmissions ? styles.active : ""}>
        Submissions
      </Link>
      <Link href="/admin/teams" className={onTeams ? styles.active : ""}>
        Teams
      </Link>
      <Link href="/admin/backstop" className={onBackstop ? styles.active : ""}>
        Backstop
      </Link>
    </nav>
  );
}
