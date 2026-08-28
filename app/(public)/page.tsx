import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>
            Someone has to check the AI&apos;s replies.
            <br />
            Right now, <em>nobody&apos;s</em> tracking who.
          </h1>
          <p className="sub">
            Backstop is a Zendesk app that tracks AI-verification load: which agents and which groups are absorbing
            the work of checking, correcting, or overriding AI-generated replies. It&apos;s a real cost native
            Zendesk reporting doesn&apos;t measure, and it doesn&apos;t stay evenly spread on its own.
          </p>
          <div className="cta-row">
            <a className="btn btn-primary" href="#how">
              See how it works
            </a>
            <a className="btn btn-ghost" href="mailto:boppjackson@gmail.com?subject=Backstop%20-%20quick%20intro">
              Get in touch
            </a>
          </div>

          <div className="stat-strip">
            <div className="stat">
              <div className="n">95%</div>
              <div className="d">of enterprise generative AI pilots deliver no measurable P&amp;L return.</div>
              <div className="src">MIT Media Lab, Project NANDA, 2025</div>
            </div>
            <div className="stat">
              <div className="n">~75%</div>
              <div className="d">of AI initiatives stall before production, driven by adoption failure, not model failure.</div>
              <div className="src">2026 enterprise adoption research</div>
            </div>
            <div className="stat">
              <div className="n">6&times;</div>
              <div className="d">more likely to succeed when a rollout is paired with real change-management design.</div>
              <div className="src">Prosci change-management research</div>
            </div>
          </div>
        </div>
      </section>

      <section id="how">
        <div className="container">
          <div className="head">
            <h2>One click in the ticket. One dashboard for the team.</h2>
            <p className="lede">
              No new workflow to learn. An agent flags a ticket the moment they catch themselves verifying,
              correcting, or overriding an AI-drafted reply. Everything after that runs on its own.
            </p>
          </div>

          <div className="process" style={{ marginTop: 48 }}>
            <div className="step">
              <div className="num">01</div>
              <h3>Flag</h3>
              <p>A one-click toggle in the Zendesk ticket sidebar marks the ticket as AI-assisted, verified by a human.</p>
            </div>
            <div className="step">
              <div className="num">02</div>
              <h3>Sync</h3>
              <p>Backstop pulls tagged and untagged ticket volume by group on a schedule, no manual export, ever.</p>
            </div>
            <div className="step">
              <div className="num">03</div>
              <h3>Aggregate</h3>
              <p>Each cycle, verification rate is computed per group, with small groups suppressed rather than guessed at.</p>
            </div>
            <div className="step">
              <div className="num">04</div>
              <h3>Surface</h3>
              <p>The dashboard flags when that load is concentrating in one group instead of spreading out evenly.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="problem">
        <div className="container">
          <div className="head">
            <h2>AI replies didn&apos;t remove the work. They moved it, quietly, onto whoever checks them.</h2>
          </div>
          <div className="problem-body">
            <div>
              <p>
                Every AI-assisted reply that goes out still needs a human to have trusted it, and trust isn&apos;t
                free. Someone reads it, someone decides whether to send it as-is, correct it, or override it
                entirely. That decision is real cognitive work. It just doesn&apos;t show up anywhere a ticketing
                system tracks by default.
              </p>
              <p>
                Native Zendesk reporting counts tickets closed, response time, CSAT. None of that tells you whether
                one group is quietly absorbing most of the verification burden while another barely touches AI
                output at all, or whether that split is shifting cycle over cycle.
              </p>
              <p>
                Left unmeasured, that load concentrates on whoever&apos;s conscientious enough to actually check the
                AI&apos;s work, and that&apos;s exactly the group that burns out first.
              </p>
            </div>
            <div className="callout">
              <span className="k">What&apos;s actually being measured</span>
              <p>
                Most support orgs can tell you how many tickets used AI. Almost none can tell you which group is
                doing the checking, or whether that&apos;s changing. You can&apos;t fix what you&apos;re not
                instrumenting, and right now this specific kind of work runs dark.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="why">
        <div className="container">
          <div className="head">
            <h2>The &quot;GenAI divide&quot; shows up inside the support queue too.</h2>
          </div>
          <div className="why-grid">
            <div>
              <p>
                MIT&apos;s researchers describe a split between companies with high AI adoption and low actual
                transformation: the GenAI Divide. The organizations that escape it share a consistent trait. They
                treated integration as a workflow and measurement problem, not a procurement decision.
              </p>
              <p>
                Support orgs rolling out AI-assisted replies are running the same experiment at smaller scale. The
                tool shipped. Whether the verification work it creates is sustainable, evenly distributed, or quietly
                wearing out one group, almost nobody is tracking. That&apos;s the gap Backstop is built to close.
              </p>
            </div>
            <blockquote>
              MIT&apos;s researchers trace the failure to a learning gap between systems and organizations: the
              inability to integrate AI into existing workflows, structures, and culture, not a shortfall in the
              models themselves.
              <cite>Summarized from MIT Media Lab, Project NANDA, &quot;The GenAI Divide,&quot; 2025</cite>
            </blockquote>
          </div>
        </div>
      </section>

      <section id="roadmap">
        <div className="container">
          <div className="head">
            <h2>AI-verification load is the first thing Backstop tracks. Not the last.</h2>
            <p className="lede">
              Zendesk&apos;s native tooling is built for ticket volume and response time. It has real blind spots
              around the new kinds of work AI is creating inside support orgs. Backstop is built to grow into more
              of them, one focused app at a time, not one app trying to do everything at once.
            </p>
          </div>
          <ol style={{ marginTop: 32, maxWidth: "58ch", color: "var(--text-soft)", fontSize: 16, lineHeight: 1.7, paddingLeft: 20 }}>
            <li style={{ marginTop: 8 }}>
              <strong style={{ color: "var(--text)" }}>Shipped:</strong> AI-verification load, tracked by group, by
              cycle, with a suppression guard so small groups never get singled out on too little data.
            </li>
            <li style={{ marginTop: 8 }}>
              <strong style={{ color: "var(--text)" }}>Next:</strong> whichever blind spot the first real pilot
              surfaces. That&apos;s deliberate, the roadmap gets set by what support teams actually run into, not
              guessed at in advance.
            </li>
          </ol>
        </div>
      </section>

      <section id="ask">
        <div className="container">
          <div className="ask">
            <h2>Backstop is early. We&apos;re looking for the teams and people who help it get real faster.</h2>
            <div className="ask-list">
              <div className="item">
                <div className="t">Pilot partners</div>
                <p>
                  A support team already running AI-assisted replies in Zendesk, willing to connect a trial account
                  and let us build the case study.
                </p>
              </div>
              <div className="item">
                <div className="t">Advisors</div>
                <p>
                  People who&apos;ve built on Zendesk&apos;s app framework, run a support org through an AI rollout,
                  or can pressure-test where this breaks.
                </p>
              </div>
              <div className="item">
                <div className="t">Early conversations</div>
                <p>Funding, marketplace introductions, or just a sharp argument for why this is wrong. All useful right now.</p>
              </div>
            </div>
            <div className="cta-row">
              <a className="btn btn-primary" href="mailto:boppjackson@gmail.com?subject=Backstop%20-%20quick%20intro">
                boppjackson@gmail.com
              </a>
              <a className="btn btn-ghost" href="https://www.linkedin.com/in/jbopp/" target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
              <a className="btn btn-ghost" href="tel:+19414565553">
                941-456-5553
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
