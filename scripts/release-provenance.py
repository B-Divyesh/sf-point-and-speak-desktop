import hashlib
import json
import os
import sys

version, directory, source_commit = sys.argv[1:4]
repo = os.environ.get("GITHUB_REPOSITORY", "B-Divyesh/sf-point-and-speak-desktop")
run_id = os.environ.get("GITHUB_RUN_ID", "local")
excluded = {"PROVENANCE.json", "SHA256SUMS", "latest.json"}
subjects = []
for name in sorted(item for item in os.listdir(directory) if item not in excluded):
    path = os.path.join(directory, name)
    if not os.path.isfile(path):
        continue
    digest = hashlib.sha256()
    with open(path, "rb") as artifact:
        for chunk in iter(lambda: artifact.read(1024 * 1024), b""):
            digest.update(chunk)
    subjects.append({"name": name, "sha256": digest.hexdigest()})

print(json.dumps({
    "schema_version": 1,
    "version": version,
    "repository": f"https://github.com/{repo}",
    "source_commit": source_commit,
    "source_ref": f"refs/tags/{version}",
    "workflow_run": f"https://github.com/{repo}/actions/runs/{run_id}",
    "subjects": subjects,
}, indent=2))
