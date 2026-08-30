import styles from "@/app/admin/admin.module.css";
import { login } from "@/app/admin/actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className={styles["login-shell"]}>
      <div className={styles["login-card"]}>
        <p className={styles.kicker}>Backstop admin</p>
        <h1>Sign in</h1>
        <form action={login}>
          <input type="password" name="password" placeholder="Password" required autoFocus />
          <button className="btn btn-primary" type="submit">
            Sign in
          </button>
        </form>
        {error === "locked" && (
          <p className={styles.err}>Too many failed attempts. Try again in a few minutes.</p>
        )}
        {error === "1" && <p className={styles.err}>Wrong password. Try again.</p>}
      </div>
    </div>
  );
}
