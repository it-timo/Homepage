#!/usr/bin/env python3
"""Generate timeline entries from dated entities plus manual records."""
from __future__ import annotations
import json, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; DATA=ROOT/'data'

def main():
  try:
    graph=json.loads((DATA/'entities.json').read_text()); manual=json.loads((DATA/'timeline_manual.json').read_text())
    generated=[]
    allowed={'album','track','project','repository','article','note','video','experiment','milestone'}
    for entity in graph['entities']:
      if entity['type'] not in allowed or not (entity.get('date') or entity.get('year')): continue
      date=entity.get('date'); year=entity.get('year') or (int(date[:4]) if date else None)
      generated.append({'id':f'timeline:{entity["id"]}','date':date,'year':year,'period':str(year) if year else 'Undated','title':entity['title'],'type':entity['type'],'status':entity.get('status','catalogued'),'description':entity.get('summary',''),'path':entity.get('path',''),'relationships':[{'type':'timeline_of','target':entity['id']}]})
    entries=manual+generated
    entries.sort(key=lambda x:(x.get('date') or (f'{x.get("year")}-00-00' if x.get('year') else '0000'),x['title']),reverse=True)
    (DATA/'timeline.json').write_text(json.dumps(entries,indent=2,ensure_ascii=False)+'\n')
    print(f'Built data/timeline.json with {len(manual)} manual and {len(generated)} generated entries.')
    return 0
  except (OSError,KeyError,json.JSONDecodeError) as error:
    print(f'timeline build error: {error}',file=sys.stderr); return 1
if __name__=='__main__': raise SystemExit(main())
