"""Build assets/feeding-guides/feeding-guides.json from the supplied guides.

Text-layer PDFs are parsed here; image guides are merged from the hand
transcriptions in scripts/feeding-guide-transcriptions.json. Cells are copied
exactly: nothing is interpolated, rounded or inferred.

Puppy guides give grams per day by age and projected adult weight.
Adult and cat guides give a min-max gram range by current weight.
"""
import hashlib
import json
import re
from pathlib import Path
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
GUIDES = ROOT / 'assets' / 'feeding-guides'

# (guide id, source product id, breed size, kind, PDF, label, words the PDF title must contain)
PDF_SOURCES = [
    ('ancestral-puppy-mini', 'P0009', 'mini', 'puppy', 'nd-ancestral-grain-canine-chicken-puppy-mini.pdf',
     'Ancestral Grain Chicken & Pomegranate Puppy — Mini', ['ANCESTRAL GRAIN', 'PUPPY', 'MINI BREEDS']),
    ('ancestral-puppy-medium-maxi', 'P0010', 'medium_maxi', 'puppy', 'nd-ancestral-grain-canine-chicken-puppy-medium-maxi.pdf',
     'Ancestral Chicken & Pomegranate — Medium/Maxi puppy', ['ANCESTRAL GRAIN', 'PUPPY', 'MEDIUM AND MAXI']),
    ('ancestral-adult-mini', 'P0011', 'mini', 'adult', 'nd-ancestral-grain-canine-chicken-adult-mini.pdf',
     'Ancestral Grain Chicken & Pomegranate Adult — Mini', ['ANCESTRAL GRAIN', 'ADUL', 'MINI BREEDS']),
    ('ancestral-adult-medium-maxi', 'P0012', 'medium_maxi', 'adult', 'nd-ancestral-grain-canine-chicken-adult-medium-maxi.pdf',
     'Ancestral Grain Chicken & Pomegranate Adult — Medium & Maxi', ['ANCESTRAL GRAIN', 'ADUL', 'MEDIUM AND MAXI']),
    ('ancestral-light-medium-maxi', 'P0014', 'medium_maxi', 'adult', 'nd-ancestral-grain-canine-chicken-light-medium-maxi.pdf',
     'Ancestral Grain Chicken & Pomegranate Light — Medium & Maxi', ['ANCESTRAL GRAIN', 'LIGHT', 'MEDIUM AND MAXI']),
    ('ocean-adult-mini', 'P0015', 'mini', 'adult', 'nd-ocean-canine-cod-pumpkin-orange-adult-mini.pdf',
     'Ocean Cod, Pumpkin & Orange Adult — Mini', ['N&D OCEAN', 'COD, PUMPKIN & ORANGE', 'MINI BREEDS']),
    ('ocean-adult-medium-maxi', 'P0016', 'medium_maxi', 'adult', 'nd-ocean-canine-cod-pumpkin-orange-adult-medium-maxi.pdf',
     'Ocean Cod, Pumpkin & Orange Adult — Medium & Maxi', ['N&D OCEAN', 'COD, PUMPKIN & ORANGE', 'MEDIUM AND MAXI']),
    ('prime-puppy-mini', 'P0019', 'mini', 'puppy', 'nd-prime-canine-1- chicken-puppy-mini.pdf',
     'Prime Chicken & Pomegranate Puppy — Mini', ['N&D PRIME', 'PUPPY', 'MINI BREEDS']),
    ('prime-puppy-maxi', 'P0020', 'maxi', 'puppy', 'nd-grain-free-canine-2-chicken-puppy-maxi.pdf',
     'Prime Chicken & Pomegranate — Maxi puppy', ['N&D GRAIN FREE', 'PUPPY', 'MAXI BREED']),
    # "N&D Grain Free" is the earlier name for N&D Prime (confirmed by Deon, 30/10/2026).
    ('prime-adult-mini', 'P0021', 'mini', 'adult', 'nd-grain-free-canine-3-chicken-mini.pdf',
     'Prime Chicken & Pomegranate Adult — Mini', ['N&D GRAIN FREE', 'ADUL', 'MINI BREEDS']),
    ('prime-adult-medium-maxi', 'P0022', 'medium_maxi', 'adult', 'nd-grain-free-canine-4-chicken-medium-maxi.pdf',
     'Prime Chicken & Pomegranate Adult — Medium & Maxi', ['N&D GRAIN FREE', 'ADUL', 'MEDIUM AND MAXI']),
    ('pumpkin-chicken-adult-mini', 'P0027', 'mini', 'adult', 'nd-pumpkin-canine-3-chicken-mini.pdf',
     'Pumpkin Chicken & Pomegranate Adult — Mini', ['N&D PUMPKIN', 'CHICKEN & POMEGRANATE', 'MINI BREEDS']),
    ('pumpkin-chicken-adult-medium-maxi', 'P0027', 'medium_maxi', 'adult', 'nd-pumpkin-canine-4-cicken-medium-maxi.pdf',
     'Pumpkin Chicken & Pomegranate Adult — Medium & Maxi', ['N&D PUMPKIN', 'CHICKEN & POMEGRANATE', 'MEDIUM AND MAXI']),
    ('pumpkin-boar-adult-mini', 'P0029', 'mini', 'adult', 'nd-pumpkin-canine-5-wild.boar-mini.pdf',
     'Pumpkin Wild Boar & Apple Adult — Mini', ['N&D PUMPKIN', 'WILD BOAR & APPLE', 'MINI BREEDS']),
    ('pumpkin-boar-adult-medium-maxi', 'P0029', 'medium_maxi', 'adult', 'nd-pumpkin-canine-6-wild-boar-medium-maxi.pdf',
     'Pumpkin Wild Boar & Apple Adult — Medium & Maxi', ['N&D PUMPKIN', 'WILD BOAR & APPLE', 'MEDIUM AND MAXI']),
    ('pumpkin-lamb-adult-mini', 'P0030', 'mini', 'adult', 'nd-pumpkin-canine-7-lamb-mini.pdf',
     'Pumpkin Lamb & Blueberry Adult — Mini', ['N&D PUMPKIN', 'LAMB & BLUEBERRY', 'ADUL', 'MINI BREEDS']),
    ('pumpkin-lamb-adult-medium-maxi', 'P0030', 'medium_maxi', 'adult', 'nd-pumpkin-canine-8-lamb-medium-maxi.pdf',
     'Pumpkin Lamb & Blueberry Adult — Medium & Maxi', ['N&D PUMPKIN', 'LAMB & BLUEBERRY', 'ADUL', 'MEDIUM AND MAXI']),
    ('pumpkin-lamb-puppy-mini', 'P0031', 'mini', 'puppy', 'nd-pumpkin-canine-1-puppy-lamb-mini.pdf',
     'Pumpkin Lamb & Blueberry Puppy — Mini', ['N&D PUMPKIN', 'LAMB & BLUEBERRY PUPPY', 'MINI BREED']),
    ('pumpkin-lamb-puppy-medium-maxi', 'P0031', 'medium_maxi', 'puppy', 'nd-pumpkin-canine-2-puppy-lamb-medium-maxi.pdf',
     'Pumpkin Lamb & Blueberry Puppy — Medium & Maxi', ['N&D PUMPKIN', 'LAMB & BLUEBERRY PUPPY', 'MEDIUM AND MAXI']),
    ('ocean-cat-herring', 'P0001', 'all', 'adult', 'nd-ocean-feline-herring-orange.pdf',
     'Ocean Herring & Orange Adult Cat', ['N&D OCEAN', 'HERRING & ORANGE', 'CA TS']),
    ('prime-cat-chicken', 'P0003', 'all', 'adult', 'nd-prime-feline-2-chicken.pdf',
     'Prime Chicken & Pomegranate Adult Cat', ['N&D PRIME', 'CHICKEN & POMEGRANATE', 'ADUL T CA TS']),
    ('prime-cat-neutered', 'P0004', 'all', 'adult', 'nd-prime-feline-5-chicken-neutered.pdf',
     'Prime Chicken & Pomegranate Neutered Cat', ['N&D PRIME', 'NEUTERED', 'CHICKEN & POMEGRANATE']),
    ('prime-cat-boar', 'P0005', 'all', 'adult', 'nd-prime-feline-3-wild-boar.pdf',
     'Prime Wild Boar & Apple Adult Cat', ['N&D PRIME', 'WILD BOAR & APPLE', 'CA TS']),
    ('prime-cat-lamb', 'P0006', 'all', 'adult', 'nd-prime-feline-4-lamb.pdf',
     'Prime Lamb & Blueberry Adult Cat', ['N&D PRIME', 'LAMB & BLUEBERRY', 'CA TS']),
    ('prime-kitten', 'P0002', 'all', 'kitten', 'nd-prime-feline-1-chicken-kitten.pdf',
     'Prime Chicken & Pomegranate Kitten', ['N&D PRIME', 'KITTENS', 'CHICKEN & POMEGRANATE KITTEN']),
]
# Kitten table rows, in printed order. Cells printed as "—" have no amount and are omitted.
KITTEN_BANDS = [('weaning', 'Weaning'), ('1-3', '1-3 mesi/ months'), ('4-6', '4-6 mesi/ months'), ('7-12', '7-12 mesi/ months')]

WEIGHT = re.compile(r'(?<![\d.])(\d+(?:\.\d+)?)\s?kg\b')
RANGE = re.compile(r'(\d+)\s?-\s?(\d+)\s?g(?![a-z])')
PUPPY_ROW = re.compile(r'^(?:Dog(?:’|\')?s? age:\s*)?(\d+)\s+(?:mesi/)?months\s+(.+)$')
PUPPY_CELL = re.compile(r'(\d+)\s?g(?![a-z])|\bAdult\b')


def number(text):
    value = float(text)
    return int(value) if value.is_integer() else value


def parse_kitten(flat, name):
    header = flat[flat.index('Kitten weight'):flat.index('Weaning')]
    weights = [number(w) for w in WEIGHT.findall(header)]
    labels = [label for _, label in KITTEN_BANDS] + ['For gestating']
    rows = []
    for i, (band, label) in enumerate(KITTEN_BANDS):
        segment = flat[flat.index(label) + len(label):flat.index(labels[i + 1])]
        cells = re.findall(r'(\d+)\s?-\s?(\d+)\s?g|—', segment)
        if len(cells) != len(weights):
            raise ValueError(f'{name}: {band} has {len(cells)} cells for {len(weights)} weights')
        for weight, (low, high) in zip(weights, cells):
            if low:
                rows.append({'age_band': band, 'weight_kg': weight, 'grams_min': int(low), 'grams_max': int(high)})
    return weights, rows


def parse_pdf(text, kind, name):
    flat = ' '.join(text.split())
    if kind == 'kitten':
        return parse_kitten(flat, name)
    weights = [number(w) for w in WEIGHT.findall(flat)]
    if kind == 'adult':
        ranges = [(int(a), int(b)) for a, b in RANGE.findall(flat)]
        if not weights or len(ranges) != len(weights):
            raise ValueError(f'{name}: {len(weights)} weights but {len(ranges)} ranges')
        return weights, [{'weight_kg': w, 'grams_min': a, 'grams_max': b} for w, (a, b) in zip(weights, ranges)]
    rows = []
    for line in text.splitlines():
        match = PUPPY_ROW.match(line.strip())
        if not match:
            continue
        cells = [m.group(0) for m in PUPPY_CELL.finditer(match[2])]
        if len(cells) != len(weights):
            raise ValueError(f'{name}: age {match[1]} has {len(cells)} cells for {len(weights)} weights')
        for weight, cell in zip(weights, cells):
            adult = cell == 'Adult'
            rows.append({'age_months': int(match[1]), 'mature_weight_kg': weight,
                         'grams_per_day': None if adult else int(re.match(r'\d+', cell)[0]), 'adult_food': adult})
    if not rows:
        raise ValueError(f'{name}: no puppy rows found')
    return weights, rows


def check_rows(guide):
    key = {'puppy': lambda r: (r['age_months'], r['mature_weight_kg']), 'adult': lambda r: r['weight_kg'],
           'kitten': lambda r: (r['age_band'], r['weight_kg'])}[guide['kind']]
    keys = [key(r) for r in guide['rows']]
    if not keys or len(set(keys)) != len(keys):
        raise ValueError(f'Empty or duplicate cells: {guide["id"]}')
    for r in guide['rows']:
        if guide['kind'] != 'puppy' and not 0 < r['grams_min'] <= r['grams_max']:
            raise ValueError(f'Invalid range: {guide["id"]} {r}')


guides = []
for guide_id, product_id, size, kind, filename, label, words in PDF_SOURCES:
    source = GUIDES / filename
    text = '\n'.join(page.extract_text() for page in PdfReader(source).pages)
    flat = ' '.join(text.split())
    missing = [w for w in words if w not in flat]
    if missing:
        raise ValueError(f'Unexpected source identity: {filename} lacks {missing}')
    weights, rows = parse_pdf(text, kind, filename)
    guides.append({'id': guide_id, 'product_id': product_id, 'size': size, 'kind': kind, 'label': label,
                   'source_file': 'assets/feeding-guides/' + filename,
                   'source_sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'rows': rows})

# Image guides have no text layer. Each transcription names its source image and
# the SHA-256 it was read from, so a replaced image forces a fresh transcription.
transcriptions = json.loads((ROOT / 'scripts' / 'feeding-guide-transcriptions.json').read_text(encoding='utf-8'))
for item in transcriptions['guides']:
    source = ROOT / item['source_file']
    if hashlib.sha256(source.read_bytes()).hexdigest() != item['source_sha256']:
        raise ValueError(f'Source image changed since transcription: {item["source_file"]}')
    guides.append({k: item[k] for k in ('id', 'product_id', 'size', 'kind', 'label', 'source_file', 'source_sha256', 'rows')})

ids = [g['id'] for g in guides]
if len(set(ids)) != len(ids):
    raise ValueError('Duplicate guide id')
pairs = [(g['product_id'], g['size']) for g in guides]
if len(set(pairs)) != len(pairs):
    raise ValueError('Two guides for one product and breed size')
for guide in guides:
    check_rows(guide)

output = GUIDES / 'feeding-guides.json'
output.write_text(json.dumps({'version': 2, 'guides': guides}, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
print(f'{len(guides)} guides, {sum(len(g["rows"]) for g in guides)} exact cells')
for g in guides:
    print(f'  {g["id"]:36} {g["product_id"]} {g["size"]:11} {g["kind"]:5} {len(g["rows"]):3} cells')
