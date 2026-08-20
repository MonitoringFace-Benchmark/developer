import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <>
      <h1>MonitoringFace</h1>
      <p className="muted" style={{ maxWidth: 680 }}>
        {/* placeholder copy, replace with the real platform description */}
        MonitoringFace is a platform for designing and running reusable
        benchmarking experiments over runtime-monitoring tools. Experiments are
        declared in YAML, executed in isolated containers with pinned tool
        versions, validated against an oracle, and published with full input
        provenance, so every reported number can be traced back to the exact
        data each tool received.
      </p>
      <p className="muted" style={{ maxWidth: 680 }}>
        {/* placeholder copy */}
        This developer site collects the documentation and internals of the
        platform: how the automatic input conversion works, how tools are
        integrated, and how experiments travel from a YAML file to the public
        results website.
      </p>
      <div className="card-grid">
        <Link className="card" to="/conversions">
          <h3>Conversion Graphs</h3>
          <p>
            The directed format graphs the auto-conversion engine discovers and
            routes on, for traces and policies.
          </p>
        </Link>
        <Link className="card" to="/tutorials">
          <h3>
            Tutorials <span className="chip soon">coming soon</span>
          </h3>
          <p>Guides for adding tools, converters, and experiments.</p>
        </Link>
        <a className="card" href="https://monitoringface-benchmark.github.io/" target="_blank" rel="noreferrer">
          <h3>Experiment results ↗</h3>
          <p>The public results website with searchable runs and provenance.</p>
        </a>
      </div>
    </>
  );
}
