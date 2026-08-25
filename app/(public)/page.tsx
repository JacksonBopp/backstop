import Link from "next/link";
import LayerCard from "@/components/LayerCard";
import { layers } from "@/data/layers";

export default function LandingPage() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="eyebrow">A systems + I-O psychology framework for AI adoption</span>
          <h1>
            AI doesn&apos;t fail on the model.
            <br />
            It fails on the <em>system</em> around it.
          </h1>
          <p className="sub">
            IIO is a diagnostic framework built on systems dynamics and industrial-organizational psychology. It looks at
            how companies integrate AI into work: the flows, the roles, the trust, and the well-being of the people
            running the loop. Not another rollout playbook. This is the missing discipline between AI strategy and AI
            that actually sticks.
          </p>
          <div className="cta-row">
            <Link className="btn btn-primary" href="/diagnostic">
              Run the live diagnostic
            </Link>
            <a className="btn btn-ghost" href="#architecture">
              See the framework
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

      <section id="architecture">
        <div className="container">
          <div className="head">
            <span className="eyebrow">The framework</span>
            <h2>Five layers, one running system, not five separate initiatives.</h2>
            <p className="lede">
              A diagnostic layer determines which configuration of the framework applies to a given team. The four
              operating layers aren&apos;t sequential phases. They&apos;re a closed loop: what you measure in Layer 4
              changes how you re-diagnose in Layer 0.
            </p>
          </div>

          <div className="diagram-wrap">
            <div className="layers">
              {layers.map((layer) => (
                <LayerCard key={layer.id} layer={layer} />
              ))}
            </div>
            <div className="loop-col">
              <svg viewBox="0 0 26 420" preserveAspectRatio="none" aria-hidden="true">
                <path
                  className="loop-path"
                  d="M 13 20 L 13 380 M 13 380 L 6 368 M 13 380 L 20 368 M 13 20 L 6 32 M 13 20 L 20 32"
                />
              </svg>
            </div>
          </div>
          <div className="cta-row" style={{ marginTop: 32 }}>
            <Link className="btn btn-primary" href="/diagnostic">
              Run the live diagnostic
            </Link>
          </div>

          <div className="process" style={{ marginTop: 72 }}>
            <div className="step">
              <div className="num">01</div>
              <h3>Diagnose</h3>
              <p>
                Run the Layer 0 intake with leadership and a cross-section of the affected teams. Score deployment
                topology, readiness, and surveillance sensitivity.
              </p>
            </div>
            <div className="step">
              <div className="num">02</div>
              <h3>Map</h3>
              <p>
                Model the actual work system, its flows, feedback loops, and interdependencies, before any role or tool
                changes. Surface what AI silently removes, not just what it adds.
              </p>
            </div>
            <div className="step">
              <div className="num">03</div>
              <h3>Redesign</h3>
              <p>
                Rebuild roles and the change plan together: function allocation, trust calibration, and the specific
                anxieties this team is carrying.
              </p>
            </div>
            <div className="step">
              <div className="num">04</div>
              <h3>Instrument</h3>
              <p>
                Stand up demands/resources metrics that don&apos;t read as surveillance, and route findings back into
                the next diagnostic cycle.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="problem">
        <div className="container">
          <div className="head">
            <h2>Companies are buying AI faster than they can redesign the work around it.</h2>
          </div>
          <div className="problem-body">
            <div>
              <p>
                Enterprise AI spend has moved fast, tens of billions committed since 2023, while the systems that work
                runs on haven&apos;t moved at all. Same job descriptions, same review chains, same performance metrics,
                same informal trust networks. The tool changes. What surrounds it doesn&apos;t.
              </p>
              <p>
                MIT&apos;s NANDA researchers call this the learning gap: the inability of an organization to integrate a
                new kind of teammate into its workflows, roles, and culture. Solving it takes industrial-organizational
                psychology and systems design, not more data science, and almost nobody is resourced for that
                combination.
              </p>
              <p>
                Meanwhile the human cost compounds quietly: fear of job loss, training overwhelm, review fatigue from
                verify-the-AI work, and, in a meaningful share of teams, quiet or active sabotage of the very tools
                leadership is betting on.
              </p>
            </div>
            <div className="callout">
              <span className="k">What&apos;s actually being measured</span>
              <p>
                Most organizations track adoption rate and output volume. Almost none track cognitive load, trust
                calibration, or whether the redesigned role still has the autonomy and skill variety it had before. You
                can&apos;t fix what you&apos;re not instrumenting, and right now the human side of AI integration is
                running dark.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="why-now">
        <div className="container">
          <div className="head">
            <h2>The &quot;GenAI divide&quot; is a positioning opportunity, not just a warning sign.</h2>
          </div>
          <div className="why-grid">
            <div>
              <p>
                MIT&apos;s researchers describe a split between companies with high AI adoption and low actual
                transformation: the GenAI Divide. The 5% who escape it share a consistent trait. They treated
                integration as a workflow, culture, and structure problem, not a procurement decision.
              </p>
              <p>
                That&apos;s a discipline gap, and right now almost no one owns it end to end. Change consultancies know
                culture. AI vendors know models. Almost nobody is fluent in both organizational psychology and systems
                dynamics applied specifically to human-AI work. That&apos;s the seat IIO is built to fill.
              </p>
            </div>
            <blockquote>
              MIT&apos;s researchers trace the failure to a learning gap between systems and organizations: the
              inability to integrate AI into existing workflows, structures, and culture, not a shortfall in the models
              themselves.
              <cite>Summarized from MIT Media Lab, Project NANDA, &quot;The GenAI Divide,&quot; 2025</cite>
            </blockquote>
          </div>
        </div>
      </section>

      <section id="ask">
        <div className="container">
          <div className="ask">
            <span className="eyebrow">Where things stand</span>
            <h2>
              IIO is an early-stage framework becoming a product. We&apos;re looking for the people who make that jump
              faster.
            </h2>
            <div className="ask-list">
              <div className="item">
                <div className="t">Pilot partners</div>
                <p>An organization mid-AI-rollout willing to run the Layer 0 diagnostic and let us build the case study.</p>
              </div>
              <div className="item">
                <div className="t">Advisors</div>
                <p>
                  People who&apos;ve sat inside I-O psychology, organizational design, or enterprise AI adoption and can
                  pressure-test the model.
                </p>
              </div>
              <div className="item">
                <div className="t">Early conversations</div>
                <p>Funding, faculty introductions, or just a sharp argument for why this is wrong. All useful right now.</p>
              </div>
            </div>
            <div className="cta-row">
              <a className="btn btn-primary" href="mailto:boppjackson@gmail.com?subject=IIO%20-%20quick%20intro">
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
