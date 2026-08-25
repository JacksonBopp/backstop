import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="site">
      <div className="nav-inner">
        <Link className="wordmark" href="/">
          <span className="mark">IIO</span>
          <span className="tag">Integrated Intelligence &amp; Organization</span>
        </Link>
        <nav className="links">
          <Link href="/#architecture">Framework</Link>
          <Link href="/#problem">The Gap</Link>
          <Link href="/#ask">Get Involved</Link>
          <Link href="/diagnostic">Diagnostic</Link>
        </nav>
        <a className="btn btn-primary" href="mailto:boppjackson@gmail.com?subject=IIO%20-%20quick%20intro">
          Get in touch
        </a>
      </div>
    </header>
  );
}
