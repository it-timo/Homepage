#!/usr/bin/env python3
"""Build a compact, destination-deduplicated client-side search index."""
from __future__ import annotations
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; DATA=ROOT/'data'
graph=json.loads((DATA/'entities.json').read_text())
records=[]; seen_paths=set()
# Milestones enrich their related project and timeline but should not create a
# second search result that opens the exact same project page.
for item in graph['entities']:
  if not item.get('path') or item['type']=='milestone' or item['path'] in seen_paths: continue
  seen_paths.add(item['path'])
  related=list(dict.fromkeys(r['title'] for r in [*item.get('relationships',[]),*item.get('incoming_relationships',[])] if r['target']!=item['id'] and r.get('path')!=item['path']))
  records.append({'id':item['id'],'type':item['type'],'title':item['title'],'summary':item.get('summary',''),'path':item['path'],'themes':item.get('themes',[]),'related':related,'search_text':' '.join([item['title'],item.get('summary',''),*item.get('themes',[]),*related]).casefold()})
(DATA/'search_index.json').write_text(json.dumps({'records':records},indent=2,ensure_ascii=False)+'\n')
print(f'Built data/search_index.json with {len(records)} unique destinations.')
