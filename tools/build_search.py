#!/usr/bin/env python3
"""Build a compact client-side search index from the entity graph."""
from __future__ import annotations
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; DATA=ROOT/'data'
graph=json.loads((DATA/'entities.json').read_text())
records=[]
for item in graph['entities']:
  if not item.get('path'): continue
  related=[r['title'] for r in item.get('relationships',[])]+[r['title'] for r in item.get('incoming_relationships',[])]
  records.append({'id':item['id'],'type':item['type'],'title':item['title'],'summary':item.get('summary',''),'path':item['path'],'themes':item.get('themes',[]),'related':related,'search_text':' '.join([item['title'],item.get('summary',''),*item.get('themes',[]),*related]).casefold()})
(DATA/'search_index.json').write_text(json.dumps({'records':records},indent=2,ensure_ascii=False)+'\n')
print(f'Built data/search_index.json with {len(records)} searchable entities.')
