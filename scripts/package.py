"""Build a deterministic, root-flat cPanel archive from explicit runtime paths."""
import hashlib
import json
import re
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
runtime = [ROOT / name for name in ['index.html', 'manifest.json', 'service-worker.js', '.htaccess']]
runtime += sorted((ROOT / 'js').glob('*.js'))
runtime += sorted((ROOT / 'css').glob('*.css'))
runtime += sorted(p for p in (ROOT / 'assets').rglob('*') if p.is_file())
if any(not p.resolve().is_relative_to(ROOT.resolve()) for p in runtime):
    raise ValueError('Runtime path resolves outside the application')
files = {p.relative_to(ROOT).as_posix(): p.read_bytes() for p in runtime}
identity = hashlib.sha256()
for name, data in sorted(files.items()):
    identity.update(name.encode() + b'\0' + hashlib.sha256(data).digest())
release_id = identity.hexdigest()[:12]
cache_name = 'apex-training-' + release_id
worker = files['service-worker.js'].decode('utf-8')
worker, count = re.subn(r"const CACHE_NAME = '[^']+';", f"const CACHE_NAME = '{cache_name}';", worker)
if count != 1:
    raise ValueError('Cannot assign a release cache identity')
files['service-worker.js'] = worker.encode('utf-8')
manifest = {'release_id': release_id, 'cache_name': cache_name,
            'target_path': '/training/',
            'hosting_directory': '/home/apexpetgroup/public_html/training/',
            'files': [{'path': name, 'sha256': hashlib.sha256(data).hexdigest()} for name, data in sorted(files.items())]}
files['release-manifest.json'] = (json.dumps(manifest, indent=2) + '\n').encode()
dist = ROOT / 'dist'
stage = dist / ('store-training-' + release_id)
stage.mkdir(parents=True, exist_ok=True)
existing = {p.relative_to(stage).as_posix() for p in stage.rglob('*') if p.is_file()}
if existing - files.keys():
    raise ValueError('Unexpected files in existing stage; refusing to overwrite it')
for name, data in files.items():
    target = stage / name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
archive = dist / ('store-training-' + release_id + '.zip')
with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED) as output:
    for name, data in sorted(files.items()):
        entry = zipfile.ZipInfo(name, (2026, 1, 1, 0, 0, 0))
        entry.compress_type = zipfile.ZIP_DEFLATED
        entry.external_attr = 0o100644 << 16
        output.writestr(entry, data)
result = {'release_id': release_id, 'stage': str(stage), 'archive': str(archive),
          'sha256': hashlib.sha256(archive.read_bytes()).hexdigest(), 'runtime_files': len(files)}
(dist / 'latest-release.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
print(json.dumps(result))
