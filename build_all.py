#!/usr/bin/env python3
"""Rebuild every generated archive index in dependency order."""
from __future__ import annotations
import argparse, subprocess, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parent

def run(command, required=True):
    print(f"\n$ {' '.join(command)}",flush=True)
    result=subprocess.run(command,cwd=ROOT)
    if result.returncode and required: raise SystemExit(result.returncode)
    return result.returncode==0

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--skip-github',action='store_true',help='Keep the checked-in GitHub catalog instead of refreshing it')
    args=parser.parse_args(); python=sys.executable
    if not args.skip_github and not run([python,'tools/update_github.py'],required=False):
        print('warning: GitHub refresh failed; retaining the existing data/projects.json',file=sys.stderr)
    for script in ['tools/build_music_catalog.py','tools/enrich_music.py','tools/build_content_catalog.py','tools/build_relationships.py','tools/build_timeline.py','tools/build_search.py']:
        run([python,script])
    run(['node','scripts/audit-content.mjs'])
    print('\nArchive build complete.')
    return 0
if __name__=='__main__': raise SystemExit(main())
