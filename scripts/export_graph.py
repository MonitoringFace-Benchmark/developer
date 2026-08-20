"""Export the MonitoringFace conversion graphs as JSON for the developer site.

Runs the platform's REAL discovery (AutoConversionMapping) over both converter
families and emits the directed format graphs the auto-conversion engine
actually routes on. Run from a MonitoringFace checkout:

    cd <MonitoringFace_curr>
    Infrastructure/environment/venv/bin/python \
        <developer-repo>/scripts/export_graph.py --out <developer-repo>/public/graph.json
"""

import argparse
import json
import subprocess
from datetime import datetime, timezone

from Infrastructure.AutoConversion.AutoConversionMapping import AutoConversionMapping
from Infrastructure.DataTypes.PathManager.PathManager import PathManager
from Infrastructure.constants import PATH_TO_ARCHIVE, PATH_TO_PROJECT
import os


def export_family(path_manager: PathManager, ttype: str) -> dict:
    mapping = AutoConversionMapping(path_manager, ttype).mappings
    nodes = set()
    edges = []
    for (src, dst), converters in sorted(mapping.items(), key=lambda kv: (kv[0][0].value, kv[0][1].value)):
        nodes.add(src.value)
        nodes.add(dst.value)
        edges.append({"from": src.value, "to": dst.value,
                      "converters": sorted(converters)})
    return {"nodes": sorted(nodes), "edges": edges}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    project = os.getcwd()
    pm = PathManager()
    pm.add_path(PATH_TO_PROJECT, project)
    pm.add_path(PATH_TO_ARCHIVE, os.path.join(project, "Archive"))

    commit = None
    try:
        res = subprocess.run(["git", "-C", project, "rev-parse", "HEAD"],
                             capture_output=True, text=True, timeout=5)
        commit = res.stdout.strip() if res.returncode == 0 else None
    except Exception:
        pass

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "framework_commit": commit,
        "trace": export_family(pm, "DataConverters"),
        "policy": export_family(pm, "PolicyConverters"),
    }
    with open(args.out, "w") as f:
        json.dump(payload, f, indent=1)
    print(f"wrote {args.out}: "
          f"trace {len(payload['trace']['nodes'])} formats / {len(payload['trace']['edges'])} edges, "
          f"policy {len(payload['policy']['nodes'])} formats / {len(payload['policy']['edges'])} edges")


if __name__ == "__main__":
    main()
