import hashlib
import json
import subprocess
import sys
import unittest
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class PackageTests(unittest.TestCase):
    def test_runtime_only_repeatable_archive_and_checksums(self):
        def build():
            result = subprocess.run([sys.executable, str(ROOT / 'scripts/package.py')], check=True, text=True, capture_output=True)
            return json.loads(result.stdout)
        first, second = build(), build()
        self.assertEqual(first['sha256'], second['sha256'])
        with zipfile.ZipFile(first['archive']) as archive:
            names = archive.namelist()
            self.assertIn('index.html', names)
            self.assertIn('.htaccess', names)
            self.assertIn('assets/apexlogo-mark.png', names)
            self.assertIn('assets/feeding-guides/feeding-guides.json', names)
            self.assertTrue(all('\\' not in name and not name.startswith('/') for name in names))
            self.assertFalse(any(name.split('/')[0] in ['.git','.vercel','docs','tests','scripts','dist'] for name in names))
            manifest = json.loads(archive.read('release-manifest.json'))
            self.assertIn(manifest['cache_name'].encode(), archive.read('service-worker.js'))
            self.assertEqual(manifest['target_path'], '/training/')
            self.assertEqual(manifest['hosting_directory'], '/home/apexpetgroup/public_html/training/')
            for entry in manifest['files']:
                self.assertEqual(hashlib.sha256(archive.read(entry['path'])).hexdigest(), entry['sha256'])

if __name__ == '__main__':
    unittest.main()
