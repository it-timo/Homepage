#!/usr/bin/env python3
"""Merge manual music metadata into the filesystem-generated music catalog."""
from __future__ import annotations
import json, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; CATALOG=ROOT/'data'/'music_catalog.json'; METADATA=ROOT/'metadata'/'music.json'

def merge(base, override):
    result={**base}
    for key,value in override.items():
        if key=='themes': result[key]=list(dict.fromkeys([*(base.get(key) or []),*value]))
        else: result[key]=value
    return result

def main():
    try:
      catalog=json.loads(CATALOG.read_text()); metadata=json.loads(METADATA.read_text())
      unmatched=[]
      for album in catalog['albums']:
        album['id']=f'album:{album["slug"]}'; album['type']='album'; album.setdefault('relationships',[])
        album=merge(album,metadata.get('albums',{}).get(album['slug'],{}))
        for index,current in enumerate(catalog['albums']):
            if current['slug']==album['slug']: catalog['albums'][index]=album
        for track in album['tracks']:
          key=f'{album["slug"]}:{track["slug"]}'; track['id']=f'track:{key}'; track['type']='track'; track['album_id']=album['id']; track.setdefault('themes',album['themes']); track.setdefault('status',album['status']); track.setdefault('year',album['year']); track.setdefault('relationships',[])
          track.update(metadata.get('tracks',{}).get(key,{}))
          if not any(r.get('target')==album['id'] for r in track['relationships']): track['relationships'].append({'type':'part_of','target':album['id']})
          album['relationships'].append({'type':'contains','target':track['id']})
      discovered={f'{a["slug"]}:{t["slug"]}' for a in catalog['albums'] for t in a['tracks']}
      unmatched=sorted(set(metadata.get('tracks',{}))-discovered)
      catalog['enrichment']={'source':'metadata/music.json','unmatched_track_metadata':unmatched}
      CATALOG.write_text(json.dumps(catalog,indent=2,ensure_ascii=False)+'\n')
      print(f'Enriched music catalog; {len(unmatched)} track metadata record(s) await matching media.')
      return 0
    except (OSError,KeyError,json.JSONDecodeError) as error:
      print(f'music enrichment error: {error}',file=sys.stderr); return 1
if __name__=='__main__': raise SystemExit(main())
