# MonitoringFace Developer

Developer documentation site for the MonitoringFace platform, deployed to
GitHub Pages at https://monitoringface-benchmark.github.io/developer/.

Pages:

- **Home**: what the platform is (placeholder copy for now).
- **Conversion Graphs**: the directed format graphs the auto-conversion
  engine discovers and routes on, one for trace/data formats and one for
  policy formats. Vertices are formats; hovering an edge shows the
  converter(s) implementing it, hovering a format highlights its conversions.
- **Tutorials**: stub, intentionally empty for now.

## Regenerating the graph data

`public/graph.json` is exported from the platform's real discovery
(`AutoConversionMapping` over `DataConverters` and `PolicyConverters`), so it
never drifts from what the engine actually does. After adding or changing a
converter:

```bash
cd <MonitoringFace checkout>
PYTHONPATH=. Infrastructure/environment/venv/bin/python \
  <this repo>/scripts/export_graph.py --out <this repo>/public/graph.json
```

Commit the new `graph.json` and push; CI deploys it.

## Run locally

```bash
bun install
bun run dev        # http://localhost:5174
```
