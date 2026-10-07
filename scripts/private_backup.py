"""Private pre-edit snapshots. This directory is excluded from Cloudflare assets."""
from pathlib import Path
from datetime import datetime
import json,hashlib,shutil
ROOT=Path(__file__).resolve().parents[1]
def snapshot(files,reason):
 folder=ROOT/'backups'/(datetime.now().strftime('%Y-%m-%d_%H-%M-%S')+'-'+reason)
 folder.mkdir(parents=True,exist_ok=False);rows=[]
 for name in dict.fromkeys(files):
  f=ROOT/name
  if not f.is_file():continue
  data=f.read_bytes();dest=folder/name;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(f,dest)
  digest=hashlib.sha256(data).hexdigest();assert hashlib.sha256(dest.read_bytes()).hexdigest()==digest
  rows.append({'file':name,'sha256':digest,'bytes':len(data),'lines':data.count(b'\n')})
 (folder/'manifest.json').write_text(json.dumps(rows,indent=2),encoding='utf8')
 print('Verified pre-edit backup:',folder.name,len(rows),'files');return folder
if __name__=='__main__':
 import subprocess
 files=subprocess.check_output(['git','ls-files','*.html','*.css','robots.txt','sitemap.xml','llms.txt','scripts/build-slide-pages.py','AGENTS.md','.github/workflows/validate-html.yml'],cwd=ROOT).decode().splitlines()
 snapshot([f for f in files if not f.startswith(('backups/','codex-backups/','og/'))],'global-site')
