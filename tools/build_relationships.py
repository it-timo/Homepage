#!/usr/bin/env python3
"""Build a validated, deduplicated, bidirectional relationship graph."""
from __future__ import annotations
import json, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; DATA=ROOT/'data'

def load(name): return json.loads((DATA/name).read_text())
def entity(record, fallback_type=None):
    item=dict(record); item.setdefault('type',fallback_type); item.setdefault('relationships',[]); return item

def normalize_relationships(source_id, relationships):
    """Reject self-links and collapse repeated type/target edges."""
    normalized=[]; seen=set()
    for relation in relationships:
        if not isinstance(relation,dict) or not relation.get('type') or not relation.get('target'):
            raise ValueError(f'{source_id}: relationships require type and target')
        if relation['target']==source_id:
            raise ValueError(f'{source_id}: relationship cannot target itself')
        key=(relation['type'],relation['target'])
        if key in seen: continue
        seen.add(key); normalized.append(relation)
    return normalized

def main():
  try:
    music=load('music_catalog.json'); content=load('content_catalog.json')
    entities=[]
    entities += [entity(x,'project') for x in load('project_context.json')]
    entities += [entity(x,'repository') for x in load('projects.json')]
    entities += [entity(x,'experiment') for x in load('experiments.json')]
    entities += [entity(x,'video') for x in load('videos.json')]
    entities += [entity(x,'milestone') for x in load('milestones.json')]
    entities += [entity(x) for x in content['entries']]
    for album in music['albums']:
      entities.append(entity({k:v for k,v in album.items() if k!='tracks'},'album'))
      entities += [entity(track,'track') for track in album['tracks']]
    by_id={}
    for item in entities:
      if not item.get('id'): raise ValueError(f'entity lacks id: {item.get("title") or item.get("name")}')
      if item['id'] in by_id: raise ValueError(f'duplicate entity id: {item["id"]}')
      item.setdefault('title',item.get('name')); item.setdefault('summary',item.get('description','')); item.setdefault('themes',[]); item.setdefault('path','')
      item['relationships']=normalize_relationships(item['id'],item['relationships'])
      by_id[item['id']]=item
    edges=[]
    for source in entities:
      resolved=[]
      for relation in source['relationships']:
        target=by_id.get(relation['target'])
        if not target: raise ValueError(f'{source["id"]}: broken relationship target {relation["target"]}')
        resolved_relation={**relation,'title':target['title'],'path':target.get('path',''),'entity_type':target['type']}
        resolved.append(resolved_relation); edges.append({'source':source['id'],**resolved_relation})
      source['relationships']=resolved
    incoming={key:[] for key in by_id}
    incoming_seen={key:set() for key in by_id}
    for edge in edges:
      source=by_id[edge['source']]; key=(source['id'],'referenced_by')
      if key in incoming_seen[edge['target']]: continue
      incoming_seen[edge['target']].add(key)
      incoming[edge['target']].append({'type':'referenced_by','target':source['id'],'title':source['title'],'path':source.get('path',''),'entity_type':source['type']})
    for item in entities: item['incoming_relationships']=incoming[item['id']]
    output={'entities':sorted(entities,key=lambda x:(x['type'],x['title'].casefold())),'edges':edges}
    (DATA/'entities.json').write_text(json.dumps(output,indent=2,ensure_ascii=False)+'\n')
    print(f'Built data/entities.json with {len(entities)} entities and {len(edges)} directed relationships.')
    return 0
  except (OSError,KeyError,ValueError,json.JSONDecodeError) as error:
    print(f'relationship build error: {error}',file=sys.stderr); return 1
if __name__=='__main__': raise SystemExit(main())
