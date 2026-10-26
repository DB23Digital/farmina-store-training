"""Extract exact gram cells from the two supplied PDFs; never interpolate."""
import hashlib
import json
import re
from pathlib import Path
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
WEIGHTS = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 70]
SOURCES = [
    ('prime-puppy-maxi', 'P0020', 'nd-grain-free-canine-2-chicken-puppy-maxi.pdf', 'Prime Chicken & Pomegranate — Maxi puppy', 'N&D GRAIN FREE'),
    ('ancestral-puppy-medium-maxi', 'P0010', 'nd-ancestral-grain-canine-chicken-puppy-medium-maxi.pdf', 'Ancestral Chicken & Pomegranate — Medium/Maxi puppy', 'N&D ANCESTRAL GRAIN'),
]

guides = []
for guide_id, product_id, filename, label, heading in SOURCES:
    source = ROOT / 'assets' / 'feeding-guides' / filename
    text = '\n'.join(page.extract_text() for page in PdfReader(source).pages)
    if heading not in text or 'CHICKEN & POMEGRANATE' not in text:
        raise ValueError(f'Unexpected source identity: {filename}')
    rows = []
    for line in text.splitlines():
        match = re.match(r'^(\d+) (?:mesi/)?months\s+(.+)$', line.strip())
        if not match:
            continue
        cells = re.findall(r'\b(\d+)g\b|\b(Adult)\b', match[2])
        if len(cells) != len(WEIGHTS):
            raise ValueError(f'Expected 12 cells: {filename}, age {match[1]}')
        for weight, (grams, adult) in zip(WEIGHTS, cells):
            rows.append({'age_months': int(match[1]), 'mature_weight_kg': weight,
                         'grams_per_day': int(grams) if grams else None,
                         'adult_food': bool(adult)})
    if len(rows) != 84 or len({(r['age_months'], r['mature_weight_kg']) for r in rows}) != 84:
        raise ValueError(f'Incomplete or duplicate table: {filename}')
    guides.append({'id': guide_id, 'product_id': product_id, 'label': label,
                   'source_pdf': 'assets/feeding-guides/' + filename,
                   'source_sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'rows': rows})

output = ROOT / 'assets' / 'feeding-guides' / 'feeding-guides.json'
output.write_text(json.dumps({'version': 1, 'guides': guides}, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
print(f'Extracted {sum(len(g["rows"]) for g in guides)} exact cells, including explicit Adult cells, into {output.name}')
