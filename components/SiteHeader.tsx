import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="site">
      <div className="nav-inner">
        <Link className="wordmark" href="/">
          <span className="mark">Backstop</span>
          <span className="tag">AI-verification load, tracked in Zendesk</span>
        </Link>
        <nav className="links">
          <Link href="/#how">How it works</Link>
          <Link href="/#problem">Why it matters</Link>
          <Link href="/#roadmap">Roadmap</Link>
          <Link href="/#ask">Get Involved</Link>
        </nav>
        <a className="btn btn-primary" href="mailto:boppjackson@gmail.com?subject=Backstop%20-%20quick%20intro">
          Get in touch
        </a>
      </div>
    </header>
  );
}
